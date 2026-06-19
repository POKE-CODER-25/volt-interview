import { Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AuthPage from './pages/AuthPage.jsx'
import InterviewPage from './pages/InterviewPage.jsx'
import LandingPage from './pages/LandingPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import ResultsPage from './pages/ResultsPage.jsx'
import SetupPage from './pages/SetupPage.jsx'

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
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
