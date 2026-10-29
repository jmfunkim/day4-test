import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Signup() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    if (password.length < 6) return setError('비밀번호는 6자 이상이어야 합니다.')
    setBusy(true)
    const { data, error } = await signUp(email, password, name)
    setBusy(false)
    if (error) return setError(error.message)
    if (data.session) navigate('/account', { replace: true })
    else setNotice('가입 확인 메일을 보냈습니다. 메일의 링크를 눌러 인증을 완료한 뒤 로그인해 주세요.')
  }

  return (
    <main className="auth-card">
      <h1>회원가입</h1>
      {notice ? (
        <p className="notice">{notice}</p>
      ) : (
        <form onSubmit={onSubmit}>
          <label>이름
            <input required value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label>이메일
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>비밀번호 (6자 이상)
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          {error && <p className="error">{error}</p>}
          <button className="btn" disabled={busy}>{busy ? '처리 중...' : '가입하기'}</button>
        </form>
      )}
      <p className="sub">이미 계정이 있나요? <Link to="/login">로그인</Link></p>
    </main>
  )
}
