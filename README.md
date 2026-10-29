# 제주 이야기 (jeju-app)

Vite + React + Supabase Auth + Pixabay 이미지 사이트.

## 로컬 실행

```bash
npm install
cp .env.example .env   # 값 채우기
npm run dev
```

## 환경변수

| 이름 | 설명 |
| --- | --- |
| `SUPABASE_URL` | Supabase Project URL |
| `SUPABASE_ANON_KEY` | Supabase anon (public) key |
| `PIXABAY_API_KEY` | Pixabay API key |

## Vercel 배포

- Root Directory: 비워 둠 (프로젝트가 저장소 루트에 있음)
- Framework Preset: Vite (Build `npm run build`, Output `dist`)
- 위 환경변수 3개를 Project Settings > Environment Variables 에 등록
- Supabase > Authentication > URL Configuration 에 배포 URL 등록
