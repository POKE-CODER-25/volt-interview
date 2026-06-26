function asArray(value) {
  return Array.isArray(value) ? value : []
}

function unique(values) {
  return [...new Set(values.filter(Boolean).map((value) => String(value).trim()))]
}

function getProjectById(projects, id) {
  return projects.find((project) => project.id === id) || null
}

function pickVariant(variants, seed) {
  if (!variants.length) return ''

  return variants[Math.abs(seed) % variants.length]
}

function stringSeed(value) {
  return String(value)
    .split('')
    .reduce((total, character) => total + character.charCodeAt(0), 0)
}

function makeQuestion(slot, variants, seed) {
  return {
    slot,
    text: pickVariant(variants, seed),
  }
}

function makeRound({
  key,
  label,
  interviewer,
  title,
  timer,
  badge,
  intro,
  transitions,
  questions,
}) {
  return {
    key,
    label,
    round: label,
    interviewer,
    title,
    timer,
    badge,
    intro,
    transitions,
    questions: questions.map((question, index) =>
      typeof question === 'string'
        ? { slot: `question-${index}`, text: question }
        : question,
    ),
  }
}

function getReadableSkill(skills, fallback = 'your technical stack') {
  return asArray(skills).find(Boolean) || fallback
}

function getSecondSkill(skills) {
  const safeSkills = asArray(skills)

  return safeSkills.find((skill, index) => index > 0 && skill) || safeSkills[0] || ''
}

function createHumanRounds({ focus = {}, resumeMode = false }) {
  const primaryName = focus.primaryProject?.name || 'your main project'
  const secondaryName = focus.secondaryProject?.name || ''
  const mainSkill = getReadableSkill(focus.skills, resumeMode ? 'your main stack' : 'React')
  const secondSkill = getSecondSkill(focus.skills) || mainSkill
  const hasSecondary = Boolean(secondaryName)
  const seedBase = stringSeed(
    `${primaryName}-${secondaryName}-${focus.skills?.join(',') || 'student'}`,
  )
  const hrIntro = resumeMode
    ? `Good morning. I would like to understand your experience through ${primaryName} and the way you present your work.`
    : 'Good morning. I would like to understand your background, communication style, and approach to work.'
  const technicalIntro = resumeMode
    ? `We will use ${primaryName} to examine your technical decisions and implementation reasoning.`
    : 'We will focus on practical technical reasoning, implementation choices, and tradeoffs.'
  const projectIntro = resumeMode
    ? `I am interested in how you built ${primaryName} and the choices that shaped it.`
    : 'I am interested in your project thinking. Choose examples you know well and explain them clearly.'

  return [
    makeRound({
      key: 'hr',
      label: 'HR',
      interviewer: 'Mr. Volt',
      title: 'Senior HR Interviewer',
      timer: '90s',
      badge: 'HR Round',
      intro: hrIntro,
      transitions: [
        '',
        'That gives me useful context about your profile.',
        'I would like to understand how a recruiter should read that experience.',
        '',
        'That background helps me understand your direction.',
        'Let us make this practical from a hiring perspective.',
      ],
      questions: [
        makeQuestion(
          'opening-background',
          resumeMode
            ? [
                'Which project best represents your abilities as a developer?',
                `When you look at your work so far, why does ${primaryName} stand out?`,
                'Which part of your work should I pay the most attention to, and why?',
              ]
            : [
                'Tell me about yourself as a developer.',
                'How would you introduce your technical journey so far?',
                'What should I know about your background before we go deeper?',
              ],
          seedBase + 1,
        ),
        makeQuestion(
          'motivation',
          resumeMode
            ? [
                `What motivated you to build ${primaryName}?`,
                `What problem were you trying to solve with ${primaryName}?`,
                `Why was ${primaryName} worth building in the first place?`,
              ]
            : [
                'What kind of role or project motivates you the most?',
                'Why are you interested in this kind of developer role?',
                'What keeps you interested in building software?',
              ],
          seedBase + 2,
        ),
        makeQuestion(
          'strengths',
          [
            `Where do you feel strongest when working with ${mainSkill}?`,
            'What is one strength you consistently bring to technical work?',
            'Which skill would your teammates or classmates notice first?',
          ],
          seedBase + 3,
        ),
        makeQuestion(
          'weakness-improvement',
          [
            'What is one area you are actively trying to improve?',
            'Where do you still need more practice as a developer?',
            'What feedback have you received that you are taking seriously?',
          ],
          seedBase + 4,
        ),
        makeQuestion(
          'career-direction',
          [
            'How do you want your developer profile to grow over the next year?',
            'What kind of engineering work do you want to become known for?',
            'Where do you see your strongest growth opportunity right now?',
          ],
          seedBase + 5,
        ),
        makeQuestion(
          'recruiter-value',
          [
            'Why should a recruiter be interested in your profile?',
            'What would make you a strong candidate compared with other students?',
            'If I had to summarize your value to a hiring team, what should I say?',
          ],
          seedBase + 6,
        ),
      ],
    }),
    makeRound({
      key: 'technical',
      label: 'Technical',
      interviewer: 'Ms. Luna',
      title: 'Technical Interview Specialist',
      timer: '120s',
      badge: 'Technical Round',
      intro: technicalIntro,
      transitions: [
        '',
        'Be specific about the implementation details here.',
        'I will focus on the reasoning behind that choice.',
        '',
        'Now connect the tools to the tradeoffs.',
        'Think about this as if you were maintaining it in production.',
      ],
      questions: [
        makeQuestion(
          'architecture',
          resumeMode
            ? [
                `How would you explain the architecture of ${primaryName}?`,
                `Break down ${primaryName} into its main technical parts.`,
                `If I opened ${primaryName}'s codebase, how would you guide me through it?`,
              ]
            : [
                'How would you explain the difference between frontend and backend?',
                'How do the main parts of a web application work together?',
                'Walk me through the architecture of a simple full-stack app.',
              ],
          seedBase + 7,
        ),
        makeQuestion(
          'core-technology',
          [
            `What problem did ${mainSkill} solve in your work?`,
            `Explain how you used ${mainSkill} in a practical feature.`,
            `What do you understand well about ${mainSkill}, and where are you still improving?`,
          ],
          seedBase + 8,
        ),
        makeQuestion(
          'backend-database',
          resumeMode
            ? [
                `Where does data live in ${primaryName}, and how does the app use it?`,
                `How did you think about storage, APIs, or backend behavior in ${primaryName}?`,
                `What part of ${primaryName} depends most on backend or database design?`,
              ]
            : [
                'What is the role of a database in a web application?',
                'How would you decide what data belongs on the client versus the server?',
                'Explain what an API is using a real example.',
              ],
          seedBase + 9,
        ),
        makeQuestion(
          'debugging-problem-solving',
          [
            `What technical challenge did you face while working with ${secondSkill}?`,
            'Tell me about a bug or technical issue you had to debug.',
            'When something breaks in an app, how do you narrow down the cause?',
          ],
          seedBase + 10,
        ),
        makeQuestion(
          'tradeoff-decision',
          [
            `What tradeoff did you make while building ${primaryName}?`,
            'How do you decide between a quick implementation and a more scalable one?',
            'Tell me about a technical choice where there was no perfect answer.',
          ],
          seedBase + 11,
        ),
        makeQuestion(
          'improvement-scalability',
          resumeMode
            ? [
                `How would you improve the technical design of ${primaryName}?`,
                `If ${primaryName} had ten times more users, what would you change first?`,
                `What would you refactor in ${primaryName} before showing it to a hiring team?`,
              ]
            : [
                'How would you improve a project after the first working version?',
                'What does scalability mean to you in a student project?',
                'What would you check before deploying a web app publicly?',
              ],
          seedBase + 12,
        ),
      ],
    }),
    makeRound({
      key: 'project',
      label: 'Project',
      interviewer: 'Ms. Mari',
      title: 'Project Defense Specialist',
      timer: '180s',
      badge: 'Project Round',
      intro: projectIntro,
      transitions: [
        '',
        'That direction is useful; go deeper into the project work.',
        'Focus on the decisions and evidence behind your answer.',
        '',
        'Now think about it with hindsight.',
        'Now explain it in a way a recruiter would understand.',
      ],
      questions: [
        makeQuestion(
          'project-walkthrough',
          resumeMode
            ? [
                `Walk me through ${primaryName} from idea to working product.`,
                `Take me through the main user flow in ${primaryName}.`,
                `Explain ${primaryName} as if I have never seen it before.`,
              ]
            : [
                'Walk me through one project you are proud of.',
                'Pick a project and explain the main user flow.',
                'Tell me about a project where you had real ownership.',
              ],
          seedBase + 13,
        ),
        makeQuestion(
          'hardest-challenge',
          [
            `What was the hardest part of building ${primaryName}?`,
            `Where did ${primaryName} push you technically or creatively?`,
            'What part of this project took longer than you expected?',
          ],
          seedBase + 14,
        ),
        makeQuestion(
          'proudest-feature',
          [
            `Which feature in ${primaryName} are you most proud of?`,
            `What part of ${primaryName} best shows your personal contribution?`,
            'Which feature would you show first in a demo, and why?',
          ],
          seedBase + 15,
        ),
        makeQuestion(
          'lessons-learned',
          hasSecondary
            ? [
                `Compare ${primaryName} with ${secondaryName}. What did you learn from both?`,
                `What did ${secondaryName} teach you that helped with ${primaryName}?`,
                `Looking at ${primaryName} and ${secondaryName}, how has your project thinking changed?`,
              ]
            : [
                `What did ${primaryName} teach you that you would carry into your next project?`,
                'What lesson from this project changed how you build software?',
                'What do you understand now that you did not understand before this project?',
              ],
          seedBase + 16,
        ),
        makeQuestion(
          'rebuild-improvement',
          [
            `If you rebuilt ${primaryName}, what would you change?`,
            `What would make ${primaryName} feel more production-ready?`,
            `What is the next serious improvement you would make to ${primaryName}?`,
          ],
          seedBase + 17,
        ),
        makeQuestion(
          'non-technical-explanation',
          [
            `How would you explain ${primaryName} to a non-technical recruiter?`,
            `Give me the simple recruiter pitch for ${primaryName}.`,
            `How would you describe the value of ${primaryName} without using technical terms?`,
          ],
          seedBase + 18,
        ),
      ],
    }),
  ]
}

function hasValidResumeContext(setup, confirmedContext) {
  return (
    setup?.mode === 'resume' &&
    Boolean(confirmedContext) &&
    confirmedContext.mode === 'resume' &&
    Array.isArray(confirmedContext.projects) &&
    confirmedContext.projects.some((project) => project?.name)
  )
}

function hasMalformedResumeContext(setup, confirmedContext) {
  return setup?.mode === 'resume' && Boolean(confirmedContext)
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

export function getInterviewerLine(round, questionIndex) {
  if (questionIndex === 0) return round.intro

  return round.transitions?.[questionIndex] || ''
}

export function getQuestionText(question) {
  return typeof question === 'string' ? question : question.text
}

export function getSpokenPrompt(round, questionIndex) {
  const dialogue = getInterviewerLine(round, questionIndex)
  const question = getQuestionText(round.questions[questionIndex])

  return [dialogue, question].filter(Boolean).join(' ')
}

export function buildInterviewQuestions({ setup, confirmedContext }) {
  if (setup?.mode === 'student' || !setup) {
    return {
      mode: 'student',
      rounds: createHumanRounds({ resumeMode: false }),
      focus: {
        primaryProject: null,
        secondaryProject: null,
        skills: [],
      },
    }
  }

  if (!hasValidResumeContext(setup, confirmedContext)) {
    if (hasMalformedResumeContext(setup, confirmedContext)) {
      console.warn('Invalid resume context, falling back to student interview.')
    }

    return {
      mode: 'student',
      rounds: createHumanRounds({ resumeMode: false }),
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
    rounds: createHumanRounds({ focus, resumeMode: true }),
    focus,
  }
}
