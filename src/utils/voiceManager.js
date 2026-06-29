const VOICE_LOAD_TIMEOUT_MS = 1600

const INTERVIEWER_SETTINGS = {
  'Mr. Volt': {
    rate: 0.96,
    pitch: 0.92,
    preferredNames: [
      'Google UK English Male',
      'Microsoft David',
      'Microsoft Guy',
      'Microsoft Ryan',
      'Google English Male',
    ],
    genderKeywords: ['male', 'david', 'guy', 'ryan', 'mark', 'george', 'daniel'],
  },
  'Ms. Luna': {
    rate: 0.95,
    pitch: 1.08,
    preferredNames: [
      'Google UK English Female',
      'Microsoft Zira',
      'Microsoft Sonia',
      'Google English Female',
    ],
    genderKeywords: ['female', 'zira', 'sonia', 'susan', 'aria', 'jenny', 'samantha'],
  },
  'Ms. Mari': {
    rate: 1,
    pitch: 1.15,
    preferredNames: [
      'Microsoft Sonia',
      'Google UK English Female',
      'Google English Female',
      'Microsoft Zira',
    ],
    genderKeywords: ['female', 'sonia', 'zira', 'susan', 'aria', 'jenny', 'samantha'],
  },
}

function getSpeechSynthesis() {
  if (typeof window === 'undefined') return null

  return window.speechSynthesis || null
}

function getSpeechSynthesisUtterance() {
  if (typeof window === 'undefined') return null

  return window.SpeechSynthesisUtterance || null
}

function normalize(value) {
  return String(value || '').toLowerCase()
}

function isEnglishVoice(voice) {
  return normalize(voice.lang).startsWith('en')
}

function languageScore(voice) {
  const lang = normalize(voice.lang)

  if (lang === 'en-us') return 80
  if (lang === 'en-gb') return 70
  if (lang.startsWith('en-us')) return 64
  if (lang.startsWith('en-gb')) return 58
  if (lang.startsWith('en')) return 46

  return 0
}

function preferredNameScore(voice, preferredNames) {
  const voiceName = normalize(voice.name)

  return preferredNames.reduce((score, preferredName, index) => {
    const preferred = normalize(preferredName)
    if (voiceName === preferred) return Math.max(score, 120 - index * 6)
    if (voiceName.includes(preferred)) return Math.max(score, 96 - index * 4)

    return score
  }, 0)
}

function genderKeywordScore(voice, keywords) {
  const name = normalize(voice.name)

  return keywords.some((keyword) => name.includes(keyword)) ? 34 : 0
}

function qualityScore(voice) {
  const name = normalize(voice.name)
  let score = 0

  if (name.includes('google')) score += 18
  if (name.includes('microsoft')) score += 16
  if (name.includes('natural')) score += 14
  if (name.includes('online')) score += 8
  if (voice.localService) score += 3

  return score
}

function scoreVoiceForInterviewer(voice, settings) {
  return (
    languageScore(voice) +
    preferredNameScore(voice, settings.preferredNames) +
    genderKeywordScore(voice, settings.genderKeywords) +
    qualityScore(voice)
  )
}

class BrowserVoiceManager {
  constructor() {
    this.voices = []
    this.loadPromise = null
    this.assignments = new Map()
  }

  isSupported() {
    return Boolean(getSpeechSynthesis() && getSpeechSynthesisUtterance())
  }

  loadVoices() {
    const synthesis = getSpeechSynthesis()

    if (!synthesis) return Promise.resolve([])

    const existingVoices = synthesis.getVoices()
    if (existingVoices.length) {
      this.voices = existingVoices
      return Promise.resolve(existingVoices)
    }

    if (this.loadPromise) return this.loadPromise

    this.loadPromise = new Promise((resolve) => {
      let settled = false

      const finish = () => {
        if (settled) return

        const loadedVoices = synthesis.getVoices()
        if (!loadedVoices.length) return

        settled = true
        this.voices = loadedVoices
        synthesis.removeEventListener?.('voiceschanged', finish)
        resolve(loadedVoices)
      }

      synthesis.addEventListener?.('voiceschanged', finish)
      synthesis.onvoiceschanged = finish
      finish()

      window.setTimeout(() => {
        if (settled) return

        settled = true
        this.voices = synthesis.getVoices()
        synthesis.removeEventListener?.('voiceschanged', finish)
        resolve(this.voices)
      }, VOICE_LOAD_TIMEOUT_MS)
    })

    return this.loadPromise
  }

  findBestVoice(interviewer) {
    const voices = this.voices.length ? this.voices : getSpeechSynthesis()?.getVoices() || []
    if (!voices.length) return null

    if (this.assignments.has(interviewer)) {
      return this.assignments.get(interviewer)
    }

    const settings = INTERVIEWER_SETTINGS[interviewer] || INTERVIEWER_SETTINGS['Mr. Volt']
    const candidates = voices.filter(isEnglishVoice)
    const searchableVoices = candidates.length ? candidates : voices
    const lunaVoice =
      this.assignments.get('Ms. Luna') ||
      (interviewer === 'Ms. Mari'
        ? this.getBestCandidateFor('Ms. Luna', searchableVoices)
        : null)

    const rankedVoices = searchableVoices
      .map((voice) => {
        let score = scoreVoiceForInterviewer(voice, settings)

        if (interviewer === 'Ms. Mari' && lunaVoice && voice.name !== lunaVoice.name) {
          score += 22
        }

        if (interviewer === 'Ms. Mari' && lunaVoice && voice.name === lunaVoice.name) {
          score -= searchableVoices.length > 1 ? 28 : 0
        }

        return { voice, score }
      })
      .sort((a, b) => b.score - a.score)

    const selectedVoice = rankedVoices[0]?.voice || null
    if (selectedVoice) this.assignments.set(interviewer, selectedVoice)

    return selectedVoice
  }

  getBestCandidateFor(interviewer, voices) {
    const settings = INTERVIEWER_SETTINGS[interviewer] || INTERVIEWER_SETTINGS['Mr. Volt']

    return [...voices]
      .map((voice) => ({
        voice,
        score: scoreVoiceForInterviewer(voice, settings),
      }))
      .sort((a, b) => b.score - a.score)[0]?.voice || null
  }

  async speak(text, interviewer, callbacks = {}) {
    const synthesis = getSpeechSynthesis()
    const SpeechSynthesisUtterance = getSpeechSynthesisUtterance()

    if (!synthesis || !SpeechSynthesisUtterance || !text?.trim()) return false

    await this.loadVoices()
    synthesis.cancel()

    const settings = INTERVIEWER_SETTINGS[interviewer] || INTERVIEWER_SETTINGS['Mr. Volt']
    const utterance = new SpeechSynthesisUtterance(text.trim())
    const voice = this.findBestVoice(interviewer)

    if (voice) {
      utterance.voice = voice
      utterance.lang = voice.lang || 'en-US'
    } else {
      utterance.lang = 'en-US'
    }

    utterance.rate = settings.rate
    utterance.pitch = settings.pitch
    utterance.volume = 1
    utterance.onstart = callbacks.onStart
    utterance.onend = callbacks.onEnd
    utterance.onerror = callbacks.onError

    synthesis.speak(utterance)

    return true
  }

  stop() {
    getSpeechSynthesis()?.cancel()
  }
}

export const VoiceManager = new BrowserVoiceManager()
