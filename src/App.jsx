import { Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import AuthPage from './pages/AuthPage.jsx'
import LandingPage from './pages/LandingPage.jsx'
import PlaceholderPage from './pages/PlaceholderPage.jsx'

const placeholders = [
  ['/setup', 'Preparation Bay', 'Interview Setup coming in Phase 2'],
  ['/interview', 'Live Simulation', 'Interview Room coming in Phase 2'],
  ['/results', 'Performance Data', 'Volt AI Report coming in Phase 2'],
  ['/profile', 'Candidate Profile', 'Progress Center coming in Phase 2'],
]

function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          {placeholders.map(([path, eyebrow, title]) => (
            <Route
              key={path}
              path={path}
              element={<PlaceholderPage eyebrow={eyebrow} title={title} />}
            />
          ))}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
