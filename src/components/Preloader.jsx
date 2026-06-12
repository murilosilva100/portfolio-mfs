import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

export function Preloader({ onComplete }) {
  const root = useRef(null)
  const [count, setCount] = useState(0)

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const returningVisitor = sessionStorage.getItem('mfs-visited') === 'true'
    const progress = { value: 0 }
    let tween
    let cancelled = false

    const image = new Image()
    image.src = '/murilo-profile.jpeg'
    const imageReady = image.decode?.().catch(() => {}) || Promise.resolve()
    const fontsReady = document.fonts?.ready || Promise.resolve()
    const minimumDelay = new Promise((resolve) => window.setTimeout(resolve, returningVisitor ? 120 : 650))

    Promise.all([imageReady, fontsReady, minimumDelay]).then(() => {
      if (cancelled) return
      tween = gsap.to(progress, {
        value: 100,
        duration: reduceMotion ? 0.01 : returningVisitor ? 0.18 : 0.65,
        ease: 'power2.out',
        onUpdate: () => setCount(Math.round(progress.value)),
        onComplete: () => {
          sessionStorage.setItem('mfs-visited', 'true')
          gsap.to(root.current, {
            yPercent: -100,
            duration: reduceMotion ? 0.01 : 0.75,
            ease: 'power4.inOut',
            onComplete,
          })
        },
      })
    })

    return () => {
      cancelled = true
      tween?.kill()
    }
  }, [onComplete])

  return (
    <div className="preloader" ref={root} role="status" aria-live="polite" aria-label="Carregando portfólio">
      <div className="preloader__mark">M<span>F</span></div>
      <div className="preloader__bottom">
        <span>Carregando experiência</span>
        <strong>{String(count).padStart(3, '0')}</strong>
      </div>
      <div className="preloader__line" />
    </div>
  )
}
