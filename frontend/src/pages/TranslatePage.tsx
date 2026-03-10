import { useState, useRef, useCallback } from 'react'
import {
  ArrowLeftRight,
  Mic,
  MicOff,
  Copy,
  Check,
  Trash2,
  Volume2,
  Loader2,
  AlertCircle,
  Sparkles,
} from 'lucide-react'
import { useTranslationStore, LANGUAGES, AUTO_DETECT } from '../store'
import LanguageDropdown from '../components/LanguageDropdown'
import { translateText } from '../api/translate'
import { useTypewriter } from '../animations/useAnimations'

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_CHARS = 5000

const QUICK_LANGS = [
  { code: 'auto', label: 'AUTO' },
  { code: 'en',   label: 'EN' },
  { code: 'hi',   label: 'HI' },
  { code: 'te',   label: 'TE' },
  { code: 'ta',   label: 'TA' },
  { code: 'fr',   label: 'FR' },
]

// ─── Animated typewriter output ───────────────────────────────────────────────

function AnimatedOutput({ text }: { text: string }) {
  const { displayed } = useTypewriter(text, 15)
  return <>{displayed}</>
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TranslatePage() {
  const {
    sourceText,
    translatedText,
    sourceLang,
    targetLang,
    isLoading,
    error,
    setSourceText,
    setTranslatedText,
    setSourceLang,
    setTargetLang,
    setLoading,
    setError,
    swapLanguages,
  } = useTranslationStore()

  const [copied, setCopied]       = useState(false)
  const [listening, setListening] = useState(false)
  const [charCount, setCharCount] = useState(sourceText.length)
  const textareaRef               = useRef<HTMLTextAreaElement>(null)

  // ── Translate ────────────────────────────────────────────────────────────
  const handleTranslate = useCallback(async () => {
    if (!sourceText.trim()) return
    setLoading(true)
    setError(null)
    setTranslatedText('')
    try {
      const { translatedText: result } = await translateText({
        text:       sourceText.trim(),
        sourceLang: sourceLang.code,
        targetLang: targetLang.code,
      })
      setTranslatedText(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Translation failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [sourceText, sourceLang, targetLang, setLoading, setError, setTranslatedText])

  // ── Ctrl/Cmd + Enter to translate ────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      handleTranslate()
    }
  }

  // ── Text change ──────────────────────────────────────────────────────────
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value.slice(0, MAX_CHARS)
    setSourceText(val)
    setCharCount(val.length)
    if (translatedText) setTranslatedText('')
  }

  // ── Copy to clipboard ────────────────────────────────────────────────────
  const handleCopy = async () => {
    if (!translatedText) return
    await navigator.clipboard.writeText(translatedText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── Voice input ──────────────────────────────────────────────────────────
  const handleVoice = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    
    // Web Speech API (browser support)
const SR =
  (window as any).SpeechRecognition ||
  (window as any).webkitSpeechRecognition

    if (!SR) {
      alert('Voice input requires Chrome or Edge.')
      return
    }

    const recognition = new SR()
    // Use empty string for 'auto' — lets the browser detect the spoken language
    recognition.lang            = sourceLang.code === 'auto' ? '' : sourceLang.code
    recognition.interimResults  = false
    recognition.maxAlternatives = 1

    recognition.onstart  = () => setListening(true)
    recognition.onend    = () => setListening(false)
    recognition.onerror  = () => setListening(false)
    recognition.onresult = (e: any) => {
      const t = e.results[0][0].transcript
      setSourceText(t)
      setCharCount(t.length)
    }
    recognition.start()
  }

  // ── Text-to-speech ────────────────────────────────────────────────────────
  const handleSpeak = (text: string, langCode: string) => {
    if (!text || !('speechSynthesis' in window)) return
    const utt = new SpeechSynthesisUtterance(text)
    utt.lang  = langCode
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utt)
  }

  // ── Clear ────────────────────────────────────────────────────────────────
  const handleClear = () => {
    setSourceText('')
    setTranslatedText('')
    setError(null)
    setCharCount(0)
    textareaRef.current?.focus()
  }

  // ── Quick language selectors ─────────────────────────────────────────────
  const setSourceQuick = (code: string) => {
    if (code === 'auto') { setSourceLang(AUTO_DETECT); return }
    const lang = LANGUAGES.find((l) => l.code === code)
    if (lang) setSourceLang(lang)
  }
  const setTargetQuick = (code: string) => {
    const lang = LANGUAGES.find((l) => l.code === code)
    if (lang) setTargetLang(lang)
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen dark:bg-surface-950 bg-slate-50 pt-24 pb-16">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-500/5 dark:bg-brand-500/8 blur-3xl rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-10 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4
            dark:bg-brand-500/10 bg-brand-50
            dark:border-brand-500/20 border-brand-200 border
            text-brand-600 dark:text-brand-400 text-sm font-medium">
            <Sparkles size={14} />
            <span>AI-Powered Translation</span>
          </div>
          <h1 className="font-display font-bold text-3xl md:text-4xl dark:text-white text-slate-900">
            Translate Anything
          </h1>
          <p className="mt-2 dark:text-slate-400 text-slate-500 text-sm">
            Real-time translation across 200+ languages ·{' '}
            <kbd className="px-1.5 py-0.5 rounded text-xs dark:bg-white/10 bg-slate-200 font-mono">
              ⌘ Enter
            </kbd>{' '}
            to translate
          </p>
        </div>

        {/* Translator card */}
        <div className="rounded-3xl
          dark:bg-surface-900 bg-white
          border dark:border-white/5 border-slate-200
          shadow-xl shadow-black/5 dark:shadow-black/30
          animate-fade-in">

          {/* ── Language bar ── */}
          <div className="flex items-center rounded-t-3xl overflow-visible
            dark:bg-surface-800/50 bg-slate-50
            border-b dark:border-white/5 border-slate-100">

            {/* Source side */}
            <div className="flex-1 flex items-center gap-2 p-3 overflow-visible">
              <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
                {QUICK_LANGS.map((l) => (
                  <button
                    key={`src-${l.code}`}
                    onClick={() => setSourceQuick(l.code)}
                    className={[
                      'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 whitespace-nowrap',
                      sourceLang.code === l.code
                        ? 'bg-brand-500 text-white shadow-sm'
                        : 'dark:text-slate-400 text-slate-500 dark:hover:bg-white/5 hover:bg-slate-200',
                    ].join(' ')}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
              <div className="hidden sm:block w-px h-6 dark:bg-white/10 bg-slate-300 mx-1 flex-shrink-0" />
              <LanguageDropdown
                value={sourceLang}
                onChange={setSourceLang}
                showAutoDetect
                excludeCode={targetLang.code}
              />
            </div>

            {/* Swap button — disabled when source is Auto Detect */}
            <button
              onClick={swapLanguages}
              disabled={sourceLang.code === 'auto'}
              title={sourceLang.code === 'auto' ? 'Cannot swap when Auto Detect is active' : 'Swap languages'}
              className={[
                'flex-shrink-0 mx-2 w-10 h-10 rounded-xl flex items-center justify-center',
                'transition-all duration-300',
                sourceLang.code === 'auto'
                  ? 'dark:bg-white/5 bg-slate-100 dark:text-slate-600 text-slate-300 cursor-not-allowed opacity-40'
                  : 'dark:bg-white/5 bg-slate-200 dark:text-slate-300 text-slate-600 dark:hover:bg-brand-500/20 hover:bg-brand-100 dark:hover:text-brand-400 hover:text-brand-600 hover:rotate-180 hover:scale-105',
              ].join(' ')}
            >
              <ArrowLeftRight size={18} />
            </button>

            {/* Target side */}
            <div className="flex-1 flex items-center gap-2 p-3 overflow-visible justify-end">
              <LanguageDropdown
                value={targetLang}
                onChange={setTargetLang}
                excludeCode={sourceLang.code}
              />
              <div className="hidden sm:block w-px h-6 dark:bg-white/10 bg-slate-300 mx-1 flex-shrink-0" />
              <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
                {QUICK_LANGS.map((l) => (
                  <button
                    key={`tgt-${l.code}`}
                    onClick={() => setTargetQuick(l.code)}
                    className={[
                      'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 whitespace-nowrap',
                      targetLang.code === l.code
                        ? 'bg-brand-500 text-white shadow-sm'
                        : 'dark:text-slate-400 text-slate-500 dark:hover:bg-white/5 hover:bg-slate-200',
                    ].join(' ')}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Editor panels ── */}
          <div className="grid grid-cols-1 md:grid-cols-2
            divide-y md:divide-y-0 md:divide-x
            dark:divide-white/5 divide-slate-100">

            {/* Source panel */}
            <div className="flex flex-col">
              <textarea
                ref={textareaRef}
                value={sourceText}
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                placeholder={sourceLang.code === 'auto' ? 'Type or paste text in any language…' : `Type in ${sourceLang.name}…`}
                aria-label="Source text input"
                spellCheck={false}
                className="flex-1 w-full min-h-[220px] md:min-h-[280px] p-5 resize-none
                  bg-transparent
                  dark:text-white text-slate-900
                  dark:placeholder-slate-600 placeholder-slate-300
                  text-lg leading-relaxed outline-none font-body"
              />
              <div className="flex items-center justify-between px-4 py-3
                border-t dark:border-white/5 border-slate-100">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleVoice}
                    title={listening ? 'Stop' : 'Voice input'}
                    aria-pressed={listening}
                    className={[
                      'w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200',
                      listening
                        ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30'
                        : 'dark:bg-white/5 bg-slate-100 dark:text-slate-400 text-slate-500 dark:hover:text-white hover:text-slate-800',
                    ].join(' ')}
                  >
                    {listening ? <MicOff size={16} /> : <Mic size={16} />}
                  </button>
                  <button
                    onClick={() => handleSpeak(sourceText, sourceLang.code)}
                    disabled={!sourceText}
                    title="Read aloud"
                    className="w-9 h-9 rounded-xl flex items-center justify-center
                      transition-all duration-200
                      dark:bg-white/5 bg-slate-100
                      dark:text-slate-400 text-slate-500
                      dark:hover:text-white hover:text-slate-800
                      disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Volume2 size={16} />
                  </button>
                  {sourceText && (
                    <button
                      onClick={handleClear}
                      title="Clear"
                      className="w-9 h-9 rounded-xl flex items-center justify-center
                        transition-all duration-200
                        dark:bg-white/5 bg-slate-100
                        dark:text-slate-400 text-slate-500
                        dark:hover:text-red-400 hover:text-red-500"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
                <span className={[
                  'text-xs font-mono transition-colors',
                  charCount > MAX_CHARS * 0.9
                    ? 'text-red-400'
                    : 'dark:text-slate-600 text-slate-300',
                ].join(' ')}>
                  {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Output panel */}
            <div className="flex flex-col dark:bg-surface-900/50 bg-slate-50/50">
              <div className="flex-1 min-h-[220px] md:min-h-[280px] p-5 overflow-auto">
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                    <span className="text-sm dark:text-slate-400 text-slate-400 ml-1">
                      Translating…
                    </span>
                  </div>
                ) : error ? (
                  <div className="flex items-start gap-3 p-4 rounded-xl
                    bg-red-500/10 border border-red-500/20">
                    <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-red-400 mb-1">
                        Translation failed
                      </p>
                      <p className="text-xs text-red-400/70">{error}</p>
                    </div>
                  </div>
                ) : translatedText ? (
                  <p className="text-lg dark:text-white text-slate-900 leading-relaxed font-body">
                    <AnimatedOutput text={translatedText} />
                  </p>
                ) : (
                  <p className="text-lg dark:text-slate-700 text-slate-300 italic select-none">
                    Translation will appear here…
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between px-4 py-3
                border-t dark:border-white/5 border-slate-100">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSpeak(translatedText, targetLang.code)}
                    disabled={!translatedText}
                    title="Read aloud"
                    className="w-9 h-9 rounded-xl flex items-center justify-center
                      transition-all duration-200
                      dark:bg-white/5 bg-slate-100
                      dark:text-slate-400 text-slate-500
                      dark:hover:text-white hover:text-slate-800
                      disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Volume2 size={16} />
                  </button>
                  <button
                    onClick={handleCopy}
                    disabled={!translatedText}
                    title="Copy translation"
                    className={[
                      'w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200',
                      'disabled:opacity-30 disabled:cursor-not-allowed',
                      copied
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'dark:bg-white/5 bg-slate-100 dark:text-slate-400 text-slate-500 dark:hover:text-white hover:text-slate-800',
                    ].join(' ')}
                  >
                    {copied ? <Check size={15} /> : <Copy size={15} />}
                  </button>
                </div>
                {translatedText && (
                  <span className="text-xs dark:text-slate-600 text-slate-300 font-medium">
                    {targetLang.nativeName}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Translate button */}
          <div className="flex justify-center py-5 px-6 rounded-b-3xl
            border-t dark:border-white/5 border-slate-100
            dark:bg-surface-800/30 bg-slate-50/50">
            <button
              onClick={handleTranslate}
              disabled={!sourceText.trim() || isLoading}
              className="btn-primary px-10 py-3.5 text-base rounded-2xl
                disabled:opacity-40 disabled:cursor-not-allowed
                disabled:hover:transform-none disabled:hover:shadow-none"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Translating…</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Translate</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            'Use the microphone button for voice-to-text input in your chosen language.',
            'Swap source & target languages instantly with the ⇄ arrow button.',
            'Press ⌘ Enter (or Ctrl + Enter) to translate without reaching for the mouse.',
          ].map((tip, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-4 rounded-2xl
                dark:bg-surface-800/30 bg-white
                border dark:border-white/5 border-slate-100"
            >
              <span className="w-6 h-6 rounded-full bg-brand-500/10 flex items-center justify-center
                text-xs font-bold text-brand-500 flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-sm dark:text-slate-400 text-slate-500">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
