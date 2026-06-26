const technologyKeywords = [
  'React',
  'Firebase',
  'Firestore',
  'Tailwind',
  'Vite',
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'Node',
  'Express',
  'MongoDB',
  'REST API',
  'API',
  'Authentication',
  'Deployment',
  'Vercel',
  'Netlify',
  'Speech Recognition',
  'Speech Synthesis',
  'HTML',
  'CSS',
]

const signalPatterns = {
  challenge: /challenge|challenging|difficult|hard|problem|bug|issue|debug|error|stuck|blocked/i,
  success: /success|achieved|completed|improved|optimized|deployed|finished|reduced|increased/i,
  learning: /learned|understood|realized|figured out|takeaway|improved my/i,
  ownership: /i built|i created|i designed|i implemented|i developed|my role|i handled|i worked on/i,
  comparison: /compared|better than|instead of|tradeoff|trade-off|chose|decision|alternative/i,
  improvement: /improve|refactor|scale|scalable|optimize|better|next version|rebuild/i,
  leadership: /led|managed|coordinated|team|teammate|collaborated|guided/i,
}

const genericProjectWords =
  'app|website|platform|game|dashboard|builder|system|tool|assistant|simulator'

function asArray(value) {
  return Array.isArray(value) ? value : []
}

function unique(values) {
  return [...new Set(values.filter(Boolean).map((value) => String(value).trim()))]
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function normalizeText(text) {
  return String(text || '').replace(/\s+/g, ' ').trim()
}

function containsPhrase(text, phrase) {
  const matcher = new RegExp(`(^|[^a-z0-9])${escapeRegex(phrase)}([^a-z0-9]|$)`, 'i')

  return matcher.test(text)
}

function getContextProjects(interviewContext = {}) {
  const confirmedProjects = asArray(interviewContext.confirmedContext?.projects)
  const parsedProjects = asArray(interviewContext.parsedResume?.parsed?.projects)
  const focusProjects = [
    interviewContext.focus?.primaryProject,
    interviewContext.focus?.secondaryProject,
  ].filter(Boolean)

  return unique([...focusProjects, ...confirmedProjects, ...parsedProjects].map((project) =>
    typeof project === 'string' ? project : project?.name,
  ))
}

function getContextTechnologies(interviewContext = {}) {
  const confirmedProjects = asArray(interviewContext.confirmedContext?.projects)
  const parsedSkills = asArray(interviewContext.parsedResume?.parsed?.skills)
  const focusSkills = asArray(interviewContext.focus?.skills)
  const projectTechnologies = confirmedProjects.flatMap((project) =>
    asArray(project?.technologies),
  )

  return unique([...focusSkills, ...projectTechnologies, ...parsedSkills])
}

export function extractKeywords(answer = '') {
  return unique(
    normalizeText(answer)
      .toLowerCase()
      .split(/[^a-z0-9+#.]+/)
      .filter((word) => word.length > 3),
  )
}

export function extractTechnologies(answer = '', interviewContext = {}) {
  const contextTechnologies = getContextTechnologies(interviewContext)
  const candidates = unique([...technologyKeywords, ...contextTechnologies])

  return candidates.filter((technology) => containsPhrase(answer, technology))
}

export function extractProjectMentions(answer = '', interviewContext = {}) {
  const contextProjects = getContextProjects(interviewContext)
  const matchedProjects = contextProjects.filter((project) =>
    containsPhrase(answer, project),
  )
  const genericMatches = [
    ...(answer.match(
      new RegExp(
        `\\b([A-Z][A-Za-z0-9]+(?:\\s+[A-Z][A-Za-z0-9]+){0,3}\\s+(?:${genericProjectWords}))\\b`,
        'gi',
      ),
    ) || []),
    ...(answer.match(
      new RegExp(
        `\\b([a-z0-9]+(?:\\s+[a-z0-9]+){0,3}\\s+(?:${genericProjectWords}))\\b`,
        'gi',
      ),
    ) || []),
    ...(answer.match(
      /\b(?:built|created|developed|implemented|worked on|made)\s+(?:a|an|the)?\s*([A-Z][A-Za-z0-9]+(?:\s+[A-Z][A-Za-z0-9]+){1,3})\b/g,
    ) || []).map((match) =>
      match.replace(/^(?:built|created|developed|implemented|worked on|made)\s+(?:a|an|the)?\s*/i, ''),
    ),
    ...(answer.match(/\b([A-Z][A-Za-z0-9]+(?:\s+[A-Z][A-Za-z0-9]+){1,3})\b/g) || [])
      .filter((match) => !/^(Actually|Firebase Authentication|Speech Recognition|Speech Synthesis)$/i.test(match)),
  ]

  return unique([...matchedProjects, ...genericMatches])
}

export function extractChallengeSignals(answer = '') {
  return signalPatterns.challenge.test(answer) ? ['challenge'] : []
}

export function extractOwnershipSignals(answer = '') {
  return signalPatterns.ownership.test(answer) ? ['ownership'] : []
}

export function extractLearningSignals(answer = '') {
  return signalPatterns.learning.test(answer) ? ['learning'] : []
}

function extractSignals(answer = '') {
  return Object.entries(signalPatterns)
    .filter(([, pattern]) => pattern.test(answer))
    .map(([signal]) => signal)
}

export function analyzeAnswer({ answer, question, interviewContext = {} }) {
  const normalizedAnswer = normalizeText(answer)
  const technologies = extractTechnologies(normalizedAnswer, interviewContext)
  const projects = extractProjectMentions(normalizedAnswer, interviewContext)
  const signals = extractSignals(normalizedAnswer)
  const keywords = extractKeywords(normalizedAnswer)

  return {
    answer: normalizedAnswer,
    question,
    wordCount: normalizedAnswer ? normalizedAnswer.split(/\s+/).length : 0,
    keywords,
    technologies,
    projects,
    signals,
    challengeSignals: extractChallengeSignals(normalizedAnswer),
    ownershipSignals: extractOwnershipSignals(normalizedAnswer),
    learningSignals: extractLearningSignals(normalizedAnswer),
  }
}

export function shouldAskFollowup(answerAnalysis) {
  if (!answerAnalysis) return false
  if (answerAnalysis.technologies.length || answerAnalysis.projects.length) {
    return true
  }
  if (answerAnalysis.wordCount < 2) return false

  return answerAnalysis.signals.length > 0
}

function firstUnusedTopic(topics, usedTopics) {
  return topics.find((topic) => !usedTopics.includes(topic.toLowerCase())) || ''
}

function isDifferentFromFocus(project, interviewContext = {}) {
  const primary = interviewContext.focus?.primaryProject?.name || ''
  const secondary = interviewContext.focus?.secondaryProject?.name || ''

  return (
    project &&
    ![primary, secondary].filter(Boolean).some((focusProject) =>
      focusProject.toLowerCase() === project.toLowerCase(),
    )
  )
}

export function generateFollowup(answerAnalysis, interviewContext = {}) {
  const usedTopics = asArray(interviewContext.usedFollowupTopics).map((topic) =>
    String(topic).toLowerCase(),
  )
  const currentRoundKey = interviewContext.currentRoundKey || 'round'
  const pivotUsed = Boolean(interviewContext.roundPivotUsed?.[currentRoundKey])
  const project = firstUnusedTopic(answerAnalysis.projects, usedTopics)
  const pivotProject =
    !pivotUsed && isDifferentFromFocus(project, interviewContext) ? project : ''
  const technology = firstUnusedTopic(answerAnalysis.technologies, usedTopics)
  const primaryProject = interviewContext.focus?.primaryProject?.name || project

  if (answerAnalysis.signals.includes('challenge') && pivotProject) {
    return {
      key: `pivot-challenge-${pivotProject.toLowerCase()}`,
      topic: pivotProject,
      isPivot: true,
      question: technology
        ? `That's interesting. You mentioned ${pivotProject} was harder. What made ${technology} and that project more challenging?`
        : `You brought up ${pivotProject} as a harder project. What made it more demanding than your original focus?`,
    }
  }

  if (answerAnalysis.signals.includes('challenge') && (technology || project)) {
    const topic = technology || project
    return {
      key: `challenge-${topic.toLowerCase()}`,
      topic,
      question: technology
        ? `Which part of using ${technology} required the most debugging or careful thinking?`
        : `What made ${project} difficult, and how did you work through that part?`,
    }
  }

  if (pivotProject) {
    return {
      key: `pivot-${pivotProject.toLowerCase()}`,
      topic: pivotProject,
      isPivot: true,
      question: `You mentioned ${pivotProject}. What made that project worth bringing up here?`,
    }
  }

  if (technology) {
    return {
      key: `technology-${technology.toLowerCase()}`,
      topic: technology,
      question: `What decision did ${technology} help you make easier, and what trade-off came with using it?`,
    }
  }

  if (answerAnalysis.signals.includes('learning') && (project || primaryProject)) {
    const topic = project || primaryProject
    return {
      key: `learning-${topic.toLowerCase()}`,
      topic,
      question: `What part of ${topic} taught you the most about building software?`,
    }
  }

  if (project) {
    return {
      key: `project-${project.toLowerCase()}`,
      topic: project,
      question: answerAnalysis.signals.includes('ownership')
        ? `You mentioned building ${project}. What part of that project taught you the most?`
        : `Which design decision in ${project} saved you the most development time later?`,
    }
  }

  if (answerAnalysis.signals.includes('improvement')) {
    return {
      key: 'improvement',
      topic: 'improvement',
      question: 'What would you change first if you had to improve that solution today?',
    }
  }

  if (answerAnalysis.signals.includes('ownership')) {
    return {
      key: 'ownership',
      topic: 'ownership',
      question: 'Which part of that work was most clearly your personal contribution?',
    }
  }

  return null
}
