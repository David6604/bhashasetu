// server/openapi.js
import express from "express";
import fetch from "node-fetch";
import swaggerUi from "swagger-ui-express";

const router = express.Router();

router.get("/openapi.json", async (_, res) => {
  const pySpec = await fetch(`${process.env.PYTHON_SERVICE_URL}/openapi.json`).then((r) => r.json());

  const nodeSpec = {
    openapi: "3.0.0",
    info: { title: "Gateway API", version: "1.0.0" },
    paths: {
      "/api/translate": {
        post: {
          summary: "Translate text (single or batch)",
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/TranslateRequest" } } } },
          responses: { "200": { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/TranslateResponse" } } } } },
        },
      },
      "/api/voice/translate": {
        post: {
          summary: "Voice translation (audio → text → audio)",
          requestBody: { required: true, content: { "multipart/form-data": { schema: { $ref: "#/components/schemas/VoiceRequest" } } } },
          responses: { "200": { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/VoiceResponse" } } } } },
        },
      },
    },
    components: {
      schemas: {
        TranslateRequest: {
          type: "object",
          properties: {
            sourceLang: { type: "string" },
            targetLang: { type: "string" },
            text: { type: "string" },
            texts: { type: "array", items: { type: "string" } },
          },
          required: ["sourceLang", "targetLang"],
        },
        TranslateResponse: {
          type: "object",
          oneOf: [
            { $ref: "#/components/schemas/SingleResponse" },
            { $ref: "#/components/schemas/BatchResponse" },
          ],
        },
        SingleResponse: { type: "object", properties: { translatedText: { type: "string" } }, required: ["translatedText"] },
        BatchResponse: { type: "object", properties: { translations: { type: "array", items: { type: "object", properties: { original: { type: "string" }, translated: { type: "string" } } } } }, required: ["translations"] },
        VoiceRequest: {
          type: "object",
          properties: {
            sourceLang: { type: "string" },
            targetLang: { type: "string" },
            audio: { type: "string", format: "binary" },
          },
          required: ["sourceLang", "targetLang", "audio"],
        },
        VoiceResponse: {
          type: "object",
          properties: {
            sourceText: { type: "string" },
            translatedText: { type: "string" },
            audioUrl: { type: "string", format: "uri" },
          },
          required: ["sourceText", "translatedText", "audioUrl"],
        },
      },
    },
  };

  const merged = { ...pySpec, ...nodeSpec };
  res.json(merged);
});

router.use("/", swaggerUi.serve, swaggerUi.setup(null, { swaggerUrl: "/openapi.json" }));

export default router;