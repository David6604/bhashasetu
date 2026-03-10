import logging
import time
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from langdetect import detect, LangDetectException

from translation_engine import TranslationEngine

# --------------------------------------------------------------
# Logging
# --------------------------------------------------------------

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --------------------------------------------------------------
# Engine (singleton)
# --------------------------------------------------------------

logger.info("Initializing TranslationEngine...")
engine = TranslationEngine()
logger.info("TranslationEngine ready.")

# --------------------------------------------------------------
# FastAPI
# --------------------------------------------------------------

app = FastAPI(title="NLLB Multilingual Translation Service")

# --------------------------------------------------------------
# Request / Response Models
# --------------------------------------------------------------

class TranslateRequest(BaseModel):
    sourceLang: str | None = None
    targetLang: str
    text: str = Field(..., max_length=5000)


class TranslateResponse(BaseModel):
    translatedText: str
    detectedSourceLang: str | None = None


class DetectRequest(BaseModel):
    text: str


class DetectResponse(BaseModel):
    detectedLang: str


# --------------------------------------------------------------
# Language Detection
# --------------------------------------------------------------

@app.post("/detect-language", response_model=DetectResponse)
async def detect_language(req: DetectRequest):
    try:
        iso = detect(req.text)
    except LangDetectException:
        raise HTTPException(status_code=400, detail="Language detection failed")

    return {"detectedLang": iso}


# --------------------------------------------------------------
# Translation Endpoint
# (kept as /translate so Node server doesn't break)
# --------------------------------------------------------------

@app.post("/translate", response_model=TranslateResponse)
async def translate(req: TranslateRequest):

    try:
        # Determine source language
        if req.sourceLang:
            src_lang = req.sourceLang
        else:
            src_lang = detect(req.text)

        tgt_lang = req.targetLang

        start = time.time()

        translated = engine.translate(
            text=req.text,
            source_lang=src_lang,
            target_lang=tgt_lang
        )

        latency = round((time.time() - start) * 1000)
        logger.info(f"Translation completed in {latency} ms")

    except Exception as e:
        logger.error(str(e))
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "translatedText": translated,
        "detectedSourceLang": src_lang
    }


# --------------------------------------------------------------
# Health
# --------------------------------------------------------------

@app.get("/health")
def health():
    return {"status": "ok"}