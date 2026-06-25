import { useEffect, useRef, useState } from 'react'

const recognitionErrorMessages = {
  'not-allowed':
    'Microphone permission was denied. Allow microphone access and try again.',
  'service-not-allowed':
    'Microphone permission was denied. Allow microphone access and try again.',
  'no-speech': 'No speech was detected. Try again.',
  'audio-capture':
    'No microphone was found. Check your microphone and try again.',
  network: 'Speech recognition could not connect. Check your connection and try again.',
}

function getSpeechRecognition() {
  if (typeof window === 'undefined') return null

  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

export function useSpeechRecognition({ onTranscript }) {
  const [listening, setListening] = useState(false)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const recognitionRef = useRef(null)
  const manuallyStoppedRef = useRef(false)
  const capturedResultRef = useRef(false)
  const onTranscriptRef = useRef(onTranscript)
  const supported = Boolean(getSpeechRecognition())

  useEffect(() => {
    onTranscriptRef.current = onTranscript
  }, [onTranscript])

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort()
      recognitionRef.current = null
    }
  }, [])

  function start() {
    const SpeechRecognition = getSpeechRecognition()

    if (!SpeechRecognition) {
      setError(
        'Voice input is not supported in this browser. Please use text mode.',
      )
      return
    }

    if (recognitionRef.current || starting || listening) return

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = navigator.language || 'en-US'

    recognition.onstart = () => {
      setStarting(false)
      setListening(true)
    }

    recognition.onresult = (event) => {
      const result = event.results[event.resultIndex]
      const transcript = result?.[0]?.transcript?.trim()

      if (transcript) {
        console.log('Speech transcript:', transcript)
        capturedResultRef.current = true
        setStatus('Voice captured and added to answer.')
        setError('')
        onTranscriptRef.current?.(transcript)
      } else {
        setStatus('No speech was detected. Try again.')
      }
    }

    recognition.onerror = (event) => {
      setStarting(false)
      setListening(false)

      if (event.error === 'aborted' && manuallyStoppedRef.current) return

      setError(
        recognitionErrorMessages[event.error] ||
          'Speech recognition failed. Please try again or use text mode.',
      )
    }

    recognition.onend = () => {
      setStarting(false)
      setListening(false)
      recognitionRef.current = null
      manuallyStoppedRef.current = false

      if (!capturedResultRef.current && !error) {
        setStatus('No speech was detected. Try again.')
      }
    }

    setError('')
    setStatus('')
    setStarting(true)
    manuallyStoppedRef.current = false
    capturedResultRef.current = false
    recognitionRef.current = recognition

    try {
      recognition.start()
    } catch {
      recognitionRef.current = null
      setStarting(false)
      setListening(false)
      setError('Speech recognition could not start. Please try again.')
    }
  }

  function stop() {
    if (!recognitionRef.current) return

    manuallyStoppedRef.current = true
    recognitionRef.current.stop()
  }

  return {
    supported,
    listening,
    starting,
    error,
    status,
    start,
    stop,
  }
}
