import * as mammoth from 'mammoth/mammoth.browser'
import * as pdfjsLib from 'pdfjs-dist'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

const technologyKeywords = [
  'React',
  'Vite',
  'Firebase',
  'Firestore',
  'Firebase Hosting',
  'Tailwind',
  'Tailwind CSS',
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'HTML',
  'CSS',
  'Node',
  'Node.js',
  'Express',
  'MongoDB',
  'MySQL',
  'PostgreSQL',
  'API',
  'REST',
  'GraphQL',
  'Redux',
  'Next.js',
  'Docker',
  'AWS',
  'Figma',
  'AI',
  'Generative AI',
  'Speech Recognition',
  'Speech Synthesis',
  'Authentication',
  'Deployment',
  'Vercel',
  'Netlify',
]

const sectionMatchers = {
  projects:
    /^(academic |portfolio |personal |live |key )?projects?$|^project experience$/i,
  skills:
    /^(technical )?skills$|^tools$|^technologies$|^programming languages$|^frameworks$|^libraries$|^databases$/i,
  education: /education|degree|university|college|school|b\.?tech|bachelor|master/i,
  experience: /experience|internships?|employment|work history|professional experience/i,
  certifications: /certifications?|courses?|licenses?|achievements?/i,
}

const projectTitleWords =
  /platform|app|website|game|builder|arena|simulator|dashboard|system|tool|assistant|tracker|portal|clone|manager|generator|analyzer/i
const projectTechLabel =
  /^(tech stack|stack|technologies|built with|tools|frontend|backend)\s*[:|-]\s*/i
const urlPattern = /https?:\/\/[^\s)]+|www\.[^\s)]+|(?:github|linkedin)\.com\/[^\s)]+/gi

function getExtension(file) {
  return file.name.split('.').pop()?.toLowerCase() || ''
}

function normalizeText(text) {
  return text
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

async function parsePdf(file) {
  const data = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data }).promise
  const pageTexts = []

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber)
    const content = await page.getTextContent()
    const text = content.items.map((item) => item.str).join(' ')
    pageTexts.push(text)
  }

  return normalizeText(pageTexts.join('\n\n'))
}

async function parseDocx(file) {
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer })

  return normalizeText(result.value || '')
}

async function extractRawText(file) {
  const extension = getExtension(file)

  if (extension === 'txt' || file.type === 'text/plain') {
    return normalizeText(await file.text())
  }

  if (extension === 'pdf' || file.type === 'application/pdf') {
    return parsePdf(file)
  }

  if (
    extension === 'docx' ||
    file.type ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return parseDocx(file)
  }

  throw new Error('Unsupported resume file type.')
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function unique(values) {
  return [...new Set(values.filter(Boolean).map((value) => value.trim()))]
}

function getFirstMatch(text, regex) {
  return text.match(regex)?.[0] || ''
}

function getLines(text) {
  return text
    .split('\n')
    .flatMap((line) => line.split(/\s+(?=[-*]\s+)/))
    .map((line) => line.trim())
    .filter(Boolean)
}

function cleanLine(line) {
  return line.replace(/^[-*\u2022]\s*/, '').trim()
}

function guessName(lines) {
  const skippedPattern =
    /resume|curriculum|email|phone|github|linkedin|portfolio|education|skills/i

  return (
    lines.find(
      (line) =>
        line.length <= 60 &&
        /^[a-zA-Z .'-]+$/.test(line) &&
        !skippedPattern.test(line),
    ) || ''
  )
}

function extractUrls(text) {
  return unique(
    (text.match(urlPattern) || []).map((url) =>
      url.replace(/[.,;:]+$/g, '').replace(/^www\./i, 'https://www.'),
    ),
  )
}

function extractLinks(text) {
  const urls = extractUrls(text)
  const github = urls.find((url) => /github\.com/i.test(url)) || ''
  const linkedin = urls.find((url) => /linkedin\.com/i.test(url)) || ''
  const liveLinks = urls.filter((url) =>
    /vercel\.app|firebaseapp\.com|web\.app|netlify\.app|github\.io|demo|live/i.test(
      url,
    ),
  )
  const portfolio =
    urls.find(
      (url) =>
        !/github\.com|linkedin\.com/i.test(url) && !liveLinks.includes(url),
    ) || liveLinks[0] || ''

  return {
    github,
    linkedin,
    portfolio,
    liveLinks,
  }
}

function detectTechnologies(text) {
  const found = technologyKeywords.filter((keyword) => {
    const escaped = escapeRegex(keyword)
    const matcher = new RegExp(`(^|[^a-z0-9+#.])${escaped}([^a-z0-9+#.]|$)`, 'i')

    return matcher.test(text)
  })

  return unique(found)
}

function extractSkills(text, lines) {
  const skillSectionLines = extractSectionLines(lines, sectionMatchers.skills, 10)
  const sectionSkills = detectTechnologies(skillSectionLines.join(' '))
  const globalSkills = detectTechnologies(text)

  return unique([...sectionSkills, ...globalSkills])
}

function lineLooksLikeSection(line) {
  return Object.values(sectionMatchers).some((matcher) => matcher.test(line))
}

function extractSectionLines(lines, matcher, maxLines = 8) {
  const results = []
  let collecting = false

  for (const line of lines) {
    if (matcher.test(cleanLine(line))) {
      collecting = true
      continue
    }

    if (collecting && lineLooksLikeSection(cleanLine(line))) break

    if (collecting) {
      results.push(cleanLine(line))
      if (results.length >= maxLines) break
    }
  }

  return results
}

function getProjectSectionLines(lines) {
  const sectionLines = []
  let collecting = false

  for (const line of lines) {
    const cleaned = cleanLine(line)

    if (sectionMatchers.projects.test(cleaned)) {
      collecting = true
      continue
    }

    if (collecting && lineLooksLikeSection(cleaned)) break

    if (collecting) sectionLines.push(cleaned)
  }

  return sectionLines
}

function isLikelyProjectTitle(line) {
  const cleaned = cleanLine(line)
  if (!cleaned || cleaned.length > 120) return false
  if (projectTechLabel.test(cleaned)) return false
  if (/^(github|live|demo|link|description)\s*[:|-]/i.test(cleaned)) return false

  const hasTitleSeparator = /\s[|:]\s|\s[-]\s|\s\u2014\s/.test(cleaned)
  const titleCaseWords = (cleaned.match(/\b[A-Z][a-zA-Z0-9+#.]+\b/g) || [])
    .length
  const hasProjectWord = projectTitleWords.test(cleaned)

  return hasProjectWord || hasTitleSeparator || titleCaseWords >= 2
}

function getProjectParts(line) {
  const cleaned = cleanLine(line)
  const [name, ...descriptionParts] = cleaned.split(/\s[|:]\s|\s[-]\s|\s\u2014\s/)

  return {
    name: (name || cleaned).replace(/^(project|app|website)\s*[:|-]\s*/i, '').trim(),
    description: descriptionParts.join(' ').trim(),
  }
}

function lineHasDescriptionSignal(line) {
  return (
    line.length > 30 ||
    /\b(built|created|developed|designed|implemented|used|integrated|features?|allows?|helps?)\b/i.test(
      line,
    )
  )
}

function linesToProjects(lines) {
  const projects = []
  let currentProject = null

  function pushCurrentProject() {
    if (!currentProject?.name) return

    const combinedText = [
      currentProject.name,
      currentProject.description,
      currentProject._rawLines.join(' '),
    ].join(' ')

    projects.push({
      name: currentProject.name,
      description: currentProject.description,
      technologies: unique([
        ...currentProject.technologies,
        ...detectTechnologies(combinedText),
      ]),
      links: unique([...currentProject.links, ...extractUrls(combinedText)]),
    })
  }

  for (const line of lines) {
    const cleaned = cleanLine(line)
    if (!cleaned) continue

    if (isLikelyProjectTitle(cleaned)) {
      const projectParts = getProjectParts(cleaned)

      pushCurrentProject()
      currentProject = {
        name: projectParts.name,
        description: projectParts.description,
        technologies: detectTechnologies(cleaned),
        links: extractUrls(cleaned),
        _rawLines: [cleaned],
      }
      continue
    }

    if (!currentProject) continue

    currentProject._rawLines.push(cleaned)
    currentProject.technologies.push(...detectTechnologies(cleaned))
    currentProject.links.push(...extractUrls(cleaned))

    if (projectTechLabel.test(cleaned)) {
      currentProject.technologies.push(...detectTechnologies(cleaned))
      continue
    }

    if (lineHasDescriptionSignal(cleaned) && !currentProject.description) {
      currentProject.description = cleaned
    }
  }

  pushCurrentProject()

  return projects
    .filter((project) => project.name.length >= 3)
    .map((project) => ({
      name: project.name,
      description: project.description,
      technologies: project.technologies,
      links: project.links,
    }))
}

function getFallbackProjectLines(lines) {
  const fallbackLines = []

  for (let index = 0; index < lines.length; index += 1) {
    const line = cleanLine(lines[index])

    if (!isLikelyProjectTitle(line)) continue

    fallbackLines.push(line)
    for (let offset = 1; offset <= 4; offset += 1) {
      const nextLine = cleanLine(lines[index + offset] || '')
      if (!nextLine || lineLooksLikeSection(nextLine)) break
      if (offset > 1 && isLikelyProjectTitle(nextLine)) break
      fallbackLines.push(nextLine)
    }
  }

  return fallbackLines
}

function dedupeProjects(projects) {
  const seen = new Set()

  return projects.filter((project) => {
    const key = project.name.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)

    return true
  })
}

function extractProjects(lines) {
  const sectionProjects = linesToProjects(getProjectSectionLines(lines))
  if (sectionProjects.length) return dedupeProjects(sectionProjects)

  return dedupeProjects(linesToProjects(getFallbackProjectLines(lines)))
}

function extractStructuredData(rawText) {
  const lines = getLines(rawText)
  const email = getFirstMatch(rawText, /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)
  const phone = getFirstMatch(
    rawText,
    /(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{3,5}\)?[-.\s]?)?\d{3,5}[-.\s]?\d{4}/,
  )

  return {
    name: guessName(lines),
    email,
    phone,
    skills: extractSkills(rawText, lines),
    projects: extractProjects(lines),
    education: extractSectionLines(lines, sectionMatchers.education),
    experience: extractSectionLines(lines, sectionMatchers.experience),
    certifications: extractSectionLines(lines, sectionMatchers.certifications),
    links: extractLinks(rawText),
  }
}

export async function parseResumeFile(file) {
  const rawText = await extractRawText(file)

  return {
    rawText,
    parsed: extractStructuredData(rawText),
  }
}
