import {
  ArrowLeft,
  ArrowRight,
  Clock3,
  Mic,
  MicOff,
  Send,
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
import { evaluateAnswer } from '../utils/evaluateAnswer'

const interviewRounds = [
  {
    round: 'HR',
    interviewer: 'Mr. Volt',
    title: 'Senior HR Interviewer',
    timer: '90s',
    badge: 'HR Round',
    opening: "Good morning. Let's begin your interview.",
    firstPrompt:
      "Good morning. Let's begin your interview. Tell me about yourself.",
    nextPromptPrefix: 'Next question.',
    questions: [
      'Tell me about yourself.',
      'Why should we hire you?',
      'What are your strengths?',
      'What is one weakness you are working on?',
      'Where do you see yourself in the next two years?',
      'Why are you interested in this role?',
    ],
  },
  {
    round: 'Technical',
    interviewer: 'Ms. Luna',
    title: 'Technical Interview Specialist',
    timer: '120s',
    badge: 'Technical Round',
    opening: "I am Ms. Luna. Let's begin the technical round.",
    firstPrompt:
      "I am Ms. Luna. Let's begin the technical round. Explain the difference between frontend and backend.",
    nextPromptPrefix: 'Next question.',
    questions: [
      'Explain the difference between frontend and backend.',
      'What is React state?',
      'What is Firebase used for?',
      'What is the difference between authentication and authorization?',
      'Explain what an API is.',
      'What happens when a user submits a form in a web app?',
    ],
  },
  {
    round: 'Project',
    interviewer: 'Ms. Mari',
    title: 'Project Defense Specialist',
    timer: '180s',
    badge: 'Project Round',
    opening: "I am Ms. Mari. Let's discuss your projects.",
    firstPrompt:
      "I am Ms. Mari. Let's discuss your projects. Tell me about one project you are proud of.",
    nextPromptPrefix: 'Next question.',
    questions: [
      'Tell me about one project you are proud of.',
      'What problem did that project solve?',
      'What technologies did you use and why?',
      'What was the hardest challenge in that project?',
      'What would you improve if you had more time?',
      'How would you explain this project to a recruiter?',
    ],
  },
]

function InterviewPage() {
  const [answer, setAnswer] = useState('')
  const [savedAnswers, setSavedAnswers] = useState([])
  const [submitStatus, setSubmitStatus] = useState('')
  const [voiceStatusCleared, setVoiceStatusCleared] = useState(false)
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const navigate = useNavigate()
  const currentRound = interviewRounds[currentRoundIndex]
  const currentQuestion = currentRound.questions[currentQuestionIndex]
  const questionCount = currentRound.questions.length
  const isFirstQuestionInRound = currentQuestionIndex === 0
  const interviewerVoiceLine = isFirstQuestionInRound
    ? currentRound.firstPrompt
    : `${currentRound.nextPromptPrefix} ${currentQuestion}`
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
      setSubmitStatus('')
      setVoiceStatusCleared(false)
    },
  })
  const {
    supported: ttsSupported,
    speaking: interviewerSpeaking,
    speak: speakInterviewerLine,
    stop: stopInterviewerVoice,
  } = useTextToSpeech()

  function submitAnswer() {
    const trimmedAnswer = answer.trim()

    if (!trimmedAnswer) {
      setSubmitStatus('Please answer before continuing.')
      return
    }

    const evaluation = evaluateAnswer({
      answer: trimmedAnswer,
      question: currentQuestion,
      round: currentRound.round,
    })

    console.log('Answer evaluation:', evaluation)

    const savedAnswer = {
      round: currentRound.round,
      interviewer: currentRound.interviewer,
      question: currentQuestion,
      answer: trimmedAnswer,
      evaluation,
    }
    const nextSavedAnswers = [...savedAnswers, savedAnswer]

    setSavedAnswers(nextSavedAnswers)
    setAnswer('')
    setSubmitStatus('Answer saved locally. Moving to next question.')
    setVoiceStatusCleared(true)
    if (listening) stopVoice()
    stopInterviewerVoice()

    const isLastQuestionInRound = currentQuestionIndex === questionCount - 1
    const isLastRound = currentRoundIndex === interviewRounds.length - 1

    if (isLastQuestionInRound && isLastRound) {
      sessionStorage.setItem(
        'voltInterviewLatestSession',
        JSON.stringify({
          completedAt: new Date().toISOString(),
          answers: nextSavedAnswers,
        }),
      )
      navigate('/results')
      return
    }

    if (isLastQuestionInRound) {
      setCurrentRoundIndex((previousIndex) => previousIndex + 1)
      setCurrentQuestionIndex(0)
      return
    }

    setCurrentQuestionIndex((previousIndex) => previousIndex + 1)
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
        {interviewRounds.map((round, index) => {
          const isCompleted = index < currentRoundIndex
          const isActive = index === currentRoundIndex
          const isLocked = index > currentRoundIndex

          return (
          <div
            key={round.round}
            className={`round-step${isActive ? ' active' : ''}${
              isCompleted ? ' completed' : ''
            }${isLocked ? ' locked' : ''}`}
            aria-current={isActive ? 'step' : undefined}
            aria-label={`${round.round} round ${
              isCompleted ? 'completed' : isActive ? 'active' : 'locked'
            }`}
            style={{
              opacity: isLocked ? 0.48 : 1,
              color: isCompleted ? '#79e6b5' : undefined,
            }}
          >
            <span>{index + 1}</span>
            <strong>{round.round}</strong>
          </div>
          )
        })}
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
              <h1>{currentRound.interviewer}</h1>
              <p className="interviewer-title">{currentRound.title}</p>
              <blockquote>
                {interviewerVoiceLine}
              </blockquote>
              <span className="round-badge">{currentRound.badge}</span>
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
                  {currentRound.interviewer} is speaking...
                </p>
              )}
            </div>
          </motion.article>

          <article className="glass-panel question-panel">
            <header className="question-heading">
              <div>
                <p>
                  Question {currentQuestionIndex + 1} of {questionCount}
                </p>
                <h2>{currentQuestion}</h2>
              </div>
              <div className="prototype-timer" title="Static prototype timer">
                <Clock3 size={18} />
                <span>{currentRound.timer}</span>
              </div>
            </header>

            <label className="answer-field">
              <span>Your answer</span>
              <textarea
                value={answer}
                onChange={(event) => {
                  setAnswer(event.target.value)
                  setSubmitStatus('')
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

            {!voiceError && voiceStatus && !submitStatus && !voiceStatusCleared && (
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

            {submitStatus && (
              <p
                role="status"
                aria-live="polite"
                style={{
                  margin: '12px 0 0',
                  color: submitStatus.startsWith('Answer saved')
                    ? '#79e6b5'
                    : '#f1b4b4',
                  fontSize: 13,
                }}
              >
                {submitStatus}
              </p>
            )}
          </article>
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
            <SessionRow label="Round" value={currentRound.round} highlight />
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
          disabled
          title="Results unlock after the Project round is complete."
        >
          Results Locked
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
