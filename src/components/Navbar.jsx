import { LogOut, Zap } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function Navbar() {
  const { currentUser, loading, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  const navClass = ({ isActive }) => `nav-link${isActive ? ' active' : ''}`

  return (
    <header className="navbar">
      <nav className="navbar-inner" aria-label="Main navigation">
        <NavLink to="/" className="brand" aria-label="Volt Interview home">
          <span className="brand-icon">
            <Zap size={19} fill="currentColor" />
          </span>
          <span>
            Volt <strong>Interview</strong>
          </span>
        </NavLink>

        <div className="nav-links">
          <NavLink to="/" end className={navClass}>
            Home
          </NavLink>

          {!loading && currentUser ? (
            <>
              <NavLink to="/setup" className={navClass}>
                Setup
              </NavLink>
              <NavLink to="/profile" className={navClass}>
                Profile
              </NavLink>
              <span className="user-label" title={currentUser.email}>
                {currentUser.displayName || currentUser.email}
              </span>
              <button type="button" className="logout-button" onClick={handleLogout}>
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            !loading && (
              <NavLink to="/auth" className={navClass}>
                Login
              </NavLink>
            )
          )}
        </div>
      </nav>
    </header>
  )
}

export default Navbar
