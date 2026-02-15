/**
 * Simple redaction utility for client-side usage.
 * Replaces email addresses and phone numbers with [REDACTED].
 */
export const simpleRedact = (text: string): string => {
  // Guard against ReDoS attacks with extremely long inputs
  // Guard against ReDoS attacks with extremely long inputs
  const SAFE_LENGTH_LIMIT = 50000
  const isTooLong = text.length > SAFE_LENGTH_LIMIT

  const textToProcess = isTooLong ? text.substring(0, SAFE_LENGTH_LIMIT) : text
  const remainingText = isTooLong ? text.substring(SAFE_LENGTH_LIMIT) : ""

  // Redact Emails
  // ReDoS-safe regex: allows subdomains and longer TLDs without backtracking
  // Matches: user@subdomain.domain.tld (supports dots in domain, any TLD length)
  const redactedEmails = textToProcess.replace(
    /\b[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g,
    "[REDACTED]",
  )

  // Redact Phone Numbers
  // Basic regex to catch common formats like:
  // (123) 456-7890
  // 123-456-7890
  // 123 456 7890
  // +1 123 456 7890
  const redactedPhones = redactedEmails.replace(
    /(?:\+?\d{1,3}[ -]?)?\(?\d{3}\)?[ -]?\d{3}[ -]?\d{4}/g,
    "[REDACTED]",
  )

  return redactedPhones + remainingText
}
