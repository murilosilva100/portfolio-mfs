import {
  BufferAttribute,
  BufferGeometry,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  WebGLRenderer,
} from 'three'

export function createAtmosphere(mount, reduceMotion) {
  const scene = new Scene()
  const camera = new PerspectiveCamera(45, 1, 0.1, 100)
  camera.position.z = 6
  const renderer = new WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25))
  mount.appendChild(renderer.domElement)

  const count = reduceMotion ? 45 : 72
  const positions = new Float32Array(count * 3)
  for (let index = 0; index < count; index += 1) {
    positions[index * 3] = (Math.random() - 0.5) * 10
    positions[index * 3 + 1] = (Math.random() - 0.5) * 7
    positions[index * 3 + 2] = (Math.random() - 0.5) * 4
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(positions, 3))
  const material = new PointsMaterial({ color: 0x0272ea, size: 0.025, transparent: true, opacity: 0.42 })
  const particles = new Points(geometry, material)
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
  let visible = true
  const animate = (time) => {
    if (!reduceMotion && visible) {
      particles.rotation.y = time * 0.000025
      particles.rotation.x = Math.sin(time * 0.00015) * 0.08
    }
    if (visible) renderer.render(scene, camera)
    frame = requestAnimationFrame(animate)
  }
  frame = requestAnimationFrame(animate)

  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
  })
  observer.observe(mount)

  return () => {
    observer.disconnect()
    cancelAnimationFrame(frame)
    window.removeEventListener('resize', resize)
    geometry.dispose()
    material.dispose()
    renderer.dispose()
    renderer.domElement.remove()
  }
}
