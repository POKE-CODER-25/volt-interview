import { Zap } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const links = [
  ['/', 'Home'],
  ['/setup', 'Setup'],
  ['/profile', 'Profile'],
  ['/auth', 'Login'],
]

function Navbar() {
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
          {links.map(([path, label]) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) =>
                `nav-link${isActive ? ' active' : ''}`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  )
}

export default Navbar
