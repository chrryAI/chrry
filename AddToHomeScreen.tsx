"use client"

import React, { useCallback, useContext, useEffect } from "react"
import styles from "./AddToHomeScreen.module.scss"
import { createPortal } from "react-dom"
import { useRef } from "react"
import Img from "./Image"
import { CircleX, EllipsisVertical, SquarePlus, Share } from "./icons"
import clsx from "clsx"
import { MdAddToHomeScreen } from "react-icons/md"
import { useAppContext } from "./context/AppContext"
import { FRONTEND_URL } from "./utils"
import Logo from "./Logo"
import { useApp, useNavigationContext } from "./context/providers"
import { usePlatform } from "./platform"
import { useHasHydrated } from "./hooks"

export default function AddToHomeScreen(): React.ReactPortal | null {
  const { t } = useAppContext()
  const { app } = useApp()
  const { os } = usePlatform()
  const { setShowAddToHomeScreen, showAddToHomeScreen } = useNavigationContext()

  const is = useHasHydrated()

  const innerRef = useRef<HTMLDivElement>(null)

  const handleKeyDown = useCallback((event: { key: string }) => {
    if (event.key === "Escape") {
      setShowAddToHomeScreen(false)
    }
  }, [])

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown, false)

    return () => {
      document.removeEventListener("keydown", handleKeyDown, false)
    }
  }, [handleKeyDown])

  if (!is || !showAddToHomeScreen) return null

  return createPortal(
    <div className={styles.addToHomeScreen} role="dialog" aria-modal="true">
      <div className={styles.main}>
        <div className={styles.inner} ref={innerRef}>
          <button
            className={clsx(styles.close, "link")}
            onClick={() => setShowAddToHomeScreen(false)}
          >
            <CircleX />
          </button>
          <div className={styles.logoContainer}>
            <Img app={app} className={styles.logo} size={80} />
          </div>
          <div className={styles.content}>
            <h2 className={styles.title}>{t("For a better experience")}</h2>
            {os === "android" ? (
              <>
                <p className={styles.share}>
                  {t("Tap the icon in the browser bar")}
                  <EllipsisVertical />
                </p>
                <div>
                  <div className={styles.selectAddToHomeScreen}>
                    <span>{t("Tap")}</span>
                    <span className={styles.addHomeScreenAndroid}>
                      {t("Add to Home Screen")}
                      <span className={styles.icon}>
                        <MdAddToHomeScreen />
                      </span>
                    </span>
                  </div>
                  <p className={styles.scrollDown}>
                    {t("You may need to scroll down to find this option")}
                  </p>
                  <p className={styles.quickAccess}>
                    {t(
                      "An icon will appear on your home screen for quick access to this app",
                    )}
                  </p>
                </div>
              </>
            ) : os === "ios" ? (
              <>
                <p className={styles.share}>
                  {t("Tap the share button in your browser")}
                  <span className={styles.icon}>
                    <Share />
                  </span>
                </p>
                <div>
                  <div className={styles.selectAddToHomeScreen}>
                    {t("Select 'Add to Home Screen' from the menu")}
                  </div>
                  <span className={styles.addHomeScreen}>
                    {t("Add to Home Screen")}
                    <span className={styles.icon}>
                      <SquarePlus />
                    </span>
                  </span>
                </div>
                <p className={styles.scrollDown}>
                  {t("You may need to scroll down to find this option")}
                </p>
                <p className={styles.quickAccess}>
                  {t(
                    "An icon will appear on your home screen for quick access to this app",
                  )}
                </p>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>,
    document.getElementById("skeleton") || document.body,
  )
}
