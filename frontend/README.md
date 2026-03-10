# BhashaSetu 🌐

> **Break language barriers with real-time AI translation**

A modern, production-ready multilingual translation frontend built with React 18, TypeScript, Vite, TailwindCSS, Zustand, and Axios — focused on Indian languages and global language support.

---

## Prerequisites

| Tool       | Min version | Check             |
|------------|------------|-------------------|
| Node.js    | 18.x       | `node -v`         |
| npm        | 9.x        | `npm -v`          |
| Backend API | running   | `http://localhost:3000` |

---

## Installation

```bash
# 1 — Clone / unzip the project
cd bhashasetu

# 2 — Install dependencies
npm install

# 3 — Configure the API URL  (already set to http://localhost:3000)
#     Edit .env if your backend runs on a different host/port:
#
#       VITE_API_URL=http://localhost:3000
#
#     The .env file is pre-filled — no changes needed for local dev.

# 4 — Start the dev server
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## Environment variables

| Variable       | Default                   | Purpose                                    |
|----------------|---------------------------|--------------------------------------------|
| `VITE_API_URL` | `http://localhost:3000`   | Base URL of the Node.js translation API    |

> All Vite env variables **must** be prefixed with `VITE_` to be exposed to the browser bundle.

### For production

```bash
# Build
VITE_API_URL=https://api.yourdomain.com npm run build

# Or set in your CI/CD environment and run:
npm run build
```

---

## Backend API contract

The app sends exactly one request type:

```
POST {VITE_API_URL}/translate
Content-Type: application/json

{
  "text":       "Hello",
  "sourceLang": "en",
  "targetLang": "hi"
}
```

Expected response:

```json
{
  "translatedText": "नमस्ते"
}
```

Error responses should return a non-2xx status; any `message` field in the body is shown to the user.

---

## Project structure

```
bhashasetu/
├── .env                        ← Environment variables (VITE_API_URL)
├── .env.example                ← Template — safe to commit
├── .gitignore
├── index.html                  ← Vite HTML entry
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── src/
    ├── vite-env.d.ts           ← TypeScript types for import.meta.env
    ├── main.tsx                ← Entry point + flash-of-theme prevention
    ├── App.tsx                 ← Router + layout shell
    ├── index.css               ← Tailwind directives + global utility classes
    │
    ├── api/
    │   └── translate.ts        ← Axios client, reads VITE_API_URL
    │
    ├── animations/
    │   └── useAnimations.ts    ← useAnimatedWords, useInView, useTypewriter
    │
    ├── components/
    │   ├── Footer.tsx          ← Site footer
    │   ├── LanguageDropdown.tsx← Searchable language picker with flags
    │   └── Navbar.tsx          ← Glassmorphism sticky nav, mobile menu, theme toggle
    │
    ├── pages/
    │   ├── HomePage.tsx        ← Hero, animated word cycling, stats, feature cards
    │   ├── TranslatePage.tsx   ← Google Translate-style dual-panel UI
    │   └── HelpContactPages.tsx← FAQ accordion + contact form
    │
    └── store/
        └── index.ts            ← Zustand: theme store (persisted) + translation store
```

---

## Available scripts

| Script            | Description                            |
|-------------------|----------------------------------------|
| `npm run dev`     | Start Vite dev server on port 5173     |
| `npm run build`   | Type-check + build to `dist/`          |
| `npm run preview` | Preview the production build locally   |
| `npm run typecheck` | Run `tsc --noEmit` without building  |

---

## Features

| Feature                               | Status       |
|---------------------------------------|--------------|
| Dark / Light theme (localStorage)     | ✅           |
| Glassmorphism sticky navbar           | ✅           |
| Animated hero — cycling language words| ✅           |
| Scroll-triggered feature cards        | ✅           |
| Google Translate-style layout         | ✅           |
| Searchable language dropdown (25 langs)| ✅          |
| Quick-select language pills           | ✅           |
| Language swap (⇄ button)             | ✅           |
| Voice input (Web Speech API)          | ✅ Chrome/Edge|
| Text-to-speech output                 | ✅           |
| Copy to clipboard                     | ✅           |
| Typewriter output animation           | ✅           |
| ⌘ Enter keyboard shortcut            | ✅           |
| Character counter (5 000 limit)       | ✅           |
| FAQ accordion page                    | ✅           |
| Contact form                          | ✅           |
| Fully responsive (mobile/tablet/desk) | ✅           |
| VITE_API_URL environment variable     | ✅           |
| Offline mode                          | 🔜 Coming soon|

---

## Design system

| Token         | Value                              |
|---------------|------------------------------------|
| Display font  | Sora (Google Fonts)                |
| Body font     | DM Sans (Google Fonts)             |
| Brand blue    | `#0ea5e9` (brand-500)              |
| Saffron       | `#f97316` (saffron-500)            |
| Dark bg       | `#080d18` (surface-950)            |
| Border radius | `rounded-2xl` / `rounded-3xl`      |
| Dark mode     | Tailwind `dark:` class strategy    |

Global utility classes defined in `src/index.css`:

- `.btn-primary` — gradient CTA button with hover lift
- `.gradient-text` — blue-to-saffron text gradient
- `.shimmer-text` — animated shimmer gradient text
- `.glass` / `.glass-light` — backdrop-blur glass panels
- `.card-hover` — subtle lift on hover

---

## Troubleshooting

**"Could not reach the server"**
→ Ensure your backend is running: `node server.js` (or equivalent) and accessible at the URL in `.env`.

**CORS error in the browser console**
→ Add `Access-Control-Allow-Origin: *` (or your frontend origin) to your backend responses.

**Voice input not working**
→ Voice input uses the Web Speech API, which requires Chrome or Edge. Firefox does not support it.

**Styles not applying**
→ Delete `node_modules/.vite` cache directory and restart `npm run dev`.

---

Built with ❤️ for India & the world.
