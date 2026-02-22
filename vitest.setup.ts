// Polyfill crypto if needed (happy-dom usually provides it, but just in case)
if (!globalThis.crypto) {
  // Try to use node crypto webcrypto if available
  try {
    const { webcrypto } = require("node:crypto")
    globalThis.crypto = webcrypto as any
  } catch (_e) {
    // console.warn('Failed to polyfill crypto', e)
  }
}
