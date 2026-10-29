import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <p className="center">불러오는 중...</p>
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  return children
}
