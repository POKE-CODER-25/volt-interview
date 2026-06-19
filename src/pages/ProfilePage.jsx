import {
  ArrowRight,
  Award,
  CalendarDays,
  CheckCircle2,
  Flame,
  Gauge,
  History,
  Home,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  UserRound,
  Zap,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const overviewStats = [
  ['Rank', 'Circuit', Trophy],
  ['Total XP', '1245', Zap],
  ['Current Streak', '4 Days', Flame],
  ['Completed Interviews', '3', CheckCircle2],
]

const masteries = [
  {
    name: 'Mr. Volt Mastery',
    role: 'HR Interview Training',
    level: 'Level 2',
    xp: '120 / 250',
    progress: 48,
  },
  {
    name: 'Ms. Luna Mastery',
    role: 'Technical Interview Training',
    level: 'Level 1',
    xp: '75 / 200',
    progress: 37.5,
  },
  {
    name: 'Ms. Mari Mastery',
    role: 'Project Defense Training',
    level: 'Level 3',
    xp: '150 / 300',
    progress: 50,
  },
]

const achievements = [
  'First Interview Completed',
  'HR Challenger',
  'Project Defender',
  '3 Day Streak',
  'Technical Spark',
]

const history = [
  ['Attempt 1', 'Student Mode', 'Fresher', '72', 'Prototype Date'],
  ['Attempt 2', 'Resume Mode', 'Internship', '79', 'Prototype Date'],
  ['Attempt 3', 'Resume Mode', 'Dream Company', '84', 'Prototype Date'],
]

const weaknesses = [
  'Technical depth',
  'Answer structure',
  'Project metrics',
  'Confidence under pressure',
]

const improvements = [
  'HR communication',
  'Project explanation',
  'Professional tone',
]

function ProfilePage() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const userName = currentUser?.displayName || 'Volt Candidate'
  const userEmail = currentUser?.email || 'No email available'

  return (
    <section className="profile-page">
      <header className="profile-header">
        <div className="eyebrow">
          <Gauge size={14} />
          Personal training dashboard
        </div>
        <h1>Progress Center</h1>
        <p>
          Track your interview growth, trainer mastery, streaks, and improvement
          areas.
        </p>
      </header>

      <article className="glass-panel user-overview">
        <div className="profile-identity">
          <div className="profile-avatar">
            <UserRound size={34} />
          </div>
          <div>
            <span>Authenticated candidate</span>
            <h2>{userName}</h2>
            <p>{userEmail}</p>
          </div>
        </div>

        <div className="overview-stats">
          {overviewStats.map(([label, value, Icon]) => (
            <div key={label}>
              <Icon size={18} />
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
        <p className="profile-prototype-note">
          Progress values shown here are prototype previews.
        </p>
      </article>

      <ProfileSection icon={TrendingUp} title="Trainer Masteries">
        <div className="profile-mastery-grid">
          {masteries.map((mastery) => (
            <article className="glass-panel profile-mastery-card" key={mastery.name}>
              <div className="profile-mastery-heading">
                <div className="profile-mastery-icon">
                  <UserRound size={21} />
                </div>
                <div>
                  <h3>{mastery.name}</h3>
                  <p>{mastery.role}</p>
                </div>
              </div>
              <div className="mastery-meta">
                <span>{mastery.level}</span>
                <strong>{mastery.xp} XP</strong>
              </div>
              <div className="profile-progress-track">
                <span style={{ width: `${mastery.progress}%` }} />
              </div>
            </article>
          ))}
        </div>
      </ProfileSection>

      <ProfileSection icon={Award} title="Achievement Preview">
        <div className="profile-achievements">
          {achievements.map((achievement, index) => (
            <article className="electric-badge" key={achievement}>
              <div>
                {index === 0 ? <Trophy size={22} /> : <Award size={22} />}
              </div>
              <span>{achievement}</span>
              <small>Prototype badge</small>
            </article>
          ))}
        </div>
      </ProfileSection>

      <ProfileSection icon={History} title="Interview History">
        <div className="glass-panel history-card">
          <div className="history-table">
            <div className="history-row history-head">
              <span>Attempt</span>
              <span>Mode</span>
              <span>Difficulty</span>
              <span>Score</span>
              <span>Date</span>
            </div>
            {history.map(([attempt, mode, difficulty, score, date]) => (
              <div className="history-row" key={attempt}>
                <strong>{attempt}</strong>
                <span>{mode}</span>
                <span>{difficulty}</span>
                <span className="history-score">{score}</span>
                <span>{date}</span>
              </div>
            ))}
          </div>
        </div>
      </ProfileSection>

      <div className="tracker-grid">
        <TrackerCard
          icon={Target}
          title="Weakness Tracker"
          items={weaknesses}
          tone="warning"
        />
        <TrackerCard
          icon={TrendingUp}
          title="Improvement Tracker"
          items={improvements}
          tone="success"
        />
      </div>

      <article className="glass-panel daily-challenge">
        <div className="challenge-icon">
          <Sparkles size={27} />
        </div>
        <div className="challenge-copy">
          <span>Today&apos;s Challenge</span>
          <h2>Explain OOP in 60 seconds.</h2>
          <p>
            Prototype reward: <strong>+30 XP</strong>
          </p>
        </div>
        <button type="button" onClick={() => navigate('/interview')}>
          Start Challenge
          <ArrowRight size={17} />
        </button>
      </article>

      <footer className="profile-actions">
        <button
          type="button"
          className="button button-primary"
          onClick={() => navigate('/setup')}
        >
          <Zap size={17} />
          Start New Interview
        </button>
        <button
          type="button"
          className="button button-secondary"
          onClick={() => navigate('/results')}
        >
          <CalendarDays size={17} />
          View Latest Results
        </button>
        <button
          type="button"
          className="button results-home-button"
          onClick={() => navigate('/')}
        >
          <Home size={17} />
          Back Home
        </button>
      </footer>
    </section>
  )
}

function ProfileSection({ icon: Icon, title, children }) {
  return (
    <section className="profile-section">
      <div className="profile-section-heading">
        <Icon size={20} />
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  )
}

function TrackerCard({ icon: Icon, title, items, tone }) {
  return (
    <article className={`glass-panel tracker-card ${tone}`}>
      <div className="tracker-heading">
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

export default ProfilePage
