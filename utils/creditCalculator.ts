// ============================================
// CREDIT CALCULATOR - Shared between API and UI
// ============================================

export interface scheduleSlot {
  hour: number
  minute: number
  postType: "post" | "comment" | "engagement"
  model:
    | "sushi"
    | "deepSeek"
    | "claude"
    | "chatGPT"
    | "gemini"
    | "perplexity"
    | "flux"
  charLimit: number
  credits?: number // Optional pre-calculated credits for UI display
  intervalMinutes?: number // Repeat interval in minutes (for custom frequency)
}

// Model pricing multipliers (matches creditCost from agents seed)
export function getModelMultiplier(model: string): number {
  switch (model) {
    case "sushi":
      return 2 // DeepSeek R1 - creditCost: 2
    case "deepSeek":
      return 2 // DeepSeek - creditCost: 2
    case "claude":
      return 3 // Claude Sonnet 4.5 - creditCost: 3
    case "chatGPT":
      return 4 // GPT-5.1 - creditCost: 4
    case "gemini":
      return 4 // Gemini 3.0 Pro - creditCost: 4
    case "perplexity":
      return 3 // Perplexity Sonar Pro - creditCost: 3
    case "flux":
      return 5 // Flux - image generation - creditCost: 5
    default:
      return 2
  }
}

// Post type multipliers
export function getPostTypeMultiplier(postType: string): number {
  switch (postType) {
    case "post":
      return 1
    case "comment":
      return 0.5
    case "engagement":
      return 0.3
    default:
      return 1
  }
}

// Calculate credits for a single slot
export function calculateSlotCredits(slot: scheduleSlot): number {
  // Base credits: 10 + (charLimit / 100) * 5
  const baseCredits = 10 + (slot.charLimit / 100) * 5
  const modelMultiplier = getModelMultiplier(slot.model)
  const postTypeMultiplier = getPostTypeMultiplier(slot.postType)

  return Math.ceil(baseCredits * modelMultiplier * postTypeMultiplier)
}

export type estimateJobCreditsParams = {
  frequency: "daily" | "weekly" | "monthly" | "once" | "custom"
  scheduledTimes: scheduleSlot[]
  startDate: Date
  endDate: Date
  creditsPrice?: number // EUR per 1000 credits (default: 10)
}

export function estimateJobCredits(params: {
  frequency: "daily" | "weekly" | "monthly" | "once" | "custom"
  scheduledTimes: scheduleSlot[]
  startDate: Date
  endDate: Date
  creditsPrice?: number // EUR per 1000 credits (default: 10)
}): {
  totalPosts: number
  creditsPerPost: number
  totalCredits: number
  totalPrice: number
} {
  const {
    frequency,
    scheduledTimes,
    startDate,
    endDate,
    creditsPrice = 10,
  } = params

  const start = new Date(startDate)
  const end = new Date(endDate)
  const days = Math.ceil(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
  )

  if (days <= 0) {
    return {
      totalPosts: 0,
      creditsPerPost: 0,
      totalCredits: 0,
      totalPrice: 0,
    }
  }

  let totalRuns = 0
  if (frequency === "daily") {
    totalRuns = days
  } else if (frequency === "weekly") {
    // Use Math.ceil to count partial weeks, minimum 1 run
    totalRuns = Math.max(1, Math.ceil(days / 7))
  } else if (frequency === "monthly") {
    // Use Math.ceil to count partial months, minimum 1 run
    totalRuns = Math.max(1, Math.ceil(days / 30))
  }

  // Calculate total credits based on each slot's configuration
  let totalCreditsSum = 0
  let totalPostsCount = 0

  scheduledTimes.forEach((slot) => {
    const runsForThisSlot = totalRuns
    totalPostsCount += runsForThisSlot

    const creditsPerRun = calculateSlotCredits(slot)
    totalCreditsSum += creditsPerRun * runsForThisSlot
  })

  const avgCreditsPerPost =
    totalPostsCount > 0 ? Math.ceil(totalCreditsSum / totalPostsCount) : 0

  // Calculate EUR price based on credits - keep decimal precision
  // EUR per credit = creditsPrice / 1000
  const eurPerCredit = creditsPrice / 1000
  const priceInEur = totalCreditsSum * eurPerCredit

  return {
    totalPosts: totalPostsCount,
    creditsPerPost: avgCreditsPerPost,
    totalCredits: totalCreditsSum,
    totalPrice: Math.round(priceInEur), // Return in cents (not EUR)
  }
}

// Helper: Format credits for display
export function formatCredits(credits: number): string {
  if (credits === 0) return "Free"
  if (credits < 10) return `${credits} credits`
  if (credits < 1000) return `${credits} credits`
  if (credits < 10000) return `${(credits / 1000).toFixed(1)}K credits`
  return `${(credits / 1000).toFixed(0)}K credits`
}

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
