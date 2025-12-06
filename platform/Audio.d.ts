// Type definitions for Audio component
import { ComponentProps } from "react"

export interface AudioProps {
  src?: string
  onEnded?: () => void
  loop?: boolean
  autoPlay?: boolean
}
