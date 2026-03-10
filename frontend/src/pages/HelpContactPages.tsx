import { useState } from 'react'
import {
  HelpCircle,
  ChevronDown,
  MessageSquare,
  Mail,
  FileText,
  ExternalLink,
  Github,
  Phone,
  MessageCircle,
  Code2,
} from 'lucide-react'

// ─── FAQ data ─────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: "How accurate is BhashaSetu's translation?",
    a: 'BhashaSetu uses state-of-the-art AI models trained on billions of multilingual text pairs, achieving over 99% accuracy for major language pairs including all major Indian languages.',
  },
  {
    id: 'languages',
    q: 'Which Indian languages are supported?',
    a: 'We fully support Hindi, Telugu, Tamil, Kannada, Malayalam, Marathi, Bengali, Gujarati, Punjabi, Urdu, Odia, Assamese, and many more. Our system handles complex scripts and regional dialects.',
  },
  {
    q: 'Is there a character limit?',
    a: 'The standard translation endpoint supports up to 5,000 characters per request. For bulk document translation, contact us for our enterprise API.',
  },
  {
    id: 'voice',
    q: 'How do I use voice input?',
    a: 'Click the microphone button in the source panel. Allow microphone access when prompted. Speak clearly, and your speech will be transcribed and translated automatically. Voice input requires Chrome or Edge.',
  },
  {
    q: "Is my data stored or used for training?",
    a: 'We take privacy seriously. Translation requests are processed in real-time and are not stored permanently. Enterprise customers can opt for zero-data-retention mode.',
  },
  {
    q: 'Can I integrate BhashaSetu into my application?',
    a: 'Yes! Our REST API is available for developers. Send a POST request to /translate with your text, source language code, and target language code. See the API docs for full details.',
  },
  {
    id: 'offline',
    q: 'Is offline translation supported?',
    a: 'Offline support is currently in development. We plan to offer downloadable language packs so you can translate without an internet connection. Stay tuned for updates — this feature is coming soon!',
  },
]

// ─── FAQ accordion item ───────────────────────────────────────────────────────

function FAQItem({ q, a, anchorId }: { q: string; a: string; anchorId?: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      id={anchorId}
      className={[
        'rounded-2xl border transition-all duration-300 overflow-hidden scroll-mt-28',
        'dark:border-white/5 border-slate-200',
        'dark:bg-surface-800/40 bg-white',
        open ? 'dark:border-brand-500/20 border-brand-200' : '',
      ].join(' ')}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left gap-4"
      >
        <span className="font-semibold dark:text-white text-slate-900 text-sm">{q}</span>
        <ChevronDown
          size={18}
          className={[
            'dark:text-slate-400 text-slate-500 flex-shrink-0 transition-transform duration-300',
            open ? 'rotate-180 text-brand-500' : '',
          ].join(' ')}
        />
      </button>
      <div
        className={[
          'transition-all duration-300 overflow-hidden',
          open ? 'max-h-64 pb-5 px-5' : 'max-h-0',
        ].join(' ')}
      >
        <p className="text-sm dark:text-slate-400 text-slate-500 leading-relaxed">{a}</p>
      </div>
    </div>
  )
}

// ─── Help Page ────────────────────────────────────────────────────────────────

export function HelpPage() {
  return (
    <div className="min-h-screen dark:bg-surface-950 bg-slate-50 pt-28 pb-16">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center mx-auto mb-4">
            <HelpCircle size={28} className="text-brand-500" />
          </div>
          <h1 className="font-display font-bold text-4xl dark:text-white text-slate-900 mb-3">
            Help Center
          </h1>
          <p className="dark:text-slate-400 text-slate-500">
            Everything you need to know about BhashaSetu
          </p>
        </div>

        {/* Support cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          {[
            { icon: <FileText size={20} />,      title: 'Documentation', desc: 'Full API reference and guides' },
            { icon: <MessageSquare size={20} />, title: 'Community',     desc: 'Join 10,000+ developers'      },
            { icon: <Mail size={20} />,           title: 'Email Support', desc: 'Response within 24 hours'    },
          ].map((item, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl border dark:border-white/5 border-slate-200
                dark:bg-surface-800/40 bg-white text-center
                hover:border-brand-500/30 transition-colors cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center mx-auto mb-3 text-brand-500">
                {item.icon}
              </div>
              <h3 className="font-semibold dark:text-white text-slate-900 text-sm mb-1">{item.title}</h3>
              <p className="text-xs dark:text-slate-400 text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* FAQ heading — also serves as #languages anchor entry point */}
        <h2 className="font-display font-bold text-2xl dark:text-white text-slate-900 mb-6">
          Frequently Asked Questions
        </h2>

        {/* FAQ list — anchor IDs live on the individual FAQ items */}
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <FAQItem key={i} q={faq.q} a={faq.a} anchorId={faq.id} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Contact Page ─────────────────────────────────────────────────────────────

export function ContactPage() {
  const [sent, setSent]   = useState(false)
  const [form, setForm]   = useState({ name: '', email: '', subject: '', message: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTimeout(() => setSent(true), 500)
  }

  const inputCls = [
    'w-full px-4 py-3 rounded-xl border',
    'dark:bg-surface-800 bg-white',
    'dark:border-white/10 border-slate-200',
    'dark:text-white text-slate-900',
    'dark:placeholder-slate-600 placeholder-slate-300',
    'focus:outline-none focus:ring-2 focus:ring-brand-500/30',
    'dark:focus:border-brand-500/50 focus:border-brand-400',
    'transition-all duration-200 text-sm',
  ].join(' ')

  return (
    <div className="min-h-screen dark:bg-surface-950 bg-slate-50 pt-28 pb-16">
      <div className="max-w-2xl mx-auto px-4">

        {/* Page header */}
        <div className="text-center mb-12">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center mx-auto mb-4">
            <Mail size={28} className="text-brand-500" />
          </div>
          <h1 className="font-display font-bold text-4xl dark:text-white text-slate-900 mb-3">
            Contact Us
          </h1>
          <p className="dark:text-slate-400 text-slate-500">
            We'd love to hear from you. Send us a message and we'll respond within 24 hours.
          </p>
        </div>

        {/* ── Developer card ── */}
        <div className="mb-10 p-6 rounded-3xl border dark:border-white/5 border-slate-200
          dark:bg-surface-900 bg-white">

          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0">
              <Code2 size={20} className="text-brand-500" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg dark:text-white text-slate-900 leading-tight">
                Meet the Developer
              </h2>
              <p className="text-xs dark:text-slate-400 text-slate-500">Project author &amp; AI engineer</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-5 pb-5
            border-b dark:border-white/5 border-slate-100">
            <div className="flex-1">
              <p className="font-display font-bold text-xl dark:text-white text-slate-900 tracking-tight">
                DAVID LIVINGSTONE
              </p>
              <p className="text-sm dark:text-slate-400 text-slate-500 mt-0.5">
                AI Engineer · Software Developer
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Portfolio */}
            <a
              href="https://david6604.github.io/livngstone-portfolio/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 rounded-xl
                dark:bg-surface-800/60 bg-slate-50
                dark:border-white/5 border border-slate-200
                dark:text-slate-300 text-slate-700
                dark:hover:border-brand-500/40 hover:border-brand-400/40
                dark:hover:text-brand-400 hover:text-brand-600
                transition-all duration-200 group"
            >
              <ExternalLink size={16} className="flex-shrink-0 dark:text-slate-500 text-slate-400 group-hover:text-current transition-colors" />
              <div className="min-w-0">
                <p className="text-xs dark:text-slate-500 text-slate-400 mb-0.5">Portfolio</p>
                <p className="text-sm font-medium truncate">david6604.github.io</p>
              </div>
            </a>

            {/* GitHub */}
            <a
              href="https://github.com/David6604"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 rounded-xl
                dark:bg-surface-800/60 bg-slate-50
                dark:border-white/5 border border-slate-200
                dark:text-slate-300 text-slate-700
                dark:hover:border-brand-500/40 hover:border-brand-400/40
                dark:hover:text-brand-400 hover:text-brand-600
                transition-all duration-200 group"
            >
              <Github size={16} className="flex-shrink-0 dark:text-slate-500 text-slate-400 group-hover:text-current transition-colors" />
              <div className="min-w-0">
                <p className="text-xs dark:text-slate-500 text-slate-400 mb-0.5">GitHub</p>
                <p className="text-sm font-medium truncate">github.com/David6604</p>
              </div>
            </a>

            {/* Phone */}
            <a
              href="tel:+919490431372"
              className="flex items-center gap-3 px-4 py-3 rounded-xl
                dark:bg-surface-800/60 bg-slate-50
                dark:border-white/5 border border-slate-200
                dark:text-slate-300 text-slate-700
                dark:hover:border-brand-500/40 hover:border-brand-400/40
                dark:hover:text-brand-400 hover:text-brand-600
                transition-all duration-200 group"
            >
              <Phone size={16} className="flex-shrink-0 dark:text-slate-500 text-slate-400 group-hover:text-current transition-colors" />
              <div className="min-w-0">
                <p className="text-xs dark:text-slate-500 text-slate-400 mb-0.5">Phone</p>
                <p className="text-sm font-medium">+91 9490431372</p>
              </div>
            </a>

            {/* WhatsApp */}
            <a
              href="https://wa.me/919490462597"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 rounded-xl
                dark:bg-surface-800/60 bg-slate-50
                dark:border-white/5 border border-slate-200
                dark:text-slate-300 text-slate-700
                dark:hover:border-emerald-500/40 hover:border-emerald-400/40
                dark:hover:text-emerald-400 hover:text-emerald-600
                transition-all duration-200 group"
            >
              <MessageCircle size={16} className="flex-shrink-0 dark:text-slate-500 text-slate-400 group-hover:text-current transition-colors" />
              <div className="min-w-0">
                <p className="text-xs dark:text-slate-500 text-slate-400 mb-0.5">WhatsApp</p>
                <p className="text-sm font-medium">+91 9490462597</p>
              </div>
            </a>
          </div>
        </div>

        {/* ── Contact form ── */}
        {sent ? (
          <div className="p-10 rounded-3xl border dark:border-emerald-500/20 border-emerald-200 dark:bg-emerald-500/10 bg-emerald-50 text-center">
            <div className="text-4xl mb-4">✅</div>
            <h3 className="font-display font-bold text-xl dark:text-white text-slate-900 mb-2">
              Message sent!
            </h3>
            <p className="dark:text-slate-400 text-slate-500 text-sm">
              Thanks for reaching out. We'll get back to you shortly.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="p-8 rounded-3xl border dark:border-white/5 border-slate-200 dark:bg-surface-900 bg-white space-y-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold dark:text-slate-400 text-slate-500 uppercase tracking-wider mb-2">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Your name"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold dark:text-slate-400 text-slate-500 uppercase tracking-wider mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="you@example.com"
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold dark:text-slate-400 text-slate-500 uppercase tracking-wider mb-2">
                Subject
              </label>
              <input
                type="text"
                required
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                placeholder="How can we help?"
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold dark:text-slate-400 text-slate-500 uppercase tracking-wider mb-2">
                Message
              </label>
              <textarea
                required
                rows={6}
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                placeholder="Tell us more…"
                className={`${inputCls} resize-none`}
              />
            </div>

            <button type="submit" className="btn-primary w-full justify-center py-3.5 text-base">
              Send Message
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
