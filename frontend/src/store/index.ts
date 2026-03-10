import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ─── Theme ────────────────────────────────────────────────────────────────────

interface ThemeState {
  isDark: boolean
  toggle: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      // Fallback to system preference on first load
      isDark:
        typeof window !== 'undefined'
          ? window.matchMedia('(prefers-color-scheme: dark)').matches
          : false,

      toggle() {
        const next = !get().isDark
        set({ isDark: next })
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', next)
        }
      },
    }),
    {
      name:    'bhashasetu-theme',
      storage: createJSONStorage(() => localStorage),
      // After rehydration, sync the DOM class
      onRehydrateStorage: () => (state) => {
        if (!state) return
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', state.isDark)
        }
      },
    },
  ),
)

// ─── Language definitions ─────────────────────────────────────────────────────

export interface Language {
  code:       string
  name:       string
  nativeName: string
  flag:       string
}

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English',    nativeName: 'English',      flag: '🇬🇧' },
  { code: 'te', name: 'Telugu',     nativeName: 'తెలుగు',        flag: '🇮🇳' },
  { code: 'hi', name: 'Hindi',      nativeName: 'हिन्दी',         flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil',      nativeName: 'தமிழ்',          flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada',    nativeName: 'ಕನ್ನಡ',          flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam',  nativeName: 'മലയാളം',         flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi',    nativeName: 'मराठी',          flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali',    nativeName: 'বাংলা',          flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati',   nativeName: 'ગુજરાતી',        flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi',    nativeName: 'ਪੰਜਾਬੀ',         flag: '🇮🇳' },
  { code: 'ur', name: 'Urdu',       nativeName: 'اردو',           flag: '🇵🇰' },
  { code: 'ar', name: 'Arabic',     nativeName: 'العربية',        flag: '🇸🇦' },
  { code: 'fr', name: 'French',     nativeName: 'Français',       flag: '🇫🇷' },
  { code: 'de', name: 'German',     nativeName: 'Deutsch',        flag: '🇩🇪' },
  { code: 'es', name: 'Spanish',    nativeName: 'Español',        flag: '🇪🇸' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português',      flag: '🇵🇹' },
  { code: 'ru', name: 'Russian',    nativeName: 'Русский',        flag: '🇷🇺' },
  { code: 'ja', name: 'Japanese',   nativeName: '日本語',           flag: '🇯🇵' },
  { code: 'zh', name: 'Chinese',    nativeName: '中文',            flag: '🇨🇳' },
  { code: 'ko', name: 'Korean',     nativeName: '한국어',           flag: '🇰🇷' },
  { code: 'it', name: 'Italian',    nativeName: 'Italiano',       flag: '🇮🇹' },
  { code: 'tr', name: 'Turkish',    nativeName: 'Türkçe',         flag: '🇹🇷' },
  { code: 'nl', name: 'Dutch',      nativeName: 'Nederlands',     flag: '🇳🇱' },
  { code: 'pl', name: 'Polish',     nativeName: 'Polski',         flag: '🇵🇱' },
  { code: 'sv', name: 'Swedish',    nativeName: 'Svenska',        flag: '🇸🇪' },
]

/**
 * Special sentinel for "detect language automatically".
 * Only valid as sourceLang — never used in the target dropdown.
 * Sends code: "auto" to the backend API.
 */
export const AUTO_DETECT: Language = {
  code:       'auto',
  name:       'Auto Detect',
  nativeName: 'Detect language',
  flag:       '🔍',
}

// ─── Translation state ────────────────────────────────────────────────────────

interface TranslationState {
  sourceText:     string
  translatedText: string
  sourceLang:     Language
  targetLang:     Language
  isLoading:      boolean
  error:          string | null

  setSourceText:     (text: string)      => void
  setTranslatedText: (text: string)      => void
  setSourceLang:     (lang: Language)    => void
  setTargetLang:     (lang: Language)    => void
  setLoading:        (val: boolean)      => void
  setError:          (err: string | null) => void
  swapLanguages:     () => void
  reset:             () => void
}

export const useTranslationStore = create<TranslationState>()((set, get) => ({
  sourceText:     '',
  translatedText: '',
  sourceLang:     LANGUAGES[0], // English
  targetLang:     LANGUAGES[2], // Hindi
  isLoading:      false,
  error:          null,

  setSourceText:     (text) => set({ sourceText: text }),
  setTranslatedText: (text) => set({ translatedText: text }),
  setSourceLang:     (lang) => set({ sourceLang: lang }),
  setTargetLang:     (lang) => set({ targetLang: lang }),
  setLoading:        (val)  => set({ isLoading: val }),
  setError:          (err)  => set({ error: err }),

  swapLanguages() {
    const { sourceLang, targetLang, sourceText, translatedText } = get()
    // Cannot meaningfully swap when source is Auto Detect
    if (sourceLang.code === 'auto') return
    set({
      sourceLang:     targetLang,
      targetLang:     sourceLang,
      sourceText:     translatedText,
      translatedText: sourceText,
    })
  },

  reset: () => set({ sourceText: '', translatedText: '', error: null }),
}))
