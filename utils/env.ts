/// <reference types="chrome" />

export const checkIsExtension = () => {
  if (typeof chrome !== "undefined" && chrome.runtime?.id) {
    return true
  }
  if (typeof browser !== "undefined" && (browser as any).runtime?.id) {
    return true
  }
  return false
}

export const getExtensionUrl = () => {
  if (typeof window === "undefined") return
  if (typeof chrome !== "undefined" && chrome.runtime?.getURL) {
    return chrome.runtime.getURL("index.html") // Chrome
  }
  if (typeof browser !== "undefined" && (browser as any).runtime?.getURL) {
    return (browser as any).runtime.getURL("index.html") // Firefox
  }
  return `${window.location.origin}/index.html` // Fallback
}

export const isProduction =
  process.env.NODE_ENV === "production" ||
  process.env.NEXT_PUBLIC_NODE_ENV === "production"

export const isDevelopment = checkIsExtension()
  ? ["bikahnjnakdnnccpnmcpmiojnehfooio"].some((id) =>
      getExtensionUrl()?.includes(id),
    )
  : !isProduction

export const isTestingDevice = false && isDevelopment
