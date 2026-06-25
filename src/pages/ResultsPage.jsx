import {
  ArrowLeft,
  Award,
  Bot,
  CheckCircle2,
  Home,
  RotateCcw,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
  Zap,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const sessionStorageKey = 'voltInterviewLatestSession'

const scoreCategories = [
  ['communication', 'Communication'],
  ['confidence', 'Confidence'],
  ['technicalDepth', 'Technical Depth'],
  ['problemSolving', 'Problem Solving'],
  ['projectOwnership', 'Project Ownership'],
  ['completeness', 'Completeness'],
]

const masteries = [
  ['Mr. Volt Mastery', 'Level 2', '+120 XP'],
  ['Ms. Luna Mastery', 'Level 1', '+75 XP'],
  ['Ms. Mari Mastery', 'Level 3', '+150 XP'],
]

const categoryAdvice = {
  Communication: 'Use a simple structure: context, action, result.',
  Confidence: 'Replace unsure language with clear ownership statements.',
  'Technical Depth':
    'Add tools, architecture, and implementation details to technical answers.',
  'Problem Solving': 'Mention challenges, solutions, and outcomes.',
  'Project Ownership':
    'Clearly explain what you personally built and contributed.',
  Completeness:
    'Answer every question with a complete explanation instead of one-word responses.',
}

function clampScore(score) {
  return Math.max(0, Math.min(100, Math.round(score)))
}

function average(values) {
  if (!values.length) return 0

  return values.reduce((total, value) => total + value, 0) / values.length
}

function getLatestSession() {
  if (typeof window === 'undefined') return null

  try {
    const rawSession = window.sessionStorage.getItem(sessionStorageKey)
    if (!rawSession) return null

    const session = JSON.parse(rawSession)
    if (!Array.isArray(session.answers) || !session.answers.length) return null

    return session
  } catch {
    return null
  }
}

function getHiringRecommendation(score) {
  if (score >= 85) return 'Highly Recommended'
  if (score >= 70) return 'Recommended'
  if (score >= 50) return 'Needs Improvement'

  return 'Not Yet Ready'
}

function getCategoryPhrase(category) {
  return category.toLowerCase()
}

function getRecruiterImpression(overallScore, strongestCategory, weakestCategory) {
  const strength = getCategoryPhrase(strongestCategory[0])
  const weakness = getCategoryPhrase(weakestCategory[0])

  if (overallScore >= 85) {
    return `You gave a strong interview with clear evidence of ${strength}. Your ${weakness} is the main area to refine, but the overall signal is strong for an internship-level role.`
  }

  if (overallScore >= 70) {
    return `You showed solid interview readiness, especially in ${strength}. To make the report stronger, add more evidence around ${weakness} with specific implementation details and measurable outcomes.`
  }

  if (overallScore >= 50) {
    return `You have some useful signals, but the interview needs more complete and specific answers. Your strongest area was ${strength}, while ${weakness} needs focused practice before this would feel recruiter-ready.`
  }

  return `Your answers were too brief to create a strong recruiter signal. Start by improving ${weakness}, then support each answer with examples, ownership, challenges, solutions, and outcomes.`
}

function getPracticePlan(scoreBreakdown) {
  return [...scoreBreakdown]
    .sort((first, second) => first[1] - second[1])
    .slice(0, 3)
    .map(([category]) => categoryAdvice[category])
}

function getReport(session) {
  const evaluatedAnswers = session.answers.filter((item) => item.evaluation)
  if (!evaluatedAnswers.length) return null

  const scoreBreakdown = scoreCategories.map(([key, label]) => [
    label,
    clampScore(
      average(
        evaluatedAnswers.map((item) => Number(item.evaluation[key]) || 0),
      ),
    ),
  ])
  const overallScore = clampScore(
    average(evaluatedAnswers.map((item) => Number(item.evaluation.overall) || 0)),
  )
  const highestCategory = scoreBreakdown.reduce((best, current) =>
    current[1] > best[1] ? current : best,
  )
  const lowestCategory = scoreBreakdown.reduce((worst, current) =>
    current[1] < worst[1] ? current : worst,
  )
  const recommendation = getHiringRecommendation(overallScore)
  const practicePlan = getPracticePlan(scoreBreakdown)
  const recruiterImpression = getRecruiterImpression(
    overallScore,
    highestCategory,
    lowestCategory,
  )

  return {
    overallScore,
    scoreBreakdown,
    recommendation,
    recruiterImpression,
    biggestStrength: `${highestCategory[0]} (${highestCategory[1]}/100)`,
    biggestGrowthArea: `${lowestCategory[0]} (${lowestCategory[1]}/100)`,
    practicePlan,
    strengths: [
      `Biggest strength: ${highestCategory[0]} (${highestCategory[1]}/100)`,
      `Hiring recommendation: ${recommendation}`,
      `Completed ${evaluatedAnswers.length} evaluated answers`,
    ],
    improvements: [
      `Biggest improvement area: ${lowestCategory[0]} (${lowestCategory[1]}/100)`,
      'Add specific examples, outcomes, and technical details where relevant',
      'Use a clear structure for each answer: situation, action, and result',
    ],
    recommendations: [
      recommendation,
      highestCategory[1] >= 70
        ? `Keep using your ${highestCategory[0].toLowerCase()} strength`
        : `Build stronger ${highestCategory[0].toLowerCase()} evidence`,
      lowestCategory[1] < 60
        ? `Practice ${lowestCategory[0].toLowerCase()} before your next attempt`
        : 'Retake the interview with more detailed examples',
    ],
  }
}

function ResultsPage() {
  const navigate = useNavigate()
  const session = getLatestSession()
  const report = session ? getReport(session) : null

  if (!report) {
    return (
      <section className="results-page">
        <header className="results-header">
          <div className="eyebrow">
            <Sparkles size={14} />
            Prototype performance report
          </div>
          <h1>No Report Yet</h1>
          <p>
            No completed interview found yet. Complete an interview to generate
            your Volt AI report.
          </p>
        </header>

        <article className="glass-panel achievement-card">
          <div className="achievement-badge">
            <Target size={30} />
          </div>
          <div>
            <span>Interview required</span>
            <h3>Complete an interview to unlock results</h3>
            <p>Your report will appear here after the Project round finishes.</p>
          </div>
        </article>

        <footer className="results-actions">
          <button
            type="button"
            className="button button-primary"
            onClick={() => navigate('/setup')}
          >
            <RotateCcw size={17} />
            Start Interview
          </button>
        </footer>
      </section>
    )
  }

  return (
    <section className="results-page">
      <header className="results-header">
        <div className="eyebrow">
          <Sparkles size={14} />
          Prototype performance report
        </div>
        <h1>Interview Complete</h1>
        <p>Volt AI has generated your prototype performance report.</p>
      </header>

      <div className="results-hero">
        <motion.article
          className="glass-panel volt-ai-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <motion.div
            className="volt-ai-icon"
            animate={{
              boxShadow: [
                '0 0 22px rgba(50,167,255,.14)',
                '0 0 40px rgba(50,167,255,.3)',
                '0 0 22px rgba(50,167,255,.14)',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Bot size={35} />
          </motion.div>
          <div>
            <p className="results-kicker">Volt AI</p>
            <h2>Final Evaluation System</h2>
            <blockquote>
              “Your interview simulation is complete. Review your performance
              breakdown and prepare for your next attempt.”
            </blockquote>
          </div>
        </motion.article>

        <article className="glass-panel overall-score-card">
          <div className="score-ring">
            <div>
              <strong>{report.overallScore}</strong>
              <span>/ 100</span>
            </div>
          </div>
          <p>Overall Interview Score</p>
          <span className="prototype-tag">
            {getHiringRecommendation(report.overallScore)}
          </span>
        </article>
      </div>

      <section className="results-section">
        <SectionHeading icon={Sparkles} title="Recruiter Report" />
        <article className="glass-panel achievement-card">
          <div className="achievement-badge">
            <Bot size={30} />
          </div>
          <div>
            <span>Hiring Recommendation</span>
            <h3>{report.recommendation}</h3>
            <p>{report.recruiterImpression}</p>
          </div>
        </article>
      </section>

      <section className="results-section">
        <SectionHeading icon={TrendingUp} title="Score Breakdown" />
        <div className="score-grid">
          {report.scoreBreakdown.map(([label, score]) => (
            <article className="glass-panel score-card" key={label}>
              <div>
                <p>{label}</p>
                <strong>{score}</strong>
              </div>
              <div className="score-track">
                <span style={{ width: `${score}%` }} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="insight-grid">
        <InsightCard
          icon={CheckCircle2}
          title="Biggest Strength"
          items={[report.biggestStrength]}
          tone="success"
        />
        <InsightCard
          icon={Target}
          title="Biggest Growth Area"
          items={[report.biggestGrowthArea]}
          tone="warning"
        />
        <InsightCard
          icon={Sparkles}
          title="Practice Plan"
          items={report.practicePlan}
          tone="electric"
        />
      </div>

      <section className="results-section mastery-section">
        <SectionHeading icon={Zap} title="Mastery Preview" />
        <div className="mastery-layout">
          <div className="mastery-grid">
            {masteries.map(([name, level, xp]) => (
              <article className="glass-panel mastery-card" key={name}>
                <div className="mastery-icon">
                  <UserRound size={22} />
                </div>
                <div>
                  <h3>{name}</h3>
                  <p>{level}</p>
                </div>
                <strong>{xp}</strong>
              </article>
            ))}
          </div>

          <aside className="glass-panel rank-card">
            <p>Current Rank</p>
            <h3>Circuit</h3>
            <span>Prototype progression preview</span>
          </aside>
        </div>
      </section>

      <section className="results-section">
        <SectionHeading icon={Award} title="Achievement Preview" />
        <article className="glass-panel achievement-card">
          <div className="achievement-badge">
            <Award size={30} />
          </div>
          <div>
            <span>Prototype unlocked badge</span>
            <h3>First Interview Completed</h3>
            <p>This achievement is a visual preview and has not been saved.</p>
          </div>
        </article>
      </section>

      <footer className="results-actions">
        <button
          type="button"
          className="button button-primary"
          onClick={() => navigate('/setup')}
        >
          <RotateCcw size={17} />
          Retake Interview
        </button>
        <button
          type="button"
          className="button button-secondary"
          onClick={() => navigate('/profile')}
        >
          <UserRound size={17} />
          View Profile
        </button>
        <button
          type="button"
          className="button results-home-button"
          onClick={() => navigate('/')}
        >
          <ArrowLeft size={17} />
          <Home size={16} />
          Back to Home
        </button>
      </footer>
    </section>
  )
}

function SectionHeading({ icon: Icon, title }) {
  return (
    <div className="results-section-heading">
      <Icon size={20} />
      <h2>{title}</h2>
    </div>
  )
}

function InsightCard({ icon: Icon, title, items, tone }) {
  return (
    <article className={`glass-panel insight-card ${tone}`}>
      <div className="insight-heading">
        <Icon size={21} />
        <h2>{title}</h2>
      </div>
      <ul>
        {items.map((item) => (
          <li key={item}>
            <span />
            {item}
          </li>
        ))}
      </ul>
    </article>
  )
}

export default ResultsPage
