// Client-side token estimation for multilingual support
// Lightweight approximation without external dependencies

import { taskAnalysis } from "../types"

// Approximate token counting for different languages
export function estimateTokens(text: string): number {
  if (!text) return 0

  // Different languages have different token densities
  const hasAsianChars =
    /[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/.test(text)
  const hasArabicChars = /[\u0600-\u06ff\u0750-\u077f]/.test(text)

  if (hasAsianChars) {
    // Chinese/Japanese/Korean: ~1 token per character
    return Math.ceil(text.length * 1.2)
  } else if (hasArabicChars) {
    // Arabic: ~1 token per 2-3 characters
    return Math.ceil(text.length * 0.4)
  } else {
    // English/European: ~1 token per 4 characters (GPT-style)
    return Math.ceil(text.length / 4)
  }
}

// Detect task type from user input (multilingual)
export function detectTaskType(input: string): taskAnalysis {
  const lowerInput = input.toLowerCase()

  // Booking/reservation keywords (multilingual)
  const bookingKeywords = [
    // English
    "book",
    "reserve",
    "reservation",
    "table",
    "restaurant",
    "hotel",
    "flight",
    "appointment",
    "schedule",
    "booking",
    // Spanish
    "reservar",
    "reserva",
    "mesa",
    "restaurante",
    "hotel",
    "vuelo",
    "cita",
    // French
    "réserver",
    "réservation",
    "table",
    "restaurant",
    "hôtel",
    "vol",
    "rendez-vous",
    // German
    "buchen",
    "reservierung",
    "tisch",
    "restaurant",
    "hotel",
    "flug",
    "termin",
    // Japanese
    "予約",
    "よやく",
    "レストラン",
    "ホテル",
    "フライト",
    // Chinese
    "预订",
    "预约",
    "餐厅",
    "酒店",
    "航班",
    // Korean
    "예약",
    "레스토랑",
    "호텔",
    "항공편",
  ]

  // Automation/scraping keywords
  const automationKeywords = [
    // English
    "extract",
    "scrape",
    "collect",
    "gather",
    "find",
    "search",
    "get data",
    "automation",
    "click",
    "fill",
    "submit",
    "navigate",
    // Spanish
    "extraer",
    "recopilar",
    "buscar",
    "automatización",
    "hacer clic",
    "rellenar",
    // French
    "extraire",
    "collecter",
    "chercher",
    "automatisation",
    "cliquer",
    "remplir",
    // German
    "extrahieren",
    "sammeln",
    "suchen",
    "automatisierung",
    "klicken",
    "ausfüllen",
    // Japanese
    "抽出",
    "ちゅうしゅつ",
    "収集",
    "しゅうしゅう",
    "自動化",
    "じどうか",
    // Chinese
    "提取",
    "收集",
    "搜索",
    "自动化",
    "点击",
    "填写",
    // Korean
    "추출",
    "수집",
    "검색",
    "자동화",
    "클릭",
    "작성",
  ]

  // Summary keywords
  const summaryKeywords = [
    // English
    "summary",
    "summarize",
    "overview",
    "brief",
    "tldr",
    "quick",
    // Spanish
    "resumen",
    "resumir",
    "breve",
    "rápido",
    // French
    "résumé",
    "résumer",
    "bref",
    "rapide",
    // German
    "zusammenfassung",
    "zusammenfassen",
    "kurz",
    "schnell",
    // Japanese
    "要約",
    "ようやく",
    "概要",
    "がいよう",
    // Chinese
    "总结",
    "摘要",
    "概述",
    "简要",
    // Korean
    "요약",
    "개요",
    "간단히",
  ]

  const baseTokens = estimateTokens(input)

  // Check for booking patterns
  if (bookingKeywords.some((keyword) => lowerInput.includes(keyword))) {
    return {
      type: "booking",
      creditMultiplier: 3,
      estimatedTokens: baseTokens + 4000, // Add context tokens
      confidence: 0.8,
    }
  }

  // Check for automation patterns
  if (automationKeywords.some((keyword) => lowerInput.includes(keyword))) {
    return {
      type: "automation",
      creditMultiplier: 2,
      estimatedTokens: baseTokens + 2000,
      confidence: 0.7,
    }
  }

  // Check for summary patterns
  if (summaryKeywords.some((keyword) => lowerInput.includes(keyword))) {
    return {
      type: "summary",
      creditMultiplier: 2,
      estimatedTokens: baseTokens + 1500,
      confidence: 0.9,
    }
  }

  // Default to chat
  return {
    type: "chat",
    creditMultiplier: 1,
    estimatedTokens: baseTokens + 500,
    confidence: 0.5,
  }
}

// Main function to get complete task analysis
export function analyzeTaskAndEstimateCredits(input: string): {
  analysis: taskAnalysis
  creditMultiplier: number
  warningMessage?: string
} {
  const analysis = detectTaskType(input)

  let warningMessage: string | undefined

  if (analysis.type === "booking") {
    warningMessage =
      "Complex booking automation detected. This may use significant credits."
  } else if (analysis.type === "automation") {
    warningMessage =
      "Browser automation task detected. Higher credit usage expected."
  }

  return {
    analysis,
    creditMultiplier: analysis.creditMultiplier,
    warningMessage,
  }
}
