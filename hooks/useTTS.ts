import { useCallback, useState } from "react"
import { useAuth, useError } from "../context/providers"
import { apiFetch } from "../utils"

interface TTSResponse {
  audio?: string
  useWebSpeech: boolean
  text?: string
}

export const useTTS = () => {
  const [isPlaying, setIsPlaying] = useState<string | null>(null)
  const { token } = useAuth()

  const { captureException } = useError()

  const playAudio = useCallback(
    async (text: string, messageId: string) => {
      if (isPlaying === messageId) {
        // Stop current audio
        setIsPlaying(null)
        return
      }

      setIsPlaying(messageId)

      try {
        const response = await apiFetch("/api/tts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({ text }),
        })

        const data: TTSResponse = await response.json()

        if (data.useWebSpeech) {
          // Fallback to Web Speech API for guests
          if ("speechSynthesis" in window) {
            const utterance = new SpeechSynthesisUtterance(text)
            utterance.onend = () => setIsPlaying(null)
            utterance.onerror = () => setIsPlaying(null)
            speechSynthesis.speak(utterance)
          }
        } else if (data.audio) {
          // Play ElevenLabs audio for members
          const audio = new Audio(data.audio)
          audio.onended = () => setIsPlaying(null)
          audio.onerror = () => setIsPlaying(null)
          await audio.play()
        }
      } catch (error) {
        captureException(error)
        console.error("TTS error:", error)
        setIsPlaying(null)
      }
    },
    [isPlaying, token],
  )

  const stopAudio = useCallback(() => {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel()
    }
    setIsPlaying(null)
  }, [])

  return {
    playAudio,
    stopAudio,
    isPlaying,
  }
}
