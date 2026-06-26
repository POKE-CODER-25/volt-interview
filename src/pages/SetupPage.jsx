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
import { parseResumeFile } from '../utils/parseResume'

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

function createProjectDraft(project = {}, index = 0) {
  const id = `project-${Date.now()}-${index}-${Math.random()
    .toString(36)
    .slice(2)}`

  if (typeof project === 'string') {
    return {
      id,
      name: project,
      technologies: '',
      description: '',
    }
  }

  return {
    id,
    name: project.name || '',
    technologies: Array.isArray(project.technologies)
      ? project.technologies.join(', ')
      : '',
    description: project.description || '',
  }
}

function splitTechnologies(value) {
  return value
    .split(',')
    .map((technology) => technology.trim())
    .filter(Boolean)
}

function SetupPage() {
  const [mode, setMode] = useState('student')
  const [resumeFile, setResumeFile] = useState(null)
  const [resumeError, setResumeError] = useState('')
  const [parsedResume, setParsedResume] = useState(null)
  const [focusProjects, setFocusProjects] = useState([])
  const [primaryProjectId, setPrimaryProjectId] = useState('')
  const [secondaryProjectId, setSecondaryProjectId] = useState('')
  const [focusConfirmed, setFocusConfirmed] = useState(false)
  const [focusError, setFocusError] = useState('')
  const [parseError, setParseError] = useState('')
  const [isAnalyzingResume, setIsAnalyzingResume] = useState(false)
  const [isDraggingResume, setIsDraggingResume] = useState(false)
  const [difficulty, setDifficulty] = useState('Hard')
  const fileInputRef = useRef(null)
  const navigate = useNavigate()
  const hasResume = mode === 'resume' && Boolean(resumeFile)
  const hasParsedResume = hasResume && Boolean(parsedResume)
  const hasConfirmedProject = focusProjects.some((project) => project.name.trim())
  const canStartInterview =
    mode === 'student' ||
    (hasParsedResume && focusConfirmed && hasConfirmedProject)

  function clearConfirmedContext() {
    setFocusConfirmed(false)
    setFocusError('')
    sessionStorage.removeItem('voltInterviewConfirmedContext')
  }

  function selectResumeFile(file) {
    if (!file) return

    if (!isAllowedResumeFile(file)) {
      setResumeFile(null)
      setResumeError('Upload a PDF, DOCX, or TXT resume.')
      setParsedResume(null)
      setParseError('')
      setFocusProjects([])
      setPrimaryProjectId('')
      setSecondaryProjectId('')
      clearConfirmedContext()
      sessionStorage.removeItem('voltInterviewParsedResume')
      return
    }

    if (file.size > maxResumeSize) {
      setResumeFile(null)
      setResumeError('Resume must be 5MB or smaller.')
      setParsedResume(null)
      setParseError('')
      setFocusProjects([])
      setPrimaryProjectId('')
      setSecondaryProjectId('')
      clearConfirmedContext()
      sessionStorage.removeItem('voltInterviewParsedResume')
      return
    }

    setResumeFile(file)
    setResumeError('')
    setParsedResume(null)
    setParseError('')
    setFocusProjects([])
    setPrimaryProjectId('')
    setSecondaryProjectId('')
    clearConfirmedContext()
    setMode('resume')
    sessionStorage.removeItem('voltInterviewParsedResume')
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
    setParsedResume(null)
    setParseError('')
    setFocusProjects([])
    setPrimaryProjectId('')
    setSecondaryProjectId('')
    clearConfirmedContext()
    sessionStorage.removeItem('voltInterviewParsedResume')
  }

  function selectStudentMode() {
    setMode('student')
    setResumeError('')
    setParseError('')
  }

  function selectDifficulty(level) {
    setDifficulty(level)
    if (level !== difficulty && mode === 'resume' && parsedResume) {
      clearConfirmedContext()
    }
  }

  async function analyzeResume() {
    if (!resumeFile || isAnalyzingResume) return

    setIsAnalyzingResume(true)
    setParseError('')

    try {
      const result = await parseResumeFile(resumeFile)
      const parsedResumePayload = {
        fileName: resumeFile.name,
        parsedAt: new Date().toISOString(),
        rawText: result.rawText,
        parsed: result.parsed,
      }
      const draftedProjects = (result.parsed.projects || []).map((project, index) =>
        createProjectDraft(project, index),
      )

      setParsedResume(parsedResumePayload)
      setFocusProjects(draftedProjects)
      setPrimaryProjectId(draftedProjects[0]?.id || '')
      setSecondaryProjectId('')
      clearConfirmedContext()
      sessionStorage.setItem(
        'voltInterviewParsedResume',
        JSON.stringify(parsedResumePayload),
      )
    } catch (error) {
      console.error('Resume parsing failed:', error)
      setParsedResume(null)
      setFocusProjects([])
      setPrimaryProjectId('')
      setSecondaryProjectId('')
      clearConfirmedContext()
      sessionStorage.removeItem('voltInterviewParsedResume')
      setParseError(
        'We could not analyze this resume. Remove it and try another PDF, DOCX, or TXT file.',
      )
    } finally {
      setIsAnalyzingResume(false)
    }
  }

  function addFocusProject() {
    const nextProject = createProjectDraft({}, focusProjects.length)

    setFocusProjects((previousProjects) => [...previousProjects, nextProject])
    if (!primaryProjectId) setPrimaryProjectId(nextProject.id)
    clearConfirmedContext()
  }

  function updateFocusProject(projectId, field, value) {
    setFocusProjects((previousProjects) =>
      previousProjects.map((project) =>
        project.id === projectId ? { ...project, [field]: value } : project,
      ),
    )
    clearConfirmedContext()
  }

  function removeFocusProject(projectId) {
    setFocusProjects((previousProjects) => {
      const nextProjects = previousProjects.filter(
        (project) => project.id !== projectId,
      )

      if (primaryProjectId === projectId) {
        setPrimaryProjectId(nextProjects[0]?.id || '')
      }

      if (secondaryProjectId === projectId) {
        setSecondaryProjectId('')
      }

      return nextProjects
    })
    clearConfirmedContext()
  }

  function selectPrimaryProject(projectId) {
    setPrimaryProjectId(projectId)
    if (secondaryProjectId === projectId) setSecondaryProjectId('')
    clearConfirmedContext()
  }

  function selectSecondaryProject(projectId) {
    setSecondaryProjectId((currentProjectId) =>
      currentProjectId === projectId ? '' : projectId,
    )
    clearConfirmedContext()
  }

  function confirmResumeFocus() {
    const projects = focusProjects
      .map((project) => ({
        id: project.id,
        name: project.name.trim(),
        technologies: splitTechnologies(project.technologies),
        description: project.description.trim(),
      }))
      .filter((project) => project.name)

    if (!projects.length) {
      setFocusError('Add at least one project name before confirming.')
      setFocusConfirmed(false)
      sessionStorage.removeItem('voltInterviewConfirmedContext')
      return
    }

    const primaryId = projects.some((project) => project.id === primaryProjectId)
      ? primaryProjectId
      : projects[0].id
    const secondaryId = projects.some(
      (project) => project.id === secondaryProjectId && project.id !== primaryId,
    )
      ? secondaryProjectId
      : ''
    const confirmedContext = {
      mode: 'resume',
      difficulty,
      resumeFileName: resumeFile.name,
      confirmedAt: new Date().toISOString(),
      projects,
      primaryProjectId: primaryId,
      secondaryProjectId: secondaryId,
      parsedResumeSummary: {
        skills: parsedResume.parsed.skills,
        links: parsedResume.parsed.links,
        education: parsedResume.parsed.education,
        experience: parsedResume.parsed.experience,
        certifications: parsedResume.parsed.certifications,
      },
    }

    setPrimaryProjectId(primaryId)
    setSecondaryProjectId(secondaryId)
    setFocusConfirmed(true)
    setFocusError('')
    sessionStorage.setItem(
      'voltInterviewConfirmedContext',
      JSON.stringify(confirmedContext),
    )
  }

  function startInterview() {
    if (!canStartInterview) return

    const setupData = {
      mode,
      difficulty,
      hasResume,
      resumeFileName: hasResume ? resumeFile.name : '',
      uploadedAt: hasResume ? parsedResume.parsedAt : null,
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

                {resumeFile && (
                  <div className="resume-analysis-actions">
                    <button
                      type="button"
                      className="analyze-resume-button"
                      onClick={analyzeResume}
                      disabled={isAnalyzingResume}
                    >
                      {isAnalyzingResume ? 'Analyzing resume...' : 'Analyze Resume'}
                    </button>
                    {parsedResume && (
                      <span className="resume-analysis-status">
                        Resume analyzed
                      </span>
                    )}
                  </div>
                )}

                {resumeError && (
                  <p className="resume-error" role="alert">
                    {resumeError}
                  </p>
                )}

                {parseError && (
                  <p className="resume-error" role="alert">
                    {parseError}
                  </p>
                )}
              </div>

              {parsedResume && (
                <ParsedResumePreview parsedResume={parsedResume} />
              )}

              {parsedResume && (
                <ResumeFocusEditor
                  projects={focusProjects}
                  primaryProjectId={primaryProjectId}
                  secondaryProjectId={secondaryProjectId}
                  confirmed={focusConfirmed}
                  error={focusError}
                  onAddProject={addFocusProject}
                  onUpdateProject={updateFocusProject}
                  onRemoveProject={removeFocusProject}
                  onSelectPrimary={selectPrimaryProject}
                  onSelectSecondary={selectSecondaryProject}
                  onConfirm={confirmResumeFocus}
                />
              )}
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
                  onClick={() => selectDifficulty(level)}
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
            {mode === 'resume' && (
              <PreviewRow
                label="Analysis"
                value={parsedResume ? 'Complete' : 'Not analyzed yet'}
              />
            )}
            {mode === 'resume' && parsedResume && (
              <PreviewRow
                label="Focus"
                value={focusConfirmed ? 'Confirmed' : 'Not confirmed yet'}
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
              : resumeFile
                ? parsedResume
                  ? 'Confirm your resume focus before starting Resume Interview.'
                  : 'Analyze your resume before starting Resume Interview.'
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

function ResumeFocusEditor({
  projects,
  primaryProjectId,
  secondaryProjectId,
  confirmed,
  error,
  onAddProject,
  onUpdateProject,
  onRemoveProject,
  onSelectPrimary,
  onSelectSecondary,
  onConfirm,
}) {
  return (
    <article className="glass-panel resume-focus-editor">
      <div className="resume-focus-heading">
        <div>
          <p>Resume Interview Focus</p>
          <h3>Confirm your project context</h3>
          <span>
            Automatic parsing is only a draft. You can edit or add missing
            projects.
          </span>
        </div>
        {confirmed && <strong>Focus confirmed</strong>}
      </div>

      <p className="resume-focus-subtitle">
        Confirm the projects and technologies you want the interviewers to focus
        on.
      </p>

      <div className="focus-project-list">
        {projects.map((project, index) => (
          <article className="focus-project-card" key={project.id}>
            <div className="focus-project-card-heading">
              <span>Project {index + 1}</span>
              <button
                type="button"
                className="remove-focus-project"
                onClick={() => onRemoveProject(project.id)}
                aria-label="Remove project"
                title="Remove project"
              >
                <Trash2 size={15} />
              </button>
            </div>

            <label className="focus-field">
              <span>Project Name</span>
              <input
                value={project.name}
                onChange={(event) =>
                  onUpdateProject(project.id, 'name', event.target.value)
                }
                placeholder="Example: Volt Interview"
              />
            </label>

            <label className="focus-field">
              <span>Technologies</span>
              <input
                value={project.technologies}
                onChange={(event) =>
                  onUpdateProject(project.id, 'technologies', event.target.value)
                }
                placeholder="React, Firebase, Vite"
              />
            </label>

            <label className="focus-field">
              <span>Description</span>
              <textarea
                value={project.description}
                onChange={(event) =>
                  onUpdateProject(project.id, 'description', event.target.value)
                }
                placeholder="Shortly describe what you built and what it does."
                rows={3}
              />
            </label>

            <div className="focus-choice-row">
              <button
                type="button"
                className={primaryProjectId === project.id ? 'selected' : ''}
                onClick={() => onSelectPrimary(project.id)}
              >
                {primaryProjectId === project.id
                  ? 'Primary Focus'
                  : 'Select as Primary Focus'}
              </button>
              <button
                type="button"
                className={secondaryProjectId === project.id ? 'selected' : ''}
                onClick={() => onSelectSecondary(project.id)}
                disabled={primaryProjectId === project.id || projects.length < 2}
              >
                {secondaryProjectId === project.id
                  ? 'Secondary Focus'
                  : 'Select as Secondary Focus'}
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="resume-focus-actions">
        <button type="button" className="add-project-button" onClick={onAddProject}>
          + Add Project
        </button>
        <button
          type="button"
          className="confirm-focus-button"
          onClick={onConfirm}
        >
          Confirm Resume Focus
        </button>
      </div>

      {error && (
        <p className="resume-focus-error" role="alert">
          {error}
        </p>
      )}
    </article>
  )
}

function ParsedResumePreview({ parsedResume }) {
  const { parsed } = parsedResume
  const foundLinks = [
    parsed.links.github && `github: ${parsed.links.github}`,
    parsed.links.linkedin && `linkedin: ${parsed.links.linkedin}`,
    parsed.links.portfolio && `portfolio: ${parsed.links.portfolio}`,
    ...(parsed.links.liveLinks || []).map((link) => `live: ${link}`),
  ].filter(Boolean)

  return (
    <article className="glass-panel parsed-resume-preview">
      <div className="parsed-resume-heading">
        <CheckCircle2 size={19} />
        <div>
          <p>Resume Analysis</p>
          <h3>Parsed Resume Preview</h3>
        </div>
      </div>

      <div className="parsed-resume-grid">
        <ParsedResumeField label="Email" value={parsed.email} />
        <ParsedResumeField label="Phone" value={parsed.phone} />
        <ParsedResumeField label="Skills found" value={parsed.skills} />
        <ParsedProjectsField value={parsed.projects} />
        <ParsedResumeField label="Education found" value={parsed.education} />
        <ParsedResumeField label="Experience found" value={parsed.experience} />
        <ParsedResumeField
          label="Certifications found"
          value={parsed.certifications}
        />
        <ParsedResumeField label="Links found" value={foundLinks} />
      </div>
    </article>
  )
}

function ParsedProjectsField({ value }) {
  const projects = Array.isArray(value) ? value : []

  return (
    <div className="parsed-resume-field parsed-projects-field">
      <span>Projects found</span>
      {projects.length ? (
        <ul>
          {projects.slice(0, 4).map((project) => {
            if (typeof project === 'string') return <li key={project}>{project}</li>

            const projectMeta = [
              project.technologies?.length
                ? `Tech: ${project.technologies.slice(0, 6).join(', ')}`
                : '',
              project.links?.length ? `Links: ${project.links.slice(0, 2).join(', ')}` : '',
            ].filter(Boolean)

            return (
              <li key={`${project.name}-${project.description}`}>
                <strong>{project.name}</strong>
                {project.description && <small>{project.description}</small>}
                {projectMeta.map((item) => (
                  <small key={item}>{item}</small>
                ))}
              </li>
            )
          })}
        </ul>
      ) : (
        <p>Not found</p>
      )}
    </div>
  )
}

function ParsedResumeField({ label, value }) {
  const values = Array.isArray(value) ? value : [value].filter(Boolean)

  return (
    <div className="parsed-resume-field">
      <span>{label}</span>
      {values.length ? (
        <ul>
          {values.slice(0, 5).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p>Not found</p>
      )}
    </div>
  )
}

export default SetupPage
