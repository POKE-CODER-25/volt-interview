import { AlertCircle, ArrowRight, LockKeyhole, Mail, User } from 'lucide-react'
import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const authErrors = {
  'auth/email-already-in-use': 'An account already exists for this email.',
  'auth/invalid-credential': 'The email or password is incorrect.',
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/missing-password': 'Enter your password.',
  'auth/network-request-failed': 'Network error. Check your connection and retry.',
  'auth/too-many-requests': 'Too many attempts. Wait a moment and try again.',
  'auth/weak-password': 'Use a password with at least 6 characters.',
}

function AuthPage() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { currentUser, loading, login, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  if (loading) {
    return (
      <section className="access-loading" aria-live="polite">
        <div className="access-spinner" />
        <p>Checking Volt access...</p>
      </section>
    )
  }

  if (currentUser) {
    return <Navigate to="/setup" replace />
  }

  function updateField(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
  }

  function selectMode(nextMode) {
    setMode(nextMode)
    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const email = form.email.trim()

      if (mode === 'register') {
        await register(email, form.password, form.name.trim())
      } else {
        await login(email, form.password)
      }

      navigate(location.state?.from?.pathname || '/setup', { replace: true })
    } catch (authError) {
      setError(
        authErrors[authError.code] ||
          authError.message ||
          'Authentication failed. Please try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="auth-section">
      <div className="auth-intro">
        <p>Candidate access</p>
        <h1>
          Enter the interview universe <span>fully charged.</span>
        </h1>
        <p>
          Sign in to continue or create your Volt Interview candidate profile.
        </p>
      </div>

      <div className="glass-panel auth-card">
        <div className="auth-toggle">
          <button
            type="button"
            className={mode === 'login' ? 'active' : ''}
            onClick={() => selectMode('login')}
          >
            Login
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'active' : ''}
            onClick={() => selectMode('register')}
          >
            Register
          </button>
        </div>

        <div className="auth-heading">
          <p>{mode === 'login' ? 'Welcome back' : 'Initialize profile'}</p>
          <h2>{mode === 'login' ? 'Login to Volt' : 'Create your account'}</h2>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <AuthField
              icon={User}
              label="Name"
              name="name"
              type="text"
              value={form.name}
              onChange={updateField}
              autoComplete="name"
              placeholder="Your name"
            />
          )}
          <AuthField
            icon={Mail}
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={updateField}
            autoComplete="email"
            placeholder="you@example.com"
          />
          <AuthField
            icon={LockKeyhole}
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={updateField}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            placeholder="Minimum 6 characters"
            minLength={6}
          />

          {error && (
            <div className="auth-error" role="alert">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <button className="auth-submit" type="submit" disabled={submitting}>
            {submitting
              ? mode === 'login'
                ? 'Logging in...'
                : 'Creating account...'
              : mode === 'login'
                ? 'Login'
                : 'Register'}
            {!submitting && <ArrowRight size={17} />}
          </button>
        </form>
      </div>
    </section>
  )
}

function AuthField({ icon: Icon, label, ...inputProps }) {
  return (
    <label className="auth-field">
      <span>{label}</span>
      <div>
        <Icon size={17} />
        <input {...inputProps} required />
      </div>
    </label>
  )
}

export default AuthPage
