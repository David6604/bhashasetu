import { useNavigate, Link } from 'react-router-dom'
import { ArrowRight, Zap, Globe2, Mic, WifiOff, Sparkles, ChevronRight } from 'lucide-react'
import { useAnimatedWords, useInView } from '../animations/useAnimations'

// ─── Hero animated word ───────────────────────────────────────────────────────

function AnimatedWord() {
  const { word, visible } = useAnimatedWords(800)

  return (
    <span
      className={`inline-block shimmer-text transition-all duration-200 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
      style={{ minWidth: '280px' }}
    >
      {word.text}
    </span>
  )
}

// ─── Feature Card ─────────────────────────────────────────────────────────────

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  href: string
  badge?: string
  delay?: number
  accent: string
}

function FeatureCard({ icon, title, description, href, badge, delay = 0, accent }: FeatureCardProps) {
  const { ref, inView } = useInView()

  return (
    <div
      ref={ref}
      className={`group relative p-6 rounded-2xl border card-hover cursor-pointer
        dark:bg-surface-800/50 bg-white
        dark:border-white/5 border-slate-200
        dark:hover:border-white/10 hover:border-slate-300
        dark:hover:shadow-xl dark:hover:shadow-black/20 hover:shadow-xl hover:shadow-slate-200
        transition-all duration-500
        ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Icon */}
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${accent} transition-transform duration-300 group-hover:scale-110`}>
        {icon}
      </div>

      {/* Badge */}
      {badge && (
        <span className="absolute top-4 right-4 text-xs px-2.5 py-1 rounded-full dark:bg-saffron-500/15 bg-saffron-50 dark:text-saffron-400 text-saffron-600 font-medium border dark:border-saffron-500/20 border-saffron-200">
          {badge}
        </span>
      )}

      <h3 className="font-display font-semibold text-lg dark:text-white text-slate-900 mb-2">
        {title}
      </h3>
      <p className="text-sm dark:text-slate-400 text-slate-500 leading-relaxed">
        {description}
      </p>

      <Link
        to={href}
        className="inline-flex items-center gap-1 mt-4 text-xs font-medium text-brand-500 dark:text-brand-400
          opacity-0 group-hover:opacity-100 transition-opacity duration-300
          hover:text-brand-600 dark:hover:text-brand-300 relative z-10"
      >
        Learn more <ChevronRight size={12} />
      </Link>
    </div>
  )
}

// ─── Stats ────────────────────────────────────────────────────────────────────

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="font-display font-bold text-3xl md:text-4xl gradient-text">{value}</div>
      <div className="text-sm dark:text-slate-400 text-slate-500 mt-1">{label}</div>
    </div>
  )
}

// ─── Language Pill ─────────────────────────────────────────────────────────────

function LangPill({ flag, name }: { flag: string; name: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-full dark:bg-surface-800 bg-white border dark:border-white/10 border-slate-200 text-sm dark:text-slate-300 text-slate-600 animate-float shadow-sm">
      <span>{flag}</span>
      <span className="font-medium">{name}</span>
    </div>
  )
}

// ─── Homepage ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const navigate = useNavigate()
  const { ref: featRef, inView: featInView } = useInView()

  return (
    <div className="relative min-h-screen dark:bg-surface-950 bg-slate-50 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-brand-500/10 dark:bg-brand-500/5 blur-3xl" />
        <div className="absolute top-1/3 right-0 w-96 h-96 rounded-full bg-saffron-500/10 dark:bg-saffron-500/5 blur-3xl" />
        <div className="absolute top-1/3 left-0 w-64 h-64 rounded-full bg-brand-400/10 dark:bg-brand-400/5 blur-3xl" />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            color: '#0ea5e9',
          }}
        />
      </div>

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-28 px-4">
        <div className="max-w-5xl mx-auto text-center">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8
            dark:bg-brand-500/10 bg-brand-50
            dark:border-brand-500/20 border-brand-200 border
            text-brand-600 dark:text-brand-400 text-sm font-medium
            animate-fade-in">
            <Sparkles size={14} />
            <span>Powered by Advanced AI Models</span>
          </div>

          {/* Main heading */}
          <h1 className="font-display font-bold text-5xl md:text-7xl lg:text-8xl tracking-tight
            dark:text-white text-slate-900 leading-[1.05] mb-6
            animate-slide-up">
            Bhasha<span className="gradient-text">Setu</span>
          </h1>

          {/* Subtitle with animated word */}
          <p className="font-body text-xl md:text-2xl dark:text-slate-300 text-slate-600 mb-3
            animate-slide-up animation-delay-100 max-w-2xl mx-auto leading-relaxed">
            Break language barriers with real-time AI
          </p>
          <div className="text-xl md:text-2xl font-display font-semibold mb-10 h-10 flex items-center justify-center animate-slide-up animation-delay-200">
            <AnimatedWord />
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up animation-delay-300">
            <button
              onClick={() => navigate('/translate')}
              className="btn-primary text-base px-8 py-4 rounded-2xl"
            >
              <span>Start Translating</span>
              <ArrowRight size={18} />
            </button>
            <a
              href="#features"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold
                dark:text-slate-300 text-slate-600
                dark:bg-white/5 bg-white
                dark:border-white/10 border-slate-200 border
                dark:hover:bg-white/10 hover:bg-slate-50
                transition-all duration-300"
            >
              See how it works
            </a>
          </div>

          {/* Floating language pills */}
          <div className="mt-16 flex flex-wrap justify-center gap-3 animate-fade-in animation-delay-500">
            {[
              { flag: '🇮🇳', name: 'Hindi' },
              { flag: '🇮🇳', name: 'Telugu' },
              { flag: '🇫🇷', name: 'French' },
              { flag: '🇯🇵', name: '日本語' },
              { flag: '🇸🇦', name: 'Arabic' },
              { flag: '🇩🇪', name: 'German' },
              { flag: '🇮🇳', name: 'Tamil' },
              { flag: '🇪🇸', name: 'Spanish' },
            ].map((l, i) => (
              <div key={i} style={{ animationDelay: `${i * 0.15 + 0.5}s` }}>
                <LangPill {...l} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-3 gap-8 p-8 rounded-3xl
            dark:bg-surface-800/40 bg-white
            dark:border-white/5 border-slate-200 border
            backdrop-blur-sm">
            <StatItem value="200+" label="Languages" />
            <StatItem value="< 1s" label="Response Time" />
            <StatItem value="99.9%" label="Accuracy" />
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-20 px-4" ref={featRef}>
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-14 transition-all duration-700 ${featInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-500 dark:text-brand-400 mb-3 block">
              Why BhashaSetu
            </span>
            <h2 className="font-display font-bold text-4xl md:text-5xl dark:text-white text-slate-900 mb-4">
              Built for <span className="gradient-text">every language</span>
            </h2>
            <p className="text-lg dark:text-slate-400 text-slate-500 max-w-xl mx-auto">
              Designed from the ground up to handle the complexity and richness of Indian and global languages.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <FeatureCard
              icon={<Zap size={22} className="text-brand-400" />}
              title="Real-time Translation"
              description="Get instant translations powered by state-of-the-art AI models with sub-second response times."
              href="/translate"
              accent="bg-brand-500/10 dark:bg-brand-500/15"
              delay={0}
            />
            <FeatureCard
              icon={<Globe2 size={22} className="text-emerald-400" />}
              title="200+ Languages"
              description="Comprehensive support for all major Indian languages plus global languages across every region."
              href="/help#languages"
              accent="bg-emerald-500/10 dark:bg-emerald-500/15"
              delay={100}
            />
            <FeatureCard
              icon={<Mic size={22} className="text-violet-400" />}
              title="Voice Translation"
              description="Speak naturally and get real-time voice-to-text translation in your target language."
              href="/help#voice"
              accent="bg-violet-500/10 dark:bg-violet-500/15"
              delay={200}
            />
            <FeatureCard
              icon={<WifiOff size={22} className="text-saffron-400" />}
              title="Offline Support"
              description="Download language packs and translate without an internet connection anywhere, anytime."
              href="/help#offline"
              accent="bg-saffron-500/10 dark:bg-saffron-500/15"
              badge="Coming Soon"
              delay={300}
            />
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl p-10 md:p-16 text-center
            bg-gradient-to-br from-brand-600 via-brand-500 to-saffron-500
            animate-glow-pulse">
            {/* Overlay pattern */}
            <div className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />
            <div className="relative">
              <h2 className="font-display font-bold text-3xl md:text-5xl text-white mb-4">
                Start translating today
              </h2>
              <p className="text-blue-100 text-lg mb-8 max-w-lg mx-auto">
                Join thousands who are breaking language barriers with BhashaSetu's AI-powered translation.
              </p>
              <button
                onClick={() => navigate('/translate')}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-brand-600 font-bold text-lg hover:bg-blue-50 transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl shadow-black/20"
              >
                Try BhashaSetu Free
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
