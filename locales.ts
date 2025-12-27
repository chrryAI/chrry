export const defaultLocale = "en"

export type locale =
  | "en"
  | "de"
  | "es"
  | "fr"
  | "ja"
  | "ko"
  | "pt"
  | "zh"
  | "nl"
  | "tr"

export const locales: locale[] = [
  "en",
  "de",
  "es",
  "fr",
  "ja",
  "ko",
  "pt",
  "zh",
  "nl",
  "tr",
]

export const LANGUAGES = [
  { code: "de", name: "Deutsch" },
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "ja", name: "日本語" },
  { code: "ko", name: "한국어" },
  { code: "pt", name: "Português" },
  { code: "zh", name: "中文" },
  { code: "nl", name: "Nederlands" },
  { code: "tr", name: "Türkçe" },
] as const

export const defaultCountry = "NL"

export const countries = ["NL"]

export const localeToCountry = {
  en: "NL",
  de: "DE",
  es: "ES",
  fr: "FR",
  ja: "JP",
  ko: "KR",
  pt: "PT",
  zh: "CN",
  nl: "NL",
  tr: "TR",
}

export const defaultCountries = {
  en: "NL",
  de: "DE",
  es: "ES",
  fr: "FR",
  ja: "JP",
  ko: "KR",
  pt: "PT",
  zh: "CN",
  nl: "NL",
  tr: "TR",
}

export const defaultLanguages = {
  NL: "nl",
  DE: "de",
  ES: "es",
  FR: "fr",
  JA: "ja",
  KO: "ko",
  PT: "pt",
  ZH: "zh",
  TR: "tr",
  EN: "en",
}
