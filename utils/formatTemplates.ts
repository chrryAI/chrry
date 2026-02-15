export interface TemplateContext {
  weather?: string
  city?: string
  country?: string
  temperature?: string
  temp?: string
  time?: string
  date?: string
  flag?: string
  location?: string
  weatherEmoji?: string
  timeOfDay?: string
  hour?: string | number
  [key: string]: string | number | undefined
}

/**
 * Format message templates by replacing {{variable}} patterns with actual values
 * @param content - The markdown content with template variables
 * @param context - Object containing variable values
 * @returns Formatted content with variables replaced
 */
export function formatMessageTemplates(
  content: string,
  context: TemplateContext,
): string {
  if (!content) return content

  // Replace all {{variable}} patterns
  return content.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
    const value = context[variable]

    // If value exists, use it; otherwise keep the template
    return value !== undefined ? String(value) : match
  })
}

/**
 * Get current template context with weather, location, time, etc.
 * @param userCity - User's city (optional)
 * @param userWeather - Current weather (optional)
 * @param locale - User's locale for date/time formatting (default: 'en-US')
 * @returns Template context object
 */
export function getCurrentTemplateContext(
  userCity?: string,
  userWeather?: string,
  locale: string = "en-US",
): TemplateContext {
  const now = new Date()

  return {
    city: userCity,
    weather: userWeather,
    time: now.toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    date: now.toLocaleDateString(locale, {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
  }
}
