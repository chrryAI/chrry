"use client"

import React, { useEffect, useState } from "react"
import styles from "./Store.module.scss"
import clsx from "clsx"
import Skeleton from "./Skeleton"
import { useAuth, useData, useNavigationContext } from "./context/providers"
import Img from "./Image"
import { useAppContext } from "./context/AppContext"
import { appWithStore } from "./types"
import { Div } from "./platform"
import { useStoreStyles } from "./Store.styles"
import { useStyles } from "./context/StylesContext"
import { Sparkles, ArrowRight } from "./icons"
import Logo from "./Logo"
import { A } from "./platform"

export default function Store({
  compact,
  slug,
}: {
  compact?: boolean
  slug?: string
}) {
  const { FRONTEND_URL } = useData()

  const { router, setIsNewChat, pathname } = useNavigationContext()

  const { allApps, getAppSlug, setApp } = useAuth()

  const storeSlug = slug || pathname.split("/")[1]
  const matchedApp = allApps?.find((app) => app?.store?.slug === storeSlug)
  const store = matchedApp?.store

  const apps = store?.apps

  // Get the base app - either from store.app or find it in the apps array
  const baseApp = store?.app || apps?.find((app) => app?.id === store?.appId)

  const { t } = useAppContext()
  const { track } = useAuth()

  // Filter apps that belong to this store (exclude Chrry itself)
  const storeApps = apps

  const [selectedApp, setSelectedAppInternal] = useState<
    appWithStore | undefined
  >(storeApps?.find((app) => app.slug === "chrry"))

  const setSelectedApp = (app: appWithStore | undefined) => {
    setSelectedAppInternal(app)
    setApp(app)
  }

  useEffect(() => {
    if (store) {
      track({
        name: "Store View",
        props: {
          storeId: store.id,
          storeName: store.name,
          storeSlug: store.slug,
          appCount: storeApps?.length || 0,
        },
      })
    }
  }, [store?.id])

  useEffect(() => {
    if (selectedApp) {
      track({
        name: "Store App Selected",
        props: {
          appId: selectedApp.id,
          appName: selectedApp.name,
          appSlug: selectedApp.slug,
          storeId: store?.id,
          storeName: store?.name,
        },
      })
    }
  }, [selectedApp?.id])

  const storeStyles = useStoreStyles()

  const { margin } = storeStyles.lifeOS.style

  const render = () => {
    if (!store?.app) {
      return null
    }

    return (
      <Div
        style={{
          ...storeStyles.lifeOS.style,
          margin: compact ? 0 : margin,
        }}
      >
        {!compact && (
          <div style={{ ...storeStyles.header.style }}>
            <div style={{ ...storeStyles.headerIcons.style }}>
              <Img
                showLoading={false}
                src={`${FRONTEND_URL}/images/pacman/space-invader.png`}
                alt="Space Invader"
                size={28}
              />
              <Img
                showLoading={false}
                src={`${FRONTEND_URL}/images/pacman/pacman.png`}
                alt="Pacman"
                size={28}
              />
              <Img app={store?.app} size={28} />
              <Img
                style={{ marginLeft: "auto" }}
                showLoading={false}
                src={`${FRONTEND_URL}/images/pacman/heart.png`}
                alt="Heart"
                size={28}
              />
            </div>
            <h1 style={{ ...storeStyles.title.style }}>
              <span style={{ ...storeStyles.titleText.style }}>
                <A
                  href={store.app ? getAppSlug(store.app) : "#"}
                  onClick={(e) => {
                    e.preventDefault()

                    if (store.app) {
                      setIsNewChat(true, getAppSlug(store.app))
                    }
                    if (e.metaKey || e.ctrlKey) {
                      return
                    }
                  }}
                  className={"link"}
                >
                  {store?.name}
                </A>
                - {t(store?.title || "")}
              </span>
            </h1>
            <p style={{ ...storeStyles.intro.style }}>
              {t(store?.description || "")}
            </p>
          </div>
        )}
        <div className={styles.createAgent}>
          <button
            onClick={() => {
              router.push("/?part=highlights")
            }}
            className="inverted"
          >
            <Sparkles size={16} color="var(--accent-1)" />
            {t("Create Your Agent")}
          </button>
        </div>
        <div className={styles.content}>
          <div className={styles.apps}>
            {storeApps?.map((app) => (
              <div
                key={app.id}
                className={clsx(
                  styles.app,
                  selectedApp?.id === app.id && styles.selected,
                )}
                onClick={() => setSelectedApp(app)}
              >
                <span className={clsx(styles.badge)}>{t("live")}</span>
                <Img app={app} alt={app.name} size={80} />
                <div className={styles.appInfo}>
                  <span className={styles.appName}>
                    {app.icon} {app.name}
                  </span>
                  <span className={styles.appSubtitle}>
                    {t(app.subtitle || "")}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div key={selectedApp?.id} className={styles.footer}>
            {selectedApp && (
              <div className={styles.appDetails}>
                <h3>
                  {selectedApp.icon} {selectedApp.name}
                </h3>
                <p className={styles.subtitle}>{t(selectedApp.title || "")}</p>
                <p className={styles.description}>
                  {t(selectedApp.description || "")}
                </p>
                {Array.isArray(selectedApp.featureList) &&
                  selectedApp.featureList.length > 0 && (
                    <div className={styles.features}>
                      <h4>{t("Key Features")}</h4>
                      <ul>
                        {selectedApp.featureList.map((feature, index) => (
                          <li className={styles.feature} key={index}>
                            <Sparkles
                              size={16}
                              color="var(--accent-1)"
                              fill="var(--accent-1)"
                            />
                            {t(feature)}
                          </li>
                        ))}
                        <li className={styles.feature}>
                          <A
                            href={getAppSlug(selectedApp)}
                            onClick={(e) => {
                              if (e.metaKey || e.ctrlKey) {
                                return
                              }
                              e.preventDefault()
                              setIsNewChat(true, getAppSlug(selectedApp))
                            }}
                            className={"link"}
                          >
                            <ArrowRight size={16} color="var(--accent-6)" />
                            {t("Try it now!")}
                          </A>
                        </li>
                      </ul>
                    </div>
                  )}
              </div>
            )}
          </div>
        </div>
        {/* Hidden content for SEO - all apps details */}
        {!compact && (
          <div style={{ display: "none" }} className="seo-content">
            {storeApps?.map((appItem) => (
              <section key={appItem.id}>
                <h2>{appItem.name}</h2>
                <h3>{t(appItem.title || "")}</h3>
                <p>{t(appItem.description || "")}</p>
                {Array.isArray(appItem.featureList) &&
                  appItem.featureList.length > 0 && (
                    <>
                      <h4>{t("Key Features")}</h4>
                      <ul>
                        {appItem.featureList.map((feature, index) => (
                          <li key={index}>{t(feature)}</li>
                        ))}
                      </ul>
                    </>
                  )}
              </section>
            ))}
          </div>
        )}
        {!compact && (
          <div className={styles.tetris}>
            <div style={{ display: "flex", gap: "1rem" }}>
              <a
                href={`${FRONTEND_URL}`}
                className={clsx("link", styles.hamburgerButton)}
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey) {
                    return
                  }
                  e.preventDefault()
                  setIsNewChat(true)
                }}
              >
                <Img app={baseApp} size={24} /> {baseApp?.name}
              </a>
              <Img
                showLoading={false}
                src={`${FRONTEND_URL}/images/pacman/tetris1.png`}
                alt="Tetris 1"
                width={28}
                height={28}
              />
              <Img
                showLoading={false}
                src={`${FRONTEND_URL}/images/pacman/tetris2.png`}
                alt="Tetris 2"
                width={28}
                height={28}
              />
            </div>
            <span></span>
          </div>
        )}
      </Div>
    )
  }

  if (compact) {
    return render()
  }

  if (!store?.app) {
    return null
  }

  return <Skeleton>{render()}</Skeleton>
}
