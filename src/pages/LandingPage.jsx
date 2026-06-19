import {
  ArrowRight,
  Bot,
  BriefcaseBusiness,
  Code2,
  FolderKanban,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const characters = [
  {
    name: 'Mr. Volt',
    role: 'Senior HR Interviewer',
    icon: BriefcaseBusiness,
    accent: 'yellow',
  },
  {
    name: 'Ms. Luna',
    role: 'Technical Interview Specialist',
    icon: Code2,
    accent: 'blue',
  },
  {
    name: 'Ms. Mari',
    role: 'Project Defense Specialist',
    icon: FolderKanban,
    accent: 'blue',
  },
  {
    name: 'Volt AI',
    role: 'Final Evaluation System',
    icon: Bot,
    accent: 'yellow',
  },
]

function LandingPage() {
  return (
    <section className="hero-section">
      <div className="hero-grid">
        <div className="hero-copy">
            <div className="eyebrow">
              <Sparkles size={14} />
              Enter the electric universe
            </div>

            <h1>
              <span>Volt Interview</span>
            </h1>
            <p className="tagline">
              Practice interviews with AI voice trainers.
            </p>
            <p className="description">
              A cinematic AI voice interview simulator where students face Mr.
              Volt, Ms. Luna, and Ms. Mari through HR, Technical, and Project
              rounds.
            </p>

            <div className="hero-actions">
              <Link
                to="/setup"
                className="button button-primary"
              >
                Start Interview
                <ArrowRight size={18} />
              </Link>
              <Link to="/auth" className="button button-secondary">
                Login / Register
              </Link>
            </div>
          </div>

          <div className="glass-panel character-panel">
              <div className="panel-heading">
                <div>
                  <p>Training panel</p>
                  <span>Choose your specialist</span>
                </div>
                <span className="system-status">
                  <i />
                  Systems ready
                </span>
              </div>

              <div className="character-grid">
                {characters.map(({ name, role, icon: Icon, accent }) => (
                  <article key={name} className="character-card">
                    <div className={`character-icon ${accent}`}>
                      <Icon size={21} />
                    </div>
                    <h2>{name}</h2>
                    <p>{role}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
    </section>
  )
}

export default LandingPage
