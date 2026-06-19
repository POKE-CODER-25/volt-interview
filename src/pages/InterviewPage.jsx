import {
  ArrowLeft,
  ArrowRight,
  Clock3,
  MicOff,
  Send,
  ShieldCheck,
  UserRound,
  Zap,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const rounds = ['HR', 'Technical', 'Project', 'Evaluation']

function InterviewPage() {
  const [answer, setAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const navigate = useNavigate()

  function submitAnswer() {
    setSubmitted(true)
  }

  return (
    <section className="interview-page">
      <div className="round-progress" aria-label="Interview round progress">
        {rounds.map((round, index) => (
          <div
            key={round}
            className={`round-step${index === 0 ? ' active' : ''}`}
          >
            <span>{index + 1}</span>
            <strong>{round}</strong>
          </div>
        ))}
      </div>

      <div className="interview-layout">
        <main className="interview-main">
          <motion.article
            className="glass-panel interviewer-card"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            <motion.div
              className="interviewer-portrait"
              animate={{
                boxShadow: [
                  '0 0 22px rgba(245,230,66,.12)',
                  '0 0 38px rgba(245,230,66,.24)',
                  '0 0 22px rgba(245,230,66,.12)',
                ],
              }}
              transition={{ duration: 2.8, repeat: Infinity }}
            >
              <UserRound size={48} />
            </motion.div>

            <div className="interviewer-copy">
              <p className="interviewer-status">
                <i />
                Current interviewer
              </p>
              <h1>Mr. Volt</h1>
              <p className="interviewer-title">Senior HR Interviewer</p>
              <blockquote>
                “Good morning. Let&apos;s begin your interview.”
              </blockquote>
              <span className="round-badge">HR Round</span>
            </div>
          </motion.article>

          <article className="glass-panel question-panel">
            <header className="question-heading">
              <div>
                <p>Question 1 of 6</p>
                <h2>Tell me about yourself.</h2>
              </div>
              <div className="prototype-timer" title="Static prototype timer">
                <Clock3 size={18} />
                <span>90s</span>
              </div>
            </header>

            <label className="answer-field">
              <span>Your answer</span>
              <textarea
                value={answer}
                onChange={(event) => {
                  setAnswer(event.target.value)
                  setSubmitted(false)
                }}
                placeholder="Type your answer here, or use voice mode in a later phase..."
                rows={7}
              />
            </label>

            <div className="answer-actions">
              <button type="button" className="voice-prototype" disabled>
                <MicOff size={17} />
                Voice Coming Soon
              </button>
              <button
                type="button"
                className="submit-answer"
                onClick={submitAnswer}
              >
                <Send size={17} />
                Submit Answer
              </button>
            </div>
          </article>

          {submitted && (
            <motion.article
              className="glass-panel prototype-feedback"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="feedback-icon">
                <ShieldCheck size={23} />
              </div>
              <div>
                <p>Prototype Feedback</p>
                <h3>
                  Your answer has been received. Real evaluation will be added
                  in Phase 3.
                </h3>
                <span>
                  Follow-up preview: You mentioned your projects. What was your
                  biggest learning?
                </span>
              </div>
            </motion.article>
          )}
        </main>

        <aside className="glass-panel session-panel">
          <div className="session-heading">
            <Zap size={20} fill="currentColor" />
            <div>
              <p>Interview Session</p>
              <h2>Chamber active</h2>
            </div>
          </div>

          <dl className="session-list">
            <SessionRow label="Mode" value="Prototype Session" />
            <SessionRow label="Round" value="HR" highlight />
            <SessionRow label="Difficulty" value="Internship" />
            <SessionRow label="Input" value="Text enabled, Voice planned" />
            <SessionRow label="Save" value="Not active in prototype" />
          </dl>

          <div className="session-note">
            <span />
            Prototype systems online
          </div>
        </aside>
      </div>

      <footer className="interview-controls">
        <button
          type="button"
          className="button button-secondary"
          onClick={() => navigate('/setup')}
        >
          <ArrowLeft size={17} />
          Back to Setup
        </button>
        <button
          type="button"
          className="button button-primary"
          onClick={() => navigate('/results')}
        >
          Go to Results
          <ArrowRight size={17} />
        </button>
      </footer>
    </section>
  )
}

function SessionRow({ label, value, highlight = false }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd className={highlight ? 'highlight' : ''}>{value}</dd>
    </div>
  )
}

export default InterviewPage
