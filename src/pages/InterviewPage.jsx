import {
  ArrowRight,
  Mic,
  MicOff,
  Square,
  UserRound,
  Volume2,
  VolumeX,
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
              }}
            >
              <span />
              <strong>{round.round}</strong>
            </div>
          )
        })}
      </div>

      <main className="interview-layout interview-focus-layout">
        <motion.article
          className="glass-panel interview-stage"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          <aside className="interviewer-rail" aria-label="Interviewer controls">
            <motion.div
              className="interviewer-portrait"
              animate={{
                boxShadow: [
                  '0 18px 42px rgba(255,122,0,.12)',
                  '0 22px 56px rgba(255,179,0,.18)',
                  '0 18px 42px rgba(255,122,0,.12)',
                ],
              }}
              transition={{ duration: 3.2, repeat: Infinity }}
            >
              <UserRound size={64} />
            </motion.div>

            <div className="interviewer-identity">
              <h1>{currentRound.interviewer}</h1>
              <p>{currentRound.title}</p>
            </div>

            <div className="interviewer-voice-actions">
              <button
                type="button"
                className="voice-icon-button"
                onClick={playInterviewerVoice}
                disabled={!ttsSupported}
                aria-label="Play interviewer voice"
                title="Play interviewer voice"
              >
                <Volume2 size={20} />
              </button>
              <button
                type="button"
                className="voice-icon-button"
                onClick={stopInterviewerVoice}
                disabled={!ttsSupported || !interviewerSpeaking}
                aria-label="Stop interviewer voice"
                title="Stop interviewer voice"
              >
                <VolumeX size={20} />
              </button>
            </div>

            {!ttsSupported && (
              <p className="interview-status-message error" role="status">
                Text-to-speech is not supported in this browser.
              </p>
            )}
          </aside>

          <div className="interview-conversation">
            <article className="question-panel">
              <p className="interviewer-dialogue">
                {presentedInterviewerDialogue}
              </p>
              <header className="question-heading">
                <h2>{presentedQuestionText}</h2>
              </header>
            </article>

            <section className="answer-card" aria-label="Answer area">
              <label className="answer-field">
                <textarea
                  value={answer}
                  onChange={(event) => {
                    setAnswer(event.target.value)
                    setSubmitStatus('')
                  }}
                  placeholder="Share your thoughts here..."
                  rows={11}
                />
              </label>

              <motion.button
                type="button"
                className={`answer-mic-button${listening ? ' listening' : ''}`}
                onClick={listening ? stopVoice : startVoice}
                disabled={!voiceSupported || starting}
                aria-label={voiceButtonLabel}
                aria-pressed={listening}
                title={voiceButtonLabel}
                animate={
                  listening
                    ? {
                        scale: [1, 1.06, 1],
                        boxShadow: [
                          '0 10px 24px rgba(255,122,0,.16)',
                          '0 14px 34px rgba(255,122,0,.28)',
                          '0 10px 24px rgba(255,122,0,.16)',
                        ],
                      }
                    : { scale: 1 }
                }
                transition={
                  listening
                    ? { duration: 1.25, repeat: Infinity, ease: 'easeInOut' }
                    : { duration: 0.2 }
                }
              >
                {!voiceSupported ? (
                  <MicOff size={18} />
                ) : listening ? (
                  <Square size={16} fill="currentColor" />
                ) : (
                  <Mic size={18} />
                )}
              </motion.button>
            </section>

            <div className="answer-actions interview-next-row">
              <button
                type="button"
                className="submit-answer"
                onClick={submitAnswer}
              >
                Next
                <ArrowRight size={18} />
              </button>
            </div>

            {!voiceSupported && (
              <p className="interview-status-message error" role="status">
                Voice input is not supported in this browser. Please use text
                mode.
              </p>
            )}

            {voiceSupported && (starting || listening) && (
              <p className="interview-status-message" role="status" aria-live="polite">
                Listening...
              </p>
            )}

            {voiceError && (
              <p className="interview-status-message error" role="alert">
                {voiceError}
              </p>
            )}

            {!voiceError &&
              voiceStatus &&
              !submitStatus &&
              !voiceStatusCleared &&
              !voiceStatus.startsWith('Voice captured') && (
                <p className="interview-status-message error" role="status" aria-live="polite">
                  {voiceStatus}
                </p>
              )}

            {submitStatus && !submitStatus.startsWith('Answer saved') && (
              <p className="interview-status-message error" role="status" aria-live="polite">
                {submitStatus}
              </p>
            )}
          </div>
        </motion.article>
      </main>
    </section>
  )
}

export default InterviewPage
