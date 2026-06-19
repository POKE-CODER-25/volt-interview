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

const scoreBreakdown = [
  ['Communication', 88],
  ['Confidence', 81],
  ['Technical Depth', 79],
  ['Project Explanation', 91],
  ['Answer Structure', 76],
]

const strengths = [
  'Clear communication',
  'Professional tone',
  'Strong project explanation',
  'Good confidence in HR answers',
]

const improvements = [
  'Add more technical depth',
  'Structure answers using STAR method',
  'Reduce filler words',
  'Give more measurable project impact',
]

const recommendations = [
  'Practice React and Firebase questions',
  'Prepare 2-minute project explanations',
  'Add numbers and outcomes to your answers',
  'Retake Technical Round at higher difficulty',
]

const masteries = [
  ['Mr. Volt Mastery', 'Level 2', '+120 XP'],
  ['Ms. Luna Mastery', 'Level 1', '+75 XP'],
  ['Ms. Mari Mastery', 'Level 3', '+150 XP'],
]

function ResultsPage() {
  const navigate = useNavigate()

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
              <strong>84</strong>
              <span>/ 100</span>
            </div>
          </div>
          <p>Overall Interview Score</p>
          <span className="prototype-tag">Prototype score</span>
        </article>
      </div>

      <section className="results-section">
        <SectionHeading icon={TrendingUp} title="Score Breakdown" />
        <div className="score-grid">
          {scoreBreakdown.map(([label, score]) => (
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
          title="Strengths"
          items={strengths}
          tone="success"
        />
        <InsightCard
          icon={Target}
          title="Areas to Improve"
          items={improvements}
          tone="warning"
        />
        <InsightCard
          icon={Sparkles}
          title="Recommendations"
          items={recommendations}
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
