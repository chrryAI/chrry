"use client"

import clsx from "clsx"
import Menu from "./Menu"
import { CircleEllipsis } from "./icons"
import LanguageSwitcher from "./LanguageSwitcher"
import { useEffect, lazy, Suspense } from "react"
import Img from "./Image"
import { useState } from "react"

// Lazy load heavy components to reduce initial bundle
const Subscribe = lazy(() => import("./Subscribe"))
const SignIn = lazy(() => import("./SignIn"))
const CharacterProfiles = lazy(() => import("./CharacterProfiles"))
import {
  Button,
  Div,
  H1,
  Main,
  usePreviousPathname,
  usePlatform,
  VexToast,
  Span,
} from "./platform"
import { useStyles } from "./context/StylesContext"
import {
  useChat,
  useNavigationContext,
  useData,
  useApp,
  useAuth,
} from "./context/providers"
import { useTheme } from "./platform"
import A from "./a/A"
import Version from "./Version"
import AddToHomeScreen from "./addToHomeScreen"
import { useHasHydrated } from "./hooks"
import { useTimerContext } from "./context/TimerContext"

function FocusButton({
  time,
  isCountingDown,
  isDrawerOpen,
}: {
  time: number
  isCountingDown?: boolean
  isDrawerOpen?: boolean
}) {
  const { minimize } = useApp()

  const { viewPortWidth } = usePlatform()
  const { app, getAppSlug, setShowFocus } = useAuth()

  const focus = app?.store?.apps?.find((app) => app.slug === "focus")

  const hasHydrated = useHasHydrated()
  const { isMobileDevice, isSmallDevice } = useTheme()
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const { skeletonStyles, utilities } = useStyles()

  useEffect(() => {
    setCurrentTime(new Date())

    if (time === 0) {
      const interval = setInterval(() => {
        setCurrentTime(new Date())
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [time])

  const formatTime = () => {
    if (time > 0) {
      return `${Math.floor(time / 60)}:${String(time % 60).padStart(2, "0")}`
    } else if (currentTime) {
      const hours = currentTime.getHours()
      const minutes = currentTime.getMinutes()
      return `${hours}:${String(minutes).padStart(2, "0")}`
    }
    return "--:--"
  }

  if (!isDrawerOpen || viewPortWidth < 700 || !hasHydrated) {
    return null
  }

  if (!focus || minimize) {
    return (
      <>
        <A
          href={`/${app?.store?.slug}`}
          className="button transparent"
          style={{
            ...utilities.button.style,
            ...utilities.transparent.style,
            ...utilities.small.style,
            position: "relative",

            left: "15.625rem",
            ...(hasHydrated && isMobileDevice && skeletonStyles.blog.style),
          }}
        >
          <Img
            showLoading={false}
            logo={app?.store?.slug === "blossom" ? "blossom" : "lifeOS"}
            store={app?.store}
            size={18}
          />
          {app?.store?.name}
        </A>
      </>
    )
  }

  return (
    <A
      href={`${getAppSlug(focus)}`}
      className="link"
      onClick={(e) => {
        e.preventDefault()
        setShowFocus(true)
      }}
      style={{
        ...utilities.link.style,
        marginTop: !isDrawerOpen ? 1 : -7.5,
        marginLeft: isDrawerOpen ? 0 : -5,
        position: "relative",

        left: 250,
      }}
    >
      {hasHydrated && (
        <Span
          style={{
            padding: "3px 6px",
            backgroundColor: isCountingDown
              ? "var(--accent-4)"
              : "var(--accent-1)",
            color: "#fff",
            borderRadius: 20,
            fontSize: 10,
            fontWeight: 600,
            fontFamily: "var(--font-mono)",
            whiteSpace: "nowrap",
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
            zIndex: 1,
          }}
        >
          {formatTime()}
        </Span>
      )}
    </A>
  )
}
export default function Skeleton({
  className,
  children,
  showThreads = true,
}: {
  className?: string
  children?: React.ReactNode
  showThreads?: boolean
}): React.ReactElement {
  const { isCapacitor, os } = usePlatform()
  const { time, isCountingDown } = useTimerContext()

  const hasHydrated = useHasHydrated()

  // Split contexts for better organization

  // Auth context

  // Chat context
  const { isEmpty } = useChat()

  // Navigation context
  const { pathname, setIsNewChat, hasNotification } = useNavigationContext()

  const { isDrawerOpen, setIsDrawerOpen, isSmallDevice, isMobileDevice } =
    useTheme()

  // Platform context
  const { isStandalone, isTauri } = usePlatform()

  // Data context
  const { FRONTEND_URL } = useData()

  const { threadIdRef, isIDE, ...auth } = useAuth()

  const threadId = threadIdRef.current

  // App context
  const { app } = useApp()

  // Theme context
  const { addHapticFeedback } = useTheme()

  const toggleMenu = () => {
    addHapticFeedback()
    setIsDrawerOpen(!isDrawerOpen)
  }

  const previous = usePreviousPathname()
  const isHome = pathname === "/" || pathname === ""

  useEffect(() => {
    // Preload toast icons
    const preloadImages = [
      `${FRONTEND_URL}/frog.png`,
      `${FRONTEND_URL}/hamster.png`,
    ]

    if (typeof Image !== "undefined") {
      preloadImages.forEach((src) => {
        const img = new Image()
        img.src = src
      })
    }

    // Enable body scroll on Capacitor
    if (isCapacitor && os === "ios") {
      document.body.style.overflow = "auto"
      ;(document.body.style as any).WebkitOverflowScrolling = "touch"
    }
  }, [FRONTEND_URL, isCapacitor, os])

  // Call ALL hooks sssbefore any conditional returns
  const { skeletonStyles, utilities } = useStyles()

  return (
    <Div
      id="skeleton"
      className={clsx(className)}
      style={{
        ...skeletonStyles.page.style,
        paddingLeft: !isSmallDevice && isDrawerOpen ? 255 : 0,
        background: "transparent",
        // paddingTop: isCapacitor && os === "ios" ? 40 : undefined,
      }}
    >
      <Div
        style={{
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
          display: "flex",
        }}
      >
        <Version />
        <Menu showThreads={showThreads} />
        <Main
          style={{
            ...skeletonStyles.main.style,
            ...{
              display: "flex",
            },
          }}
        >
          <Div
            className="blur"
            data-tauri-drag-region
            onDoubleClick={async () => {
              if (!isTauri) return
              try {
                const { getCurrentWindow } =
                  await import("@tauri-apps/api/window")
                const appWindow = getCurrentWindow()
                const isMaximized = await appWindow.isMaximized()
                if (isMaximized) {
                  await appWindow.unmaximize()
                } else {
                  await appWindow.maximize()
                }
              } catch (e) {
                // Tauri API not available
              }
            }}
            style={{
              ...skeletonStyles.header.style,
              ...(hasHydrated &&
                isStandalone &&
                skeletonStyles.headerStandalone.style),
              ...(hasHydrated &&
              isCapacitor &&
              os === "ios" &&
              (!threadId || isEmpty)
                ? { paddingTop: 55 }
                : {}),
              ...(hasHydrated &&
              isCapacitor &&
              os === "ios" &&
              (threadId || !isEmpty)
                ? {
                    position: "fixed",
                    top: 0,
                    paddingTop: 50,
                    backgroundColor: "var(--background)",
                  }
                : {}),
              ...{
                backgroundColor: "none",
              },
            }}
          >
            {isIDE ? (
              <></>
            ) : (
              <>
                <Div style={{ ...skeletonStyles.hamburgerMenu.style }}>
                  <Div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      paddingTop:
                        hasHydrated && !isDrawerOpen && isTauri
                          ? "1.4rem"
                          : "0",
                    }}
                  >
                    {!isDrawerOpen && (
                      <Button
                        className="link"
                        style={{
                          ...skeletonStyles.hamburgerButton.style,
                          ...utilities.link,
                        }}
                        onClick={toggleMenu}
                      >
                        {hasNotification && (
                          <Span
                            style={{ ...skeletonStyles.notification.style }}
                          />
                        )}
                        <CircleEllipsis
                          strokeWidth={1.5}
                          color="var(--accent-1)"
                          size={24}
                        />
                      </Button>
                    )}
                    {!isDrawerOpen ? (
                      <Div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        <A
                          className="link"
                          clientOnly
                          href={`/`}
                          style={{
                            ...utilities.link.style,
                            ...skeletonStyles.hamburgerButton.style,
                            marginRight: 15,
                          }}
                          onClick={(e) => {
                            e.preventDefault()
                            setIsNewChat(true)
                          }}
                        >
                          <Img key={app?.id || "vex"} app={app} size={28} />
                          <H1
                            key={`title-${app?.id || "vex"}`}
                            style={{ ...skeletonStyles.brand.style }}
                          >
                            {app?.name || "Vex"}
                          </H1>
                        </A>
                      </Div>
                    ) : null}

                    {isMobileDevice ? null : (
                      <FocusButton
                        isDrawerOpen={isDrawerOpen}
                        time={time}
                        isCountingDown={isCountingDown}
                      />
                    )}
                  </Div>
                </Div>
                <Div style={{ ...skeletonStyles.right.style }}>
                  <Suspense fallback={null}>
                    <CharacterProfiles />
                  </Suspense>

                  <Suspense fallback={null}>
                    <Subscribe />
                  </Suspense>

                  <Suspense fallback={null}>
                    <SignIn showSignIn={false} />
                  </Suspense>

                  <LanguageSwitcher />
                </Div>
              </>
            )}
          </Div>
          <Div style={{ ...skeletonStyles.contentContainer.style }}>
            <>{children}</>
          </Div>
        </Main>
      </Div>
      {hasHydrated && (
        <>
          <AddToHomeScreen />
          <VexToast />
        </>
      )}
    </Div>
  )
}
