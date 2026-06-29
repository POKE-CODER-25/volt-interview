import { useEffect, useRef, useState } from 'react'
import { VoiceManager } from '../utils/voiceManager'

export function useTextToSpeech() {
  const [speaking, setSpeaking] = useState(false)
  const speechRequestRef = useRef(0)
  const supported = VoiceManager.isSupported()

  useEffect(() => {
    return () => {
      VoiceManager.stop()
      speechRequestRef.current += 1
    }
  }, [])

  async function speak(text, interviewer) {
    if (!supported || !text?.trim()) {
      return
    }

    const requestId = speechRequestRef.current + 1
    speechRequestRef.current = requestId
    setSpeaking(true)

    const didStart = await VoiceManager.speak(text, interviewer, {
      onStart: () => {
        if (speechRequestRef.current === requestId) setSpeaking(true)
      },
      onEnd: () => {
        if (speechRequestRef.current === requestId) setSpeaking(false)
      },
      onError: () => {
        if (speechRequestRef.current === requestId) setSpeaking(false)
      },
    })

    if (!didStart && speechRequestRef.current === requestId) {
      setSpeaking(false)
    }
  }

  function stop() {
    VoiceManager.stop()
    speechRequestRef.current += 1
    setSpeaking(false)
  }

  return {
    supported,
    speaking,
    speak,
    stop,
  }
}
