"use client"

import type React from "react"
import { useEffect, useState } from "react"
import AppLink from "./AppLink"
import A from "./a/A"
import { COLORS, useAppContext } from "./context/AppContext"
import {
  useApp,
  useAuth,
  useChat,
  useData,
  useNavigationContext,
} from "./context/providers"
import { useStyles } from "./context/StylesContext"
import { useStoreMetadata } from "./hooks/useMetadata"
import Img from "./Image"
import { ArrowRight, Sparkles } from "./icons"
import Loading from "./Loading"
import { Button, Div, H1, H3, H4, P, Span, useTheme } from "./platform"
import Skeleton from "./Skeleton"
import { useStoreStyles } from "./Store.styles"
import type { appWithStore, storeWithApps } from "./types"
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
    hasStoreApps,
    accountApp,
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

  const [selectedApp, setSelectedApp] = useState<appWithStore | undefined>(
    storeApps?.find((app) => app.slug === slugParam || app.id === store?.appId),
  )

  useEffect(() => {
    if (!storeApps?.length) return
  }, [slugParam, storeApps, storeAppsContext])

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
                      setIsNewAppChat({ item: store.app })
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
          {accountApp ? (
            <AppLink
              app={accountApp}
              icon={<Img app={accountApp} size={22} />}
              loading={<Loading size={22} />}
              className="inverted"
              style={{
                ...utilities.button.style,
                ...utilities.small.style,
                ...utilities.inverted.style,
              }}
            >
              {t("Go to Your Agent")}
            </AppLink>
          ) : (
            <Button
              onClick={() => {
                router.push("/?settings=true")
              }}
              className="inverted"
              style={{ ...utilities.inverted.style }}
            >
              <Sparkles size={16} color="var(--accent-1)" />
              {t("Create Your Agent")}
            </Button>
          )}
        </Div>
        <Div style={styles.content.style}>
          <Div style={styles.apps.style}>
            {storeApps?.map((app, index) => {
              return (
                <AppLink
                  isTribe
                  app={app}
                  key={app.id}
                  setIsNewAppChat={(app) => {
                    setSelectedApp(app)
                  }}
                  icon={
                    <>
                      <Div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: 8,
                        }}
                      >
                        <Span
                          style={{
                            ...styles.badge.style,
                            display: isMobileDevice ? "none" : "flex",
                            fontSize: 12,
                          }}
                        >
                          {t(app.status === "active" ? "live" : "testing")}
                        </Span>
                      </Div>
                      <Img
                        style={{ ...styles.appImage.style }}
                        app={app}
                        alt={app.name}
                        size={isMobileDevice ? 40 : 50}
                      />
                    </>
                  }
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
                    ["--glow-color" as keyof React.CSSProperties]:
                      COLORS[app.themeColor as keyof typeof COLORS],
                  }}
                >
                  <Div
                    style={{
                      ...styles.appInfo.style,
                      display: isMobileDevice ? "none" : "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      alignContent: "center",
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
                    <Span
                      style={{
                        ...styles.appSubtitle.style,
                        margin: ".25rem 0 0 0",
                      }}
                    >
                      {t(app.subtitle || "")}
                    </Span>
                  </Div>
                </AppLink>
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
                      setIsNewAppChat({ item: selectedApp })
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
                              setIsNewAppChat({ item: selectedApp })
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
