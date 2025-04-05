import { ApiResponse, StartStreamingType } from '@renderer/globalTypes/globalApi'
import { useEffect, useState } from 'react'

interface TranscriptionListener {
  transcriptionWords: string
  transcriptionSentence: string
  transcriptionIsLoading: boolean
  transcriptionError: string | null
  setTranscriptionSentence: React.Dispatch<React.SetStateAction<string>>
  setTranscriptionIsLoading: React.Dispatch<React.SetStateAction<boolean>>
  setTranscriptionError: React.Dispatch<React.SetStateAction<string | null>>
  setTranscriptionWords: React.Dispatch<React.SetStateAction<string>>
}
interface TranscriptionListenerProps {
  cleanState?: boolean
}
const useTranscriptionListener = ({
  cleanState = false
}: TranscriptionListenerProps): TranscriptionListener => {
  const [transcriptionSentence, setTranscriptionSentence] = useState<string>('')
  const [transcriptionWords, setTranscriptionWords] = useState<string>('')
  const [transcriptionIsLoading, setTranscriptionIsLoading] = useState<boolean>(false)
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null)
  useEffect(() => {
    const handleStreamingData = (_event: unknown, data: ApiResponse<StartStreamingType>): void => {
      if (data.success) {
        if (data.data.status !== undefined) {
          if (data.data.status === 0) {
            if (data.data.channel_info?.is_final || data.data.channel_info?.speech_final) {
              setTranscriptionWords('')
              setTranscriptionSentence(
                (prev) =>
                  `${prev}${data.data.sentence}${data.data.sentence && data.data.sentence.length > 0 ? ', ' : ''}`
              )
            } else {
              setTranscriptionWords(
                data.data.words?.length ? data.data.words.map((item) => item.word).join(' ') : ''
              )
            }
          } else if (data.data.status === 2) {
            if (cleanState === true) {
              setTranscriptionSentence('')
            }
            setTranscriptionIsLoading(false)
          }
        }
      } else {
        setTranscriptionError(data.error)
      }
    }

    const handleStreamingError = (_event: unknown, data: { error: string }): void => {
      setTranscriptionError(data.error)
    }

    window.api.on('streaming-data', handleStreamingData)
    window.api.on('streaming-error', handleStreamingError)

    return (): void => {
      window.api.removeListener('streaming-data', handleStreamingData)
      window.api.removeListener('streaming-error', handleStreamingError)
    }
  }, [])

  return {
    transcriptionWords,
    transcriptionSentence,
    transcriptionIsLoading,
    transcriptionError,
    setTranscriptionSentence,
    setTranscriptionIsLoading,
    setTranscriptionError,
    setTranscriptionWords
  }
}

export default useTranscriptionListener
