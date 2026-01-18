"use client"

import React, { useEffect, useState } from "react"
import Skeleton from "./Skeleton"
import {
  useApp,
  useAuth,
  useData,
  useNavigationContext,
  useChat,
} from "./context/providers"
import Img from "./Image"
import { COLORS, useAppContext } from "./context/AppContext"
import { appWithStore, storeWithApps } from "./types"
import { Button, Div, H1, H3, H4, P, Span, useTheme } from "./platform"
import { useStoreStyles } from "./Store.styles"
import { Sparkles, ArrowRight } from "./icons"
import A from "./a/A"
import { useStoreMetadata } from "./hooks/useMetadata"
import { useStyles } from "./context/StylesContext"
import Loading from "./Loading"
import { ANALYTICS_EVENTS } from "./utils/analyticsEvents"

export default function Store({
  compact,
  slug,
  ...rest
}: {
  compact?: boolean
  slug?: string
  store?: storeWithApps
}) {
  const { FRONTEND_URL } = useData()

  const { isMobileDevice } = useTheme()

  const { utilities } = useStyles()

  const { router, searchParams } = useNavigationContext()

  const { setIsNewAppChat } = useChat()

  const {
    plausible,
    storeApps: storeAppsContext,
    getAppSlug,
    loadingApp,
    setLoadingApp,
    loadingAppId,
    setLoadingAppId,
    hasStoreApps,
  } = useAuth()

  const { currentStore, setAppStatus } = useApp()

  const store = rest.store
    ? rest.store
    : slug
      ? storeAppsContext.find((app) => app.slug === slug)?.store
      : currentStore

  const apps = store?.apps

  // Get the base app - either from store.app or find it in the apps array

  const { t } = useAppContext()

  // Filter apps that belong to this store (exclude Chrry itself)
  const storeApps = apps

  const slugParam = searchParams.get("app")

  const [selectedApp, setSelectedAppInternal] = useState<
    appWithStore | undefined
  >(storeApps?.find((app) => app.slug === slugParam || app.id === store?.appId))

  useEffect(() => {
    if (!storeApps?.length) return
    if (slugParam) {
      const app = storeApps?.find((app) => app.slug === slugParam)
      if (app) {
        setSelectedAppInternal(app)
      }
    }
  }, [slugParam, storeAppsContext])

  const [loadingAppInternal, setLoadingAppInternal] = useState<
    appWithStore | undefined
  >(loadingApp)

  const setSelectedApp = (app: appWithStore | undefined) => {
    if (app && !hasStoreApps(storeAppsContext.find((a) => a.id === app.id))) {
      setLoadingApp(app)
      setLoadingAppInternal(app)
      return
    }

    if (!app?.store?.slug) return
    if (!app?.slug) return

    if (loadingApp?.id === app.id) return

    setSelectedAppInternal(app)

    !slug && router.push(`/${app.store.slug}?app=${app.slug}`)
  }

  useEffect(() => {
    const loadedApp = storeApps?.find(
      (app) => app.id === loadingAppInternal?.id,
    )
    if (!loadingApp && loadingAppInternal && loadedApp) {
      setSelectedAppInternal(loadedApp)
      router.push(`/${loadedApp?.store?.slug}?app=${loadedApp?.slug}`)
      setLoadingAppInternal(undefined)
    }
  }, [loadingApp, loadingAppInternal])

  useEffect(() => {
    if (store) {
      plausible({
        name: ANALYTICS_EVENTS.STORE_VIEW,
        props: {
          storeId: store.id,
          storeName: store.name,
          storeSlug: store.slug,
          appCount: storeApps?.length || 0,
        },
      })
    }
  }, [store?.id, plausible])

  useEffect(() => {
    if (selectedApp) {
      plausible({
        name: ANALYTICS_EVENTS.STORE_APP_SELECTED,
        props: {
          appId: selectedApp.id,
          appName: selectedApp.name,
          appSlug: selectedApp.slug,
          storeId: store?.id,
          storeName: store?.name,
        },
      })
    }
  }, [selectedApp?.id, store?.id, plausible])

  // Dynamically update page metadata for client-side navigation
  useStoreMetadata(store)

  const styles = useStoreStyles()

  if (!store?.app) {
    return null
  }

  const render = () => {
    return (
      <Div
        style={{
          ...styles.lifeOS.style,
          margin: compact ? 0 : "0 auto",
        }}
      >
        {!compact && (
          <Div style={{ ...styles.header.style }}>
            <Div style={{ ...styles.headerIcons.style }}>
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

              <A href={"/blossom"}>
                <Img logo="blossom" size={32} />
              </A>
              <Img
                style={{ marginLeft: "auto" }}
                showLoading={false}
                src={`${FRONTEND_URL}/images/pacman/heart.png`}
                alt="Heart"
                size={28}
              />
            </Div>
            <H1 style={{ ...styles.title.style }}>
              <Span style={{ ...styles.titleText.style }}>
                <A
                  href={store.app ? getAppSlug(store.app) : "#"}
                  onClick={(e) => {
                    e.preventDefault()

                    if (store.app) {
                      setIsNewAppChat(store.app)
                    }
                    if (e.metaKey || e.ctrlKey) {
                      return
                    }
                  }}
                  className={"link"}
                >
                  {store?.name}
                </A>{" "}
                - {t(store?.title || "")}
              </Span>
            </H1>
            <P style={{ ...styles.intro.style }}>
              {t(store?.description || "")}
            </P>
          </Div>
        )}
        <Div style={styles.createAgent.style}>
          <Button
            onClick={() => {
              setAppStatus({
                part: "highlights",
                step: "add",
              })
            }}
            className="inverted"
            style={{ ...utilities.inverted.style }}
          >
            <Sparkles size={16} color="var(--accent-1)" />
            {t("Create Your Agent")}
          </Button>
        </Div>
        <Div style={styles.content.style}>
          <Div style={styles.apps.style}>
            {storeApps?.map((app, index) => {
              return (
                <Div
                  key={app.id}
                  data-color={COLORS[app.themeColor as keyof typeof COLORS]}
                  className={`pointer ${loadingApp?.id === app.id ? "glow" : ""}`}
                  style={{
                    ...styles.app.style,
                    ...(index === storeApps?.length - 1 &&
                      styles.appLast.style),
                    ...(!isMobileDevice ? styles.appLarge.style : {}),
                    ...(selectedApp?.id === app.id && styles.appSelected.style),
                    boxShadow: COLORS[app.themeColor as keyof typeof COLORS],
                    borderColor: COLORS[app.themeColor as keyof typeof COLORS],
                    "--glow-color":
                      COLORS[app.themeColor as keyof typeof COLORS],
                  }}
                  onClick={() => setSelectedApp(app)}
                >
                  <A
                    href={getAppSlug(app)}
                    style={{
                      ...styles.badge.style,
                      display: isMobileDevice ? "none" : "flex",
                    }}
                    onClick={(e) => {
                      e.preventDefault()
                      // setSelectedApp(app)
                    }}
                  >
                    {t(app.status === "active" ? "live" : "testing")}
                  </A>
                  <Img
                    style={{ ...styles.appImage.style }}
                    app={app}
                    alt={app.name}
                    size={isMobileDevice ? 40 : 80}
                  />
                  <A
                    href={getAppSlug(app)}
                    style={{
                      ...styles.appInfo.style,
                      display: isMobileDevice ? "none" : "flex",
                    }}
                  >
                    <Span style={{ ...styles.appName.style }}>
                      {loadingAppId === app.id ? (
                        <Loading size={16} />
                      ) : (
                        app.icon
                      )}{" "}
                      {app.name}
                    </Span>
                    <Span style={{ ...styles.appSubtitle.style }}>
                      {t(app.subtitle || "")}
                    </Span>
                  </A>
                </Div>
              )
            })}
          </Div>

          <Div key={selectedApp?.id} style={styles.footer.style}>
            {selectedApp && (
              <Div style={styles.appDetails.style}>
                <H3 style={styles.appTitle.style}>
                  {selectedApp.icon} {selectedApp.name}
                  <A
                    href={getAppSlug(selectedApp)}
                    onClick={(e) => {
                      if (e.metaKey || e.ctrlKey) {
                        return
                      }
                      e.preventDefault()
                      setIsNewAppChat(selectedApp)
                    }}
                    style={styles.tryItNow.style}
                  >
                    <ArrowRight size={16} color="var(--accent-6)" />
                    {t("Try it now!")}
                  </A>
                </H3>
                <P style={styles.subtitle.style}>
                  {t(selectedApp.title || "")}
                </P>
                <P style={styles.description.style}>
                  {t(selectedApp.description || "")}
                </P>
                {Array.isArray(selectedApp.featureList) &&
                  selectedApp.featureList.length > 0 && (
                    <Div>
                      <H4 style={styles.featuresH4.style}>
                        {t("Key Features")}
                      </H4>
                      <Div>
                        {selectedApp.featureList.map((feature, index) => (
                          <P style={styles.feature.style} key={index}>
                            <Sparkles
                              size={16}
                              color="var(--accent-1)"
                              fill="var(--accent-1)"
                            />
                            {t(feature)}
                          </P>
                        ))}
                        <P style={styles.feature.style}>
                          <A
                            href={getAppSlug(selectedApp)}
                            onClick={(e) => {
                              if (e.metaKey || e.ctrlKey) {
                                return
                              }
                              e.preventDefault()
                              setIsNewAppChat(selectedApp)
                            }}
                            className={"link"}
                          >
                            <ArrowRight size={16} color="var(--accent-6)" />
                            {t("Try it now!")}
                          </A>
                        </P>
                      </Div>
                    </Div>
                  )}
              </Div>
            )}
          </Div>
        </Div>
        {!compact && (
          <Div style={styles.tetris.style}>
            <Div style={{ display: "flex", gap: "1rem" }}>
              <A href={`/blossom`}>
                <Img logo="blossom" size={28} /> Blossom
              </A>
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
            </Div>
          </Div>
        )}
      </Div>
    )
  }

  if (compact) {
    return render()
  }

  return <Skeleton>{render()}</Skeleton>
}
