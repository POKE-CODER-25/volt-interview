const genericRounds = [
  {
    key: 'hr',
    label: 'HR',
    round: 'HR',
    interviewer: 'Mr. Volt',
    title: 'Senior HR Interviewer',
    timer: '90s',
    badge: 'HR Round',
    intro: "Good morning. Let's begin your interview.",
    firstPrompt:
      "Good morning. Let's begin your interview. Tell me about yourself.",
    nextPromptPrefix: 'Next question.',
    questions: [
      'Tell me about yourself.',
      'Why should we hire you?',
      'What are your strengths?',
      'What is one weakness you are working on?',
      'Where do you see yourself in the next two years?',
      'Why are you interested in this role?',
    ],
  },
  {
    key: 'technical',
    label: 'Technical',
    round: 'Technical',
    interviewer: 'Ms. Luna',
    title: 'Technical Interview Specialist',
    timer: '120s',
    badge: 'Technical Round',
    intro: "I am Ms. Luna. Let's begin the technical round.",
    firstPrompt:
      "I am Ms. Luna. Let's begin the technical round. Explain the difference between frontend and backend.",
    nextPromptPrefix: 'Next question.',
    questions: [
      'Explain the difference between frontend and backend.',
      'What is React state?',
      'What is Firebase used for?',
      'What is the difference between authentication and authorization?',
      'Explain what an API is.',
      'What happens when a user submits a form in a web app?',
    ],
  },
  {
    key: 'project',
    label: 'Project',
    round: 'Project',
    interviewer: 'Ms. Mari',
    title: 'Project Defense Specialist',
    timer: '180s',
    badge: 'Project Round',
    intro: "I am Ms. Mari. Let's discuss your projects.",
    firstPrompt:
      "I am Ms. Mari. Let's discuss your projects. Tell me about one project you are proud of.",
    nextPromptPrefix: 'Next question.',
    questions: [
      'Tell me about one project you are proud of.',
      'What problem did that project solve?',
      'What technologies did you use and why?',
      'What was the hardest challenge in that project?',
      'What would you improve if you had more time?',
      'How would you explain this project to a recruiter?',
    ],
  },
]

function asArray(value) {
  return Array.isArray(value) ? value : []
}

function unique(values) {
  return [...new Set(values.filter(Boolean).map((value) => String(value).trim()))]
}

function getProjectById(projects, id) {
  return projects.find((project) => project.id === id) || null
}

function getReadableSkill(skills, fallback = 'your technical stack') {
  return skills.find(Boolean) || fallback
}

function getSecondSkill(skills) {
  return skills.find((skill, index) => index > 0 && skill) || skills[0] || ''
}

function hasValidResumeContext(setup, confirmedContext) {
  return (
    setup?.mode === 'resume' &&
    confirmedContext?.mode === 'resume' &&
    Array.isArray(confirmedContext.projects) &&
    confirmedContext.projects.some((project) => project?.name)
  )
}

function getResumeFocus(confirmedContext) {
  const projects = asArray(confirmedContext.projects).filter((project) =>
    project?.name?.trim(),
  )
  const primaryProject =
    getProjectById(projects, confirmedContext.primaryProjectId) || projects[0]
  const secondaryProject =
    getProjectById(projects, confirmedContext.secondaryProjectId) ||
    projects.find((project) => project.id !== primaryProject?.id) ||
    null
  const projectSkills = projects.flatMap((project) =>
    asArray(project.technologies),
  )
  const parsedSkills = asArray(confirmedContext.parsedResumeSummary?.skills)
  const skills = unique([...projectSkills, ...parsedSkills])

  return {
    primaryProject,
    secondaryProject,
    skills,
  }
}

function buildResumeRounds(focus) {
  const primaryName = focus.primaryProject?.name || 'your primary project'
  const secondaryName = focus.secondaryProject?.name || ''
  const mainSkill = getReadableSkill(focus.skills)
  const secondSkill = getSecondSkill(focus.skills) || mainSkill
  const hasSecondary = Boolean(secondaryName)
  const hrIntro = focus.primaryProject?.name
    ? `Good morning. I reviewed your resume before this interview. I noticed your work on ${primaryName}. Let's begin.`
    : "Good morning. I reviewed your resume before this interview. Let's begin."

  return [
    {
      key: 'hr',
      label: 'HR',
      round: 'HR',
      interviewer: 'Mr. Volt',
      title: 'Senior HR Interviewer',
      timer: '90s',
      badge: 'HR Round',
      intro: hrIntro,
      firstPrompt: `${hrIntro} I reviewed your resume. Which project best represents your abilities as a developer?`,
      nextPromptPrefix: 'Next question.',
      questions: [
        'I reviewed your resume. Which project best represents your abilities as a developer?',
        `Your resume mentions ${primaryName}. What motivated you to build it?`,
        `I noticed you worked with ${mainSkill}. How confident are you with it?`,
        'What makes your project experience different from a normal academic assignment?',
        'How would you summarize your developer journey so far?',
        'Why should a recruiter be interested in your profile?',
      ],
    },
    {
      key: 'technical',
      label: 'Technical',
      round: 'Technical',
      interviewer: 'Ms. Luna',
      title: 'Technical Interview Specialist',
      timer: '120s',
      badge: 'Technical Round',
      intro: "I am Ms. Luna. Let's begin the technical round.",
      firstPrompt: `I am Ms. Luna. Let's begin the technical round. How would you explain the architecture of ${primaryName}?`,
      nextPromptPrefix: 'Next question.',
      questions: [
        `How would you explain the architecture of ${primaryName}?`,
        `Your project uses ${mainSkill}. What problem did ${mainSkill} solve in your application?`,
        `You mentioned ${secondSkill}. Explain how you used it in your work.`,
        `What technical challenge did you face while building ${primaryName}?`,
        `How would you improve the technical design of ${primaryName}?`,
        'How do you decide whether a feature belongs on the frontend, backend, or database layer?',
      ],
    },
    {
      key: 'project',
      label: 'Project',
      round: 'Project',
      interviewer: 'Ms. Mari',
      title: 'Project Defense Specialist',
      timer: '180s',
      badge: 'Project Round',
      intro: "I am Ms. Mari. Let's discuss your projects.",
      firstPrompt: `I am Ms. Mari. Let's discuss your projects. Walk me through the architecture of ${primaryName}.`,
      nextPromptPrefix: 'Next question.',
      questions: [
        `Walk me through the architecture of ${primaryName}.`,
        `What was the hardest part of building ${primaryName}?`,
        `Which feature in ${primaryName} are you most proud of?`,
        `If you rebuilt ${primaryName}, what would you change?`,
        hasSecondary
          ? `Compare ${primaryName} with ${secondaryName}. What did you learn from both?`
          : `What user problem does ${primaryName} solve, and how would you prove it works well?`,
        `How would you explain ${primaryName} to a non-technical recruiter?`,
      ],
    },
  ]
}

export function buildInterviewQuestions({ setup, confirmedContext }) {
  if (!hasValidResumeContext(setup, confirmedContext)) {
    return {
      mode: 'student',
      rounds: genericRounds,
      focus: {
        primaryProject: null,
        secondaryProject: null,
        skills: [],
      },
    }
  }

  const focus = getResumeFocus(confirmedContext)

  return {
    mode: 'resume',
    rounds: buildResumeRounds(focus),
    focus,
  }
}
