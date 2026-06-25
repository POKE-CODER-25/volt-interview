import { useEffect, useRef, useState } from 'react'

function getSpeechSynthesis() {
  if (typeof window === 'undefined') return null

  return window.speechSynthesis || null
}

function getSpeechSynthesisUtterance() {
  if (typeof window === 'undefined') return null

  return window.SpeechSynthesisUtterance || null
}

export function useTextToSpeech() {
  const [speaking, setSpeaking] = useState(false)
  const utteranceRef = useRef(null)
  const supported = Boolean(getSpeechSynthesis() && getSpeechSynthesisUtterance())

  useEffect(() => {
    return () => {
      getSpeechSynthesis()?.cancel()
      utteranceRef.current = null
    }
  }, [])

  function speak(text, options = {}) {
    const synthesis = getSpeechSynthesis()
    const SpeechSynthesisUtterance = getSpeechSynthesisUtterance()

    if (!synthesis || !SpeechSynthesisUtterance || !text?.trim()) {
      return
    }

    synthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text.trim())
    utterance.lang = options.lang || 'en-US'
    utterance.rate = options.rate ?? 0.95
    utterance.pitch = options.pitch ?? 1
    utterance.volume = options.volume ?? 1

    utterance.onstart = () => {
      setSpeaking(true)
    }

    utterance.onend = () => {
      if (utteranceRef.current === utterance) {
        utteranceRef.current = null
        setSpeaking(false)
      }
    }

    utterance.onerror = () => {
      if (utteranceRef.current === utterance) {
        utteranceRef.current = null
        setSpeaking(false)
      }
    }

    utteranceRef.current = utterance
    setSpeaking(true)
    synthesis.speak(utterance)
  }

  function stop() {
    getSpeechSynthesis()?.cancel()
    utteranceRef.current = null
    setSpeaking(false)
  }

  return {
    supported,
    speaking,
    speak,
    stop,
  }
}
