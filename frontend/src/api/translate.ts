import axios, { type AxiosError } from 'axios'

// ─── Axios instance ───────────────────────────────────────────────────────────
//
// The base URL is read from the Vite environment variable VITE_API_URL.
// Create a  .env  file at the project root and set:
//
//   VITE_API_URL=http://localhost:3000
//
// In production, set VITE_API_URL to your deployed API gateway URL.

const api = axios.create({
  baseURL: "https://bhashasetu-api.onrender.com",
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

// ─── Request interceptor (auth headers, logging, etc.) ───────────────────────

api.interceptors.request.use(
  (config) => config,
  (error: AxiosError) => Promise.reject(error),
)

// ─── Response interceptor — normalise errors ─────────────────────────────────

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    if (error.response) {
      const msg =
        error.response.data?.message ??
        `Server error ${error.response.status}: ${error.response.statusText}`
      throw new Error(msg)
    }
    if (error.request) {
      throw new Error(
        'Could not reach the server. Is your backend running at ' +
        (import.meta.env.VITE_API_URL ?? 'http://localhost:3000') + '?',
      )
    }
    throw new Error(error.message ?? 'An unexpected error occurred.')
  },
)

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TranslateRequest {
  text:       string
  sourceLang: string
  targetLang: string
}

export interface TranslateResponse {
  translatedText: string
}

// ─── API call ─────────────────────────────────────────────────────────────────

export async function translateText(
  payload: TranslateRequest,
): Promise<TranslateResponse> {
  const { data } = await api.post<TranslateResponse>('/api/translate', payload)
  return data
}

export default api
