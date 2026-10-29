import { useEffect, useState } from 'react'
import { fetchJejuImages } from '../lib/pixabay.js'

// 로그인/회원가입 공통 레이아웃: 왼쪽 Pixabay 제주 사진 + 오른쪽 폼
export default function AuthLayout({ query, title, caption, children }) {
  const [img, setImg] = useState(null)

  useEffect(() => {
    let alive = true
    fetchJejuImages(query, 12).then(({ hits }) => {
      if (alive && hits.length) setImg(hits[Math.floor(Math.random() * hits.length)])
    })
    return () => { alive = false }
  }, [query])

  return (
    <main className="auth-split">
      <aside
        className="auth-art"
        style={img ? { backgroundImage: `linear-gradient(rgba(0,30,50,.2), rgba(0,30,50,.6)), url(${img.large})` } : undefined}
      >
        <h2>{title}</h2>
        <p>{caption}</p>
        {img && (
          <small>
            📷 <a href={img.page} target="_blank" rel="noreferrer">{img.user}</a> / Pixabay
          </small>
        )}
      </aside>
      <section className="auth-form">{children}</section>
    </main>
  )
}
