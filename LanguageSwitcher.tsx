"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useAppContext } from "./context/AppContext"
import { useAuth, useNavigationContext } from "./context/providers"
import { useStyles } from "./context/StylesContext"
import { CircleCheck, Languages } from "./icons"
import { useLanguageSwitcherStyles } from "./LanguageSwitcher.styles"
import { LANGUAGES, type locale, locales } from "./locales"
import Modal from "./Modal"
import { Button, Div, toast } from "./platform"
import { apiFetch } from "./utils"
import { ANALYTICS_EVENTS } from "./utils/analyticsEvents"

const LanguageSwitcher = ({
  style,
  children,
  languages = locales,
  isModalOpen: _isModalOpen,
  handleSetLanguages,
  handleSetLanguage,
  onOpenChange,
  hideLanguages,
  attachTo,
  hideOnClickOutside = true,
  maxLanguages = 4,
  ...props
}: {
  multi?: boolean
  languages?: locale[]
  children?: React.ReactNode
  style?: React.CSSProperties
  isModalOpen?: boolean
  title?: string
  selected?: locale
  onOpenChange?: (open: boolean) => void
  handleSetLanguage?: (language: locale) => void
  handleSetLanguages?: (languages: locale[]) => void
  hideLanguages?: locale
  attachTo?: string
  hideOnClickOutside?: boolean
  maxLanguages?: number
}) => {
  const { t } = useAppContext()
  const styles = useLanguageSwitcherStyles()

  const { utilities } = useStyles()

  const {
    language,
    setLanguage,
    user,
    token,
    plausible,
    API_URL,
    languageModal,
    setLanguageModal,
  } = useAuth()

  const { searchParams, removeParams } = useNavigationContext()

  const multi = props.multi && !languageModal

  const selectedInitial = (
    props.selected ? [props.selected] : languages.length ? languages : ["en"]
  ) as locale[]

  const [selected, setSelected] = useState<locale[]>(selectedInitial)

  const isModalOpenFromUrl = multi
    ? false
    : searchParams.get("language") === "true"
  const [isModalOpen, setIsModalOpenInternal] = useState<boolean>(
    isModalOpenFromUrl ? true : (_isModalOpen ?? false),
  )

  const setIsModalOpen = (value: boolean) => {
    setIsModalOpenInternal(value)
    !value && setLanguageModal(undefined)
    onOpenChange?.(value)
  }

  useEffect(() => {
    if (_isModalOpen !== undefined) setIsModalOpen(_isModalOpen)
    if (isModalOpenFromUrl) setIsModalOpen(true)
  }, [_isModalOpen, isModalOpenFromUrl])

  useEffect(() => {
    if (!isModalOpen && isModalOpenFromUrl) removeParams(["language"])
  }, [isModalOpen, isModalOpenFromUrl])

  useEffect(() => {
    if (languageModal !== undefined) setIsModalOpen(true)
  }, [languageModal])

  const changeLanguage = (newLocale: locale) => {
    const result = selected.includes(newLocale)
      ? selected.filter((l) => l !== newLocale)
      : selected.concat(newLocale)

    const r = multi ? result : [newLocale]

    if (r.length > maxLanguages) {
      toast.error(
        t("You can select up to {{maxLanguages}} languages on each batch", {
          maxLanguages,
        }),
      )
      return
    }

    setSelected(multi ? result : [newLocale])

    if (handleSetLanguages || handleSetLanguage) {
      handleSetLanguages?.(r)
      handleSetLanguage?.(newLocale)

      return
    }

    plausible({
      name: ANALYTICS_EVENTS.LANGUAGE_SWITCHER,
      props: {
        language: newLocale,
      },
    })
    if (multi) return

    setLanguage(newLocale)
    setIsModalOpen(false)
  }

  useEffect(() => {
    if (user && user.language !== language && token) {
      ;(async () => {
        const _result = await apiFetch(`${API_URL}/user`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...user, language }),
        })
      })()
    }
  }, [user, language, token])

  return (
    <>
      <Button
        className="link"
        style={{ ...utilities.link.style, ...style }}
        onClick={() => {
          setIsModalOpen(true)
        }}
      >
        <Languages size={18} />
      </Button>
      <Modal
        hideOnClickOutside={hideOnClickOutside}
        isModalOpen={isModalOpen}
        title={
          <>
            <Languages size={18} />{" "}
            {t(props.title || languageModal || "Language")}
          </>
        }
        hasCloseButton
        onToggle={(open) => {
          setIsModalOpen(open)
        }}
        event={{
          name: "language_switcher",
        }}
      >
        <Div style={styles.languages.style}>
          {!hideLanguages &&
            LANGUAGES.map((item) => (
              <Button
                disabled={multi ? item.code === "en" : undefined}
                key={item.code}
                style={{
                  ...utilities.link.style,
                  ...styles.languageButton.style,
                  color: multi
                    ? selected.includes(item.code)
                      ? "var(--accent-1)"
                      : languages.includes(item.code as locale)
                        ? "var(--accent-4)"
                        : item.code === language ||
                            selected[selected.length - 1] === item.code
                          ? "var(--shade-8)"
                          : ""
                    : item.code === language
                      ? "var(--shade-8)"
                      : "",
                }}
                onClick={() => changeLanguage(item.code)}
                className={"link"}
              >
                {multi && selected.includes(item.code) && (
                  <CircleCheck size={18} />
                )}
                {item.name}
              </Button>
            ))}
        </Div>
        {children}
      </Modal>
    </>
  )
}

export default LanguageSwitcher
