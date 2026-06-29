import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  ClipboardCheck,
  Code2,
  FileText,
  FolderKanban,
  MessageCircle,
  Mic,
  RefreshCw,
  Sparkles,
  UserRoundCheck,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const featureChips = [
  'Voice Interviews',
  'Resume-Aware Questions',
  'Student Mode',
  'Follow-up Engine',
  'Recruiter Report',
]

const workSteps = [
  {
    title: 'Choose Resume or Student Mode',
    description:
      'Start with a resume-aware interview or practice from student mode without uploading anything.',
    icon: ClipboardCheck,
  },
  {
    title: 'Answer with Voice or Text',
    description:
      'Respond naturally with voice input or write your answer when you want more control.',
    icon: Mic,
  },
  {
    title: 'Get Recruiter-Style Feedback',
    description:
      'Review practical feedback focused on clarity, technical depth, confidence, and improvement.',
    icon: FileText,
  },
]

const interviewers = [
  {
    name: 'Mr. Volt',
    role: 'HR Interviewer',
    description:
      'Helps you practice introductions, motivation, strengths, and recruiter-facing answers.',
    icon: BriefcaseBusiness,
  },
  {
    name: 'Ms. Luna',
    role: 'Technical Interview Specialist',
    description:
      'Challenges your implementation reasoning, tradeoffs, debugging, and architecture thinking.',
    icon: Code2,
  },
  {
    name: 'Ms. Mari',
    role: 'Project Defense Specialist',
    description:
      'Pushes you to explain project decisions, ownership, outcomes, and production readiness.',
    icon: FolderKanban,
  },
]

const realFeatures = [
  {
    title: 'Resume-aware questions',
    icon: FileText,
  },
  {
    title: 'Natural follow-ups',
    icon: RefreshCw,
  },
  {
    title: 'Student mode without resume',
    icon: UserRoundCheck,
  },
  {
    title: 'Voice interview experience',
    icon: MessageCircle,
  },
  {
    title: 'Improvement-focused report',
    icon: ClipboardCheck,
  },
]

const fadeUp = {
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.22 },
  transition: { duration: 0.55, ease: 'easeOut' },
}

function LandingPage() {
  const { currentUser, loading } = useAuth()
  const isSignedIn = !loading && Boolean(currentUser)

  return (
    <div className="landing-page">
      <section className="hero-section landing-hero">
        <div className="landing-glow landing-glow-one" />
        <div className="landing-glow landing-glow-two" />

        <div className="hero-grid landing-hero-grid">
          <motion.div className="hero-copy" {...fadeUp}>
            <div className="eyebrow">
              <Sparkles size={14} />
              Premium interview practice
            </div>

            <h1>
              <span>Volt Interview</span>
            </h1>
            <p className="tagline">
              Practice realistic voice interviews with resume-aware interviewers.
            </p>
            <p className="description">
              Prepare for HR, technical, and project discussions with adaptive
              questions, natural follow-ups, voice practice, and clear feedback
              after every session.
            </p>

            <div className="hero-actions">
              <Link to="/setup" className="button button-primary">
                Start Interview
                <ArrowRight size={18} />
              </Link>
              {isSignedIn ? (
                <Link to="/profile" className="button button-secondary">
                  View Profile
                </Link>
              ) : (
                <Link to="/auth" className="button button-secondary">
                  Login / Register
                </Link>
              )}
            </div>
          </motion.div>

          <motion.div className="landing-preview-wrap" {...fadeUp}>
            <motion.div
              className="interview-preview-card"
              whileHover={{ y: -6 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <div className="preview-card-top">
                <div className="preview-avatar">
                  <BriefcaseBusiness size={22} />
                </div>
                <div>
                  <h2>Mr. Volt</h2>
                  <p>HR Interviewer</p>
                </div>
                <span className="resume-aware-badge">Resume-aware</span>
              </div>

              <div className="preview-question">
                <p>
                  “Which project best represents your abilities as a developer?”
                </p>
                <div className="voice-wave" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
              </div>

              <div className="candidate-answer-preview">
                <span>Candidate answer</span>
                <p>
                  I would highlight my resume builder project because it shows
                  frontend architecture, parsing logic, and product thinking.
                </p>
              </div>

              <div className="mini-report-preview">
                <div>
                  <BarChart3 size={18} />
                  <span>Report preview</span>
                </div>
                <strong>84%</strong>
              </div>
            </motion.div>

            {featureChips.map((chip, index) => (
              <motion.span
                key={chip}
                className="floating-chip"
                animate={{ y: [0, index % 2 ? -8 : 8, 0] }}
                transition={{
                  duration: 4 + index * 0.35,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                {chip}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </section>

      <LandingSection
        eyebrow="How it works"
        title="How Volt Interview Works"
        description="A simple practice flow that stays focused on interview readiness."
      >
        <div className="landing-card-grid three">
          {workSteps.map(({ title, description, icon: Icon }) => (
            <article className="landing-card" key={title}>
              <div className="landing-card-icon">
                <Icon size={22} />
              </div>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </LandingSection>

      <LandingSection
        eyebrow="Real practice"
        title="Why It Feels Real"
        description="Volt keeps the session practical, adaptive, and oriented around how interviews actually unfold."
      >
        <div className="landing-card-grid feature">
          {realFeatures.map(({ title, icon: Icon }) => (
            <article className="landing-feature-card" key={title}>
              <div className="landing-card-icon small">
                <Icon size={19} />
              </div>
              <h3>{title}</h3>
            </article>
          ))}
        </div>
      </LandingSection>

      <LandingSection
        eyebrow="Interview panel"
        title="Meet the Interview Panel"
        description="Three focused interviewers guide the session from first impression to project defense."
      >
        <div className="landing-card-grid three">
          {interviewers.map(({ name, role, description, icon: Icon }) => (
            <article className="landing-card interviewer-landing-card" key={name}>
              <div className="landing-card-icon">
                <Icon size={23} />
              </div>
              <h3>{name}</h3>
              <strong>{role}</strong>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </LandingSection>
    </div>
  )
}

function LandingSection({ eyebrow, title, description, children }) {
  return (
    <motion.section className="landing-section" {...fadeUp}>
      <div className="landing-section-heading">
        <p>{eyebrow}</p>
        <h2>{title}</h2>
        <span>{description}</span>
      </div>
      {children}
    </motion.section>
  )
}

export default LandingPage
