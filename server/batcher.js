// server/batcher.js
import fetch from "node-fetch";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

let pending = [];
let timer = null;
const BATCH_WINDOW_MS = 50;

/**
 * Batch incoming translate requests.
 * Supports optional sourceLang – if omitted, language detection is performed.
 */
export async function batchTranslate(req, res) {
  // ---- Language auto‑detection (if sourceLang missing) ----
  if (!req.body.sourceLang) {
    const textToDetect = req.body.text || (Array.isArray(req.body.texts) ? req.body.texts[0] : "");
    const detectResp = await fetch(`${process.env.PYTHON_SERVICE_URL}/detect-language`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: textToDetect }),
    });
    if (!detectResp.ok) {
      const err = await detectResp.json();
      return res.status(400).json({ error: "DETECTION_ERROR", message: err.message });
    }
    const { detectedLang } = await detectResp.json();
    req.body.sourceLang = detectedLang;
    req.detectedSourceLang = detectedLang;
  }

  pending.push({ req, res });

  if (!timer) {
    timer = setTimeout(async () => {
      const batch = pending.splice(0, pending.length);
      timer = null;

      // All requests share the same sourceLang/targetLang (assumed)
      const { sourceLang, targetLang } = batch[0].req.body;
      const texts = batch.map((p) => p.req.body.text || p.req.body.texts).flat();

      const pyResp = await fetch(`${process.env.PYTHON_SERVICE_URL}/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceLang, targetLang, texts }),
      });
      const data = await pyResp.json();

      // Distribute results and persist each translation
      let idx = 0;
      for (const p of batch) {
        if (p.req.body.text) {
          // ---- Single‑text request ----
          const original = p.req.body.text;
          const translated = data.translations[idx].translated;
          const payload = {
            translatedText: translated,
            detectedSourceLang: p.req.detectedSourceLang,
          };
          p.res.json(payload);

          // Persist translation
          await prisma.translation.create({
            data: {
              userId: p.req.user.userId,
              sourceLang,
              detectedSourceLang: p.req.detectedSourceLang,
              targetLang,
              sourceText: original,
              translatedText: translated,
            },
          });
          idx++;
        } else {
          // ---- Batch request ----
          const count = p.req.body.texts.length;
          const items = data.translations.slice(idx, idx + count).map((t) => ({
            original: t.original,
            translated: t.translated,
          }));
          const payload = { translations: items };
          if (p.req.detectedSourceLang) {
            payload.detectedSourceLang = p.req.detectedSourceLang;
          }
          p.res.json(payload);

          // Persist each translation in the batch
          for (let j = 0; j < items.length; j++) {
            const item = items[j];
            await prisma.translation.create({
              data: {
                userId: p.req.user.userId,
                sourceLang,
                detectedSourceLang: p.req.detectedSourceLang,
                targetLang,
                sourceText: item.original,
                translatedText: item.translated,
              },
            });
          }
          idx += count;
        }
      }
    }, BATCH_WINDOW_MS);
  }
}