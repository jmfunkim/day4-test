import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // 로컬 개발에서도 /api/visitors 가 동작하도록 프록시 (키는 서버측에서만 붙음)
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    // PIXABAY_API_KEY, SUPABASE_* 도 클라이언트에 노출되도록 허용 (기본은 VITE_ 만)
    envPrefix: ['VITE_', 'PIXABAY_', 'SUPABASE_'],
    server: {
      proxy: {
        '/api/visitors': {
          target: 'https://api.odcloud.kr',
          changeOrigin: true,
          rewrite: () =>
            `/api/15125100/v1/uddi:32a1b877-af20-4505-a76a-fd389ebd30ca?page=1&perPage=200&serviceKey=${env.DATA_GO_KR_API_KEY || ''}`,
        },
      },
    },
  }
})
