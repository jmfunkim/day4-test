import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import { isSupabaseConfigured } from './lib/supabase.js'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Account from './pages/Account.jsx'

export default function App() {
  return (
    <>
      <Navbar />
      {!isSupabaseConfigured && (
        <div className="banner">
          Supabase 설정이 되어 있지 않아 로그인 기능이 동작하지 않습니다.
        </div>
      )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <footer className="footer">
        사진 제공: <a href="https://pixabay.com" target="_blank" rel="noreferrer">Pixabay</a>
      </footer>
    </>
  )
}
