"use client"

import type React from "react"
import { useEffect, useRef } from "react"

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
  playing?: boolean
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
  playing,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!videoRef.current || playing === undefined) return

    if (playing) {
      videoRef.current.play().catch((err) => {
        // Autoplay policy might block this even if muted in some browsers/cases
        console.warn("Video play failed:", err)
      })
    } else {
      videoRef.current.pause()
    }
  }, [playing])

  return (
    <video
      ref={videoRef}
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
