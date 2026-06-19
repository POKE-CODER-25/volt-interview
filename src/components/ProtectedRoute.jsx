import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <section className="access-loading" aria-live="polite">
        <div className="access-spinner" />
        <p>Checking Volt access...</p>
      </section>
    )
  }

  if (!currentUser) {
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute
