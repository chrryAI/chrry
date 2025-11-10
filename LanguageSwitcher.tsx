"use client"

import React, { useEffect, useState } from "react"
import { Languages } from "./icons"
import Modal from "./Modal"
import styles from "./LanguageSwitcher.module.scss"
import clsx from "clsx"
import { locale, LANGUAGES } from "./locales"
import { useAppContext } from "./context/AppContext"
import { useAuth } from "./context/providers"
import { apiFetch } from "./utils"

const LanguageSwitcher = ({
  className,
}: {
  className?: string
  handleSetLanguage?: (path: string, language: locale) => void
}) => {
  const { t } = useAppContext()

  const { language, setLanguage, user, token, track, API_URL } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  const changeLanguage = (newLocale: locale) => {
    track({
      name: "language_switcher",
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
        const result = await apiFetch(`${API_URL}/user`, {
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
      <button
        className={clsx("link", className)}
        onClick={() => {
          setIsModalOpen(true)
        }}
      >
        <Languages size={18} />
      </button>
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
        <div className={styles.languages}>
          {LANGUAGES.map((item) => (
            <button
              key={item.code}
              style={{
                color: item.code === language ? "var(--shade-8)" : "",
              }}
              onClick={() => changeLanguage(item.code)}
              className={clsx("link", styles.languageButton)}
            >
              {item.name}
            </button>
          ))}
        </div>
      </Modal>
    </>
  )
}

export default LanguageSwitcher
