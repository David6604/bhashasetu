# python_service/voice.py
import os
import uuid
import shutil
import aiofiles
import json
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field, validator
from typing import Literal
import whisper
from transformers import MarianMTModel, MarianTokenizer
from TTS.api import TTS

# ---------- Cache helpers (stable SHA‑256 keys) ----------
from .cache import get_translation_cache, set_translation_cache

# ---------- Load models ----------
whisper_model = whisper.load_model("medium")
TRANSLATION_MODEL = os.getenv("TRANSLATION_MODEL", "Helsinki-NLP/opus-mt-en-es")
tokenizer = MarianTokenizer.from_pretrained(TRANSLATION_MODEL)
translator = MarianMTModel.from_pretrained(TRANSLATION_MODEL)
tts = TTS(model_name="tts_models/en/ljspeech/tacotron2-DDC", progress_bar=False, gpu=False)

# ---------- Language whitelist ----------
SUPPORTED_PAIRS = {
    ("en", "es"), ("es", "en"),
    ("en", "fr"), ("fr", "en"),
    ("en", "de"), ("de", "en"),
    ("en", "zh"), ("zh", "en"),
    ("en", "ja"), ("ja", "en"),
}

def _check_pair(src: str, tgt: str):
    if (src, tgt) not in SUPPORTED_PAIRS:
        raise HTTPException(
            status_code=400,
            detail={"error": "UNSUPPORTED_LANGUAGE_PAIR", "message": f"{src}->{tgt} not supported"},
        )

def _transcribe(audio_path: str):
    result = whisper_model.transcribe(audio_path)
    text = result["text"].strip()
    language = result.get("language", "und")
    return text, language

def _translate(text: str, src: str, tgt: str) -> str:
    inputs = tokenizer(text, return_tensors="pt", padding=True)
    generated_ids = translator.generate(**inputs, max_length=512)
    return tokenizer.decode(generated_ids[0], skip_special_tokens=True)

def _synthesize(text: str) -> str:
    os.makedirs("./generated", exist_ok=True)
    out_path = f"./generated/{uuid.uuid4()}.wav"
    tts.tts_to_file(text=text, file_path=out_path)
    return out_path

# ---------- API ----------
app = FastAPI(title="Voice Translation Service")

@app.post("/voice/translate")
async def voice_translate(
    sourceLang: Literal["en", "es", "fr", "de", "zh", "ja"] = Form(None),
    targetLang: Literal["en", "es", "fr", "de", "zh", "ja"] = Form(...),
    audio: UploadFile = File(...),
):
    # If sourceLang not provided, Whisper will detect it automatically
    if not targetLang:
        raise HTTPException(status_code=400, detail={"error": "BAD_REQUEST", "message": "targetLang required"})

    if audio.content_type not in {"audio/wav", "audio/mpeg", "audio/mp4", "audio/webm"}:
        raise HTTPException(
            status_code=415,
            detail={"error": "UNSUPPORTED_MEDIA_TYPE", "message": f"Unsupported MIME type {audio.content_type}"},
        )

    # Save uploaded audio to a temporary file
    tmp_dir = "./tmp"
    os.makedirs(tmp_dir, exist_ok=True)
    tmp_path = os.path.join(tmp_dir, f"{uuid.uuid4()}_{audio.filename}")

    with open(tmp_path, "wb") as f:
        shutil.copyfileobj(audio.file, f)

    try:
        # 1️⃣ Transcribe audio → source_text and detected language
        source_text, detected_lang = _transcribe(tmp_path)

        # Use detected language if sourceLang not supplied
        effective_source_lang = sourceLang or detected_lang

        # 2️⃣ Look for a cached translation of this source_text
        cached = await get_translation_cache(effective_source_lang, targetLang, source_text)
        if cached:
            translated = cached["translated"]
        else:
            # 3️⃣ No cache → perform translation and store result
            translated = _translate(source_text, effective_source_lang, targetLang)
            await set_translation_cache(effective_source_lang, targetLang, source_text, translated)

        # 4️⃣ Synthesize TTS for the translated text
        tts_path = _synthesize(translated)

        # Clean up the temporary upload file
        os.remove(tmp_path)

        return {
            "sourceText": source_text,
            "translatedText": translated,
            "detectedSourceLang": detected_lang,
            "audioPath": tts_path,
        }
    except Exception as exc:
        # Ensure temporary file is removed on error as well
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
        raise HTTPException(status_code=500, detail={"error": "VOICE_TRANSLATION_FAILURE", "message": str(exc)})

@app.get("/voice/audio/{filename}")
async def stream_audio(filename: str):
    file_path = f"./generated/{filename}"
    if not os.path.isfile(file_path):
        raise HTTPException(status_code=404, detail="Audio not found")

    async def iterfile():
        async with aiofiles.open(file_path, "rb") as f:
            chunk = await f.read(8192)
            while chunk:
                yield chunk
                chunk = await f.read(8192)

    return StreamingResponse(iterfile(), media_type="audio/wav")