import { locales } from "../locales"
import { appWithStore } from "../types"

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
  const localeMatch = locales.find((loc) => {
    return pathname === `/${loc}` || pathname.startsWith(`/${loc}/`)
  })

  const localePrefix = localeMatch ? `/${localeMatch}` : ""

  let computedSlug = defaultSlug

  if (targetApp) {
    if (targetApp.id === baseApp?.id) {
      computedSlug = defaultSlug
    } else if (targetApp.store?.slug === baseApp?.store?.slug) {
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
