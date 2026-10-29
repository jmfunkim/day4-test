// 제주 3D 지도 데이터: 지형 높이 함수 + 관광 포인트(POI)
// 좌표계: x = 동(+)/서(-), z = 남(+)/북(-), y = 높이. 섬 크기는 약 25 x 11 단위 (높이는 과장됨)

export const A = 12.5 // 동서 반경
export const B = 5.4 // 남북 반경

const wob = (t) => 0.05 * Math.sin(2 * t + 1) + 0.035 * Math.sin(5 * t) + 0.02 * Math.sin(9 * t + 2)

// 각도(deg, 0=동, 90=남, -90=북)와 해안 대비 비율 f(1=해안선)로 위치를 구함
export function polar(deg, f = 1) {
  const t = (deg * Math.PI) / 180
  const rho = f / (1 + wob(t))
  return { x: A * rho * Math.cos(t), z: B * rho * Math.sin(t) }
}

export const LAYERS = [
  { key: 'spot', label: '관광지', emoji: '🏞️', color: 0xe63946 },
  { key: 'orom', label: '오름', emoji: '⛰️', color: 0x2a9d8f },
  { key: 'wind', label: '풍력발전기', emoji: '🌬️', color: 0x6a4c93 },
  { key: 'light', label: '등대', emoji: '🗼', color: 0xf4a261 },
  { key: 'hareubang', label: '돌하르방', emoji: '🗿', color: 0x8d6e63 },
  { key: 'olle', label: '올레길', emoji: '🥾', color: 0xff7f11 },
  { key: 'port', label: '항·포구', emoji: '⚓', color: 0x0b6e8a },
  { key: 'orchard', label: '감귤재배지', emoji: '🍊', color: 0xff8a1f },
]

export const POIS = [
  // 관광지
  { id: 'hallasan', type: 'spot', emoji: '🌋', name: '한라산 백록담', pos: { x: -0.8, z: 0.4 }, desc: '해발 1,947m, 대한민국 최고봉. 정상에는 화산 분화구에 물이 고인 백록담이 있어요.' },
  { id: 'seongsan', type: 'spot', emoji: '🌅', name: '성산일출봉', deg: -6, f: 0.99, bump: { h: 0.9, sg: 0.3 }, desc: '바다 위에 솟은 거대한 화산 분화구. 유네스코 세계자연유산으로 일출 명소예요.' },
  { id: 'sanbang', type: 'spot', emoji: '⛰️', name: '산방산', deg: 129, f: 0.97, bump: { h: 0.95, sg: 0.28 }, desc: '종 모양의 용암 돔. 아래 용머리해안과 함께 서남부 대표 풍경이에요.' },
  { id: 'jusang', type: 'spot', emoji: '🪨', name: '중문·대포 주상절리대', deg: 101, f: 1, desc: '용암이 식으며 만든 육각 기둥 절벽. 파도가 부딪히는 모습이 장관이에요.' },
  { id: 'waterfall', type: 'spot', emoji: '💧', name: '정방·천지연폭포', deg: 89, f: 0.98, desc: '바다로 곧장 떨어지는 정방폭포와 울창한 숲 속 천지연폭포가 가까이 있어요.' },
  { id: 'hyeopjae', type: 'spot', emoji: '🏖️', name: '협재해변', deg: -170, f: 1, desc: '에메랄드빛 바다와 하얀 모래, 멀리 비양도가 보이는 서쪽 대표 해변.' },
  { id: 'udo', type: 'spot', emoji: '🐂', name: '우도', pos: polar(-12, 1.14), bump: { h: 0.45, sg: 0.4 }, desc: '소가 누운 모양의 섬. 땅콩 아이스크림과 자전거 일주로 유명해요.' },

  // 오름
  { id: 'saebyeol', type: 'orom', emoji: '🔥', name: '새별오름', deg: -172, f: 0.62, bump: { h: 0.55, sg: 0.34 }, desc: '정월대보름 들불축제가 열리는 억새 명소. 해 질 녘 풍경이 특히 예뻐요.' },
  { id: 'geumo', type: 'orom', emoji: '💧', name: '금오름', deg: -163, f: 0.76, bump: { h: 0.5, sg: 0.3 }, desc: '정상 분화구에 물이 고여 있는 오름. 일몰 사진 명소예요.' },
  { id: 'daranshi', type: 'orom', emoji: '👑', name: '다랑쉬오름', deg: -14, f: 0.6, bump: { h: 0.55, sg: 0.32 }, desc: '‘오름의 여왕’이라 불리는 깊고 둥근 분화구를 가진 오름.' },
  { id: 'yongnuni', type: 'orom', emoji: '🌾', name: '용눈이오름', deg: -9, f: 0.72, bump: { h: 0.4, sg: 0.34 }, desc: '부드러운 능선 곡선이 아름다워 사진가들이 즐겨 찾는 오름.' },
  { id: 'sangumburi', type: 'orom', emoji: '🌲', name: '산굼부리', deg: -35, f: 0.42, bump: { h: 0.35, sg: 0.36 }, desc: '평지에 움푹 파인 거대한 분화구. 천연기념물로 보호되고 있어요.' },

  // 풍력발전기
  { id: 'hangyeong', type: 'wind', emoji: '🌬️', name: '한경 풍력단지', deg: 178, f: 0.93, desc: '서쪽 해안을 따라 하얀 풍력발전기들이 돌아가요. 제주의 바람이 전기가 됩니다.' },
  { id: 'gujwa', type: 'wind', emoji: '⚡', name: '구좌·행원 풍력단지', deg: -32, f: 0.96, desc: '북동쪽 해안의 대표 풍력단지. 해안도로 드라이브 코스로도 유명해요.' },
  { id: 'daejeong', type: 'wind', emoji: '💨', name: '대정 풍력단지', deg: 146, f: 0.93, desc: '남서쪽 들판 위에 늘어선 풍력발전기들.' },

  // 등대
  { id: 'dodu', type: 'light', emoji: '🗼', name: '도두 등대', deg: -104, f: 1, desc: '제주공항 근처 도두봉 아래 바닷가의 무지개 해안도로 옆 등대.' },
  { id: 'gosan', type: 'light', emoji: '🌠', name: '고산 등대', deg: 168, f: 1, desc: '서쪽 끝 수월봉 인근, 차귀도가 바라보이는 곳의 등대.' },
  { id: 'seongsan-lh', type: 'light', emoji: '🏮', name: '성산 등대', deg: -1, f: 1.0, desc: '성산일출봉 아래 바닷가에서 동쪽 바다를 밝히는 등대.' },
  { id: 'mara', type: 'light', emoji: '🏝️', name: '마라도 등대', pos: polar(116, 1.46), bump: { h: 0.4, sg: 0.3 }, desc: '대한민국 최남단 섬 마라도의 등대. 짜장면 맛집으로도 유명해요.' },

  // 돌하르방
  { id: 'hb-jeju', type: 'hareubang', emoji: '🗿', name: '제주시 돌하르방', deg: -90, f: 0.8, desc: '제주의 수호신. 큰 눈과 벙거지 모자, 배 위의 두 손이 특징이에요.' },
  { id: 'hb-seongsan', type: 'hareubang', emoji: '🗿', name: '성산 돌하르방', deg: -20, f: 0.88, desc: '일출봉 가는 길목에서 여행자를 맞이하는 돌하르방.' },
  { id: 'hb-seogwipo', type: 'hareubang', emoji: '🗿', name: '서귀포 돌하르방', deg: 92, f: 0.8, desc: '서귀포 시내를 지키는 돌하르방. 함께 사진 찍기 좋아요.' },

  // 올레길
  { id: 'olle1', type: 'olle', emoji: '🥾', name: '올레 1코스', deg: -12, f: 1, desc: '시흥초등학교에서 광치기해변까지. 말미오름과 성산일출봉을 만나는 올레의 시작.' },
  { id: 'olle7', type: 'olle', emoji: '🚶', name: '올레 7코스', deg: 74, f: 1, desc: '외돌개에서 월평까지. 해안 절벽과 수봉로를 걷는 인기 코스.' },
  { id: 'olle10', type: 'olle', emoji: '🥾', name: '올레 10코스', deg: 136, f: 1, desc: '화순에서 모슬포까지. 산방산과 형제섬을 바라보며 걷는 길.' },
  { id: 'olle18', type: 'olle', emoji: '🚶', name: '올레 18코스', deg: -118, f: 1, desc: '제주 원도심과 사라봉을 지나는 도심 속 해안 올레.' },

  // 항·포구
  { id: 'jejuport', type: 'port', emoji: '⚓', name: '제주항', deg: -92, f: 1, desc: '제주의 관문 항구. 여객선이 육지와 섬을 이어줘요.' },
  { id: 'hallimport', type: 'port', emoji: '🚢', name: '한림항', deg: -150, f: 1, desc: '비양도와 가파도행 배가 오가는 서쪽의 항구.' },
  { id: 'seongsanport', type: 'port', emoji: '⛴️', name: '성산포항', deg: -22, f: 1, desc: '우도로 가는 도항선이 떠나는 포구.' },
  { id: 'seogwipoport', type: 'port', emoji: '⚓', name: '서귀포항', deg: 86, f: 1, desc: '새섬과 이어지는 남쪽 항구. 노을이 아름다워요.' },
  { id: 'hwasunport', type: 'port', emoji: '🚢', name: '화순항', deg: 119, f: 1, desc: '남서부의 항구로, 요트와 여객선이 오갑니다.' },

  // 감귤재배지
  { id: 'or-seogwipo', type: 'orchard', emoji: '🍊', name: '서귀포 감귤원', deg: 80, f: 0.62, desc: '따뜻한 남쪽 비탈에 펼쳐진 감귤밭. 겨울이면 노랗게 물들어요.' },
  { id: 'or-hyodon', type: 'orchard', emoji: '🍋', name: '효돈·남원 감귤원', deg: 55, f: 0.7, desc: '쇠소깍 인근 효돈은 감귤 명산지로 유명해요.' },
  { id: 'or-aewol', type: 'orchard', emoji: '🍊', name: '애월 감귤원', deg: -138, f: 0.68, desc: '북서쪽 애월 중산간의 감귤밭과 돌담.' },
]

export const poiPos = (p) => p.pos || polar(p.deg, p.f)

// ---- 지형 ----
const HALLA = { x: -0.8, z: 0.4 }

function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
export { mulberry32 }

// 이름 있는 봉우리 + 이름 없는 작은 오름들(고정 시드)
const rng = mulberry32(2026)
const BUMPS = POIS.filter((p) => p.bump).map((p) => ({ ...poiPos(p), ...p.bump }))
for (let i = 0; i < 26; i++) {
  const { x, z } = polar(rng() * 360 - 180, 0.15 + rng() * 0.7)
  if (Math.hypot((x - HALLA.x) / 3, (z - HALLA.z) / 2.4) < 1) continue
  BUMPS.push({ x, z, h: 0.18 + rng() * 0.25, sg: 0.22 + rng() * 0.14 })
}

const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
const smooth = (e0, e1, v) => {
  const t = clamp((v - e0) / (e1 - e0), 0, 1)
  return t * t * (3 - 2 * t)
}

export function heightAt(x, z) {
  const t = Math.atan2(z / B, x / A)
  const land = 1 - Math.hypot(x / A, z / B) * (1 + wob(t))
  let h = land > 0 ? Math.pow(land, 0.6) * 0.5 : land * 0.9
  const s = smooth(0, 0.25, land)

  const dx = (x - HALLA.x) / 3.2
  const dz = (z - HALLA.z) / 2.3
  const d2 = dx * dx + dz * dz
  h += s * 3.4 * Math.exp(-Math.sqrt(d2) * 1.9)
  h -= s * 0.2 * Math.exp(-d2 * 30) // 백록담

  for (const b of BUMPS) {
    const q = (x - b.x) ** 2 + (z - b.z) ** 2
    if (q < 9) h += b.h * Math.exp(-q / (2 * b.sg * b.sg))
  }
  return h
}

const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * clamp(t, 0, 1))
export function colorAt(h) {
  if (h < 0) return mix([0.7, 0.82, 0.78], [0.1, 0.35, 0.5], -h / 0.6) // 바다 밑
  if (h < 0.07) return [0.93, 0.87, 0.66] // 모래
  if (h < 0.7) return mix([0.42, 0.68, 0.28], [0.3, 0.56, 0.24], (h - 0.07) / 0.6)
  if (h < 1.9) return mix([0.3, 0.56, 0.24], [0.2, 0.4, 0.2], (h - 0.7) / 1.2)
  if (h < 2.7) return mix([0.2, 0.4, 0.2], [0.5, 0.44, 0.38], (h - 1.9) / 0.8)
  return mix([0.5, 0.44, 0.38], [0.88, 0.88, 0.86], (h - 2.7) / 0.7)
}
