import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { fetchJejuImages } from '../lib/pixabay.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'

export const won = (n) => `${n.toLocaleString('ko-KR')}원`

const PROMOS = [
  { q: 'jeju tangerine orchard', emoji: '🍊', title: '감귤 시즌', text: '새콤달콤 햇감귤' },
  { q: 'jeju sea sunset', emoji: '🌅', title: '제주 선물', text: '여행의 추억을 담아' },
  { q: 'green tea field', emoji: '🍵', title: '녹차 한 잔', text: '향긋한 여유' },
]

const EMOJI = ['🍊', '🍋', '🐖', '🗿', '🌼', '🍵']

function useImage(query, size = 'large') {
  const [url, setUrl] = useState('')
  useEffect(() => {
    let alive = true
    fetchJejuImages(query, 6).then(({ hits }) => {
      if (alive && hits[0]) setUrl(hits[0][size === 'large' ? 'large' : 'thumb'])
    })
    return () => { alive = false }
  }, [query, size])
  return url
}

function Promo({ p }) {
  const url = useImage(p.q)
  return (
    <div className="promo" style={url ? { backgroundImage: `linear-gradient(rgba(0,20,40,.15), rgba(0,20,40,.65)), url(${url})` } : undefined}>
      <span className="promo-emoji">{p.emoji}</span>
      <b>{p.title}</b>
      <small>{p.text}</small>
    </div>
  )
}

export default function Shop() {
  const { user } = useAuth()
  const { addToCart } = useCart()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [images, setImages] = useState({})
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const heroUrl = useImage('jeju island landscape')

  useEffect(() => {
    supabase.from('products').select('*').order('id').then(({ data, error }) => {
      if (error) return setError(error.message)
      setProducts(data)
      data.forEach(async (p) => {
        if (!p.image_query) return
        const { hits } = await fetchJejuImages(p.image_query, 3)
        if (hits[0]) setImages((prev) => ({ ...prev, [p.id]: hits[0].large }))
      })
    })
  }, [])

  async function onAdd(p) {
    if (!user) return navigate('/login', { state: { from: { pathname: '/shop' } } })
    await addToCart(p.id)
    setToast(`🛒 ${p.name} 담았어요!`)
    setTimeout(() => setToast(''), 1800)
  }

  return (
    <main>
      <section
        className="hero shop-hero"
        style={heroUrl ? { backgroundImage: `linear-gradient(rgba(0,30,50,.3), rgba(0,30,50,.6)), url(${heroUrl})` } : undefined}
      >
        <h1>🛍️ 제주 특산품 샵 🍊</h1>
        <p>🌊 바다와 바람이 키운 제주의 맛과 멋을 집으로 🎁</p>
        <div className="hero-tags"><span>🚚 전국 배송</span><span>🌿 산지 직송</span><span>💝 선물 포장</span></div>
      </section>

      <section className="promos">
        {PROMOS.map((p) => <Promo key={p.q} p={p} />)}
      </section>

      <section className="gallery-wrap">
        <h2 className="section-title">🌟 인기 상품</h2>
        {error && <p className="error center">⚠️ {error}</p>}
        <div className="grid">
          {products.map((p, idx) => (
            <div key={p.id} className="product">
              {idx < 3 && <span className="ribbon">🔥 BEST</span>}
              <div className="product-img" style={images[p.id] ? { backgroundImage: `url(${images[p.id]})` } : undefined}>
                <span className="product-emoji">{EMOJI[idx % EMOJI.length]}</span>
              </div>
              <div className="product-body">
                <b>{p.name}</b>
                <small>{p.description}</small>
                <div className="product-foot">
                  <span className="price">{won(p.price)}</span>
                  <button className="btn" onClick={() => onAdd(p)}>🛒 담기</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {toast && <div className="toast">{toast}</div>}
    </main>
  )
}
