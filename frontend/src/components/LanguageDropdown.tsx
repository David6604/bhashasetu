import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search, Check, Wand2 } from 'lucide-react'
import { Language, LANGUAGES, AUTO_DETECT } from '../store'

interface LanguageDropdownProps {
  value:            Language
  onChange:         (lang: Language) => void
  /** If true, renders "Auto Detect" as the first pinned option (source lang only) */
  showAutoDetect?:  boolean
  excludeCode?:     string
  label?:           string
  className?:       string
}

export default function LanguageDropdown({
  value,
  onChange,
  showAutoDetect = false,
  excludeCode,
  label,
  className = '',
}: LanguageDropdownProps) {
  const [open, setOpen]   = useState(false)
  const [query, setQuery] = useState('')
  const ref               = useRef<HTMLDivElement>(null)
  const inputRef          = useRef<HTMLInputElement>(null)

  // Filter the main language list
  const filtered = LANGUAGES.filter(
    (l) =>
      l.code !== excludeCode &&
      (l.name.toLowerCase().includes(query.toLowerCase()) ||
       l.nativeName.toLowerCase().includes(query.toLowerCase()) ||
       l.code.toLowerCase().includes(query.toLowerCase())),
  )

  // Click-outside to close
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Auto-focus search input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const handleSelect = (lang: Language) => {
    onChange(lang)
    setOpen(false)
    setQuery('')
  }

  const isAutoSelected = value.code === 'auto'

  return (
    <div ref={ref} className={`relative ${className}`}>
      {label && (
        <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wider">
          {label}
        </p>
      )}

      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className={[
          'flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-200',
          'dark:bg-surface-800 bg-white',
          'dark:border-white/10 border-slate-200',
          'dark:text-white text-slate-800',
          'dark:hover:border-brand-500/50 hover:border-brand-400/50',
          'dark:hover:bg-surface-800 hover:bg-slate-50',
          'focus:outline-none focus:ring-2 focus:ring-brand-500/30',
          'min-w-[160px]',
          open ? 'dark:border-brand-500/50 border-brand-400/50 ring-2 ring-brand-500/20' : '',
        ].join(' ')}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {/* Flag or wand icon for auto detect */}
        {isAutoSelected ? (
          <Wand2 size={18} className="text-brand-500 dark:text-brand-400 flex-shrink-0" />
        ) : (
          <span className="text-xl leading-none flex-shrink-0">{value.flag}</span>
        )}

        <span className="flex-1 text-left min-w-0">
          <span className="block text-sm font-semibold truncate">{value.name}</span>
          <span className="block text-xs dark:text-slate-400 text-slate-500 truncate">
            {value.nativeName}
          </span>
        </span>

        <ChevronDown
          size={16}
          className={`dark:text-slate-400 text-slate-500 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute z-[200] top-full left-0 mt-2 w-72 rounded-2xl
            shadow-2xl shadow-black/20
            dark:bg-surface-850 bg-white
            dark:border-white/10 border border-slate-200
            overflow-hidden animate-fade-in"
        >
          {/* Search bar */}
          <div className="p-3 border-b dark:border-white/5 border-slate-100">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl dark:bg-surface-900 bg-slate-50">
              <Search size={15} className="dark:text-slate-500 text-slate-400 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search language…"
                className="flex-1 bg-transparent text-sm dark:text-white text-slate-800
                  placeholder-slate-400 dark:placeholder-slate-600 outline-none"
              />
            </div>
          </div>

          <ul role="listbox" className="max-h-64 overflow-y-auto py-2">

            {/* ── Pinned Auto Detect row (source dropdown only) ── */}
            {showAutoDetect && (
              <>
                <li>
                  <button
                    role="option"
                    aria-selected={isAutoSelected}
                    onClick={() => handleSelect(AUTO_DETECT)}
                    className={[
                      'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-150',
                      isAutoSelected
                        ? 'dark:bg-brand-500/15 bg-brand-50 dark:text-brand-400 text-brand-600'
                        : 'dark:text-slate-300 text-slate-700 dark:hover:bg-white/5 hover:bg-slate-50',
                    ].join(' ')}
                  >
                    <span className="w-7 flex items-center justify-center flex-shrink-0">
                      <Wand2 size={16} className={isAutoSelected ? 'text-brand-500' : 'dark:text-slate-400 text-slate-400'} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="block text-sm font-semibold">{AUTO_DETECT.name}</span>
                      <span className="block text-xs dark:text-slate-500 text-slate-400">
                        {AUTO_DETECT.nativeName}
                      </span>
                    </div>
                    {isAutoSelected && (
                      <Check size={15} className="text-brand-500 flex-shrink-0" />
                    )}
                  </button>
                </li>
                {/* Separator between auto detect and the language list */}
                <li role="separator" className="mx-3 my-1 border-t dark:border-white/5 border-slate-100" />
              </>
            )}

            {/* ── Filtered language list ── */}
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm dark:text-slate-500 text-slate-400 text-center">
                No languages found
              </li>
            ) : (
              filtered.map((lang) => {
                const selected = lang.code === value.code
                return (
                  <li key={lang.code}>
                    <button
                      role="option"
                      aria-selected={selected}
                      onClick={() => handleSelect(lang)}
                      className={[
                        'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-150',
                        selected
                          ? 'dark:bg-brand-500/15 bg-brand-50 dark:text-brand-400 text-brand-600'
                          : 'dark:text-slate-300 text-slate-700 dark:hover:bg-white/5 hover:bg-slate-50',
                      ].join(' ')}
                    >
                      <span className="text-lg leading-none w-7 flex-shrink-0">{lang.flag}</span>
                      <div className="flex-1 min-w-0">
                        <span className="block text-sm font-medium truncate">{lang.name}</span>
                        <span className="block text-xs dark:text-slate-500 text-slate-400">
                          {lang.nativeName}
                        </span>
                      </div>
                      {selected && (
                        <Check size={15} className="text-brand-500 flex-shrink-0" />
                      )}
                    </button>
                  </li>
                )
              })
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
