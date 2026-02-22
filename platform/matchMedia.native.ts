/**
 * matchMedia polyfill for React Native
 * Returns a mock that always returns false for prefers-reduced-motion
 */

export const matchMedia = (query: string) => {
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

// Polyfill window.matchMedia if it doesn't exist
if (typeof window !== "undefined" && !window.matchMedia) {
  ;(window as any).matchMedia = matchMedia
}
