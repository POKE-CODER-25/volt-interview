const technicalKeywords = [
  'api',
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
  'react',
  'route',
  'server',
  'state',
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
]

const ownershipWords = [
  'i built',
  'i created',
  'i implemented',
  'my project',
  'i designed',
  'i developed',
]

const problemSolvingWords = [
  'challenge',
  'issue',
  'problem',
  'solved',
  'fixed',
  'improved',
  'optimized',
]

const structureWords = [
  'first',
  'then',
  'finally',
  'because',
  'therefore',
  'result',
  'outcome',
]

const roundWeights = {
  HR: {
    communication: 0.25,
    confidence: 0.22,
    technicalDepth: 0.08,
    problemSolving: 0.14,
    projectOwnership: 0.11,
    completeness: 0.2,
  },
  Technical: {
    communication: 0.15,
    confidence: 0.12,
    technicalDepth: 0.33,
    problemSolving: 0.18,
    projectOwnership: 0.07,
    completeness: 0.15,
  },
  Project: {
    communication: 0.16,
    confidence: 0.13,
    technicalDepth: 0.22,
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

function getMeaningfulWords(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2)
}

function scoreByCount(count, maxUsefulCount, baseScore = 35) {
  return clampScore(baseScore + (Math.min(count, maxUsefulCount) / maxUsefulCount) * 65)
}

function getStrengths(scores, signals) {
  const strengths = []

  if (scores.communication >= 70) strengths.push('Clear and structured response')
  if (scores.confidence >= 70) strengths.push('Confident action-oriented wording')
  if (scores.technicalDepth >= 70) strengths.push('Good technical detail')
  if (scores.problemSolving >= 70) strengths.push('Shows problem-solving ability')
  if (scores.projectOwnership >= 70) strengths.push('Shows ownership of work')
  if (signals.meaningfulWordCount >= 45) strengths.push('Detailed answer')

  return strengths.slice(0, 3)
}

function getImprovements(scores, signals) {
  const improvements = []

  if (scores.completeness < 60) improvements.push('Add more specific details')
  if (scores.communication < 60) improvements.push('Use a clearer structure')
  if (scores.technicalDepth < 60) improvements.push('Include relevant technical terms')
  if (scores.problemSolving < 60) improvements.push('Explain the problem and outcome')
  if (scores.projectOwnership < 60) improvements.push('Clarify your personal contribution')
  if (signals.hesitationCount > 0) improvements.push('Reduce hesitation language')

  return improvements.slice(0, 3)
}

export function evaluateAnswer({ answer, question, round }) {
  const normalizedAnswer = answer.trim().toLowerCase()
  const normalizedQuestion = question.trim().toLowerCase()
  const meaningfulWords = getMeaningfulWords(normalizedAnswer)
  const meaningfulWordCount = meaningfulWords.length
  const uniqueMeaningfulWordCount = new Set(meaningfulWords).size
  const technicalKeywordCount = countMatches(normalizedAnswer, technicalKeywords)
  const hesitationCount = countMatches(normalizedAnswer, hesitationWords)
  const confidenceCount = countMatches(normalizedAnswer, confidenceWords)
  const ownershipCount = countMatches(normalizedAnswer, ownershipWords)
  const problemSolvingCount = countMatches(normalizedAnswer, problemSolvingWords)
  const structureCount = countMatches(normalizedAnswer, structureWords)
  const questionKeywordOverlap = getMeaningfulWords(normalizedQuestion).filter((word) =>
    normalizedAnswer.includes(word),
  ).length

  const communication = clampScore(
    scoreByCount(structureCount, 4, 38) +
      Math.min(meaningfulWordCount, 70) * 0.45 -
      hesitationCount * 7,
  )
  const confidence = clampScore(
    scoreByCount(confidenceCount, 4, 32) +
      Math.min(uniqueMeaningfulWordCount, 45) * 0.3 -
      hesitationCount * 10,
  )
  const technicalDepth = clampScore(
    scoreByCount(technicalKeywordCount, 5, 28) +
      Math.min(meaningfulWordCount, 80) * 0.25 +
      (round === 'Technical' ? 8 : 0),
  )
  const problemSolving = clampScore(
    scoreByCount(problemSolvingCount, 4, 32) +
      Math.min(structureCount, 4) * 4 +
      Math.min(meaningfulWordCount, 70) * 0.2,
  )
  const projectOwnership = clampScore(
    scoreByCount(ownershipCount, 4, round === 'Project' ? 35 : 28) +
      Math.min(confidenceCount, 4) * 4 +
      (round === 'Project' ? Math.min(meaningfulWordCount, 70) * 0.2 : 0),
  )
  const completeness = clampScore(
    Math.min(meaningfulWordCount, 80) * 0.85 +
      Math.min(questionKeywordOverlap, 5) * 5 +
      Math.min(structureCount, 4) * 4,
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
