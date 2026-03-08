/**
 * Shared Chart Utilities
 * Cross-platform chart calculation logic
 */

import { emojiMap, type Mood, moodValues } from "./chartTypes"

export const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

/**
 * Get mood emoji for a given mood type
 */
export const getMoodEmoji = (type: string): string => {
  return emojiMap[type as Mood] || "🫥"
}

/**
 * Get start of week (Monday as first day)
 */
export function getStartOfWeek(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const day = d.getDay()
  // Monday as start of week (0 = Sunday, 1 = Monday, ...)
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0) // Local midnight
  return d
}

/**
 * Get end of week (Sunday as last day)
 */
export function getEndOfWeek(date: Date): Date {
  const start = getStartOfWeek(date)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999) // Local end of day
  return end
}

/**
 * Check if a date is in the latest week
 */
export function isLatestWeek(currentWeek: Date): boolean {
  const today = new Date()
  const weekStart = getStartOfWeek(today)
  const viewedStart = getStartOfWeek(currentWeek)
  return viewedStart.getTime() >= weekStart.getTime()
}

/**
 * Check if a date is in the latest month
 */
export function isLatestMonth(currentMonth: Date): boolean {
  const today = new Date()
  return (
    currentMonth.getMonth() === today.getMonth() &&
    currentMonth.getFullYear() === today.getFullYear()
  )
}

/**
 * Get most frequent mood from an array of mood types
 */
export function getMostFrequentMood(arr: string[]): string {
  if (!arr || arr.length === 0) return "thinking"
  const freq: Record<string, number> = {}
  arr.forEach((m) => {
    freq[m] = (freq[m] || 0) + 1
  })
  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1])
  return sorted[0]?.[0] ?? "thinking"
}

/**
 * Get mood value for chart display
 */
export function getMoodValue(moodType: string): number {
  return moodValues[moodType as Mood] || 50
}

/**
 * Create smooth cubic Bezier path points (Catmull-Rom to Bezier)
 * Returns control points for cubic bezier curves
 */
export function createSmoothPathPoints(
  data: Array<{ x: number; y: number }>,
  progress: number = 1,
): Array<{
  type: "move" | "cubic"
  x: number
  y: number
  c1x?: number
  c1y?: number
  c2x?: number
  c2y?: number
}> {
  if (data.length < 2) return []

  const lastIndex = Math.floor((data.length - 1) * progress)
  const points: Array<{
    type: "move" | "cubic"
    x: number
    y: number
    c1x?: number
    c1y?: number
    c2x?: number
    c2y?: number
  }> = []

  // Start point - with null safety
  const firstPoint = data[0]
  if (!firstPoint) return []

  points.push({ type: "move", x: firstPoint.x, y: firstPoint.y })

  // Create smooth curves
  for (let i = 0; i < lastIndex; i++) {
    const curr = data[i]
    const next = data[i + 1]
    const prev = i === 0 ? curr : data[i - 1]
    const after = i + 2 > lastIndex ? next : data[i + 2]

    // Null safety checks
    if (!curr || !next || !prev || !after) continue

    // Catmull-Rom to Bezier control points
    const c1x = curr.x + (next.x - prev.x) / 6
    const c1y = curr.y + (next.y - prev.y) / 6
    const c2x = next.x - (after.x - curr.x) / 6
    const c2y = next.y - (after.y - curr.y) / 6

    points.push({
      type: "cubic",
      x: next.x,
      y: next.y,
      c1x,
      c1y,
      c2x,
      c2y,
    })
  }

  return points
}
