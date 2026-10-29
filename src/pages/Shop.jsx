import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { fetchJejuImages } from '../lib/pixabay.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'

export const won = (n) => `${n.toLocaleString('ko-KR')}원`

export default function Shop() {
  const { user } = useAuth()
  const { addToCart } = useCart()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [images, setImages] = useState({})
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

  useEffect(() => {
    supabase.from('products').select('*').order('id').then(({ data, error }) => {
      if (error) return setError(error.message)
      setProducts(data)
      data.forEach(async (p) => {
        if (!p.image_query) return
        const { hits } = await fetchJejuImages(p.image_query, 3)
        if (hits[0]) setImages((prev) => ({ ...prev, [p.id]: hits[0].thumb }))
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
    <main className="gallery-wrap">
      <h1 className="center">🛍️ 제주 특산품 샵</h1>
      {error && <p className="error center">⚠️ {error}</p>}
      <div className="grid">
        {products.map((p) => (
          <div key={p.id} className="product">
            <div className="product-img" style={images[p.id] ? { backgroundImage: `url(${images[p.id]})` } : undefined} />
            <div className="product-body">
              <b>{p.name}</b>
              <small>{p.description}</small>
              <span className="price">{won(p.price)}</span>
              <button className="btn" onClick={() => onAdd(p)}>🛒 담기</button>
            </div>
          </div>
        ))}
      </div>
      {toast && <div className="toast">{toast}</div>}
    </main>
  )
}
