/**
 * Shared Chart Types
 * Cross-platform chart type definitions
 */

export interface DataPoint {
  value: number
  label: string
  date?: string
}

export interface Dataset {
  label: string
  color: string
  data: DataPoint[]
}

export interface BarData {
  value: number
  label: string // e.g. month name or short date
  mood: string // mood type for emoji
}

export type Mood =
  | "happy"
  | "sad"
  | "angry"
  | "astonished"
  | "inlove"
  | "thinking"
  | "neutral"

export const emojiMap: Record<Mood, string> = {
  happy: "😊",
  sad: "😢",
  angry: "😠",
  astonished: "😲",
  inlove: "😍",
  thinking: "🤔",
  neutral: "😐",
}

export const moodValues: Record<Mood, number> = {
  happy: 80,
  sad: 20,
  angry: 10,
  astonished: 60,
  inlove: 100,
  thinking: 50,
  neutral: 50,
}
