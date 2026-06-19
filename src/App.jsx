import { Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AuthPage from './pages/AuthPage.jsx'
import LandingPage from './pages/LandingPage.jsx'
import PlaceholderPage from './pages/PlaceholderPage.jsx'
import SetupPage from './pages/SetupPage.jsx'

const placeholders = [
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
          <Route
            path="/setup"
            element={
              <ProtectedRoute>
                <SetupPage />
              </ProtectedRoute>
            }
          />
          {placeholders.map(([path, eyebrow, title]) => (
            <Route
              key={path}
              path={path}
              element={
                <ProtectedRoute>
                  <PlaceholderPage eyebrow={eyebrow} title={title} />
                </ProtectedRoute>
              }
            />
          ))}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
