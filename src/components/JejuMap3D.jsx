import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { A, B, LAYERS, POIS, colorAt, heightAt, mulberry32, noise2, polar, poiPos } from '../lib/jejuData.js'

const COLOR = Object.fromEntries(LAYERS.map((l) => [l.key, l.color]))
const PIN_Y = { spot: 0.55, orom: 0.6, wind: 1.7, light: 1.05, hareubang: 0.9, olle: 0.4, port: 0.55, orchard: 0.6 }

function makeLabel(text) {
  const size = 40
  const c = document.createElement('canvas')
  const ctx = c.getContext('2d')
  ctx.font = `700 ${size}px sans-serif`
  const w = Math.ceil(ctx.measureText(text).width) + 28
  c.width = w
  c.height = size + 22
  ctx.fillStyle = 'rgba(255,255,255,.88)'
  ctx.beginPath()
  ctx.roundRect(0, 0, w, c.height, 20)
  ctx.fill()
  ctx.font = `700 ${size}px sans-serif`
  ctx.fillStyle = '#17323b'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 14, c.height / 2 + 2)
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthTest: false }))
  sprite.scale.set(w * 0.0085, c.height * 0.0085, 1)
  sprite.renderOrder = 10
  return sprite
}

const std = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.7, ...extra })

function buildTurbine(rotors) {
  const g = new THREE.Group()
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.045, 1.2, 8), std(0xf4f6f8))
  tower.position.y = 0.6
  const rotor = new THREE.Group()
  rotor.position.set(0, 1.22, 0.06)
  for (let i = 0; i < 3; i++) {
    const pivot = new THREE.Group()
    pivot.rotation.z = (i * Math.PI * 2) / 3
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.52, 0.01), std(0xffffff))
    blade.position.y = 0.27
    pivot.add(blade)
    rotor.add(pivot)
  }
  rotor.add(new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), std(0xdddddd)))
  g.add(tower, rotor)
  rotors.push(rotor)
  return g
}

function buildLighthouse(beams) {
  const g = new THREE.Group()
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.13, 0.75, 12), std(0xffffff))
  body.position.y = 0.375
  const stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.098, 0.113, 0.16, 12), std(0xe63946))
  stripe.position.y = 0.35
  const deck = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.1, 0.05, 12), std(0x333b40))
  deck.position.y = 0.77
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 8), new THREE.MeshStandardMaterial({ color: 0xfff1a8, emissive: 0xffd54a, emissiveIntensity: 1.2 }))
  lamp.position.y = 0.85
  const roof = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.14, 12), std(0xe63946))
  roof.position.y = 0.97
  const beamPivot = new THREE.Group()
  beamPivot.position.y = 0.85
  const beam = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.03, 0.09),
    new THREE.MeshBasicMaterial({ color: 0xffe58a, transparent: true, opacity: 0.4 }),
  )
  beam.position.x = 0.75
  beamPivot.add(beam)
  g.add(body, stripe, deck, lamp, roof, beamPivot)
  beams.push(beamPivot)
  return g
}

function buildHareubang() {
  const g = new THREE.Group()
  const stone = std(0x6f6a66, { roughness: 0.95 })
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.17, 0.36, 12), stone)
  body.position.y = 0.18
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 14, 12), stone)
  head.position.y = 0.46
  head.scale.set(1, 1.1, 1)
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.025, 16), stone)
  brim.position.y = 0.58
  const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.125, 0.1, 14), stone)
  hat.position.y = 0.64
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), stone)
  nose.position.set(0, 0.44, 0.15)
  g.add(body, head, brim, hat, nose)
  for (const sx of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 6), std(0x1d1d1d))
    eye.position.set(sx * 0.06, 0.5, 0.13)
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), stone)
    hand.position.set(sx * 0.07, 0.22, 0.14)
    g.add(eye, hand)
  }
  return g
}

function buildPort(boats) {
  const g = new THREE.Group() // 로컬 +x 가 바다 쪽
  const wood = std(0x8a6a4a)
  const pier = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.04, 0.14), wood)
  pier.position.set(0.2, 0.03, 0)
  const wallA = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.8), std(0xb8b2a8))
  wallA.position.set(0.7, 0.04, 0)
  g.add(pier, wallA)
  const colors = [0xffffff, 0xe63946, 0x2a9d8f]
  colors.forEach((c, i) => {
    const boat = new THREE.Group()
    const hull = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.05, 0.08), std(c))
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.06, 0.06), std(0xf3f3f3))
    cabin.position.set(-0.03, 0.05, 0)
    boat.add(hull, cabin)
    boat.position.set(0.42, 0.02, (i - 1) * 0.22)
    boat.userData.phase = i * 1.7
    g.add(boat)
    boats.push(boat)
  })
  return g
}

function buildOrchard(center) {
  const rng = mulberry32(Math.floor(center.x * 100 + center.z * 7))
  const crowns = []
  for (let i = 0; i < 70; i++) {
    const ang = rng() * Math.PI * 2
    const r = Math.sqrt(rng()) * 0.95
    const x = center.x + Math.cos(ang) * r * 1.3
    const z = center.z + Math.sin(ang) * r * 0.9
    const h = heightAt(x, z)
    if (h < 0.06 || h > 1.2) continue
    crowns.push({ x, y: h, z })
  }
  const crownMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.1, 8, 6), std(0x2f8f3a), crowns.length)
  const fruitMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.035, 6, 5), std(0xff8a1f, { emissive: 0x552200 }), crowns.length * 3)
  const trunkMesh = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.012, 0.016, 0.1, 5), std(0x6b4a2b), crowns.length)
  const d = new THREE.Object3D()
  crowns.forEach((c, i) => {
    d.position.set(c.x, c.y + 0.14, c.z); d.scale.setScalar(1); d.updateMatrix(); crownMesh.setMatrixAt(i, d.matrix)
    d.position.set(c.x, c.y + 0.05, c.z); d.updateMatrix(); trunkMesh.setMatrixAt(i, d.matrix)
    for (let k = 0; k < 3; k++) {
      d.position.set(c.x + (rng() - 0.5) * 0.16, c.y + 0.14 + (rng() - 0.3) * 0.12, c.z + (rng() - 0.5) * 0.16)
      d.updateMatrix()
      fruitMesh.setMatrixAt(i * 3 + k, d.matrix)
    }
  })
  const g = new THREE.Group()
  g.add(trunkMesh, crownMesh, fruitMesh)
  return g
}

export default function JejuMap3D({ visible, selectedId, onSelect }) {
  const mountRef = useRef(null)
  const api = useRef({})
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect
  const [tip, setTip] = useState(null)

  useEffect(() => {
    const mount = mountRef.current
    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0xcfeaf5, 28, 60)
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200)
    camera.position.set(0, 14, 19)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    mount.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.minDistance = 2.5
    controls.maxDistance = 36
    controls.maxPolarAngle = Math.PI / 2.1
    controls.target.set(0, 0, 0)

    scene.add(new THREE.HemisphereLight(0xdff3ff, 0x6b8f4a, 0.9))
    const sun = new THREE.DirectionalLight(0xfff3d6, 1.3)
    sun.position.set(10, 16, 8)
    scene.add(sun)

    // 지형
    const W = 36
    const D = 18
    const geo = new THREE.PlaneGeometry(W, D, 400, 200)
    geo.rotateX(-Math.PI / 2)
    const pos = geo.attributes.position
    const cols = new Float32Array(pos.count * 3)
    const eps = 0.06
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const z = pos.getZ(i)
      const h = heightAt(x, z)
      pos.setY(i, h)
      const slope = h > 0.2 ? Math.hypot(heightAt(x + eps, z) - h, heightAt(x, z + eps) - h) / eps : 0
      const [r, g, b] = colorAt(h, x, z, slope)
      cols.set([r, g, b], i * 3)
    }
    geo.setAttribute('color', new THREE.BufferAttribute(cols, 3))
    geo.computeVertexNormals()
    scene.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 })))

    const sea = new THREE.Mesh(
      new THREE.PlaneGeometry(W, D, 120, 60),
      new THREE.MeshPhongMaterial({ color: 0x2a93c2, transparent: true, opacity: 0.72, shininess: 90, specular: 0x99ccee }),
    )
    sea.rotation.x = -Math.PI / 2
    sea.position.y = 0.004
    scene.add(sea)
    const seaPos = sea.geometry.attributes.position

    // 레이어 그룹
    const groups = {}
    LAYERS.forEach((l) => { groups[l.key] = new THREE.Group(); scene.add(groups[l.key]) })

    const rotors = []
    const beams = []
    const boats = []
    const markers = []
    const markerOf = {}

    // 올레길: 해안선을 따라 도는 주황색 길
    const trailPts = []
    for (let d = 0; d < 360; d += 5) {
      const p = polar(d, 0.985)
      trailPts.push(new THREE.Vector3(p.x, Math.max(heightAt(p.x, p.z), 0.02) + 0.05, p.z))
    }
    const trail = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(trailPts, true), 400, 0.03, 6, true),
      new THREE.MeshStandardMaterial({ color: 0xff7f11, emissive: 0xff5500, emissiveIntensity: 0.5 }),
    )
    groups.olle.add(trail)

    POIS.forEach((p) => {
      const { x, z } = poiPos(p)
      const y = Math.max(heightAt(x, z), 0)
      const grp = groups[p.type]
      const base = new THREE.Vector3(x, y, z)

      // 바깥 방향(해안 법선) – 항구 방향 계산용
      const outward = Math.atan2(z / (B * B), x / (A * A))

      if (p.type === 'wind') {
        ;[[-0.4, 0.1], [0.02, -0.28], [0.4, 0.14]].forEach(([ox, oz]) => {
          const t = buildTurbine(rotors)
          t.position.set(x + ox, Math.max(heightAt(x + ox, z + oz), 0), z + oz)
          grp.add(t)
        })
      } else if (p.type === 'light') {
        const m = buildLighthouse(beams)
        m.position.copy(base)
        grp.add(m)
      } else if (p.type === 'hareubang') {
        const m = buildHareubang()
        m.position.copy(base)
        m.rotation.y = -outward + Math.PI / 2
        m.scale.setScalar(1.15)
        grp.add(m)
      } else if (p.type === 'port') {
        const m = buildPort(boats)
        m.position.set(x, 0, z)
        m.rotation.y = -outward
        grp.add(m)
      } else if (p.type === 'orchard') {
        grp.add(buildOrchard({ x, z }))
      }

      // 클릭 가능한 핀
      const pin = new THREE.Group()
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 12), new THREE.MeshStandardMaterial({ color: COLOR[p.type], emissive: COLOR[p.type], emissiveIntensity: 0.35 }))
      const tipCone = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.2, 10), head.material)
      tipCone.rotation.x = Math.PI
      tipCone.position.y = -0.14
      pin.add(head, tipCone)
      const baseY = y + PIN_Y[p.type]
      pin.position.set(x, baseY, z)
      head.userData = { id: p.id, type: p.type }
      const label = makeLabel(`${p.emoji} ${p.name}`)
      label.position.set(0, 0.34, 0)
      pin.add(label)
      grp.add(pin)
      markers.push(head)
      markerOf[p.id] = { pin, baseY, head, target: new THREE.Vector3(x, y + 0.3, z) }
    })

    // ---- 디테일 장식 ----
    // 도로: 일주도로 + 횡단도로
    const road = (pts, closed, radius = 0.02) => {
      const m = new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, closed), pts.length * 4, radius, 5, closed),
        std(0xb9b6ae),
      )
      scene.add(m)
    }
    const ringRoad = []
    for (let d = 0; d < 360; d += 4) {
      const p = polar(d, 0.92)
      ringRoad.push(new THREE.Vector3(p.x, Math.max(heightAt(p.x, p.z), 0.02) + 0.03, p.z))
    }
    road(ringRoad, true)
    const crossA = polar(-90, 0.88)
    const crossB = polar(90, 0.88)
    const crossRoad = []
    for (let t = 0; t <= 1.001; t += 0.04) {
      const x = crossA.x + (crossB.x - crossA.x) * t - 2.6 * Math.sin(Math.PI * t)
      const z = crossA.z + (crossB.z - crossA.z) * t
      crossRoad.push(new THREE.Vector3(x, Math.max(heightAt(x, z), 0.02) + 0.03, z))
    }
    road(crossRoad, false, 0.018)

    // 해안 포말
    const foamPts = []
    for (let d = 0; d < 360; d += 3) {
      const p = polar(d, 1.005)
      foamPts.push(new THREE.Vector3(p.x, 0.012, p.z))
    }
    const foamMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 })
    scene.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(foamPts, true), 500, 0.045, 4, true), foamMat))

    // 한라산 중산간 숲 (침엽수)
    const frng = mulberry32(77)
    const trees = []
    for (let i = 0; i < 6000 && trees.length < 1200; i++) {
      const { x, z } = polar(frng() * 360 - 180, 0.1 + frng() * 0.85)
      const h = heightAt(x, z)
      if (h < 0.35 || h > 2.1 || noise2(x * 3, z * 3) < 0.45) continue
      trees.push({ x, y: h, z, s: 0.7 + frng() * 0.8 })
    }
    const forest = new THREE.InstancedMesh(new THREE.ConeGeometry(0.06, 0.22, 6), std(0x1f5d2c), trees.length)
    const dummy = new THREE.Object3D()
    trees.forEach((t, i) => {
      dummy.position.set(t.x, t.y + 0.1 * t.s, t.z)
      dummy.scale.setScalar(t.s)
      dummy.updateMatrix()
      forest.setMatrixAt(i, dummy.matrix)
    })
    scene.add(forest)

    // 도시 (제주시, 서귀포시)
    const town = (deg, f, count, name) => {
      const c = polar(deg, f)
      const trng = mulberry32(Math.floor(c.x * 31 + 5))
      const palette = [0xf0e6d8, 0xd9e4ea, 0xf3d9c4, 0xe6e6e6]
      const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), std(0xffffff), count)
      const colr = new THREE.Color()
      for (let i = 0; i < count; i++) {
        const x = c.x + (trng() - 0.5) * 1.8
        const z = c.z + (trng() - 0.5) * 0.7
        const h = Math.max(heightAt(x, z), 0.02)
        const sy = 0.06 + trng() * 0.14
        dummy.position.set(x, h + sy / 2, z)
        dummy.scale.set(0.07 + trng() * 0.05, sy, 0.07 + trng() * 0.05)
        dummy.updateMatrix()
        mesh.setMatrixAt(i, dummy.matrix)
        mesh.setColorAt(i, colr.setHex(palette[Math.floor(trng() * palette.length)]))
      }
      scene.add(mesh)
      const label = makeLabel(`🏙️ ${name}`)
      label.position.set(c.x, Math.max(heightAt(c.x, c.z), 0) + 0.85, c.z)
      scene.add(label)
    }
    town(-90, 0.9, 110, '제주시')
    town(90, 0.88, 70, '서귀포시')

    // 구름
    const clouds = []
    const crng = mulberry32(9)
    for (let i = 0; i < 8; i++) {
      const c = new THREE.Group()
      for (let k = 0; k < 4; k++) {
        const puff = new THREE.Mesh(
          new THREE.SphereGeometry(0.5 + crng() * 0.4, 10, 8),
          new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.82, roughness: 1, depthWrite: false }),
        )
        puff.position.set(k * 0.6 - 0.9, crng() * 0.2, crng() * 0.4)
        puff.scale.y = 0.55
        c.add(puff)
      }
      c.position.set(crng() * 36 - 18, 6.5 + crng() * 2.5, crng() * 16 - 8)
      c.userData.speed = 0.15 + crng() * 0.25
      scene.add(c)
      clouds.push(c)
    }

    // 방위표
    const north = makeLabel('🧭 북 ↑')
    north.position.set(-16, 0.5, -7.6)
    scene.add(north)

    // 선택 링
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.28, 0.36, 40),
      new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.9 }),
    )
    ring.rotation.x = -Math.PI / 2
    ring.visible = false
    scene.add(ring)

    // 상태
    let visibleState = visible
    let selected = null
    let tween = null

    function flyTo(id) {
      const m = markerOf[id]
      if (!m) return
      const dir = camera.position.clone().sub(controls.target)
      dir.y = 0
      if (dir.lengthSq() < 0.01) dir.set(0, 0, 1)
      dir.normalize()
      const dist = id === 'hallasan' ? 8 : 4.6
      const to = m.target.clone().addScaledVector(dir, dist).add(new THREE.Vector3(0, id === 'hallasan' ? 5.5 : 3, 0))
      tween = { t0: performance.now(), dur: 1100, fp: camera.position.clone(), tp: to, ft: controls.target.clone(), tt: m.target.clone() }
    }

    api.current.setVisible = (v) => {
      visibleState = v
      LAYERS.forEach((l) => { groups[l.key].visible = v[l.key] !== false })
    }
    api.current.select = (id) => {
      selected = id
      const m = markerOf[id]
      ring.visible = Boolean(m) && visibleState[POIS.find((p) => p.id === id).type] !== false
      if (m) { ring.position.set(m.pin.position.x, Math.max(heightAt(m.pin.position.x, m.pin.position.z), 0) + 0.04, m.pin.position.z); flyTo(id) }
    }
    api.current.setVisible(visible)
    if (selectedId) api.current.select(selectedId)

    // 입력
    const ray = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    function pick(e) {
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1)
      ray.setFromCamera(pointer, camera)
      const list = markers.filter((m) => visibleState[m.userData.type] !== false)
      return { hit: ray.intersectObjects(list)[0]?.object, rect }
    }
    let down = null
    const onDown = (e) => { down = { x: e.clientX, y: e.clientY } }
    const onUp = (e) => {
      if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5) return
      const { hit } = pick(e)
      if (hit) onSelectRef.current(hit.userData.id)
    }
    const onMove = (e) => {
      const { hit, rect } = pick(e)
      renderer.domElement.style.cursor = hit ? 'pointer' : 'grab'
      if (hit) {
        const p = POIS.find((q) => q.id === hit.userData.id)
        setTip({ text: `${p.emoji} ${p.name}`, x: e.clientX - rect.left, y: e.clientY - rect.top })
      } else setTip(null)
    }
    const el = renderer.domElement
    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointermove', onMove)

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
    function tick(now) {
      const s = now / 1000
      rotors.forEach((r) => { r.rotation.z -= 0.035 })
      beams.forEach((b) => { b.rotation.y += 0.03 })
      boats.forEach((b) => { b.position.y = 0.02 + Math.sin(s * 2 + b.userData.phase) * 0.012; b.rotation.z = Math.sin(s * 1.6 + b.userData.phase) * 0.08 })
      for (const id in markerOf) {
        const m = markerOf[id]
        const sel = id === selected
        m.pin.position.y = m.baseY + Math.sin(s * 2.2 + m.baseY * 5) * 0.04 + (sel ? 0.08 : 0)
        m.pin.scale.setScalar(sel ? 1.35 : 1)
      }
      ring.scale.setScalar(1 + Math.sin(s * 4) * 0.12)

      // 바다 물결 / 포말 / 구름
      for (let i = 0; i < seaPos.count; i++) {
        const x = seaPos.getX(i)
        const y = seaPos.getY(i)
        seaPos.setZ(i, Math.sin(x * 1.4 + s * 1.3) * 0.012 + Math.cos(y * 1.8 + s * 1.1) * 0.01)
      }
      seaPos.needsUpdate = true
      foamMat.opacity = 0.38 + Math.sin(s * 1.5) * 0.15
      clouds.forEach((c) => {
        c.position.x += c.userData.speed * 0.01
        if (c.position.x > 20) c.position.x = -20
      })

      if (tween) {
        const t = Math.min(1, (now - tween.t0) / tween.dur)
        const e = 1 - Math.pow(1 - t, 3)
        camera.position.lerpVectors(tween.fp, tween.tp, e)
        controls.target.lerpVectors(tween.ft, tween.tt, e)
        if (t >= 1) tween = null
      }
      controls.update()
      renderer.render(scene, camera)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      controls.dispose()
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointermove', onMove)
      scene.traverse((o) => {
        o.geometry?.dispose()
        const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : []
        mats.forEach((m) => { m.map?.dispose(); m.dispose() })
      })
      renderer.dispose()
      mount.removeChild(el)
      api.current = {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { api.current.setVisible?.(visible) }, [visible])
  useEffect(() => { if (selectedId) api.current.select?.(selectedId) }, [selectedId])

  return (
    <div className="map3d" ref={mountRef}>
      {tip && <div className="tip3d" style={{ left: tip.x + 12, top: tip.y + 12 }}>{tip.text}</div>}
      <span className="hint3d">🖱️ 드래그 회전 · 휠/핀치 확대 · 핀을 눌러 자세히 보기</span>
    </div>
  )
}
