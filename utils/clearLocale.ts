import { type locale, locales } from "../locales"

export const cleanSlug = (slug: string) => {
  // Remove trailing slashes safely without regex
  while (slug.endsWith("/")) {
    slug = slug.slice(0, -1)
  }
  return slug
}

const clearLocale = (url: string) => {
  // Handle full URLs (with protocol and domain) vs paths
  const hasProtocol = url.includes("://")

  if (hasProtocol) {
    // Extract protocol
    const protocol = url.startsWith("https://") ? "https://" : "http://"
    // Remove protocol to get domain + path
    const withoutProtocol = url.replace(protocol, "")
    // Split by first slash to separate domain from path
    const firstSlashIndex = withoutProtocol.indexOf("/")

    if (firstSlashIndex === -1) {
      // No path, just domain
      return url
    }

    const domain = withoutProtocol.substring(0, firstSlashIndex)
    const path = withoutProtocol.substring(firstSlashIndex + 1) // Remove leading slash

    if (!path) {
      // Empty path
      return `${protocol}${domain}`
    }

    // Check if path starts with a locale
    const pathSegments = path.split("/")
    if (pathSegments[0] && locales.includes(pathSegments[0] as locale)) {
      // Remove locale from path
      const remaining = pathSegments.slice(1).join("/")
      return `${protocol}${domain}${remaining ? `/${remaining}` : ""}`
    }

    return url
  } else {
    // Handle relative paths
    const cleanUrl = url.startsWith("/") ? url.slice(1) : url
    const parts = cleanUrl.split("/")

    // Check if first part is a locale
    if (locales.includes(parts[0] as locale)) {
      // Remove locale and return remaining path
      const remaining = parts.slice(1).join("/")
      return remaining ? `/${remaining}` : ""
    }

    return cleanSlug(url)
  }
}

export default clearLocale
