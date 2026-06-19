import {
  ArrowRight,
  FileText,
  GraduationCap,
  Upload,
  UserRound,
  Zap,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const difficulties = [
  'Fresher',
  'Internship',
  'Junior Developer',
  'Dream Company',
]

function SetupPage() {
  const [mode, setMode] = useState('student')
  const [resumeName, setResumeName] = useState('')
  const [branch, setBranch] = useState('CSE')
  const [year, setYear] = useState('3rd Year')
  const [difficulty, setDifficulty] = useState('Internship')
  const navigate = useNavigate()

  function handleResume(event) {
    setResumeName(event.target.files?.[0]?.name || '')
  }

  return (
    <section className="setup-page">
      <header className="setup-header">
        <div className="eyebrow">
          <Zap size={14} />
          Simulation configuration
        </div>
        <h1>Interview Setup</h1>
        <p>
          Configure your training session before entering the interview chamber.
        </p>
      </header>

      <div className="setup-layout">
        <div className="setup-controls">
          <SetupSection number="01" title="Choose Mode">
            <div className="mode-grid">
              <ModeCard
                icon={FileText}
                title="Resume Mode"
                description="Upload your resume and receive personalized interview questions."
                buttonText="Select Resume Mode"
                selected={mode === 'resume'}
                onSelect={() => setMode('resume')}
              />
              <ModeCard
                icon={GraduationCap}
                title="Student Mode"
                description="Practice standard interviews without uploading a resume."
                buttonText="Select Student Mode"
                selected={mode === 'student'}
                onSelect={() => setMode('student')}
              />
            </div>
          </SetupSection>

          <SetupSection
            number="02"
            title={mode === 'resume' ? 'Upload Resume' : 'Student Details'}
          >
            {mode === 'resume' ? (
              <div className="glass-panel resume-upload">
                <Upload size={28} />
                <div>
                  <h3>Upload Resume</h3>
                  <p>Accepted formats: PDF, DOCX</p>
                </div>
                <label className="upload-button">
                  Choose file
                  <input
                    type="file"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleResume}
                  />
                </label>
                {resumeName && (
                  <p className="selected-file">
                    Resume selected: <strong>{resumeName}</strong>
                  </p>
                )}
              </div>
            ) : (
              <div className="glass-panel student-fields">
                <SelectField
                  label="Branch"
                  value={branch}
                  onChange={setBranch}
                  options={['CSE', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Other']}
                />
                <SelectField
                  label="Year"
                  value={year}
                  onChange={setYear}
                  options={['1st Year', '2nd Year', '3rd Year', '4th Year']}
                />
              </div>
            )}
          </SetupSection>

          <SetupSection number="03" title="Select Difficulty">
            <div className="difficulty-grid">
              {difficulties.map((level) => (
                <button
                  key={level}
                  type="button"
                  className={`difficulty-card${difficulty === level ? ' selected' : ''}`}
                  onClick={() => setDifficulty(level)}
                >
                  <Zap size={18} fill="currentColor" />
                  <span>{level}</span>
                </button>
              ))}
            </div>
          </SetupSection>
        </div>

        <aside className="glass-panel setup-preview">
          <div className="preview-orbit">
            <UserRound size={28} />
          </div>
          <p className="preview-label">Interview Preview</p>
          <h2>Chamber readiness</h2>

          <dl className="preview-list">
            <PreviewRow
              label="Mode"
              value={mode === 'resume' ? 'Resume Mode' : 'Student Mode'}
            />
            {mode === 'resume' ? (
              <PreviewRow label="Resume" value={resumeName || 'Not selected'} />
            ) : (
              <>
                <PreviewRow label="Branch" value={branch} />
                <PreviewRow label="Year" value={year} />
              </>
            )}
            <PreviewRow label="Difficulty" value={difficulty} highlight />
          </dl>

          <button
            type="button"
            className="start-interview-button"
            onClick={() => navigate('/interview')}
          >
            Start Interview
            <ArrowRight size={19} />
          </button>
          <p className="preview-note">Your simulation chamber is standing by.</p>
        </aside>
      </div>
    </section>
  )
}

function SetupSection({ number, title, children }) {
  return (
    <section className="setup-section">
      <div className="setup-section-heading">
        <span>{number}</span>
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  )
}

function ModeCard({
  icon: Icon,
  title,
  description,
  buttonText,
  selected,
  onSelect,
}) {
  return (
    <article className={`glass-panel mode-card${selected ? ' selected' : ''}`}>
      <div className="mode-icon">
        <Icon size={24} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      <button type="button" onClick={onSelect}>
        {selected ? 'Selected' : buttonText}
      </button>
    </article>
  )
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="setup-select">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  )
}

function PreviewRow({ label, value, highlight = false }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd className={highlight ? 'highlight' : ''}>{value}</dd>
    </div>
  )
}

export default SetupPage
