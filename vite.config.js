import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // PIXABAY_API_KEY 도 클라이언트에 노출되도록 허용 (기본은 VITE_ 만)
  envPrefix: ['VITE_', 'PIXABAY_', 'SUPABASE_'],
})
