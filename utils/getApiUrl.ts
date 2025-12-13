/**
 * Get the appropriate API URL based on execution context
 * - Client-side (browser/extension): Use public URL through Cloudflare
 * - Server-side (SSR/API): Use internal localhost URL to avoid round-trip
 */
export function getApiUrl(options?: { forcePublic?: boolean }): string {
  const isServer = typeof window === "undefined"

  // Force public URL (for OAuth callbacks that need to be publicly accessible)
  if (options?.forcePublic) {
    return (
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.API_URL ||
      "https://chrry.dev/api"
    )
  }

  // Server-side: use internal URL to avoid Cloudflare round-trip
  if (isServer) {
    return (
      process.env.INTERNAL_API_URL ||
      process.env.API_URL ||
      "http://localhost:3001/api"
    )
  }

  // Client-side: use public URL
  return process.env.NEXT_PUBLIC_API_URL || "https://chrry.dev/api"
}

/**
 * Get the full API URL for a specific endpoint
 */
export function getApiEndpoint(
  path: string,
  options?: { forcePublic?: boolean },
): string {
  const baseUrl = getApiUrl(options)
  const cleanPath = path.startsWith("/") ? path.slice(1) : path
  return `${baseUrl}/${cleanPath}`
}
