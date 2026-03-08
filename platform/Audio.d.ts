// Type definitions for Audio component

export interface AudioProps {
  src?: string
  onEnded?: () => void
  loop?: boolean
  autoPlay?: boolean
}
