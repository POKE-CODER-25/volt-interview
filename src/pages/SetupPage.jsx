import {
  ArrowRight,
  CheckCircle2,
  FileText,
  GraduationCap,
  Trash2,
  Upload,
  UserRound,
  Zap,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const difficulties = ['Easy', 'Medium', 'Hard']
const maxResumeSize = 5 * 1024 * 1024
const allowedResumeExtensions = ['pdf', 'docx', 'txt']
const allowedResumeTypes = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]

function formatFileSize(bytes) {
  if (!bytes) return '0 KB'

  const sizeInMb = bytes / (1024 * 1024)
  if (sizeInMb >= 1) return `${sizeInMb.toFixed(1)} MB`

  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

function isAllowedResumeFile(file) {
  const extension = file.name.split('.').pop()?.toLowerCase()

  return (
    allowedResumeExtensions.includes(extension) ||
    allowedResumeTypes.includes(file.type)
  )
}

function SetupPage() {
  const [mode, setMode] = useState('student')
  const [resumeFile, setResumeFile] = useState(null)
  const [resumeError, setResumeError] = useState('')
  const [isDraggingResume, setIsDraggingResume] = useState(false)
  const [difficulty, setDifficulty] = useState('Hard')
  const fileInputRef = useRef(null)
  const navigate = useNavigate()
  const hasResume = mode === 'resume' && Boolean(resumeFile)
  const canStartInterview = mode === 'student' || hasResume

  function selectResumeFile(file) {
    if (!file) return

    if (!isAllowedResumeFile(file)) {
      setResumeFile(null)
      setResumeError('Upload a PDF, DOCX, or TXT resume.')
      return
    }

    if (file.size > maxResumeSize) {
      setResumeFile(null)
      setResumeError('Resume must be 5MB or smaller.')
      return
    }

    setResumeFile(file)
    setResumeError('')
    setMode('resume')
  }

  function handleResumeInput(event) {
    selectResumeFile(event.target.files?.[0])
    event.target.value = ''
  }

  function handleResumeDrop(event) {
    event.preventDefault()
    setIsDraggingResume(false)
    selectResumeFile(event.dataTransfer.files?.[0])
  }

  function removeResume() {
    setResumeFile(null)
    setResumeError('')
  }

  function selectStudentMode() {
    setMode('student')
    setResumeError('')
  }

  function startInterview() {
    if (!canStartInterview) return

    const setupData = {
      mode,
      difficulty,
      hasResume,
      resumeFileName: hasResume ? resumeFile.name : '',
      uploadedAt: hasResume ? new Date().toISOString() : null,
    }

    sessionStorage.setItem('voltInterviewSetup', JSON.stringify(setupData))
    navigate('/interview')
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
          <SetupSection number="01" title="Choose Interview Path">
            <div className="mode-grid">
              <ModeCard
                icon={FileText}
                title="Resume Interview"
                description="Upload a resume file for this setup. Parsing and personalization come later."
                buttonText="Select Resume Path"
                selected={mode === 'resume'}
                onSelect={() => setMode('resume')}
              />
              <ModeCard
                icon={GraduationCap}
                title="Continue Without Resume"
                description="Practice standard interviews without uploading a resume."
                buttonText="Use Student Interview"
                selected={mode === 'student'}
                onSelect={selectStudentMode}
              />
            </div>
          </SetupSection>

          {mode === 'resume' && (
            <SetupSection number="02" title="Resume Upload">
              <div
                className={`glass-panel resume-upload${
                  isDraggingResume ? ' dragging' : ''
                }${resumeError ? ' invalid' : ''}`}
                onDragEnter={(event) => {
                  event.preventDefault()
                  setIsDraggingResume(true)
                }}
                onDragOver={(event) => event.preventDefault()}
                onDragLeave={(event) => {
                  if (event.currentTarget.contains(event.relatedTarget)) return
                  setIsDraggingResume(false)
                }}
                onDrop={handleResumeDrop}
              >
                <Upload size={28} />
                <div>
                  <h3>Drag and drop your resume</h3>
                  <p>Accepted formats: PDF, DOCX, TXT. Max size: 5MB.</p>
                </div>
                <button
                  type="button"
                  className="upload-button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Browse file
                </button>
                <input
                  ref={fileInputRef}
                  className="resume-file-input"
                  type="file"
                  accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                  onChange={handleResumeInput}
                />

                {resumeFile && (
                  <div className="selected-file">
                    <div>
                      <CheckCircle2 size={17} />
                      <span>
                        <strong>{resumeFile.name}</strong>
                        {formatFileSize(resumeFile.size)}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="remove-resume-button"
                      onClick={removeResume}
                      aria-label="Remove selected resume"
                      title="Remove resume"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}

                {resumeError && (
                  <p className="resume-error" role="alert">
                    {resumeError}
                  </p>
                )}
              </div>
            </SetupSection>
          )}

          <SetupSection
            number={mode === 'resume' ? '03' : '02'}
            title="Select Difficulty"
          >
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
          <p className="preview-label">Interview Summary</p>
          <h2>Interview Summary</h2>

          <dl className="preview-list">
            <PreviewRow
              label="Interview Type"
              value={mode === 'resume' ? 'Resume Interview' : 'Student Interview'}
            />
            <PreviewRow label="Difficulty" value={difficulty} highlight />
            <PreviewRow label="Estimated Duration" value={'\u224818 minutes'} />
            <PreviewRow label="Voice" value="Browser Voice" />
            {mode === 'resume' && (
              <PreviewRow
                label="Resume"
                value={resumeFile ? resumeFile.name : 'Not uploaded yet'}
              />
            )}
          </dl>

          <button
            type="button"
            className="start-interview-button"
            onClick={startInterview}
            disabled={!canStartInterview}
          >
            Start Interview
            <ArrowRight size={19} />
          </button>
          <p className="preview-note">
            {canStartInterview
              ? 'Your simulation chamber is standing by.'
              : 'Upload a resume to start Resume Interview.'}
          </p>
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

function PreviewRow({ label, value, highlight = false }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd className={highlight ? 'highlight' : ''}>{value}</dd>
    </div>
  )
}

export default SetupPage
