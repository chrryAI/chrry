// Type declarations for platform-specific Video component
import React from "react"

export interface VideoProps {
  src: string
  autoPlay?: boolean
  loop?: boolean
  muted?: boolean
  playsInline?: boolean
  controls?: boolean
  style?: React.CSSProperties | any
  className?: string
  width?: number | string
  height?: number | string
}

declare const Video: React.FC<VideoProps>
export default Video
