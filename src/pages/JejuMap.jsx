import { useState } from 'react'
import JejuMap3D from '../components/JejuMap3D.jsx'
import { LAYERS, POIS } from '../lib/jejuData.js'

const allOn = Object.fromEntries(LAYERS.map((l) => [l.key, true]))

export default function JejuMap() {
  const [visible, setVisible] = useState(allOn)
  const [selectedId, setSelectedId] = useState('hallasan')
  const selected = POIS.find((p) => p.id === selectedId)
  const layerOf = (key) => LAYERS.find((l) => l.key === key)

  const toggle = (key) => setVisible((v) => ({ ...v, [key]: !v[key] }))

  return (
    <main className="mapPage">
      <h1 className="center">🗺️ 제주 3D 입체지도</h1>
      <p className="center sub">🌋 한라산 · ⛰️ 오름 · 🌬️ 풍력발전기 · 🗼 등대 · 🗿 돌하르방을 돌려보고 확대해 보세요</p>

      <div className="chips">
        {LAYERS.map((l) => (
          <button key={l.key} className={`chip ${visible[l.key] ? 'on' : ''}`} onClick={() => toggle(l.key)}>
            {l.emoji} {l.label}
          </button>
        ))}
      </div>

      <div className="mapLayout">
        <JejuMap3D visible={visible} selectedId={selectedId} onSelect={setSelectedId} />

        <aside className="mapSide">
          {selected && (
            <div className="infoCard">
              <div className="infoEmoji">{selected.emoji}</div>
              <h2>{selected.name}</h2>
              <span className="tag">{layerOf(selected.type).emoji} {layerOf(selected.type).label}</span>
              <p>{selected.desc}</p>
            </div>
          )}

          <div className="poiList">
            {LAYERS.filter((l) => visible[l.key]).map((l) => (
              <div key={l.key}>
                <h3>{l.emoji} {l.label}</h3>
                {POIS.filter((p) => p.type === l.key).map((p) => (
                  <button key={p.id} className={`poiBtn ${p.id === selectedId ? 'on' : ''}`} onClick={() => setSelectedId(p.id)}>
                    {p.emoji} {p.name}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </main>
  )
}
