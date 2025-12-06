// Web implementation using HTML audio element
import { forwardRef } from "react"

export interface AudioProps {
  src?: string
  onEnded?: () => void
  loop?: boolean
  autoPlay?: boolean
}

export const Audio = forwardRef<HTMLAudioElement, AudioProps>(
  ({ src, onEnded, loop, autoPlay }, ref) => {
    return (
      <audio
        ref={ref}
        src={src}
        onEnded={onEnded}
        loop={loop}
        autoPlay={autoPlay}
      />
    )
  },
)

Audio.displayName = "Audio"
