import { useEffect, useRef } from 'react'

export function HeroAtmosphere() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const compactViewport = window.matchMedia('(max-width: 640px)').matches
    const saveData = navigator.connection?.saveData
    if (compactViewport || saveData) return undefined
    let disposed = false
    let cleanup = () => {}
    let idleId

    const initialize = async () => {
      const { createAtmosphere } = await import('./threeAtmosphereRuntime')
      if (disposed) return
      cleanup = createAtmosphere(mount, reduceMotion)
    }

    if ('requestIdleCallback' in window) idleId = window.requestIdleCallback(initialize, { timeout: 900 })
    else idleId = window.setTimeout(initialize, 300)

    return () => {
      disposed = true
      if ('cancelIdleCallback' in window) window.cancelIdleCallback(idleId)
      else window.clearTimeout(idleId)
      cleanup()
    }
  }, [])

  return <div className="hero__atmosphere" ref={mountRef} aria-hidden="true" />
}
