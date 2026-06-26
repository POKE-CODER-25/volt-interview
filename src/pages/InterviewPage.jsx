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
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { useTextToSpeech } from '../hooks/useTextToSpeech'
import {
  analyzeAnswer,
  generateFollowup,
  shouldAskFollowup,
} from '../utils/answerAnalyzer'
import {
  buildInterviewQuestions,
  getQuestionText,
} from '../utils/buildInterviewQuestions'
import { evaluateAnswer } from '../utils/evaluateAnswer'

function readSessionJson(key) {
  if (typeof window === 'undefined') return null

  try {
    const value = window.sessionStorage.getItem(key)
    return value ? JSON.parse(value) : null
  } catch {
    return null
  }
}

function getInterviewQuestionPresentation(question) {
  return String(question || '')
    .replace(/^\s*(?:follow[-\s]?up|pivot|main question)\s*:?\s*/i, '')
    .replace(/^\s*that's interesting[.!]?\s*/i, '')
    .replace(/^\s*i want to follow that thread for a moment[.!]?\s*/i, '')
    .replace(/^\s*i want to stay with that for a moment[.!]?\s*/i, '')
    .replace(/^\s*i'd like to stay on that topic[.!]?\s*/i, '')
    .replace(/^\s*let's follow up[.!]?\s*/i, '')
    .replace(/^\s*let's explore that[.!]?\s*/i, '')
    .replace(/^\s*conversation pivot[.!]?\s*/i, '')
    .trim()
}

function getInterviewerDialoguePresentation(round, questionIndex, isGeneratedQuestion) {
  if (isGeneratedQuestion) {
    const generatedLines = [
      "I'd like to understand that point more clearly.",
      'That gives me a useful direction to explore.',
      "Let's look at that answer a little deeper.",
    ]

    return generatedLines[questionIndex % generatedLines.length]
  }

  const linesByRound = {
    hr: [
      "I'd like to understand your background and how you think about your work.",
      "Let's talk through your experience in a practical way.",
      'I want to get a clearer sense of how you present yourself.',
    ],
    technical: [
      "Let's go deeper into your technical thinking.",
      "I'll focus on how you reason through implementation decisions.",
      'I want to understand how you approach technical problems.',
    ],
    project: [
      "Let's talk about the projects you've built and the choices behind them.",
      "I'm interested in how you explain your work and your decisions.",
      "Let's explore the project experience you bring.",
    ],
  }
  const roundLines = linesByRound[round.key] || [
    "Let's talk through this in a clear and practical way.",
  ]

  return roundLines[questionIndex % roundLines.length]
}

function InterviewPage() {
  const [answer, setAnswer] = useState('')
  const [savedAnswers, setSavedAnswers] = useState([])
  const [submitStatus, setSubmitStatus] = useState('')
  const [voiceStatusCleared, setVoiceStatusCleared] = useState(false)
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [activeFollowup, setActiveFollowup] = useState(null)
  const [askedFollowupKeys, setAskedFollowupKeys] = useState([])
  const [usedFollowupTopics, setUsedFollowupTopics] = useState([])
  const [interviewMemory, setInterviewMemory] = useState({
    mentionedProjects: [],
    mentionedTechnologies: [],
    challenges: [],
    achievements: [],
    primaryFocus: '',
    secondaryFocus: '',
    askedFollowups: [],
    roundPivotUsed: {},
  })
  const navigate = useNavigate()
  const setupData = useMemo(() => readSessionJson('voltInterviewSetup'), [])
  const confirmedContext = useMemo(
    () => readSessionJson('voltInterviewConfirmedContext'),
    [],
  )
  const parsedResume = useMemo(
    () => readSessionJson('voltInterviewParsedResume'),
    [],
  )
  const interviewPlan = useMemo(() => {
    return buildInterviewQuestions({
      setup: setupData,
      confirmedContext,
    })
  }, [confirmedContext, setupData])
  const interviewFocus = interviewPlan.focus || {}
  const interviewRounds = interviewPlan.rounds
  const currentRound = interviewRounds[currentRoundIndex]
  const currentQuestion = currentRound.questions[currentQuestionIndex]
  const plannedQuestionText = getQuestionText(currentQuestion)
  const currentQuestionText = activeFollowup?.question || plannedQuestionText
  const presentedQuestionText = getInterviewQuestionPresentation(currentQuestionText)
  const presentedInterviewerDialogue = getInterviewerDialoguePresentation(
    currentRound,
    currentQuestionIndex,
    Boolean(activeFollowup),
  )
  const questionCount = currentRound.questions.length
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

  function uniqueValues(values) {
    return [...new Set(values.filter(Boolean).map((value) => String(value).trim()))]
  }

  function moveToNextPlannedQuestion() {
    const isLastQuestionInRound = currentQuestionIndex === questionCount - 1
    const isLastRound = currentRoundIndex === interviewRounds.length - 1

    if (isLastQuestionInRound && isLastRound) return false

    if (isLastQuestionInRound) {
      setCurrentRoundIndex((previousIndex) => previousIndex + 1)
      setCurrentQuestionIndex(0)
      return true
    }

    setCurrentQuestionIndex((previousIndex) => previousIndex + 1)
    return true
  }

  function maybeBuildFollowup(trimmedAnswer) {
    const mainQuestionKey = `${currentRound.key}-${currentQuestionIndex}`
    if (askedFollowupKeys.includes(mainQuestionKey)) return null

    try {
      const answerAnalysis = analyzeAnswer({
        answer: trimmedAnswer,
        question: plannedQuestionText,
        interviewContext: {
          mode: interviewPlan.mode,
          focus: interviewFocus,
          confirmedContext,
          parsedResume,
        },
      })

      setInterviewMemory((previousMemory) => ({
        ...previousMemory,
        mentionedProjects: uniqueValues([
          ...previousMemory.mentionedProjects,
          ...answerAnalysis.projects,
        ]),
        mentionedTechnologies: uniqueValues([
          ...previousMemory.mentionedTechnologies,
          ...answerAnalysis.technologies,
        ]),
        challenges: answerAnalysis.signals.includes('challenge')
          ? uniqueValues([...previousMemory.challenges, plannedQuestionText])
          : previousMemory.challenges,
        achievements: answerAnalysis.signals.includes('success')
          ? uniqueValues([...previousMemory.achievements, plannedQuestionText])
          : previousMemory.achievements,
        primaryFocus:
          previousMemory.primaryFocus || interviewFocus.primaryProject?.name || '',
        secondaryFocus:
          previousMemory.secondaryFocus ||
          interviewFocus.secondaryProject?.name ||
          '',
      }))

      if (!shouldAskFollowup(answerAnalysis)) return null

      const followup = generateFollowup(answerAnalysis, {
        mode: interviewPlan.mode,
        focus: interviewFocus,
        confirmedContext,
        parsedResume,
        usedFollowupTopics,
        currentRoundKey: currentRound.key,
        roundPivotUsed: interviewMemory.roundPivotUsed,
      })

      if (!followup || askedFollowupKeys.includes(followup.key)) return null

      return {
        ...followup,
        mainQuestionKey,
        parentQuestion: plannedQuestionText,
        round: currentRound.round,
      }
    } catch (error) {
      console.warn('Additional prompt generation failed, continuing normally.', error)
      return null
    }
  }

  function submitAnswer() {
    const trimmedAnswer = answer.trim()

    if (!trimmedAnswer) {
      setSubmitStatus('Please answer before continuing.')
      return
    }

    const evaluation = evaluateAnswer({
      answer: trimmedAnswer,
      question: currentQuestionText,
      round: currentRound.round,
    })

    console.log('Answer evaluation:', evaluation)

    const savedAnswer = {
      round: currentRound.round,
      interviewer: currentRound.interviewer,
      question: currentQuestionText,
      answer: trimmedAnswer,
      evaluation,
      isFollowup: Boolean(activeFollowup),
      parentQuestion: activeFollowup?.parentQuestion || null,
    }
    const nextSavedAnswers = [...savedAnswers, savedAnswer]

    setSavedAnswers(nextSavedAnswers)
    setAnswer('')
    setSubmitStatus('Answer saved locally.')
    setVoiceStatusCleared(true)
    if (listening) stopVoice()
    stopInterviewerVoice()

    if (activeFollowup) {
      setActiveFollowup(null)

      const moved = moveToNextPlannedQuestion()
      if (!moved) {
        sessionStorage.setItem(
          'voltInterviewLatestSession',
          JSON.stringify({
            completedAt: new Date().toISOString(),
            answers: nextSavedAnswers,
          }),
        )
        navigate('/results')
      }

      return
    }

    const followup = maybeBuildFollowup(trimmedAnswer)
    if (followup) {
      setActiveFollowup(followup)
      setAskedFollowupKeys((previousKeys) => [
        ...previousKeys,
        followup.mainQuestionKey,
        followup.key,
      ])
      setUsedFollowupTopics((previousTopics) => [
        ...previousTopics,
        followup.topic.toLowerCase(),
      ])
      setInterviewMemory((previousMemory) => {
        const nextMemory = {
          ...previousMemory,
          askedFollowups: uniqueValues([
            ...previousMemory.askedFollowups,
            followup.key,
          ]),
          roundPivotUsed: followup.isPivot
            ? {
                ...previousMemory.roundPivotUsed,
                [currentRound.key]: true,
              }
            : previousMemory.roundPivotUsed,
        }

        console.log('Generated interview prompt:', followup.question)
        console.log('Interview memory:', nextMemory)

        return nextMemory
      })
      setSubmitStatus('Answer saved locally.')
      return
    }

    const moved = moveToNextPlannedQuestion()
    if (!moved) {
      sessionStorage.setItem(
        'voltInterviewLatestSession',
        JSON.stringify({
          completedAt: new Date().toISOString(),
          answers: nextSavedAnswers,
        }),
      )
      navigate('/results')
    }
  }

  function playInterviewerVoice() {
    speakInterviewerLine(
      [presentedInterviewerDialogue, presentedQuestionText]
        .filter((line) => line?.trim())
        .join(' '),
    )
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
                {presentedInterviewerDialogue}
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
                  {`Question ${currentQuestionIndex + 1} of ${questionCount}`}
                </p>
                <h2>{presentedQuestionText}</h2>
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
            <SessionRow
              label="Mode"
              value={
                interviewPlan.mode === 'resume'
                  ? 'Resume Interview'
                  : 'Student Interview'
              }
            />
            <SessionRow label="Round" value={currentRound.round} highlight />
            {interviewPlan.mode === 'resume' && (
              <SessionRow
                label="Primary Focus"
                value={interviewFocus.primaryProject?.name || 'Not set'}
              />
            )}
            {interviewPlan.mode === 'resume' &&
              interviewFocus.secondaryProject?.name && (
                <SessionRow
                  label="Secondary Focus"
                  value={interviewFocus.secondaryProject.name}
                />
              )}
            <SessionRow
              label="Difficulty"
              value={setupData?.difficulty || 'Medium'}
            />
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
