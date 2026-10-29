import { useEffect, useMemo, useState } from 'react'
import Bars3D from '../components/Bars3D.jsx'

const META = ['기준연도', '기준월', '데이터기준일자']
const ICONS = { 감귤박물관: '🍊', '산방산_용머리': '⛰️', 정방폭포: '💧', '중문대포 주상절리대': '🪨', 천제연폭포: '🌊', 천지연폭포: '🏞️' }
const COLORS = ['#ff8a1f', '#0b6e8a', '#2a9d8f', '#e63946', '#6a4c93', '#f4a261']
const fmt = (n) => (n ?? 0).toLocaleString('ko-KR')

export default function Stats() {
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [year, setYear] = useState(null)
  const [spot, setSpot] = useState(null)

  useEffect(() => {
    fetch('/api/visitors')
      .then(async (r) => {
        const body = await r.json()
        if (!r.ok) throw new Error(body.error || `오류 (${r.status})`)
        return body.data
      })
      .then((data) => {
        setRows(data)
        const years = [...new Set(data.map((d) => d['기준연도']))].sort()
        setYear(years[years.length - 1])
        setSpot(Object.keys(data[0]).find((k) => !META.includes(k)))
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const spots = useMemo(() => (rows[0] ? Object.keys(rows[0]).filter((k) => !META.includes(k)) : []), [rows])
  const years = useMemo(() => [...new Set(rows.map((d) => d['기준연도']))].sort(), [rows])
  const yearRows = useMemo(
    () => rows.filter((d) => d['기준연도'] === year).sort((a, b) => a['기준월'] - b['기준월']),
    [rows, year],
  )
  const totals = useMemo(
    () => spots.map((s) => ({ name: s, total: yearRows.reduce((sum, r) => sum + (r[s] || 0), 0) })).sort((a, b) => b.total - a.total),
    [spots, yearRows],
  )

  if (loading) return <p className="center">📊 데이터를 불러오는 중...</p>
  if (error) return <p className="error center">⚠️ {error}</p>

  const maxTotal = Math.max(...totals.map((t) => t.total), 1)
  const maxMonth = Math.max(...yearRows.map((r) => r[spot] || 0), 1)
  const color = COLORS[spots.indexOf(spot) % COLORS.length]
  const W = 600, H = 220, pad = 28
  const bw = (W - pad * 2) / 12

  return (
    <main className="stats">
      <h1 className="center">📊 서귀포 직영관광지 관람객 추이</h1>
      <p className="center sub">🏝️ 제주특별자치도 서귀포시 · 공공데이터포털 제공</p>

      <div className="chips">
        {years.map((y) => (
          <button key={y} className={`chip ${y === year ? 'on' : ''}`} onClick={() => setYear(y)}>📅 {y}년</button>
        ))}
      </div>

      <h2 className="section-title">🏆 {year}년 관광지별 누적 관람객</h2>
      <div className="rank">
        {totals.map((t, i) => (
          <div key={t.name} className="rank-row">
            <span className="rank-name">{['🥇', '🥈', '🥉'][i] || '🎫'} {ICONS[t.name] || ''} {t.name.replace('_', ' ')}</span>
            <div className="rank-bar"><div style={{ width: `${(t.total / maxTotal) * 100}%`, background: COLORS[spots.indexOf(t.name) % COLORS.length] }} /></div>
            <b>{fmt(t.total)}명</b>
          </div>
        ))}
      </div>

      <h2 className="section-title">🧊 {year}년 3D 입체 그래프</h2>
      <Bars3D rows={yearRows} spots={spots} colors={COLORS} />

      <h2 className="section-title">📈 월별 관람객</h2>
      <div className="chips">
        {spots.map((s) => (
          <button key={s} className={`chip ${s === spot ? 'on' : ''}`} onClick={() => setSpot(s)}>
            {ICONS[s] || '📍'} {s.replace('_', ' ')}
          </button>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H + 24}`} className="chart" role="img" aria-label={`${spot} 월별 관람객`}>
        {yearRows.map((r) => {
          const v = r[spot] || 0
          const h = (v / maxMonth) * (H - pad)
          const x = pad + (r['기준월'] - 1) * bw
          return (
            <g key={r['기준월']}>
              <rect x={x + 4} y={H - h} width={bw - 8} height={h} rx="4" fill={color}>
                <title>{r['기준월']}월: {fmt(v)}명</title>
              </rect>
              <text x={x + bw / 2} y={H + 16} textAnchor="middle" fontSize="11" fill="#567">{r['기준월']}월</text>
              <text x={x + bw / 2} y={H - h - 4} textAnchor="middle" fontSize="9" fill="#345">{v >= 1000 ? `${Math.round(v / 1000)}k` : v}</text>
            </g>
          )
        })}
      </svg>
      <p className="center sub">⚠️ 데이터가 집계되지 않은 달은 표시되지 않을 수 있어요.</p>
    </main>
  )
}
