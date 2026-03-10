import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Sun, Moon, Menu, X, Globe2 } from 'lucide-react'
import { useThemeStore } from '../store'

const NAV_LINKS = [
  { label: 'Home',              href: '/' },
  { label: 'Start Translation', href: '/translate' },
  { label: 'Help',              href: '/help' },
  { label: 'Contact',           href: '/contact' },
]

export default function Navbar() {
  const { isDark, toggle } = useThemeStore()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500
        ${scrolled
          ? 'py-2 dark:bg-surface-900/80 bg-white/80 backdrop-blur-xl shadow-lg shadow-black/5 border-b border-white/10'
          : 'py-4 bg-transparent'
        }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center
            bg-gradient-to-br from-brand-500 to-saffron-500 shadow-lg shadow-brand-500/30
            group-hover:shadow-brand-500/50 transition-shadow duration-300">
            <Globe2 size={20} className="text-white" strokeWidth={2} />
          </div>
          <span className="font-display font-bold text-xl tracking-tight dark:text-white text-surface-900">
            Bhasha<span className="gradient-text">Setu</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const active = location.pathname === link.href
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${active
                    ? 'text-brand-500 dark:text-brand-400'
                    : 'dark:text-slate-300 text-slate-600 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
              >
                {active && (
                  <span className="absolute inset-0 rounded-lg bg-brand-500/10 dark:bg-brand-500/15" />
                )}
                <span className="relative">{link.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
              dark:bg-white/5 dark:hover:bg-white/10 bg-slate-100 hover:bg-slate-200
              dark:text-slate-300 text-slate-600 hover:scale-105 active:scale-95`}
          >
            <span className={`absolute transition-all duration-300 ${isDark ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'}`}>
              <Sun size={18} />
            </span>
            <span className={`absolute transition-all duration-300 ${isDark ? 'opacity-0 -rotate-90' : 'opacity-100 rotate-0'}`}>
              <Moon size={18} />
            </span>
          </button>

          {/* CTA */}
          <Link
            to="/translate"
            className="hidden sm:flex btn-primary text-sm px-5 py-2.5"
          >
            <span>Translate</span>
          </Link>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center
              dark:bg-white/5 bg-slate-100 dark:text-slate-300 text-slate-600
              transition-all duration-200 hover:scale-105"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`md:hidden transition-all duration-300 overflow-hidden ${menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-4 pt-2 pb-4 space-y-1 dark:bg-surface-900/95 bg-white/95 backdrop-blur-xl border-t dark:border-white/5 border-slate-100">
          {NAV_LINKS.map((link) => {
            const active = location.pathname === link.href
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                  ${active
                    ? 'bg-brand-500/10 text-brand-500 dark:text-brand-400'
                    : 'dark:text-slate-300 text-slate-600 hover:bg-slate-50 dark:hover:bg-white/5'
                  }`}
              >
                {link.label}
              </Link>
            )
          })}
          <div className="pt-2">
            <Link to="/translate" className="btn-primary w-full justify-center text-sm py-3">
              Start Translating
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
