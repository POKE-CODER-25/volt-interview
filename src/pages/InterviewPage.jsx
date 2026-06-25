import {
  ArrowLeft,
  ArrowRight,
  Clock3,
  Mic,
  MicOff,
  Send,
  ShieldCheck,
  Square,
  UserRound,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { useTextToSpeech } from '../hooks/useTextToSpeech'

const rounds = ['HR', 'Technical', 'Project', 'Evaluation']
const interviewerVoiceLine =
  "Good morning. Let's begin your interview. Tell me about yourself."

function InterviewPage() {
  const [answer, setAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const navigate = useNavigate()
  const {
    supported: voiceSupported,
    listening,
    starting,
    error: voiceError,
    status: voiceStatus,
    start: startVoice,
    stop: stopVoice,
  } = useSpeechRecognition({
    onTranscript: (transcript) => {
      setAnswer((previousAnswer) =>
        `${previousAnswer}${previousAnswer ? ' ' : ''}${transcript}`.trim(),
      )
      setSubmitted(false)
    },
  })
  const {
    supported: ttsSupported,
    speaking: interviewerSpeaking,
    speak: speakInterviewerLine,
    stop: stopInterviewerVoice,
  } = useTextToSpeech()

  function submitAnswer() {
    setSubmitted(true)
  }

  function playInterviewerVoice() {
    speakInterviewerLine(interviewerVoiceLine)
  }

  const voiceButtonLabel = starting
    ? 'Listening...'
    : listening
      ? 'Stop Voice'
      : 'Start Voice'

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
              <div
                className="answer-actions"
                style={{ marginTop: 16, justifyContent: 'flex-start' }}
              >
                <button
                  type="button"
                  className="voice-prototype"
                  onClick={playInterviewerVoice}
                  disabled={!ttsSupported}
                  style={{
                    cursor: ttsSupported ? 'pointer' : 'not-allowed',
                    opacity: ttsSupported ? 1 : 0.65,
                  }}
                >
                  <Volume2 size={17} />
                  Play Interviewer Voice
                </button>
                <button
                  type="button"
                  className="voice-prototype"
                  onClick={stopInterviewerVoice}
                  disabled={!ttsSupported || !interviewerSpeaking}
                  style={{
                    cursor:
                      ttsSupported && interviewerSpeaking
                        ? 'pointer'
                        : 'not-allowed',
                    opacity: ttsSupported && interviewerSpeaking ? 1 : 0.65,
                  }}
                >
                  <VolumeX size={17} />
                  Stop Voice
                </button>
              </div>
              {!ttsSupported && (
                <p
                  role="status"
                  style={{
                    margin: '12px 0 0',
                    color: '#f1b4b4',
                    fontSize: 13,
                  }}
                >
                  Text-to-speech is not supported in this browser.
                </p>
              )}
              {ttsSupported && interviewerSpeaking && (
                <p
                  role="status"
                  aria-live="polite"
                  style={{
                    margin: '12px 0 0',
                    color: 'var(--yellow)',
                    fontSize: 13,
                  }}
                >
                  Mr. Volt is speaking...
                </p>
              )}
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
                placeholder="Type your answer here, or use voice input..."
                rows={7}
              />
            </label>

            <div className="answer-actions">
              <motion.button
                type="button"
                className="voice-prototype"
                onClick={listening ? stopVoice : startVoice}
                disabled={!voiceSupported || starting}
                aria-pressed={listening}
                animate={
                  listening
                    ? {
                        scale: [1, 1.035, 1],
                        boxShadow: [
                          '0 0 0 rgba(245,230,66,0)',
                          '0 0 22px rgba(245,230,66,.25)',
                          '0 0 0 rgba(245,230,66,0)',
                        ],
                      }
                    : { scale: 1, boxShadow: '0 0 0 rgba(245,230,66,0)' }
                }
                transition={
                  listening
                    ? { duration: 1.25, repeat: Infinity, ease: 'easeInOut' }
                    : { duration: 0.2 }
                }
                style={{
                  cursor: voiceSupported && !starting ? 'pointer' : 'not-allowed',
                  color: listening ? '#07101e' : '#d8e5f2',
                  background: listening
                    ? 'var(--yellow)'
                    : 'rgba(255,255,255,.06)',
                  borderColor: listening
                    ? 'rgba(245,230,66,.75)'
                    : 'rgba(255,255,255,.14)',
                  opacity: voiceSupported ? 1 : 0.65,
                }}
              >
                {!voiceSupported ? (
                  <MicOff size={17} />
                ) : listening ? (
                  <Square size={15} fill="currentColor" />
                ) : (
                  <Mic size={17} />
                )}
                {voiceButtonLabel}
              </motion.button>
              <button
                type="button"
                className="submit-answer"
                onClick={submitAnswer}
              >
                <Send size={17} />
                Submit Answer
              </button>
            </div>

            {!voiceSupported && (
              <p
                role="status"
                style={{ margin: '12px 0 0', color: '#f1b4b4', fontSize: 13 }}
              >
                Voice input is not supported in this browser. Please use text
                mode.
              </p>
            )}

            {voiceSupported && (starting || listening) && (
              <p
                role="status"
                aria-live="polite"
                style={{ margin: '12px 0 0', color: 'var(--yellow)', fontSize: 13 }}
              >
                Listening... speak your answer now
              </p>
            )}

            {voiceError && (
              <p
                role="alert"
                style={{ margin: '12px 0 0', color: '#f1b4b4', fontSize: 13 }}
              >
                {voiceError}
              </p>
            )}

            {!voiceError && voiceStatus && (
              <p
                role="status"
                aria-live="polite"
                style={{
                  margin: '12px 0 0',
                  color: voiceStatus.startsWith('Voice captured')
                    ? '#79e6b5'
                    : '#f1b4b4',
                  fontSize: 13,
                }}
              >
                {voiceStatus}
              </p>
            )}
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
            <SessionRow label="Input" value="Text and voice enabled" />
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
