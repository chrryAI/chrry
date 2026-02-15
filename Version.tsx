import React, { useState } from "react"
import { useData, useNavigationContext, useAuth } from "./context/providers"
import Modal from "./Modal"
import {
  FaApple,
  FaAndroid,
  FaChrome,
  FaFirefox,
  FaWindows,
  FaLinux,
} from "react-icons/fa"
import { FiCheck } from "react-icons/fi"
import Img from "./Img"
import { useTranslation } from "react-i18next"
import { Button, Div, Span, usePlatform, Video } from "./platform"
import A from "./a/A"
import { useVersionStyles } from "./Version.styles"
import { useStyles } from "./context/StylesContext"
import { SiMacos } from "react-icons/si"
import { useHasHydrated } from "./hooks"

export default function Version() {
  const {
    setNeedsUpdateModalOpen,
    versions,
    needsUpdateModalOpen,
    needsUpdate,
  } = useData()

  const hasHydrated = useHasHydrated()

  const { showAddToHomeScreen, setShowAddToHomeScreen } = useNavigationContext()
  const { t } = useTranslation()

  const { chromeWebStoreUrl, downloadUrl } = useAuth()

  const { os, isStandalone, isTauri, isFirefox, isExtension, BrowserInstance } =
    usePlatform()

  const { FRONTEND_URL } = useData()

  const styles = useVersionStyles()
  const { utilities } = useStyles()

  const [urlCopied, setUrlCopied] = useState(false)

  if (!hasHydrated) {
    return null
  }

  return (
    <Div>
      {/* <NextTopLoader color="#197ef4" /> */}
      {needsUpdateModalOpen && versions && (
        <Modal
          isModalOpen={needsUpdateModalOpen}
          hideOnClickOutside={false}
          hasCloseButton={false}
          onToggle={(open) => {
            setNeedsUpdateModalOpen(open)
          }}
          icon={
            <Video
              style={styles.video.style}
              src={`${FRONTEND_URL}/video/blob.mp4`}
              autoPlay
              loop
              muted
              playsInline
            />
          }
          title={<Div>{t("Thinking")}...</Div>}
        >
          <Div style={styles.updateModalDescription.style}>
            <Img src={`${FRONTEND_URL}/hamster.png`} width={24} height={24} />
            <Span
              style={{
                lineHeight: "1.5",
              }}
            >
              {t(
                urlCopied
                  ? `Link copied! Open your favorite browser to download: ${downloadUrl.split("/").pop()} 📋`
                  : "Let's update your app to the latest version",
              )}

              {isStandalone
                ? null
                : isFirefox
                  ? versions.firefoxVersion
                  : versions.chromeVersion}
            </Span>
          </Div>
          <Div style={styles.updateModalButtons.style}>
            {os && ["ios", "android"].includes(os) ? (
              <Button
                style={{
                  ...utilities.small.style,
                }}
                onClick={() => {
                  setShowAddToHomeScreen(true)
                  setNeedsUpdateModalOpen(false)
                }}
              >
                {os === "ios" ? (
                  <FaApple
                    style={{
                      position: "relative",
                      bottom: 1,
                    }}
                    size={18}
                  />
                ) : (
                  <FaAndroid size={18} />
                )}{" "}
                {t("Install")}
              </Button>
            ) : !isFirefox && !isTauri ? (
              <A
                openInNewTab
                className="button"
                href={chromeWebStoreUrl}
                style={{
                  ...utilities.button.style,
                  ...utilities.small.style,
                }}
              >
                <FaChrome size={18} />
                {t("Install")}
              </A>
            ) : isFirefox ? (
              <A
                className="button"
                openInNewTab
                href="https://addons.mozilla.org/en-US/firefox/addon/vex"
                style={{
                  ...utilities.button.style,
                  ...utilities.small.style,
                }}
              >
                <FaFirefox size={18} />
                {t("Install")}
              </A>
            ) : null}

            {/* Desktop app download button */}
            {/* Desktop app download button */}
            {downloadUrl && (
              <>
                <Button
                  className="button inverted"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(downloadUrl)
                      setUrlCopied(true)
                      setTimeout(() => setUrlCopied(false), 5000)
                    } catch (err) {
                      console.error("Failed to copy: ", err)
                      window.open(downloadUrl, "_blank")
                    }
                  }}
                  style={{
                    ...utilities.button.style,
                    ...utilities.xSmall.style,
                    ...utilities.inverted.style,
                  }}
                >
                  {urlCopied ? (
                    <>
                      <FiCheck size={24} />
                    </>
                  ) : (
                    <>
                      {os === "macos" ? (
                        <SiMacos size={24} />
                      ) : os === "windows" ? (
                        <FaWindows size={18} />
                      ) : (
                        <FaLinux size={18} />
                      )}
                    </>
                  )}
                </Button>
              </>
            )}
          </Div>
        </Modal>
      )}
    </Div>
  )
}
