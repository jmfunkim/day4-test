import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const MAX_H = 6
const fmt = (n) => (n ?? 0).toLocaleString('ko-KR')

function makeLabel(text, { size = 56, color = '#17323b' } = {}) {
  const c = document.createElement('canvas')
  const ctx = c.getContext('2d')
  ctx.font = `700 ${size}px sans-serif`
  const w = Math.ceil(ctx.measureText(text).width) + 16
  c.width = w
  c.height = size + 16
  ctx.font = `700 ${size}px sans-serif`
  ctx.fillStyle = color
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 8, c.height / 2)
  const tex = new THREE.CanvasTexture(c)
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }))
  const scale = 0.012
  sprite.scale.set(w * scale, c.height * scale, 1)
  return sprite
}

// 월(x) × 관광지(z) × 관람객 수(높이) 3D 막대 그래프
export default function Bars3D({ rows, spots, colors }) {
  const mountRef = useRef(null)
  const [tip, setTip] = useState(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount || !rows.length) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200)
    camera.position.set(10, 9, 13)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    mount.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.8
    controls.maxPolarAngle = Math.PI / 2.05
    controls.target.set(0, 2, 0)
    controls.addEventListener('start', () => { controls.autoRotate = false })

    scene.add(new THREE.AmbientLight(0xffffff, 0.7))
    const sun = new THREE.DirectionalLight(0xffffff, 1.1)
    sun.position.set(8, 14, 6)
    scene.add(sun)

    const monthsN = 12
    const xGap = 1
    const zGap = 1.5
    const xOff = ((monthsN - 1) * xGap) / 2
    const zOff = ((spots.length - 1) * zGap) / 2

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(monthsN * xGap + 1, spots.length * zGap + 1),
      new THREE.MeshStandardMaterial({ color: 0xe8f3f6 }),
    )
    floor.rotation.x = -Math.PI / 2
    scene.add(floor)
    const grid = new THREE.GridHelper(Math.max(monthsN * xGap + 1, spots.length * zGap + 1), 14, 0x9bbcc6, 0xc9dde3)
    grid.position.y = 0.01
    scene.add(grid)

    const max = Math.max(1, ...rows.flatMap((r) => spots.map((s) => r[s] || 0)))
    const bars = []
    rows.forEach((r) => {
      spots.forEach((s, si) => {
        const v = r[s] || 0
        const h = Math.max(0.03, (v / max) * MAX_H)
        const mat = new THREE.MeshStandardMaterial({ color: colors[si % colors.length], roughness: 0.4 })
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1, 0.9), mat)
        mesh.position.set((r['기준월'] - 1) * xGap - xOff, 0, si * zGap - zOff)
        mesh.scale.y = 0.001
        mesh.userData = { h, text: `${s.replace('_', ' ')} · ${r['기준월']}월 · ${fmt(v)}명` }
        scene.add(mesh)
        bars.push(mesh)
      })
    })

    for (let m = 1; m <= monthsN; m++) {
      const l = makeLabel(`${m}월`, { size: 44 })
      l.position.set((m - 1) * xGap - xOff, 0.2, zOff + 1.3)
      scene.add(l)
    }
    spots.forEach((s, si) => {
      const l = makeLabel(s.replace('_', ' '), { size: 44, color: '#08475c' })
      l.position.set(-xOff - 2.4, 0.3, si * zGap - zOff)
      scene.add(l)
    })

    const ray = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    let hovered = null
    function onMove(e) {
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1)
      ray.setFromCamera(pointer, camera)
      const hit = ray.intersectObjects(bars)[0]?.object || null
      if (hovered && hovered !== hit) hovered.material.emissive.setHex(0x000000)
      hovered = hit
      if (hit) {
        hit.material.emissive.setHex(0x333333)
        setTip({ text: hit.userData.text, x: e.clientX - rect.left, y: e.clientY - rect.top })
      } else setTip(null)
    }
    renderer.domElement.addEventListener('pointermove', onMove)
    renderer.domElement.addEventListener('pointerleave', () => setTip(null))

    function resize() {
      const w = mount.clientWidth
      const h = mount.clientHeight
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(mount)

    let raf
    const t0 = performance.now()
    function tick(now) {
      const t = Math.min(1, (now - t0) / 1200)
      const ease = 1 - Math.pow(1 - t, 3)
      bars.forEach((b) => {
        const hh = Math.max(0.001, b.userData.h * ease)
        b.scale.y = hh
        b.position.y = hh / 2
      })
      controls.update()
      renderer.render(scene, camera)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      controls.dispose()
      renderer.domElement.removeEventListener('pointermove', onMove)
      scene.traverse((o) => {
        o.geometry?.dispose()
        const m = o.material
        if (m) { m.map?.dispose(); m.dispose() }
      })
      renderer.dispose()
      mount.removeChild(renderer.domElement)
    }
  }, [rows, spots, colors])

  return (
    <div className="bars3d" ref={mountRef}>
      {tip && <div className="tip3d" style={{ left: tip.x + 12, top: tip.y + 12 }}>{tip.text}</div>}
      <span className="hint3d">🖱️ 드래그: 회전 · 휠: 확대/축소 · 막대에 올리면 수치 표시</span>
    </div>
  )
}
