import { user, guest } from "../types"

export const SPEECH_LIMITS = {
  GUEST: {
    REQUESTS_PER_HOUR: 5,
    REQUESTS_PER_DAY: 50,
    CHARACTERS_PER_DAY: 2500, // ~10-12 sentences
    VOICE_TYPE: "elevenlabs_basic",
  },
  USER: {
    REQUESTS_PER_HOUR: 20,
    REQUESTS_PER_DAY: 200,
    CHARACTERS_PER_DAY: 10000, // ~40-50 sentences
    // CHARACTERS_PER_DAY: 10000, // ~40-50 sentences
    VOICE_TYPE: "elevenlabs_basic",
  },
  SUBSCRIBER: {
    REQUESTS_PER_HOUR: -1, // unlimited
    REQUESTS_PER_DAY: -1, // unlimited
    CHARACTERS_PER_DAY: -1, // unlimited
    VOICE_TYPE: "elevenlabs_premium",
  },
} as const

export type UserType = "GUEST" | "USER" | "SUBSCRIBER"

export function getSpeechLimits(userType: UserType) {
  return SPEECH_LIMITS[userType]
}

export function checkSpeechLimits({
  user,
  guest,
  textLength,
}: {
  user?: user
  guest?: guest
  textLength: number
}) {
  if (!user && !guest) {
    return { allowed: false, reason: "Unauthorized" }
  }

  const currentUser = user || guest
  const userType: UserType = currentUser?.subscription
    ? "SUBSCRIBER"
    : user
      ? "USER"
      : "GUEST"
  const limits = getSpeechLimits(userType)

  const requestsToday = currentUser?.speechRequestsToday || 0
  const requestsThisHour = currentUser?.speechRequestsThisHour || 0
  const charactersToday = currentUser?.speechCharactersToday || 0

  // Check hourly request limit
  if (
    limits.REQUESTS_PER_HOUR !== -1 &&
    requestsThisHour >= limits.REQUESTS_PER_HOUR
  ) {
    return {
      allowed: false,
      reason: `Hourly limit reached`,
    }
  }

  // Check daily request limit (using requestsToday)
  if (
    limits.REQUESTS_PER_DAY !== -1 &&
    requestsToday >= limits.REQUESTS_PER_DAY
  ) {
    return {
      allowed: false,
      reason: `Daily request limit reached (${limits.REQUESTS_PER_DAY} requests/day)`,
    }
  }

  // Check daily character limit
  if (
    limits.CHARACTERS_PER_DAY !== -1 &&
    charactersToday + textLength > limits.CHARACTERS_PER_DAY
  ) {
    return {
      allowed: false,
      reason: `Daily character limit reached (${limits.CHARACTERS_PER_DAY} chars/day)`,
    }
  }

  return { allowed: true }
}
