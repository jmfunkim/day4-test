import { useAuth } from '../context/AuthContext.jsx'

export default function Account() {
  const { user } = useAuth()
  return (
    <main className="auth-card">
      <h1>내 정보</h1>
      <p>안녕하세요, <b>{user.user_metadata?.name || user.email}</b>님 🍊</p>
      <dl className="info">
        <dt>이메일</dt><dd>{user.email}</dd>
        <dt>가입일</dt><dd>{new Date(user.created_at).toLocaleDateString('ko-KR')}</dd>
      </dl>
    </main>
  )
}
