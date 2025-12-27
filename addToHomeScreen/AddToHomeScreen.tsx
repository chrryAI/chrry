"use client"

import React, { useCallback, useEffect } from "react"
import { createPortal } from "react-dom"
import { useRef } from "react"
import Img from "../Image"
import { CircleX, EllipsisVertical, SquarePlus, Share } from "../icons"
import { MdAddToHomeScreen } from "react-icons/md"
import { useAppContext } from "../context/AppContext"
import { useApp, useNavigationContext } from "../context/providers"
import { Button, Div, H2, P, Span, usePlatform } from "../platform"
import { useHasHydrated } from "../hooks"
import { useAddToHomeScreenStyles } from "./AddToHomeScreen.styles"
import { useStyles } from "../context/StylesContext"
import Modal from "../Modal"

export default function AddToHomeScreen(): React.ReactElement | null {
  const { t } = useAppContext()
  const { app, storeApp } = useApp()
  const { ...platform } = usePlatform()

  const os = platform.os === "macos" ? "ios" : "android"

  const { setShowAddToHomeScreen, showAddToHomeScreen } = useNavigationContext()

  const styles = useAddToHomeScreenStyles()
  const { utilities } = useStyles()

  const is = useHasHydrated()

  const innerRef = useRef<HTMLDivElement>(null)

  if (!is) return null

  return (
    <Modal
      params="?showInstall"
      isModalOpen={showAddToHomeScreen}
      onToggle={() => setShowAddToHomeScreen(false)}
      title={t("Add to Home Screen")}
    >
      <Div>
        <Div ref={innerRef}>
          <Button
            className="link"
            style={{ ...styles.close.style, ...utilities.link.style }}
            onClick={() => setShowAddToHomeScreen(false)}
          >
            <CircleX />
          </Button>
          <Div style={styles.logoContainer.style}>
            <Img app={app?.chromeWebStoreUrl ? app : storeApp} size={80} />
          </Div>
          <Div
            style={{
              ...styles.innerContent.style,
              alignItems: "flex-start",
              fontSize: ".8rem",
            }}
          >
            {/* <H2 style={styles.title.style}>{t("For a better experience")}</H2> */}
            {os === "android" ? (
              <>
                <P style={styles.share.style}>
                  {t("Tap the icon in the browser bar")}
                  <EllipsisVertical />
                </P>
                <Div>
                  <Div style={styles.selectAddToHomeScreen.style}>
                    <Span>{t("Tap")}</Span>
                    <Span style={styles.addHomeScreenAndroid.style}>
                      {t("Add to Home Screen")}
                      <Span style={styles.icon.style}>
                        <MdAddToHomeScreen />
                      </Span>
                    </Span>
                  </Div>
                  <P style={styles.scrollDown.style}>
                    {t("You may need to scroll down to find this option")}
                  </P>
                  <P style={styles.quickAccess.style}>
                    {t(
                      "An icon will appear on your home screen for quick access to this app",
                    )}
                  </P>
                </Div>
              </>
            ) : os === "ios" ? (
              <>
                <P style={styles.share.style}>
                  {t("Tap the share button in your browser")}
                  <Span style={styles.icon.style}>
                    <Share />
                  </Span>
                </P>
                <Div>
                  <Div style={styles.selectAddToHomeScreen.style}>
                    {t("Select 'Add to Home Screen' from the menu")}
                  </Div>
                  <Span style={styles.addHomeScreen.style}>
                    {t("Add to Home Screen")}
                    <Span style={styles.icon.style}>
                      <SquarePlus />
                    </Span>
                  </Span>
                </Div>
                <P style={styles.scrollDown.style}>
                  {t("You may need to scroll down to find this option")}
                </P>
                <P style={styles.quickAccess.style}>
                  {t(
                    "An icon will appear on your home screen for quick access to this app",
                  )}
                </P>
              </>
            ) : null}
          </Div>
        </Div>
      </Div>
    </Modal>
  )
}
