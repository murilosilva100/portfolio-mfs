import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

export function Preloader({ onComplete }) {
  const root = useRef(null)
  const [count, setCount] = useState(0)

  useEffect(() => {
    const progress = { value: 0 }
    const tween = gsap.to(progress, {
      value: 100,
      duration: 1.8,
      ease: 'power3.inOut',
      onUpdate: () => setCount(Math.round(progress.value)),
      onComplete: () => {
        gsap.timeline({ onComplete })
          .to(root.current.querySelector('.preloader__line'), { scaleX: 0, transformOrigin: 'right', duration: 0.45 })
          .to(root.current, { yPercent: -100, duration: 0.9, ease: 'power4.inOut' }, '-=0.1')
      },
    })
    return () => tween.kill()
  }, [onComplete])

  return (
    <div className="preloader" ref={root}>
      <div className="preloader__mark">M<span>F</span></div>
      <div className="preloader__bottom">
        <span>Carregando experiência</span>
        <strong>{String(count).padStart(3, '0')}</strong>
      </div>
      <div className="preloader__line" />
    </div>
  )
}
