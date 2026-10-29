// Vercel 서버리스 함수: 공공데이터포털 키를 서버에서만 사용 (브라우저에 노출되지 않음)
const URL_BASE =
  'https://api.odcloud.kr/api/15125100/v1/uddi:32a1b877-af20-4505-a76a-fd389ebd30ca'

export default async function handler(req, res) {
  const key = process.env.DATA_GO_KR_API_KEY
  if (!key) return res.status(500).json({ error: 'DATA_GO_KR_API_KEY 환경변수가 없습니다.' })

  try {
    // 포털의 "일반 인증키(Encoding)"를 그대로 붙입니다.
    const r = await fetch(`${URL_BASE}?page=1&perPage=200&serviceKey=${key}`)
    const body = await r.json()
    if (!r.ok) return res.status(r.status).json({ error: body.msg || '공공데이터 API 오류' })
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
    return res.status(200).json(body)
  } catch (e) {
    return res.status(502).json({ error: e.message })
  }
}
