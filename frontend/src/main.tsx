import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// ── Prevent flash of wrong theme on first paint ──────────────────────────────
// This runs synchronously before the first React render.
// The Zustand store also calls documentElement.classList.toggle on rehydrate,
// but that fires slightly later — so we guard here too.
;(function applyStoredTheme() {
  try {
    const raw    = localStorage.getItem('bhashasetu-theme')
    const parsed = raw ? JSON.parse(raw) : null
    const isDark: boolean =
      parsed?.state?.isDark ??
      window.matchMedia('(prefers-color-scheme: dark)').matches

    document.documentElement.classList.toggle('dark', isDark)
  } catch {
    // If localStorage is unavailable (private mode, SSR, etc.) fall back silently
  }
})()

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
