import React from "react"
import { useData, useNavigationContext } from "./context/providers"
import AddToHomeScreen from "./AddToHomeScreen"
import Modal from "./Modal"
import clsx from "clsx"
import { FaApple, FaAndroid, FaChrome, FaFirefox } from "react-icons/fa"
import Img from "./Img"
import styles from "./Version.module.scss"
import { useTranslation } from "react-i18next"
import { usePlatform } from "./platform"
import A from "./A"

export default function Version() {
  const {
    setNeedsUpdateModalOpen,
    versions,
    needsUpdateModalOpen,
    needsUpdate,
  } = useData()

  const { showAddToHomeScreen, setShowAddToHomeScreen } = useNavigationContext()
  const { t } = useTranslation()

  const { os, isStandalone, isFirefox, isExtension, BrowserInstance } =
    usePlatform()

  const { FRONTEND_URL } = useData()

  return (
    <div>
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
            <video
              className={styles.video}
              src={`${FRONTEND_URL}/video/blob.mp4`}
              autoPlay
              loop
              muted
              playsInline
            ></video>
          }
          title={
            <div className={styles.updateModalTitle}>{t("Thinking")}...</div>
          }
        >
          <div className={styles.updateModalDescription}>
            <Img src={`${FRONTEND_URL}/hamster.png`} width={24} height={24} />
            <span>
              {t("Let's update your app to the latest version")}{" "}
              {isStandalone
                ? null
                : isFirefox
                  ? versions.firefoxVersion
                  : versions.chromeVersion}
            </span>
          </div>
          <div className={styles.updateModalButtons}>
            {os && ["ios", "android"].includes(os) ? (
              <button
                className={clsx(
                  "small",
                  styles.installAppButton,
                  isStandalone ? styles.standalone : undefined,
                )}
                onClick={(e) => {
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
              </button>
            ) : !isFirefox ? (
              <a
                onClick={(e) => {
                  if (isExtension) {
                    BrowserInstance?.runtime?.sendMessage({
                      action: "openInSameTab",
                      url: "https://chromewebstore.google.com/detail/vex/odgdgbbddopmblglebfngmaebmnhegfc",
                    })

                    return
                  }
                }}
                href="https://chromewebstore.google.com/detail/vex/odgdgbbddopmblglebfngmaebmnhegfc"
                className={clsx("button small", styles.installButton)}
              >
                <FaChrome size={18} />
                {t("Install")}
              </a>
            ) : isFirefox ? (
              <A
                openInNewTab
                href="https://addons.mozilla.org/en-US/firefox/addon/vex"
                className={clsx("button small", styles.installButton)}
              >
                <FaFirefox size={18} />
                {t("Install")}
              </A>
            ) : null}
          </div>
        </Modal>
      )}
    </div>
  )
}
