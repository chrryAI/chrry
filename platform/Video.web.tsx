"use client"

import type React from "react"

export interface VideoProps {
  src: string
  autoPlay?: boolean
  loop?: boolean
  muted?: boolean
  playsInline?: boolean
  controls?: boolean
  style?: React.CSSProperties
  className?: string
  width?: number | string
  height?: number | string
}

const Video: React.FC<VideoProps> = ({
  src,
  autoPlay,
  loop,
  muted,
  playsInline,
  controls,
  style,
  className,
  width,
  height,
}) => {
  return (
    <video
      src={src}
      autoPlay={autoPlay}
      loop={loop}
      muted={muted}
      playsInline={playsInline}
      controls={controls}
      style={style}
      className={className}
      width={width}
      height={height}
    />
  )
}

export default Video
