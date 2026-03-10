import torch
from transformers import AutoModelForSeq2SeqLM, NllbTokenizer


class TranslationEngine:
    """
    Clean reusable NLLB Translation Engine
    Accepts ISO language codes (en, te, hi, etc.)
    Internally maps to NLLB codes.
    """

    def __init__(self, model_name: str = "facebook/nllb-200-distilled-600M"):
        self.model_name = model_name

        print("Loading tokenizer...")
        self.tokenizer = NllbTokenizer.from_pretrained(self.model_name)

        print("Loading model...")
        self.model = AutoModelForSeq2SeqLM.from_pretrained(self.model_name)

        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model.to(self.device)
        self.model.eval()

        # ISO → NLLB mapping (Version 1 fixed mapping)
        self.iso_to_nllb = {
            "en": "eng_Latn",
            "hi": "hin_Deva",
            "te": "tel_Telu",
            "ta": "tam_Taml",
            "bn": "ben_Beng",
            "ml": "mal_Mlym",
            "kn": "kan_Knda",
            "mr": "mar_Deva",
            "gu": "guj_Gujr",
            "pa": "pan_Guru",
            "fr": "fra_Latn",
            "de": "deu_Latn",
            "es": "spa_Latn",
        }

        print("TranslationEngine ready.\n")

    def _map_iso(self, iso_code: str) -> str:
        iso_code = iso_code.lower()

        if iso_code not in self.iso_to_nllb:
            raise ValueError(f"Unsupported language code: {iso_code}")

        return self.iso_to_nllb[iso_code]

    def translate(self, text: str, source_lang: str, target_lang: str) -> str:
        if not text:
            raise ValueError("Text cannot be empty")

        src_nllb = self._map_iso(source_lang)
        tgt_nllb = self._map_iso(target_lang)

        self.tokenizer.src_lang = src_nllb

        inputs = self.tokenizer(
            text,
            return_tensors="pt"
        ).to(self.device)

        forced_bos_token_id = self.tokenizer.convert_tokens_to_ids(tgt_nllb)

        with torch.no_grad():
            generated_tokens = self.model.generate(
                **inputs,
                forced_bos_token_id=forced_bos_token_id,
                max_length=128
            )

        translated = self.tokenizer.batch_decode(
            generated_tokens,
            skip_special_tokens=True
        )[0]

        return translated