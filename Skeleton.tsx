"use client"

import clsx from "clsx"
import styles from "./Skeleton.module.scss"
import Menu from "chrry/Menu"
import SignIn from "chrry/SignIn"
import Subscribe from "chrry/Subscribe"
import { useAppContext } from "chrry/context/AppContext"
import { CircleEllipsis, NotebookPen } from "./icons"
import { useHasHydrated } from "chrry/hooks"
import Loading from "chrry/Loading"
import LanguageSwitcher from "./LanguageSwitcher"
import { useEffect, useState } from "react"
import Img from "./Image"
import CharacterProfiles from "./CharacterProfiles"
import {
  Button,
  Div,
  H1,
  Main,
  useLocalStorage,
  useNavigation,
  usePreviousPathname,
  usePlatform,
  VexToast,
} from "./platform"
import { useStyles } from "./context/StylesContext"
import {
  useAuth,
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
  const { t } = useAppContext()

  // Auth context

  // Chat context
  const { isEmpty } = useChat()

  // Navigation context
  const { pathname, setIsNewChat, hasNotification } = useNavigationContext()

  const { isDrawerOpen, setIsDrawerOpen, isSmallDevice } = useTheme()

  const { device } = usePlatform()

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

    preloadImages.forEach((src) => {
      const img = new Image()
      img.src = src
    })
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
            className={clsx(hasHydrated && device && styles[device])}
          >
            <Div style={{ ...skeletonStyles.hamburgerMenu.style }}>
              {!isDrawerOpen && (
                <Button
                  style={{
                    ...skeletonStyles.hamburgerButton.style,
                    ...utilities.link,
                  }}
                  onClick={toggleMenu}
                >
                  {hasNotification && <span className={styles.notification} />}
                  <CircleEllipsis color="var(--accent-1)" size={24} />
                </Button>
              )}
              {!isDrawerOpen ? (
                <Div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <A
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
              <A
                href={`/blossom`}
                style={{
                  ...utilities.button.style,
                  ...utilities.transparent.style,
                  ...utilities.small.style,
                  ...(hasHydrated && isMobile && skeletonStyles.blog.style),
                }}
              >
                <Img logo="blossom" size={22} /> {"Blossom"}
              </A>
            </Div>
            <Div style={{ ...skeletonStyles.right.style }}>
              <CharacterProfiles />
              <Subscribe className={styles.subscribeDesktop} />

              <SignIn showSignIn={false} className={styles.signIn} />

              <LanguageSwitcher className={styles.languageSwitcher} />
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
