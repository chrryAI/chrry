import TimeAgo from "javascript-time-ago"
import de from "javascript-time-ago/locale/de"
import en from "javascript-time-ago/locale/en"
import es from "javascript-time-ago/locale/es"
import fr from "javascript-time-ago/locale/fr"
import ja from "javascript-time-ago/locale/ja"
import ko from "javascript-time-ago/locale/ko"
import pt from "javascript-time-ago/locale/pt"
import zh from "javascript-time-ago/locale/zh"

TimeAgo.addLocale(en)
TimeAgo.addLocale(ja)
TimeAgo.addLocale(es)
TimeAgo.addLocale(pt)
TimeAgo.addLocale(fr)
TimeAgo.addLocale(ko)
TimeAgo.addLocale(de)
TimeAgo.addLocale(zh)

// Cache TimeAgo instances to avoid expensive recreation
const timeAgoCache = new Map<string, TimeAgo>()

function timeAgo(input: string | Date, locale = "en-US") {
  let ago = timeAgoCache.get(locale)
  if (!ago) {
    ago = new TimeAgo(locale)
    timeAgoCache.set(locale, ago)
  }

  const date = input instanceof Date ? input : new Date(input)
  return ago.format(date)
}

export default timeAgo
