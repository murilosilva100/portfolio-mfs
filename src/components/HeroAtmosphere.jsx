import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export function HeroAtmosphere() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
    camera.position.z = 6

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    mount.appendChild(renderer.domElement)

    const count = 90
    const positions = new Float32Array(count * 3)
    for (let index = 0; index < count; index += 1) {
      positions[index * 3] = (Math.random() - 0.5) * 10
      positions[index * 3 + 1] = (Math.random() - 0.5) * 7
      positions[index * 3 + 2] = (Math.random() - 0.5) * 4
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const material = new THREE.PointsMaterial({ color: 0x9ca16f, size: 0.025, transparent: true, opacity: 0.48 })
    const particles = new THREE.Points(geometry, material)
    scene.add(particles)

    const resize = () => {
      const { width, height } = mount.getBoundingClientRect()
      renderer.setSize(width, height)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }
    resize()
    window.addEventListener('resize', resize)

    let frame
    const animate = (time) => {
      particles.rotation.y = time * 0.000025
      particles.rotation.x = Math.sin(time * 0.00015) * 0.08
      renderer.render(scene, camera)
      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return <div className="hero__atmosphere" ref={mountRef} aria-hidden="true" />
}
