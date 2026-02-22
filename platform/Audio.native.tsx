// React Native implementation - placeholder for now
// You can integrate react-native-track-player or react-native-sound later
import { forwardRef } from "react"
import type { View } from "react-native"

export interface AudioProps {
  src?: string
  onEnded?: () => void
  loop?: boolean
  autoPlay?: boolean
}

export const Audio = forwardRef<View, AudioProps>(
  ({ src, onEnded, loop, autoPlay }, ref) => {
    // For now, return null - audio playback in React Native requires
    // native modules like react-native-track-player which you already have!
    // TODO: Integrate with react-native-track-player for native audio
    return null
  },
)

Audio.displayName = "Audio"
