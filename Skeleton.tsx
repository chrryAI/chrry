"use client"

import clsx from "clsx"
import Menu from "./Menu"
import SignIn from "./SignIn"
import Subscribe from "./Subscribe"
import { CircleEllipsis } from "./icons"
import { useHasHydrated } from "../ui/hooks"
import LanguageSwitcher from "./LanguageSwitcher"
import { useEffect } from "react"
import Img from "./Image"
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
} from "./context/providers"
import { useTheme } from "./platform"
import A from "./A"
import Version from "./Version"
import AddToHomeScreen from "./AddToHomeScreen"

export default function Skeleton({
  className,
  children,
  showThreads = true,
}: {
  className?: string
  children?: React.ReactNode
  showThreads?: boolean
}): React.ReactElement {
  const { isMobile } = usePlatform()

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
  const { isStandalone } = usePlatform()

  // Data context
  const { FRONTEND_URL } = useData()

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
  }, [])

  // Call ALL hooks before any conditional returns
  const { skeletonStyles, utilities } = useStyles()

  return (
    <Div
      id="skeleton"
      className={clsx(className)}
      style={{
        ...skeletonStyles.page.style,
        paddingLeft: !isSmallDevice && isDrawerOpen ? 255 : 0,
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
            },
          }}
        >
          <Div
            style={{
              ...skeletonStyles.header.style,
              ...(isStandalone && skeletonStyles.headerStandalone.style),
              ...(isEmpty && skeletonStyles.headerEmpty.style),
            }}
            // className={clsx(hasHydrated && device && styles[device])}
          >
            <Div style={{ ...skeletonStyles.hamburgerMenu.style }}>
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
                    <Span style={{ ...skeletonStyles.notification.style }} />
                  )}
                  <CircleEllipsis
                    strokeWidth={1.5}
                    color="var(--accent-1)"
                    size={24}
                  />
                </Button>
              )}
              {!isDrawerOpen ? (
                <Div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <A
                    className="link"
                    clientOnly
                    href={`/`}
                    style={{
                      ...utilities.link.style,
                      ...skeletonStyles.hamburgerButton.style,
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
              {isEmpty && (
                <A
                  href={`/blossom`}
                  className="button transparent"
                  style={{
                    ...utilities.button.style,
                    ...utilities.transparent.style,
                    ...utilities.small.style,
                    ...(hasHydrated &&
                      isMobileDevice &&
                      skeletonStyles.blog.style),
                  }}
                >
                  <Img logo="blossom" size={22} /> {"Blossom"}
                </A>
              )}
            </Div>
            <Div style={{ ...skeletonStyles.right.style }}>
              <CharacterProfiles />
              <Subscribe />

              <SignIn showSignIn={false} />

              <LanguageSwitcher />
            </Div>
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
