/**
 * Regional endpoint detection and routing
 * Automatically routes users to the closest server for optimal performance
 */

export type Region =
  | "us"
  | "eu"
  | "asia"
  | "oceania"
  | "africa"
  | "south-america"

interface RegionalEndpoints {
  api: string
  ws: string
  frontend: string
}

// Regional endpoint configuration
const REGIONAL_ENDPOINTS: Record<Region, RegionalEndpoints> = {
  us: {
    api: "https://us-api.askvex.com/api",
    ws: "wss://us-ws.askvex.com",
    frontend: "https://us.askvex.com",
  },
  eu: {
    api: "https://eu-api.askvex.com/api",
    ws: "wss://eu-ws.askvex.com",
    frontend: "https://eu.askvex.com",
  },
  asia: {
    api: "https://asia-api.askvex.com/api",
    ws: "wss://asia-ws.askvex.com",
    frontend: "https://asia.chrry.dev",
  },
  oceania: {
    api: "https://oceania-api.askvex.com/api",
    ws: "wss://oceania-ws.askvex.com",
    frontend: "https://oceania.chrry.dev",
  },
  africa: {
    api: "https://africa-api.askvex.com/api",
    ws: "wss://africa-ws.askvex.com",
    frontend: "https://africa.chrry.dev",
  },
  "south-america": {
    api: "https://sa-api.askvex.com/api",
    ws: "wss://sa-ws.askvex.com",
    frontend: "https://sa.chrry.dev",
  },
}

// Timezone to region mapping
const TIMEZONE_TO_REGION: Record<string, Region> = {
  // Americas
  "America/New_York": "us",
  "America/Chicago": "us",
  "America/Denver": "us",
  "America/Los_Angeles": "us",
  "America/Toronto": "us",
  "America/Sao_Paulo": "south-america",
  "America/Buenos_Aires": "south-america",
  "America/Mexico_City": "us",

  // Europe
  "Europe/London": "eu",
  "Europe/Paris": "eu",
  "Europe/Berlin": "eu",
  "Europe/Madrid": "eu",
  "Europe/Rome": "eu",
  "Europe/Amsterdam": "eu",
  "Europe/Stockholm": "eu",
  "Europe/Moscow": "eu",

  // Asia
  "Asia/Tokyo": "asia",
  "Asia/Shanghai": "asia",
  "Asia/Hong_Kong": "asia",
  "Asia/Singapore": "asia",
  "Asia/Seoul": "asia",
  "Asia/Bangkok": "asia",
  "Asia/Dubai": "asia",
  "Asia/Kolkata": "asia",

  // Oceania
  "Australia/Sydney": "oceania",
  "Australia/Melbourne": "oceania",
  "Pacific/Auckland": "oceania",

  // Africa
  "Africa/Cairo": "africa",
  "Africa/Johannesburg": "africa",
  "Africa/Lagos": "africa",
}

/**
 * Detect user's region based on timezone
 */
export function detectUserRegion(): Region {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    return TIMEZONE_TO_REGION[timezone] || "us" // Default to US
  } catch {
    return "us"
  }
}

/**
 * Detect user's region using Geolocation API (more accurate but requires permission)
 */
export async function detectUserRegionByGeo(): Promise<Region> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(detectUserRegion()) // Fallback to timezone
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords

        // Simple region detection based on coordinates
        // North America
        if (
          latitude > 15 &&
          latitude < 72 &&
          longitude > -168 &&
          longitude < -52
        ) {
          resolve("us")
        }
        // Europe
        else if (
          latitude > 35 &&
          latitude < 71 &&
          longitude > -10 &&
          longitude < 40
        ) {
          resolve("eu")
        }
        // Asia
        else if (
          latitude > -10 &&
          latitude < 55 &&
          longitude > 60 &&
          longitude < 150
        ) {
          resolve("asia")
        }
        // Oceania
        else if (
          latitude > -47 &&
          latitude < -10 &&
          longitude > 110 &&
          longitude < 180
        ) {
          resolve("oceania")
        }
        // Africa
        else if (
          latitude > -35 &&
          latitude < 37 &&
          longitude > -20 &&
          longitude < 52
        ) {
          resolve("africa")
        }
        // South America
        else if (
          latitude > -56 &&
          latitude < 13 &&
          longitude > -82 &&
          longitude < -34
        ) {
          resolve("south-america")
        }
        // Default
        else {
          resolve("us")
        }
      },
      () => {
        resolve(detectUserRegion()) // Fallback to timezone on error
      },
      { timeout: 5000 },
    )
  })
}

/**
 * Get regional endpoints for a specific region
 */
export function getRegionalEndpoints(region: Region): RegionalEndpoints {
  return REGIONAL_ENDPOINTS[region]
}

/**
 * Detect user's region using IP-based geolocation (most accurate)
 * Uses a free IP geolocation API
 */
export async function detectUserRegionByIP(): Promise<Region> {
  try {
    const response = await fetch("https://ipapi.co/json/")
    const data = await response.json()
    const countryCode = data.country_code

    // Map country codes to regions
    const countryToRegion: Record<string, Region> = {
      // North America
      US: "us",
      CA: "us",
      MX: "us",

      // Europe
      GB: "eu",
      FR: "eu",
      DE: "eu",
      IT: "eu",
      ES: "eu",
      NL: "eu",
      SE: "eu",
      NO: "eu",
      DK: "eu",
      FI: "eu",
      PL: "eu",
      RU: "eu",

      // Asia
      CN: "asia",
      JP: "asia",
      KR: "asia",
      IN: "asia",
      SG: "asia",
      TH: "asia",
      VN: "asia",
      ID: "asia",
      MY: "asia",
      PH: "asia",

      // Oceania
      AU: "oceania",
      NZ: "oceania",

      // Africa
      ZA: "africa",
      EG: "africa",
      NG: "africa",
      KE: "africa",

      // South America
      BR: "south-america",
      AR: "south-america",
      CL: "south-america",
      CO: "south-america",
      PE: "south-america",
    }

    return countryToRegion[countryCode] || "us"
  } catch {
    return detectUserRegion() // Fallback to timezone
  }
}

/**
 * Auto-configure regional endpoints based on user location
 * Returns the best endpoints for the user
 */
export async function autoConfigureRegionalEndpoints(): Promise<RegionalEndpoints> {
  // Try IP-based detection first (most accurate)
  const region = await detectUserRegionByIP()
  return getRegionalEndpoints(region)
}

/**
 * Measure latency to different regional endpoints
 * Returns the fastest endpoint
 */
export async function findFastestEndpoint(): Promise<Region> {
  const regions: Region[] = [
    "us",
    "eu",
    "asia",
    "oceania",
    "africa",
    "south-america",
  ]
  const latencies: Record<Region, number> = {} as any

  await Promise.all(
    regions.map(async (region) => {
      const endpoint = REGIONAL_ENDPOINTS[region].api
      const start = performance.now()

      try {
        await fetch(`${endpoint}/health`, {
          method: "HEAD",
          signal: AbortSignal.timeout(5000),
        })
        latencies[region] = performance.now() - start
      } catch {
        latencies[region] = Infinity // Endpoint unreachable
      }
    }),
  )

  // Find region with lowest latency
  let fastestRegion: Region = "us"
  let lowestLatency = Infinity

  for (const [region, latency] of Object.entries(latencies)) {
    if (latency < lowestLatency) {
      lowestLatency = latency
      fastestRegion = region as Region
    }
  }

  return fastestRegion
}
