import { appWithStore } from "../types"
import { whiteLabels } from "./siteConfig"

const getWhiteLabel = ({ app }: { app?: appWithStore }) => {
  const whiteLabel = whiteLabels.find(
    (label) => label.storeSlug === app?.store?.slug && label.isStoreApp,
  )

  const storeApp = whiteLabel
    ? app?.store?.apps.find(
        (a) =>
          a.slug === whiteLabel?.slug &&
          a.store?.slug === whiteLabel?.storeSlug,
      )
    : undefined

  return { storeApp, whiteLabel }
}

export default getWhiteLabel
