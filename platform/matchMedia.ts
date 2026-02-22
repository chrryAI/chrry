/**
 * matchMedia for web - just use the native browser API
 */

export const matchMedia = (query: string) => {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia(query)
  }
  // Fallback for SSR
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  }
}
