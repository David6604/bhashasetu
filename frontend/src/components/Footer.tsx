import { Link } from 'react-router-dom'
import { Globe2, Github, Twitter } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="relative border-t dark:border-white/5 border-slate-100 dark:bg-surface-950 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-brand-500 to-saffron-500">
                <Globe2 size={16} className="text-white" />
              </div>
              <span className="font-display font-bold text-lg dark:text-white text-slate-900">
                Bhasha<span className="gradient-text">Setu</span>
              </span>
            </Link>
            <p className="text-sm dark:text-slate-400 text-slate-500 max-w-xs leading-relaxed">
              Breaking language barriers with real-time AI translation. Connecting cultures through technology.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a href="#" className="w-8 h-8 rounded-lg flex items-center justify-center dark:bg-white/5 bg-slate-200 dark:text-slate-400 text-slate-500 hover:text-brand-500 dark:hover:text-brand-400 transition-colors">
                <Github size={15} />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg flex items-center justify-center dark:bg-white/5 bg-slate-200 dark:text-slate-400 text-slate-500 hover:text-brand-500 dark:hover:text-brand-400 transition-colors">
                <Twitter size={15} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold dark:text-white text-slate-900 mb-4">Product</h4>
            <ul className="space-y-2">
              {['Features', 'Translate', 'API Docs', 'Changelog'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm dark:text-slate-400 text-slate-500 hover:text-brand-500 dark:hover:text-brand-400 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold dark:text-white text-slate-900 mb-4">Company</h4>
            <ul className="space-y-2">
              {['About', 'Blog', 'Privacy', 'Terms'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm dark:text-slate-400 text-slate-500 hover:text-brand-500 dark:hover:text-brand-400 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t dark:border-white/5 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs dark:text-slate-500 text-slate-400">
            © {new Date().getFullYear()} BhashaSetu. All rights reserved.
          </p>
          <p className="text-xs dark:text-slate-500 text-slate-400">
            Built with ❤️ for India & the world
          </p>
        </div>
      </div>
    </footer>
  )
}
