import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    const { error } = await signIn(email, password)
    setBusy(false)
    if (error) return setError(error.message)
    navigate(location.state?.from?.pathname || '/account', { replace: true })
  }

  return (
    <main className="auth-card">
      <h1>🔑 로그인</h1>
      <p className="sub">🍊 제주에 오신 걸 환영해요!</p>
      <form onSubmit={onSubmit}>
        <label>📧 이메일
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>🔒 비밀번호
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="btn" disabled={busy}>{busy ? '⏳ 확인 중...' : '🌴 로그인'}</button>
      </form>
      <p className="sub">계정이 없나요? <Link to="/signup">회원가입</Link></p>
    </main>
  )
}
