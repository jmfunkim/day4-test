import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anonKey)

// 환경변수가 없어도 앱이 죽지 않도록 placeholder 로 생성 (화면에서 안내 배너 표시)
export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  anonKey || 'placeholder-key',
)
