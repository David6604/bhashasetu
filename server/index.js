// server/index.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import fetch from "node-fetch";
import FormData from "form-data";
import http from "http";
import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import { enqueueTask } from "./concurrency.js";
import { batchTranslate } from "./batcher.js";
import { redis, cacheKey } from "./cache.js";
import { pythonBreaker } from "./circuit.js";
import openapiRouter from "./openapi.js";
import authRouter from "./auth.js";
import { verifyJWT } from "./jwt.js";
import { PrismaClient } from "@prisma/client";

import * as roomManager from "./roomManager.js";
import * as broadcastManager from "./broadcastManager.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://bhashasetu.vercel.app",
    "https://bhashasetu-rosy.vercel.app"
  ],
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
  credentials: true
}));

app.options("*", cors());
app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(
  rateLimit({
    windowMs: 60_000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// ------------------------------------------------------------------
// Public auth routes (no JWT required)
// ------------------------------------------------------------------
app.use("/api/auth", authRouter);

/* ---------- Text translation (single & batch) ---------- */
app.post("/api/translate", batchTranslate);

// ------------------------------------------------------------------
// JWT middleware – protects everything after this point
// ------------------------------------------------------------------
app.use("/api", verifyJWT);


/* ---------- Voice translation ---------- */
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadMiddleware = multer({
  dest: path.join(__dirname, "uploads/"),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const allowed = ["audio/wav", "audio/mpeg", "audio/mp4", "audio/webm"];
    cb(null, allowed.includes(file.mimetype));
  },
});

const prisma = new PrismaClient();

app.post("/api/voice/translate", uploadMiddleware.single("audio"), async (req, res) => {
  const { sourceLang, targetLang } = req.body;
  const file = req.file;
  if (!targetLang) {
    return res.status(400).json({ error: "BAD_REQUEST", message: "targetLang required" });
  }
  if (!file) {
    return res.status(400).json({ error: "BAD_REQUEST", message: "Audio file missing" });
  }

  // Offload heavy work to a worker thread
  try {
    const result = await enqueueTask(async () => {
      const form = new FormData();
      form.append("sourceLang", sourceLang || ""); // may be empty – Python will detect
      form.append("targetLang", targetLang);
      form.append("audio", await fetch(`file://${file.path}`).then(r => r.blob()), file.originalname);
      const pyResp = await fetch(`${process.env.PYTHON_SERVICE_URL}/voice/translate`, {
        method: "POST",
        body: form,
      });
      if (!pyResp.ok) {
        const err = await pyResp.json();
        throw new Error(err.message ?? "Voice translation failed");
      }
      return pyResp.json();
    });

    // Persist voice translation record
    await prisma.voiceTranslation.create({
      data: {
        userId: req.user.userId,
        sourceLang: sourceLang || result.detectedSourceLang,
        detectedSourceLang: result.detectedSourceLang,
        targetLang,
        sourceAudioPath: file.path,
        sourceText: result.sourceText,
        translatedText: result.translatedText,
        translatedAudioPath: result.audioPath,
      },
    });

    // Store generated audio under a public static folder
    const audioUrl = `/static/${path.basename(result.audioPath)}`;
    return res.json({
      sourceText: result.sourceText,
      translatedText: result.translatedText,
      detectedSourceLang: result.detectedSourceLang,
      audioUrl,
    });
  } catch (e) {
    console.error(e);
    return res.status(503).json({ error: "SERVICE_UNAVAILABLE", message: e.message });
  }
});

/* ---------- Serve generated audio files ---------- */
app.use("/static", express.static(path.join(__dirname, "generated")));

/* ---------- User translation history (paginated) ---------- */
app.get("/api/translations", async (req, res) => {
  const userId = req.user.userId;
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.translation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.translation.count({ where: { userId } }),
  ]);

  return res.json({
    items,
    total,
    page,
    limit,
  });
});

app.use("/docs", openapiRouter);

app.get("/health", (_, res) => res.json({ status: "ok" }));

/* -------------------------------------------------
   WebSocket Server (ws) – real‑time rooms & broadcast
   ------------------------------------------------- */
const httpServer = http.createServer(app);
const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

wss.on("connection", (ws, request) => {
  // ---- JWT authentication (token passed as query param) ----
  const url = new URL(request.url, `http://${request.headers.host}`);
  const token = url.searchParams.get("token");
  if (!token) {
    ws.close(4001, "Missing token");
    return;
  }
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET || "change_this_secret");
  } catch (e) {
    ws.close(4002, "Invalid token");
    return;
  }
  ws.userId = payload.userId;
  ws.role = payload.role;

  // ---- Message handling ----
  ws.on("message", async (msg) => {
    let data;
    try {
      data = JSON.parse(msg);
    } catch (e) {
      ws.send(JSON.stringify({ error: "INVALID_JSON" }));
      return;
    }

    const { type } = data;
    switch (type) {
      case "join_room": {
        const { roomId, targetLang } = data;
        roomManager.joinRoom(ws.userId, roomId, targetLang, ws);
        ws.currentRoom = roomId;
        ws.send(JSON.stringify({ type: "joined", roomId }));
        break;
      }
      case "leave_room": {
        const { roomId } = data;
        roomManager.leaveRoom(ws.userId, roomId);
        ws.currentRoom = null;
        ws.send(JSON.stringify({ type: "left", roomId }));
        break;
      }
      case "broadcast_subscribe": {
        const { targetLang } = data;
        broadcastManager.subscribe(ws.userId, targetLang, ws);
        ws.send(JSON.stringify({ type: "subscribed", targetLang }));
        break;
      }
      case "broadcast_unsubscribe": {
        broadcastManager.unsubscribe(ws.userId);
        ws.send(JSON.stringify({ type: "unsubscribed" }));
        break;
      }
      case "message": {
        const { roomId, text, sourceLang } = data;
        const room = roomManager.getRoom(roomId);
        if (!room) {
          ws.send(JSON.stringify({ error: "ROOM_NOT_FOUND", roomId }));
          break;
        }

        // ---- Auto‑detect source language if needed ----
        let effectiveSourceLang = sourceLang;
        let detectedSourceLang = null;
        if (!effectiveSourceLang) {
          const detectResp = await fetch(`${process.env.PYTHON_SERVICE_URL}/detect-language`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
          });
          if (!detectResp.ok) {
            ws.send(JSON.stringify({ error: "DETECTION_ERROR" }));
            break;
          }
          const det = await detectResp.json();
          effectiveSourceLang = det.detectedLang;
          detectedSourceLang = det.detectedLang;
        }

        // ---- Parallel translation for all participants ----
        const participants = Object.entries(room.users);
        const translatePromises = participants.map(([uid, info]) => {
          const body = {
            sourceLang: effectiveSourceLang,
            targetLang: info.targetLang,
            text,
          };
          return fetch(`${process.env.PYTHON_SERVICE_URL}/translate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }).then((r) => r.json());
        });

        const results = await Promise.all(translatePromises);

        participants.forEach(([uid, info], idx) => {
          const result = results[idx];
          const translated = result.translatedText || (result.translations?.[0]?.translated ?? "");
          info.socket.send(
            JSON.stringify({
              type: "room_message",
              roomId,
              from: ws.userId,
              sourceLang: effectiveSourceLang,
              detectedSourceLang,
              targetLang: info.targetLang,
              text: translated,
            })
          );
        });
        break;
      }
      case "broadcast_message": {
        const { text, sourceLang } = data;

        // ---- Auto‑detect source language if needed ----
        let effectiveSourceLang = sourceLang;
        let detectedSourceLang = null;
        if (!effectiveSourceLang) {
          const detectResp = await fetch(`${process.env.PYTHON_SERVICE_URL}/detect-language`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
          });
          if (!detectResp.ok) {
            ws.send(JSON.stringify({ error: "DETECTION_ERROR" }));
            break;
          }
          const det = await detectResp.json();
          effectiveSourceLang = det.detectedLang;
          detectedSourceLang = det.detectedLang;
        }

        const allSubs = broadcastManager.getAll(); // { targetLang: [{userId, socket}] }

        // ---- Parallel translation per target language ----
        const langPromises = Object.entries(allSubs).map(async ([targetLang, subs]) => {
          const body = {
            sourceLang: effectiveSourceLang,
            targetLang,
            text,
          };
          const resp = await fetch(`${process.env.PYTHON_SERVICE_URL}/translate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
          const result = await resp.json();
          const translated = result.translatedText || (result.translations?.[0]?.translated ?? "");
          return { targetLang, translated, subs };
        });

        const translations = await Promise.all(langPromises);

        translations.forEach(({ targetLang, translated, subs }) => {
          subs.forEach((sub) => {
            sub.socket.send(
              JSON.stringify({
                type: "broadcast_message",
                from: ws.userId,
                sourceLang: effectiveSourceLang,
                detectedSourceLang,
                targetLang,
                text: translated,
              })
            );
          });
        });
        break;
      }
      default:
        ws.send(JSON.stringify({ error: "UNKNOWN_MESSAGE_TYPE", type }));
    }
  });

  ws.on("close", () => {
    // Clean up any room membership and broadcast subscription
    if (ws.currentRoom) {
      roomManager.leaveRoom(ws.userId, ws.currentRoom);
    }
    broadcastManager.unsubscribe(ws.userId);
  });
});

const PORT = process.env.PORT || 10000;
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Gateway listening on ${PORT}`);
});