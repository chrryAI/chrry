import { type locale, locales } from "../locales"
import type { appWithStore } from "../types"

const getAppSlug = ({
  targetApp,
  defaultSlug = "",
  pathname = "/",
  baseApp,
}: {
  targetApp: appWithStore
  defaultSlug?: string
  pathname: string
  baseApp?: appWithStore
}): string => {
  // Extract locale from pathname using split (more performant than multiple string comparisons)
  const pathParts = pathname.split("/").filter(Boolean) // ['tr', 'vex', ...] or ['vex', ...]
  const firstPart = pathParts[0]
  const localeMatch = locales.includes(firstPart as locale) ? firstPart : null

  const localePrefix = localeMatch ? `/${localeMatch}` : ""

  let computedSlug = defaultSlug

  if (targetApp) {
    if (targetApp.id === baseApp?.id) {
      computedSlug = defaultSlug
    } else if (
      targetApp.store?.slug === baseApp?.store?.slug ||
      baseApp?.store?.apps?.some((app) => app.slug === targetApp.slug)
    ) {
      // Same store: just use the app slug
      computedSlug = `/${targetApp.slug}`
    } else {
      // Different store: include store slug
      computedSlug = `/${targetApp.store?.slug}/${targetApp.slug}`
    }
  }

  if (localePrefix) {
    if (!computedSlug || computedSlug === "/") {
      return localePrefix || "/"
    }

    if (
      computedSlug === localePrefix ||
      computedSlug.startsWith(`${localePrefix}/`)
    ) {
      return computedSlug
    }

    if (computedSlug.startsWith("/")) {
      return `${localePrefix}${computedSlug}`
    }

    return `${localePrefix}/${computedSlug}`
  }

  return computedSlug || defaultSlug
}

export default getAppSlug
