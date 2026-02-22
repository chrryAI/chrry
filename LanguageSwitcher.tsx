"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useAppContext } from "./context/AppContext"
import { useAuth } from "./context/providers"
import { useStyles } from "./context/StylesContext"
import { Languages } from "./icons"
import { useLanguageSwitcherStyles } from "./LanguageSwitcher.styles"
import { LANGUAGES, type locale } from "./locales"
import Modal from "./Modal"
import { Button, Div } from "./platform"
import { apiFetch } from "./utils"
import { ANALYTICS_EVENTS } from "./utils/analyticsEvents"

const LanguageSwitcher = ({
  style,
}: {
  style?: React.CSSProperties
  handleSetLanguage?: (path: string, language: locale) => void
}) => {
  const { t } = useAppContext()
  const styles = useLanguageSwitcherStyles()

  const { utilities } = useStyles()

  const { language, setLanguage, user, token, plausible, API_URL } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  const changeLanguage = (newLocale: locale) => {
    plausible({
      name: ANALYTICS_EVENTS.LANGUAGE_SWITCHER,
      props: {
        language: newLocale,
      },
    })
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
        isModalOpen={isModalOpen}
        title={
          <>
            <Languages size={18} /> {t("Language")}
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
          {LANGUAGES.map((item) => (
            <Button
              key={item.code}
              style={{
                ...utilities.link.style,
                ...styles.languageButton.style,
                color: item.code === language ? "var(--shade-8)" : "",
              }}
              onClick={() => changeLanguage(item.code)}
              className={"link"}
            >
              {item.name}
            </Button>
          ))}
        </Div>
      </Modal>
    </>
  )
}

export default LanguageSwitcher
