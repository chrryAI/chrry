/**
 * Decodes HTML entities in a string
 * Handles common entities like &amp;, &lt;, &gt;, &quot;, &#39;, etc.
 */
export function decodeHtmlEntities(text: string): string {
  if (typeof text !== "string") return text

  // Create a temporary element to leverage browser's built-in HTML decoding
  if (typeof document !== "undefined") {
    const textarea = document.createElement("textarea")
    textarea.innerHTML = text
    return textarea.value
  }

  // Fallback for non-browser environments (SSR, Node.js)
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&amp;/g, "&")
}
