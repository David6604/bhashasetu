# Multilingual AI Translator – Phase 1

A micro‑service architecture that provides:

* **Text translation** (single & batch) with optional **auto‑language detection**.
* **Voice translation** (audio → transcription → translation → TTS) with Whisper‑based language detection.
* **JWT‑based authentication** (register / login) and per‑user translation history.
* **Redis caching**, **circuit‑breaker**, **rate‑limiting**, and **OpenAPI** documentation.

## Getting Started

```bash
# 1️⃣ Clone the repo
git clone <repo‑url> translator-app
cd translator-app

# 2️⃣ Build & start containers
docker compose up --build

# 3️⃣ Apply Prisma migrations (once)
docker compose exec gateway npx prisma migrate dev --name init

# 4️⃣ Test the API
#   • Register: POST http://localhost:3000/api/auth/register
#   • Login:    POST http://localhost:3000/api/auth/login
#   • Translate (text): POST http://localhost:3000/api/translate
#   • Translate (voice): POST http://localhost:3000/api/voice/translate
#   • History: GET http://localhost:3000/api/translations