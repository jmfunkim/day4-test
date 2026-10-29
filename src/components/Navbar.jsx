import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  return (
    <nav className="nav">
      <Link to="/" className="logo">🍊 제주 이야기</Link>
      <div className="nav-right">
        {user ? (
          <>
            <Link to="/account">🙋 내 정보</Link>
            <button
              className="btn ghost"
              onClick={async () => {
                await signOut()
                navigate('/')
              }}
            >
              👋 로그아웃
            </button>
          </>
        ) : (
          <>
            <Link to="/login">🔑 로그인</Link>
            <Link to="/signup" className="btn">📝 회원가입</Link>
          </>
        )}
      </div>
    </nav>
  )
}
