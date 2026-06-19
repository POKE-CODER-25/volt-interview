import { Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AuthPage from './pages/AuthPage.jsx'
import InterviewPage from './pages/InterviewPage.jsx'
import LandingPage from './pages/LandingPage.jsx'
import PlaceholderPage from './pages/PlaceholderPage.jsx'
import ResultsPage from './pages/ResultsPage.jsx'
import SetupPage from './pages/SetupPage.jsx'

const placeholders = [
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
          <Route
            path="/interview"
            element={
              <ProtectedRoute>
                <InterviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/results"
            element={
              <ProtectedRoute>
                <ResultsPage />
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
