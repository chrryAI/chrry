"use client"

import clsx from "clsx"
import Menu from "./Menu"
import SignIn from "./SignIn"
import Subscribe from "./Subscribe"
import { CircleEllipsis, CodeXml } from "./icons"
import LanguageSwitcher from "./LanguageSwitcher"
import { useEffect } from "react"
import Img from "./Image"
import { useState } from "react"
import CharacterProfiles from "./CharacterProfiles"
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
  const { appStyles } = useStyles()
  const { viewPortWidth, isTauri } = usePlatform()
  const { app, getAppSlug, setShowFocus, isIDE, toggleIDE, threadId } =
    useAuth()

  const focus = app?.store?.apps?.find((app) => app.slug === "focus")

  const codeEditor = isTauri && app?.store?.app?.slug === "sushi"

  const hasHydrated = useHasHydrated()
  const { isMobileDevice } = useTheme()
  const [currentTime, setCurrentTime] = useState(new Date())
  const { skeletonStyles, utilities } = useStyles()

  useEffect(() => {
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
    } else {
      const hours = currentTime.getHours()
      const minutes = currentTime.getMinutes()
      return `${hours}:${String(minutes).padStart(2, "0")}`
    }
  }
  const { isEmpty } = useChat()

  if (codeEditor && !isIDE) {
    return (
      <>
        <Button
          className="button transparent xSmall"
          onClick={() => {
            toggleIDE()
          }}
          style={{
            ...utilities.button.style,
            ...utilities.transparent.style,
            ...utilities.xSmall.style,
            ...(hasHydrated && isMobileDevice && skeletonStyles.blog.style),
          }}
        >
          <CodeXml size={20} /> {"Code"}
        </Button>
      </>
    )
  }

  if (!focus || viewPortWidth < 375) {
    return (
      <>
        <A
          href={`/blossom`}
          className="button transparent"
          style={{
            ...utilities.button.style,
            ...utilities.transparent.style,
            ...utilities.small.style,
            ...(hasHydrated && isMobileDevice && skeletonStyles.blog.style),
          }}
        >
          <Img logo="blossom" size={22} /> {"Blossom"}
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
  const { app, isRemovingApp, isSavingApp } = useApp()

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
            ...(isEmpty && skeletonStyles.mainEmpty.style),
            ...(isDrawerOpen &&
              {
                // position: "absolute",
                // lef: 0,
              }),
            ...{
              display: "flex",
              // paddingTop: isCapacitor && os === "ios" ? 40 : undefined,
            },
          }}
        >
          <Div
            data-tauri-drag-region
            onDoubleClick={async () => {
              if (!isTauri) return
              try {
                const { getCurrentWindow } = await import(
                  "@tauri-apps/api/window"
                )
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
              ...(isStandalone && skeletonStyles.headerStandalone.style),
              ...(isEmpty && skeletonStyles.headerEmpty.style),
              ...(isCapacitor && os === "ios" ? { paddingTop: 55 } : {}),
              ...(isCapacitor && os === "ios" && threadId
                ? {
                    position: "fixed",
                    top: 0,
                    paddingTop: 50,
                    backgroundColor: "var(--background)",
                  }
                : {}),
            }}
            // className={clsx(hasHydrated && device && styles[device])}
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
                      paddingTop: !isDrawerOpen && isTauri ? "1.4rem" : "0",
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

                    {!isEmpty || threadId ? null : (
                      <FocusButton
                        isDrawerOpen={isDrawerOpen}
                        time={time}
                        isCountingDown={isCountingDown}
                      />
                    )}
                  </Div>
                </Div>
                <Div style={{ ...skeletonStyles.right.style }}>
                  {time && !isEmpty ? (
                    <>
                      <FocusButton
                        isDrawerOpen={isDrawerOpen}
                        time={time}
                        isCountingDown={isCountingDown}
                      />
                    </>
                  ) : (
                    <CharacterProfiles />
                  )}
                  {<Subscribe />}

                  <SignIn showSignIn={false} />

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
