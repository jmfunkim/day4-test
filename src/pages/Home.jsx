import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchJejuImages } from '../lib/pixabay.js'
import { useAuth } from '../context/AuthContext.jsx'

const TOPICS = [
  { label: '🏝️ 전체', q: 'jeju island' },
  { label: '🌊 바다', q: 'jeju sea' },
  { label: '🌋 한라산', q: 'hallasan' },
  { label: '🌼 유채꽃', q: 'jeju canola flower' },
  { label: '🍊 감귤', q: 'jeju tangerine' },
  { label: '🗿 돌하르방', q: 'dol hareubang' },
]

const HIGHLIGHTS = [
  { icon: '🌊', title: '푸른 바다', text: '에메랄드빛 해변과 파도' },
  { icon: '🌋', title: '한라산', text: '사계절 다른 얼굴의 산' },
  { icon: '🍊', title: '감귤', text: '새콤달콤 제주의 맛' },
  { icon: '💨', title: '바람', text: '돌담 사이로 부는 바람' },
]

export default function Home() {
  const { user } = useAuth()
  const [topic, setTopic] = useState(TOPICS[0])
  const [images, setImages] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    let alive = true
    setLoading(true)
    fetchJejuImages(topic.q).then(({ hits, error }) => {
      if (!alive) return
      setImages(hits)
      setError(error || '')
      setLoading(false)
    })
    return () => { alive = false }
  }, [topic])

  const hero = images[0]

  return (
    <main>
      <section
        className="hero"
        style={hero ? { backgroundImage: `linear-gradient(rgba(0,30,50,.35), rgba(0,30,50,.55)), url(${hero.large})` } : undefined}
      >
        <h1>🏝️ 제주, 바람과 바다의 섬 🌊</h1>
        <p>🌋 한라산부터 푸른 바다, 돌담과 🍊 감귤밭까지 — 제주의 풍경을 만나보세요.</p>
        {!user && <Link to="/signup" className="btn big">✨ 지금 가입하고 시작하기</Link>}
      </section>

      <section className="highlights">
        {HIGHLIGHTS.map((h) => (
          <div key={h.title} className="hl">
            <span className="hl-icon">{h.icon}</span>
            <b>{h.title}</b>
            <small>{h.text}</small>
          </div>
        ))}
      </section>

      <section className="gallery-wrap">
        <div className="chips">
          {TOPICS.map((t) => (
            <button key={t.q} className={`chip ${t.q === topic.q ? 'on' : ''}`} onClick={() => setTopic(t)}>
              {t.label}
            </button>
          ))}
        </div>
        {error && <p className="error center">⚠️ {error}</p>}
        {loading ? (
          <p className="center">📷 사진을 불러오는 중...</p>
        ) : (
          <div className="grid">
            {images.map((img) => (
              <button key={img.id} className="tile" onClick={() => setSelected(img)}>
                <img src={img.thumb} alt={img.tags} loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </section>

      {selected && (
        <div className="lightbox" onClick={() => setSelected(null)}>
          <img src={selected.large} alt={selected.tags} />
          <p>
            by <a href={selected.page} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>{selected.user}</a> / Pixabay
          </p>
        </div>
      )}
    </main>
  )
}
