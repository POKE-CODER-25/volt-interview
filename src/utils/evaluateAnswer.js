const veryWeakAnswers = [
  'no',
  'idk',
  'i dont know',
  "i don't know",
  'nothing',
  'i wont say',
  "i won't say",
  'skip',
  'not sure',
]

const technicalKeywords = [
  'api',
  'architecture',
  'authentication',
  'authorization',
  'backend',
  'component',
  'database',
  'deployment',
  'firebase',
  'frontend',
  'function',
  'hosting',
  'javascript',
  'react',
  'route',
  'server',
  'state',
  'testing',
  'ui',
]

const technologyKeywords = [
  'css',
  'express',
  'firebase',
  'firestore',
  'html',
  'javascript',
  'node',
  'react',
  'tailwind',
  'typescript',
  'vite',
]

const hesitationWords = ['maybe', 'probably', 'i think', 'not sure', 'kind of']

const confidenceWords = [
  'built',
  'created',
  'implemented',
  'designed',
  'solved',
  'developed',
  'deployed',
  'led',
  'managed',
]

const ownershipWords = [
  'i built',
  'i created',
  'i implemented',
  'i designed',
  'i developed',
  'i deployed',
  'my project',
  'my role',
]

const problemSolvingWords = [
  'challenge',
  'issue',
  'problem',
  'solved',
  'solution',
  'fixed',
  'improved',
  'optimized',
  'debugged',
  'resolved',
]

const outcomeWords = [
  'result',
  'outcome',
  'impact',
  'reduced',
  'increased',
  'faster',
  'better',
  'users',
  'performance',
]

const structureWords = [
  'first',
  'then',
  'finally',
  'because',
  'therefore',
  'result',
  'outcome',
  'for example',
]

const detailWords = [
  'example',
  'specific',
  'used',
  'built',
  'created',
  'implemented',
  'designed',
  'challenge',
  'solution',
  'result',
  'outcome',
]

const roundWeights = {
  HR: {
    communication: 0.26,
    confidence: 0.23,
    technicalDepth: 0.07,
    problemSolving: 0.13,
    projectOwnership: 0.1,
    completeness: 0.21,
  },
  Technical: {
    communication: 0.14,
    confidence: 0.11,
    technicalDepth: 0.35,
    problemSolving: 0.19,
    projectOwnership: 0.06,
    completeness: 0.15,
  },
  Project: {
    communication: 0.15,
    confidence: 0.12,
    technicalDepth: 0.24,
    problemSolving: 0.19,
    projectOwnership: 0.18,
    completeness: 0.12,
  },
}

function clampScore(score) {
  return Math.max(0, Math.min(100, Math.round(score)))
}

function countMatches(text, phrases) {
  return phrases.reduce((count, phrase) => {
    return text.includes(phrase) ? count + 1 : count
  }, 0)
}

function getCanonicalText(text) {
  return text
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function getMeaningfulWords(text) {
  return getCanonicalText(text)
    .split(/\s+/)
    .filter((word) => word.length > 2)
}

function getLengthScore(wordCount) {
  if (wordCount <= 2) return 5
  if (wordCount < 8) return 18 + wordCount * 3
  if (wordCount < 20) return 42 + (wordCount - 8) * 2.2
  if (wordCount < 45) return 68 + (wordCount - 20) * 0.8

  return 88
}

function hasVeryWeakAnswer(rawAnswer) {
  const canonicalAnswer = getCanonicalText(rawAnswer)

  return veryWeakAnswers.some((weakAnswer) => {
    const canonicalWeakAnswer = getCanonicalText(weakAnswer)
    return (
      canonicalAnswer === canonicalWeakAnswer ||
      (canonicalAnswer.length <= 18 && canonicalAnswer.includes(canonicalWeakAnswer))
    )
  })
}

function getQuestionOverlap(answerText, questionText) {
  const questionWords = getMeaningfulWords(questionText).filter(
    (word) => !['what', 'why', 'how', 'when', 'where', 'tell', 'explain'].includes(word),
  )
  if (!questionWords.length) return 0

  const answerWords = new Set(getMeaningfulWords(answerText))
  return questionWords.filter((word) => answerWords.has(word)).length
}

function getWeakEvaluation() {
  const scores = {
    communication: 8,
    confidence: 6,
    technicalDepth: 4,
    problemSolving: 4,
    projectOwnership: 4,
    completeness: 5,
  }

  return {
    ...scores,
    overall: 5,
    strengths: [],
    improvements: [
      'Answer the question with a complete explanation',
      'Add specific examples and relevant details',
      'Use clear ownership statements instead of skipping',
    ],
  }
}

function getStrengths(scores, signals) {
  const strengths = []

  if (scores.communication >= 75) strengths.push('Clear and structured response')
  if (scores.confidence >= 75) strengths.push('Confident action-oriented wording')
  if (scores.technicalDepth >= 75) strengths.push('Good technical detail')
  if (scores.problemSolving >= 75) strengths.push('Shows problem-solving ability')
  if (scores.projectOwnership >= 75) strengths.push('Shows ownership of work')
  if (signals.meaningfulWordCount >= 45) strengths.push('Detailed answer')

  return strengths.slice(0, 3)
}

function getImprovements(scores, signals) {
  const improvements = []

  if (scores.completeness < 60) improvements.push('Add more specific details')
  if (scores.communication < 60) improvements.push('Use a clearer structure')
  if (scores.technicalDepth < 60) improvements.push('Include relevant technical terms')
  if (scores.problemSolving < 60) improvements.push('Explain the challenge and outcome')
  if (scores.projectOwnership < 60) improvements.push('Clarify your personal contribution')
  if (signals.hesitationCount > 1) improvements.push('Reduce hesitation language')

  return improvements.slice(0, 3)
}

export function evaluateAnswer({ answer, question, round }) {
  if (hasVeryWeakAnswer(answer)) return getWeakEvaluation()

  const normalizedAnswer = getCanonicalText(answer)
  const normalizedQuestion = getCanonicalText(question)
  const meaningfulWords = getMeaningfulWords(normalizedAnswer)
  const meaningfulWordCount = meaningfulWords.length
  const uniqueMeaningfulWordCount = new Set(meaningfulWords).size
  const answerLengthScore = getLengthScore(meaningfulWordCount)
  const technicalKeywordCount = countMatches(normalizedAnswer, technicalKeywords)
  const technologyCount = countMatches(normalizedAnswer, technologyKeywords)
  const hesitationCount = countMatches(normalizedAnswer, hesitationWords)
  const confidenceCount = countMatches(normalizedAnswer, confidenceWords)
  const ownershipCount = countMatches(normalizedAnswer, ownershipWords)
  const problemSolvingCount = countMatches(normalizedAnswer, problemSolvingWords)
  const outcomeCount = countMatches(normalizedAnswer, outcomeWords)
  const structureCount = countMatches(normalizedAnswer, structureWords)
  const detailCount = countMatches(normalizedAnswer, detailWords)
  const questionKeywordOverlap = getQuestionOverlap(normalizedAnswer, normalizedQuestion)
  const relevantDetailBonus = detailCount > 0 || technologyCount > 0 || outcomeCount > 0 ? 10 : 0
  const roundTechnicalWeight =
    round === 'Technical' ? 1.35 : round === 'Project' ? 1.15 : 0.65

  const communication = clampScore(
    answerLengthScore * 0.62 +
      Math.min(structureCount, 4) * 8 +
      Math.min(uniqueMeaningfulWordCount, 45) * 0.45 -
      hesitationCount * 8,
  )
  const confidence = clampScore(
    28 +
      answerLengthScore * 0.35 +
      Math.min(confidenceCount + ownershipCount, 5) * 9 -
      hesitationCount * 11,
  )
  const technicalDepth = clampScore(
    18 +
      answerLengthScore * 0.2 +
      Math.min(technicalKeywordCount + technologyCount, 7) * 10 * roundTechnicalWeight +
      (round === 'Technical' && technicalKeywordCount > 0 ? 8 : 0),
  )
  const problemSolving = clampScore(
    22 +
      answerLengthScore * 0.28 +
      Math.min(problemSolvingCount, 5) * 11 +
      Math.min(outcomeCount, 4) * 7 +
      Math.min(structureCount, 4) * 4,
  )
  const projectOwnership = clampScore(
    20 +
      answerLengthScore * (round === 'Project' ? 0.34 : 0.22) +
      Math.min(ownershipCount, 5) * 13 +
      Math.min(confidenceCount, 4) * 5 +
      (round === 'Project' && ownershipCount > 0 ? 8 : 0),
  )
  const completeness = clampScore(
    answerLengthScore * 0.58 +
      Math.min(questionKeywordOverlap, 4) * 7 +
      Math.min(detailCount, 4) * 5 +
      relevantDetailBonus,
  )

  const scores = {
    communication,
    confidence,
    technicalDepth,
    problemSolving,
    projectOwnership,
    completeness,
  }
  const weights = roundWeights[round] || roundWeights.HR
  const overall = clampScore(
    Object.entries(weights).reduce((total, [category, weight]) => {
      return total + scores[category] * weight
    }, 0),
  )
  const signals = {
    meaningfulWordCount,
    hesitationCount,
  }

  return {
    ...scores,
    overall,
    strengths: getStrengths(scores, signals),
    improvements: getImprovements(scores, signals),
  }
}
