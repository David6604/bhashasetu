// server/batcher.js
import fetch from "node-fetch";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const HF_TRANSLATE_URL =
  "https://api-inference.huggingface.co/models/facebook/nllb-200-distilled-600M";

const HF_HEADERS = {
  Authorization: `Bearer ${process.env.HF_API_KEY}`,
  "Content-Type": "application/json",
};

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
   req.body.sourceLang = req.body.sourceLang || "eng_Latn";
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

      const translations = [];

for (const text of texts) {
  const resp = await fetch(HF_TRANSLATE_URL, {
    method: "POST",
    headers: HF_HEADERS,
    body: JSON.stringify({
      inputs: text,
      parameters: {
        src_lang: sourceLang,
        tgt_lang: targetLang,
      },
    }),
  });

  const result = await resp.json();

  translations.push({
    original: text,
    translated: result?.[0]?.translation_text || "",
  });
}

const data = { translations };

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