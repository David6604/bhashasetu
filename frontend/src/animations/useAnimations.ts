import { useEffect, useRef, useState } from 'react'

// ─── Animated language words cycling hook ────────────────────────────────────

const TRANSLATION_WORDS = [
  { text: 'translation',     lang: 'en' },
  { text: 'अनुवाद',           lang: 'hi' },
  { text: 'అనువాదం',          lang: 'te' },
  { text: 'மொழிபெயர்ப்பு',     lang: 'ta' },
  { text: 'ಭಾಷಾಂತರ',          lang: 'kn' },
  { text: 'ترجمة',            lang: 'ar' },
  { text: 'traduction',      lang: 'fr' },
  { text: 'Übersetzung',     lang: 'de' },
  { text: 'traducción',      lang: 'es' },
  { text: '翻訳',              lang: 'ja' },
]

export function useAnimatedWords(intervalMs = 800) {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex((i) => (i + 1) % TRANSLATION_WORDS.length)
        setVisible(true)
      }, 200)
    }, intervalMs)

    return () => clearInterval(timer)
  }, [intervalMs])

  return { word: TRANSLATION_WORDS[index], visible }
}

// ─── Intersection Observer for scroll-triggered animations ───────────────────

export function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, inView }
}

// ─── Stagger children animation ──────────────────────────────────────────────

export function useStaggeredChildren(count: number, delayMs = 100) {
  const delays = Array.from({ length: count }, (_, i) => i * delayMs)
  return delays
}

// ─── Typewriter effect hook ──────────────────────────────────────────────────

export function useTypewriter(text: string, speed = 30) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    setDisplayed('')
    setDone(false)
    if (!text) return

    let i = 0
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1))
        i++
      } else {
        setDone(true)
        clearInterval(timer)
      }
    }, speed)

    return () => clearInterval(timer)
  }, [text, speed])

  return { displayed, done }
}

export { TRANSLATION_WORDS }
