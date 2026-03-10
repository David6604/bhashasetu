import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import TranslatePage from './pages/TranslatePage'
import { HelpPage, ContactPage } from './pages/HelpContactPages'

// ─── 404 page ─────────────────────────────────────────────────────────────────

function NotFoundPage() {
  return (
    <div className="min-h-screen dark:bg-surface-950 bg-slate-50 flex items-center justify-center pt-20">
      <div className="text-center px-4">
        <div className="font-display font-bold text-8xl gradient-text mb-4">404</div>
        <h2 className="font-display font-bold text-2xl dark:text-white text-slate-900 mb-2">
          Page not found
        </h2>
        <p className="dark:text-slate-400 text-slate-500 mb-8">
          The page you're looking for doesn't exist.
        </p>
        <a href="/" className="btn-primary px-6 py-3 rounded-xl inline-flex">
          Go Home
        </a>
      </div>
    </div>
  )
}

// ─── Root app ─────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <div className="flex flex-col min-h-screen dark:bg-surface-950 bg-slate-50 transition-colors duration-300">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/"          element={<HomePage />} />
          <Route path="/translate" element={<TranslatePage />} />
          <Route path="/help"      element={<HelpPage />} />
          <Route path="/contact"   element={<ContactPage />} />
          <Route path="*"          element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
