"use client"

import { useState } from "react"
import { useAppContext } from "./context/AppContext"
import { useAuth, useChat, useNavigationContext } from "./context/providers"
import { useTribe } from "./context/providers/TribeProvider"
import { useStyles } from "./context/StylesContext"
import { Coins, OpenAI } from "./icons"
import LanguageSwitcher from "./LanguageSwitcher"
import Loading from "./Loading"
import type { locale } from "./locales"
import { Button, Div } from "./platform"
import { calculateTranslationCredits } from "./utils"

interface TribeTranslatePostProps {
  type: "post"
  id: string
  appName: string
  contentLength: number
  /** Languages the post already has translations for */
  existingLanguages?: locale[]
  /** After success, navigate to the post detail page */
  onSuccessNavigate?: (language: locale) => void
}

interface TribeTranslateCommentProps {
  type: "comment"
  id: string
  appName: string
  contentLength: number
  existingLanguages?: locale[]
  onSuccessNavigate?: (language: locale) => void
}

type TribeTranslateProps = (
  | TribeTranslatePostProps
  | TribeTranslateCommentProps
) & {
  isModalOpen?: boolean
  onOpenChange?: (open: boolean) => void
  style?: React.CSSProperties
}

/**
 * Reusable translation widget for Tribe posts and comments.
 *
 * - Opens LanguageSwitcher in multi-select mode so the owner picks target languages.
 * - Shows a cost breakdown (credits) and a Translate button.
 * - On success shows a "Translated by ChatGPT" banner and (for posts) a "Go to post" button.
 * - Works identically inside Tribe.tsx (feed) and TribePost.tsx (detail page).
 */
export default function TribeTranslate({
  type,
  id,
  appName,
  contentLength,
  existingLanguages,
  onSuccessNavigate,
  isModalOpen: _isModalOpen,
  onOpenChange,
  style,
}: TribeTranslateProps) {
  const { t } = useAppContext()
  const { utilities } = useStyles()
  const { language } = useAuth()
  const { creditsLeft } = useChat()
  const { addParams, push } = useNavigationContext()

  const { translatePost, translateComment, isTranslating } = useTribe()

  // ── state ──────────────────────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(_isModalOpen ?? false)
  const [selectedLanguages, setSelectedLanguages] = useState<locale[]>([])
  /** Set after a successful translation — triggers the success banner */
  const [translatedLanguage, setTranslatedLanguage] = useState<
    locale | undefined
  >(undefined)

  const handleOpenChange = (open: boolean) => {
    setIsModalOpen(open)
    onOpenChange?.(open)
  }

  // Languages the user added that didn't already exist
  const changes = selectedLanguages.filter(
    (l) => !(existingLanguages ?? []).includes(l),
  )

  const totalCredits =
    calculateTranslationCredits({ contentLength }) * changes.length

  // ── handlers ───────────────────────────────────────────────────────────────
  const handleTranslate = async () => {
    if (totalCredits && (creditsLeft || 0) < totalCredits) {
      addParams({ subscribe: true, plan: "credits" })
      return
    }

    if (type === "post") {
      await translatePost({ id, changes })
    } else {
      await translateComment({ id, changes })
    }

    if (onSuccessNavigate) {
      onSuccessNavigate(language)
      handleOpenChange(false)
      return
    }

    setTranslatedLanguage(language)
  }

  const handleGoToPost = (language: locale) => {
    handleOpenChange(false)

    setTimeout(() => {
      push(`/p/${id}?language=true`)
    }, 200)
  }

  const key = `${type}-${id}-language`

  return (
    <LanguageSwitcher
      style={style}
      key={key}
      attachTo={key}
      onOpenChange={handleOpenChange}
      hideOnClickOutside={false}
      isModalOpen={isModalOpen}
      handleSetLanguages={translatedLanguage ? undefined : setSelectedLanguages}
      handleSetLanguage={
        translatedLanguage
          ? () => {} /* no-op; handled via success button */
          : undefined
      }
      hideLanguages={translatedLanguage}
      multi
      languages={translatedLanguage ? undefined : existingLanguages}
      title={
        translatedLanguage
          ? "Success! Select a language to see the result"
          : undefined
      }
    >
      {totalCredits || translatedLanguage ? (
        <Div
          style={{
            marginTop: translatedLanguage ? 0 : "1.5rem",
            paddingTop: ".5rem",
            display: "flex",
            alignItems: "center",
            fontSize: "0.85rem",
            gap: ".5rem",
            flexWrap: "wrap",
            borderTop: translatedLanguage
              ? "none"
              : "1px dashed var(--shade-1)",
          }}
        >
          <OpenAI size={24} />
          {t(
            translatedLanguage
              ? "Translated by {{agent}}"
              : "{{appName}} post will be localized by {{agent}}",
            { appName, agent: "ChatGPT" },
          )}

          {/* ── success state: navigate to post ─────────────────────────── */}
          {translatedLanguage ? (
            <Button
              disabled={isTranslating}
              className="inverted"
              onClick={handleGoToPost}
              style={{ marginLeft: "auto", ...utilities.inverted.style }}
            >
              {type === "post" ? t("Go to your post") : t("Done")}
            </Button>
          ) : totalCredits ? (
            /* ── cost + translate button ─────────────────────────────────── */
            <Button
              disabled={isTranslating}
              className="inverted"
              onClick={handleTranslate}
              style={{ marginLeft: "auto", ...utilities.inverted.style }}
            >
              {isTranslating ? <Loading size={16} /> : <Coins size={16} />}
              {t("credits_other", { count: totalCredits })}
            </Button>
          ) : null}
        </Div>
      ) : null}
    </LanguageSwitcher>
  )
}
