import { Metadata } from "next"
import { thread } from "../types"
import { t as tFunc } from "./t"
import { locale } from "../locales"

/**
 * Generate dynamic metadata for a thread page
 *
 * @example
 * ```typescript
 * export async function generateMetadata({ params }) {
 *   const thread = await getThread({ id: params.threadId })
 *   return generateThreadMetadata({ thread, locale: params.locale, currentDomain })
 * }
 * ```
 */
export function generateThreadMetadata({
  thread,
  locale = "en",
  currentDomain,
  translations,
}: {
  thread: thread
  locale?: locale | string
  currentDomain: string
  translations: Record<string, any>
}): Metadata {
  const threadTitle = thread.title?.substring(0, 120) || "Thread"

  // Get translation for thread description
  const descriptions: Record<string, string> = {
    en: "Thread for Vex AI Assistant",
    de: "Thread für den Vex KI-Assistenten",
    fr: "Thread pour l'assistant IA Vex",
    ja: "Vex AIアシスタントのスレッド",
    ko: "Vex AI 어시스턴트의 스레드",
    pt: "Thread para o Assistente de IA Vex",
    es: "Thread del Asistente de IA Vex",
    zh: "Vex AI助手的线程",
    nl: "Thread voor de Vex AI-assistent",
    tr: "Vex AI Asistanı için konu",
  }

  const title = `${threadTitle} | Vex`
  const description = descriptions[locale as string] || descriptions.en

  const baseUrl = currentDomain
  const canonicalUrl = `${baseUrl}/threads/${thread.id}`

  const t = (key: string) => {
    return tFunc(translations)(key)
  }

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      type: "article",
      url: canonicalUrl,
      locale: locale as string,
    },
    twitter: {
      card: "summary",
      title: title,
      description: description,
    },
    alternates: {
      canonical: canonicalUrl,
      languages: {
        "x-default": canonicalUrl,
        en: canonicalUrl,
        de: `${baseUrl}/de/threads/${thread.id}`,
        fr: `${baseUrl}/fr/threads/${thread.id}`,
        es: `${baseUrl}/es/threads/${thread.id}`,
        ja: `${baseUrl}/ja/threads/${thread.id}`,
        ko: `${baseUrl}/ko/threads/${thread.id}`,
        pt: `${baseUrl}/pt/threads/${thread.id}`,
        zh: `${baseUrl}/zh/threads/${thread.id}`,
        nl: `${baseUrl}/nl/threads/${thread.id}`,
        tr: `${baseUrl}/tr/threads/${thread.id}`,
      },
    },
  }
}
