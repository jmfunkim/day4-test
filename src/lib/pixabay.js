const KEY = import.meta.env.PIXABAY_API_KEY || import.meta.env.VITE_PIXABAY_API_KEY

// Pixabay 약관: 결과는 24시간 캐시 가능 -> sessionStorage 에 캐시
export async function fetchJejuImages(query = 'jeju island', perPage = 24) {
  if (!KEY) return { hits: [], error: '이미지를 불러올 수 없습니다. (Pixabay API 키 미설정)' }

  const cacheKey = `pixabay:${query}:${perPage}`
  try {
    const cached = sessionStorage.getItem(cacheKey)
    if (cached) return { hits: JSON.parse(cached) }
  } catch {}

  const params = new URLSearchParams({
    key: KEY,
    q: query,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: 'true',
    order: 'popular',
    per_page: String(perPage),
  })
  try {
    const res = await fetch(`https://pixabay.com/api/?${params}`)
    if (!res.ok) throw new Error(`Pixabay 오류 (${res.status})`)
    const data = await res.json()
    const hits = data.hits.map((h) => ({
      id: h.id,
      thumb: h.webformatURL,
      large: h.largeImageURL,
      tags: h.tags,
      user: h.user,
      page: h.pageURL,
    }))
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify(hits))
    } catch {}
    return { hits }
  } catch (e) {
    return { hits: [], error: e.message }
  }
}
