"use client"

import React, { useEffect, useRef, useState } from "react"
import {
  ArrowLeft,
  AtSign,
  BellDot,
  HatGlasses,
  LoaderCircle,
  LockOpen,
  Lock,
  MessageCirclePlus,
  PanelRight,
  Search,
  Tornado,
  UserLock,
  UserRoundCog,
  UserRoundPlus,
  UsersRound,
  WannathisIcon,
} from "./icons"
import {
  BrowserInstance,
  checkIsExtension,
  FRONTEND_URL,
  VERSION,
} from "./utils"
import { toast } from "./platform/toast"
import { ANALYTICS_EVENTS } from "./utils/analyticsEvents"
import { hasThreadNotification } from "./utils/hasThreadNotification"
import Loading from "./Loading"
import { useAppContext } from "./context/AppContext"
import { useAuth, useNavigationContext, useApp } from "./context/providers"
import {
  Button,
  Div,
  H4,
  isTauri,
  Span,
  usePlatform,
  useTheme,
} from "./platform"
import { MotiView } from "./platform/MotiView"
import { useHasHydrated } from "./hooks"
import Bookmark from "./Bookmark"
import CollaborationStatus from "./CollaborationStatus"
import ColorScheme from "./ColorScheme"
import Img from "./Image"
import EmptyStateTips from "./EmptyStateTips"
import ThemeSwitcher from "./ThemeSwitcher"
import { useMenuStyles } from "./Menu.styles"
import A from "./a/A"

export default function Menu({
  className,
  showThreads = true,
}: {
  className?: string
  showThreads?: boolean
}) {
  // Split contexts for better organization
  const { t } = useAppContext()

  // Auth context
  const {
    user,
    guest,
    profile,
    plausible,
    showFocus,
    setShowFocus,
    getAppSlug,
    loadingAppId,
    storeApps,
    setLoadingAppId,
    hasStoreApps,
    setBurn,
  } = useAuth()

  const city = (user || guest)?.city || ""
  // const { utilities } = useStyles()

  const styles = useMenuStyles()

  // Navigation context
  const {
    router,
    threads,
    setIsNewChat,
    collaborationStatus,
    setCollaborationStatus,
    pendingCollaborationThreadsCount,
    activeCollaborationThreadsCount,
    isLoadingThreads,
    refetchThreads,
    setIsAccountVisible,
    goToThreads,
    addParams,
  } = useNavigationContext()

  const { app } = useApp()

  // Platform context
  const { isTauri: tauri, os, viewPortHeight, isCapacitor } = usePlatform()

  const [isFullscreen, setIsFullscreen] = useState(false)

  // Detect fullscreen state in Tauri
  useEffect(() => {
    if (tauri && typeof window !== "undefined") {
      const checkFullscreen = async () => {
        try {
          const { getCurrentWindow } = await import("@tauri-apps/api/window")
          const appWindow = getCurrentWindow()

          // Check if isFullscreen method exists (Tauri v2+)
          if (typeof appWindow.isFullscreen === "function") {
            const fullscreen = await appWindow.isFullscreen()
            setIsFullscreen(fullscreen)
          }
        } catch (e) {
          // Silent fail - not critical
        }
      }

      checkFullscreen()

      // Listen for fullscreen changes
      const interval = setInterval(checkFullscreen, 500)
      return () => clearInterval(interval)
    }
  }, [tauri])

  const [loadingThreadId, setLoadingThreadId] = useState<string | null>(null)

  useEffect(() => {
    if (!loadingAppId) {
      setLoadingThreadId(null)
      loadingThreadId && router.push(`/threads/${loadingThreadId}`)
      if (loadingThreadId && isSmallDevice) {
        toggleMenu()
      }
    }
  }, [loadingAppId])

  // Theme context
  const {
    theme,
    isDark,
    addHapticFeedback,
    reduceMotion: reduceMotionContext,
    setReduceMotion,
    isMobileDevice,
    isDrawerOpen,
    setIsDrawerOpen,
    isSmallDevice,
    colors,
    isThemeLocked,
    setIsThemeLocked,
  } = useTheme()

  const toggleMenu = ({ timeout = 200 }: { timeout?: number } = {}) => {
    addHapticFeedback()
    plausible({
      name: ANALYTICS_EVENTS.MENU_TOGGLE,
      props: {
        isDrawerOpen,
        isSmallDevice,
      },
    })

    setTimeout(
      () => {
        setIsDrawerOpen(!isDrawerOpen)
      },
      timeout ?? (isCapacitor ? 300 : timeout),
    )
  }

  const toggleMenuIfSmallDevice = () => {
    if (isSmallDevice) {
      toggleMenu()
    }
  }

  const hasHydrated = useHasHydrated()

  const reload = () => {}

  const timelineListRef = useRef<HTMLDivElement>(null)

  // Custom loading state that waits for actual DOM rendering

  const [animationKey, setAnimationKey] = useState(0)

  useEffect(() => {
    if (!reduceMotionContext) {
      setAnimationKey((prev) => prev + 1)
    }
  }, [reduceMotionContext])
  // Animation key changes to trigger reanimate

  const innerRef = React.useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && document.addEventListener) {
      function handleClickOutside(event: MouseEvent) {
        if (
          isSmallDevice &&
          innerRef.current &&
          !innerRef.current.contains(event.target as Node)
        ) {
          setIsDrawerOpen(false)
        }
      }

      document.addEventListener("mousedown", handleClickOutside)
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }
  }, [isSmallDevice])

  // useEffect(() => {
  //   // isDrawerOpen && animateThreads() // Moti handles this declaratively
  //   const handleKeyDown = (e: KeyboardEvent) => {
  //     if (e.key === "Escape") {
  //       setIsDrawerOpen(!isDrawerOpen)
  //     }
  //   }

  //   if (typeof window !== "undefined" && window.addEventListener) {
  //     window.addEventListener("keydown", handleKeyDown)
  //     return () => {
  //       window.removeEventListener("keydown", handleKeyDown)
  //     }
  //   }
  // }, [isDrawerOpen])

  const [lastStarredId, setLastStarredId] = useState<string | null>(null)
  const threadRefs = useRef<{ [id: string]: HTMLDivElement | null }>({})

  useEffect(() => {
    // Function to get or create the meta tag
    const getOrCreateThemeMetaTag = () => {
      let meta = document.querySelector(
        "meta[name='theme-color']",
      ) as HTMLMetaElement
      if (!meta) {
        meta = document.createElement("meta")
        meta.name = "theme-color"
        document.head.appendChild(meta)
      }
      return meta
    }

    const getOrCreateBackgroundMetaTag = () => {
      let meta = document.querySelector(
        "meta[name='background-color']",
      ) as HTMLMetaElement
      if (!meta) {
        meta = document.createElement("meta")
        meta.name = "background-color"
        document.head.appendChild(meta)
      }
      return meta
    }

    const themeMeta = getOrCreateThemeMetaTag()
    themeMeta.content = isDark ? "#000000" : "#ffffff"

    const backgroundMeta = getOrCreateBackgroundMetaTag()
    backgroundMeta.content = isDark ? "#000000" : "#ffffff"
  }, [theme])

  useEffect(() => {
    if (lastStarredId && threadRefs.current[lastStarredId]) {
      threadRefs.current[lastStarredId]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })
      setLastStarredId(null) // reset after scrolling
    }
  }, [threads, lastStarredId])

  // if (!hasHydrated) {
  //   return null
  // }

  return (
    <>
      <Div
        suppressHydrationWarning
        className={`menu blur safeArea ${os}`}
        key={isDrawerOpen ? "open" : "closed"}
        ref={innerRef}
        style={{
          ...styles.menu.style,
          ...(isCapacitor && os === "ios" ? { paddingTop: 60 } : {}),
          paddingBottom: os === "ios" || tauri ? 10 : 0,
          ...(isDrawerOpen ? styles.open.style : styles.closed.style),
        }}
      >
        <>
          <Div>
            {/* <Controls /> */}
            {!isFullscreen && tauri && (
              <Div
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
                  height: "1.5rem",
                  width: "100%",
                  cursor: "default",
                  // backgroundColor: "var(--background-1)",
                }}
              ></Div>
            )}
            <Div
              style={{
                ...styles.menuHeader.style,
              }}
            >
              {isDrawerOpen ? (
                <>
                  <A
                    data-testid="menu-home-button"
                    className={"link"}
                    href={FRONTEND_URL}
                    onClick={(e) => {
                      addHapticFeedback()
                      plausible({
                        name: ANALYTICS_EVENTS.HOME_CLICK,
                      })
                      if (e.metaKey || e.ctrlKey) {
                        return
                      }
                      e.preventDefault()
                      setShowFocus(false)

                      toggleMenuIfSmallDevice()
                      setIsNewChat(true)
                      reload()
                    }}
                  >
                    <Img app={app} size={28} />
                    <Span style={styles.brand.style}>{app?.name || "Vex"}</Span>
                  </A>
                  <Button
                    className={"link"}
                    onClick={toggleMenu}
                    style={styles.menuButton.style}
                  >
                    <PanelRight
                      strokeWidth={1.5}
                      color="var(--accent-1)"
                      size={20}
                    />
                  </Button>
                </>
              ) : (
                <Button
                  suppressHydrationWarning
                  className={"link"}
                  onClick={toggleMenu}
                >
                  <Img app={app} size={28} />
                </Button>
              )}
            </Div>
          </Div>

          <Div
            style={{
              ...styles.menuContent.style,
            }}
          >
            <Div
              suppressHydrationWarning
              style={{
                ...styles.menuItems.style,
                display: "flex",
                marginTop:
                  !viewPortHeight || viewPortHeight > 700 ? "1rem" : undefined,
              }}
            >
              <A
                data-testid="new-chat-button"
                href={FRONTEND_URL}
                onClick={(e) => {
                  plausible({
                    name: ANALYTICS_EVENTS.NEW_CHAT_CLICK,
                  })
                  if (e.metaKey || e.ctrlKey) {
                    return
                  }
                  e.preventDefault()

                  setShowFocus(false)

                  isSmallDevice ? toggleMenu() : addHapticFeedback()
                  setIsNewChat(true)
                  reload()
                }}
                style={styles.menuItemButton.style}
                className="button transparent"
              >
                <MessageCirclePlus size={18} /> {t("New chat")}
              </A>
              <Button
                onClick={() => {
                  plausible({
                    name: ANALYTICS_EVENTS.PRIVATE_CHAT_CLICK,
                  })
                  setShowFocus(false)
                  isSmallDevice ? toggleMenu() : addHapticFeedback()
                  setBurn(true)
                  reload()
                }}
                style={styles.menuItemButton.style}
                className="button transparent"
              >
                <HatGlasses size={18} /> {t("Incognito Chat")}
              </Button>
              <Button
                onClick={() => {
                  isSmallDevice ? toggleMenu() : addHapticFeedback()
                  goToThreads()
                }}
                style={styles.menuItemButton.style}
                className="button transparent"
              >
                <Search size={18} /> {t("Search chats")}
              </Button>
              {showThreads && (
                <Div
                  style={{
                    ...styles.threads.style,
                    ...(isLoadingThreads ? styles.loading.style : {}),
                  }}
                >
                  <H4 style={styles.threadsTitle.style}>
                    {collaborationStatus === "active" ? (
                      <>
                        <UsersRound size={15} color={colors.accent6} />{" "}
                        {t("Collaborations")}
                      </>
                    ) : collaborationStatus === "pending" ? (
                      <>
                        <UsersRound size={15} color={colors.accent6} />{" "}
                        {t("Pending")}
                      </>
                    ) : (
                      <>
                        {(() => {
                          if (!hasHydrated) return null
                          const name = profile?.name || user?.name

                          const isOwner =
                            user &&
                            (!profile || profile?.userName === user?.userName)

                          if (isOwner) {
                            return (
                              <>
                                <Button
                                  className="link"
                                  style={styles.profileButton.style}
                                  onClick={() => {
                                    addHapticFeedback()
                                    isSmallDevice
                                      ? toggleMenu({ timeout: 0 })
                                      : null
                                    setIsAccountVisible(true)
                                  }}
                                >
                                  <UserRoundCog size={18} />{" "}
                                  <Span
                                    style={{
                                      color: isMobileDevice
                                        ? undefined
                                        : "var(--foreground)",
                                    }}
                                  >
                                    {name || t("Threads")}
                                  </Span>
                                </Button>
                              </>
                            )
                          }

                          return (
                            <>
                              <AtSign size={18} /> {name || t("Threads")}
                            </>
                          )
                        })()}
                      </>
                    )}
                    <Div
                      style={{
                        marginLeft: "auto",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 7.5,
                      }}
                    >
                      {profile && profile.userName !== user?.userName ? (
                        <Button
                          className="link"
                          onClick={() => {
                            setIsNewChat(true)
                          }}
                        >
                          <ArrowLeft color={colors.accent6} size={17} />
                        </Button>
                      ) : (
                        <>
                          {activeCollaborationThreadsCount > 0 ? (
                            <>
                              {collaborationStatus === "active" ? (
                                <Button
                                  className="link"
                                  onClick={() => {
                                    setIsNewChat(true)
                                  }}
                                >
                                  <ArrowLeft color={colors.accent6} size={17} />
                                </Button>
                              ) : (
                                <Button
                                  title={t("Active Collaborations")}
                                  className="link"
                                  onClick={() => {
                                    addHapticFeedback()

                                    if (guest) {
                                      addParams({
                                        signIn: "register",
                                      })
                                      toggleMenuIfSmallDevice()
                                      return
                                    }
                                    setCollaborationStatus("active")
                                  }}
                                >
                                  <UsersRound
                                    color={colors.accent1}
                                    size={17}
                                  />
                                </Button>
                              )}
                            </>
                          ) : null}
                          {!profile && pendingCollaborationThreadsCount > 0 ? (
                            collaborationStatus === "pending" ? (
                              <Button
                                className="link"
                                onClick={() => {
                                  setCollaborationStatus(null)
                                }}
                              >
                                <ArrowLeft color={colors.accent6} size={16} />
                              </Button>
                            ) : (
                              <Button
                                title={t("Pending Collaborations")}
                                className="link"
                                onClick={() => {
                                  addHapticFeedback()
                                  setCollaborationStatus("pending")
                                }}
                              >
                                <UserRoundPlus
                                  color={colors.accent6}
                                  size={17}
                                />
                              </Button>
                            )
                          ) : null}
                        </>
                      )}
                    </Div>
                  </H4>
                  {isLoadingThreads ? (
                    <Div>
                      <Loading width={20} />
                    </Div>
                  ) : (
                    <>
                      <Div
                        ref={timelineListRef}
                        className="menuThreadList"
                        style={{
                          ...styles.threadsList.style,
                        }}
                      >
                        {threads?.threads
                          ?.sort((a, b) => {
                            return (
                              (b.isMainThread ? 1 : 0) -
                              (a.isMainThread ? 1 : 0)
                            )
                          })
                          .map((thread, index) => (
                            <MotiView
                              key={`${thread.id}-${thread.bookmarks?.length}-${animationKey}`}
                              from={{
                                opacity: 0,
                                translateY: 0,
                                translateX: -10,
                              }}
                              animate={{
                                opacity: 1,
                                translateY: 0,
                                translateX: 0,
                              }}
                              transition={{
                                type: "timing",
                                duration: reduceMotionContext ? 0 : 100,
                                delay: reduceMotionContext ? 0 : index * 50,
                              }}
                              data-testid="menu-thread-item"
                              style={{
                                ...styles.threadItem.style,
                                paddingRight:
                                  collaborationStatus === "pending" ? 0 : 17,
                              }}
                              ref={(el: any) => {
                                threadRefs.current[thread.id] = el
                              }}
                              className="menuThreadItem"
                            >
                              {thread.isMainThread ? (
                                <Span
                                  title={t("DNA thread")}
                                  style={{ marginRight: 3, fontSize: 11 }}
                                >
                                  🧬
                                </Span>
                              ) : thread.visibility !== "private" ||
                                thread.collaborations?.length ? (
                                <Span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 5,
                                    fontSize: 12,
                                    position: "relative",
                                    marginRight: 3,
                                    top: "1px",
                                  }}
                                  title={t(thread.visibility)}
                                >
                                  {hasThreadNotification({
                                    thread,
                                    user,
                                    guest,
                                  }) ? (
                                    <BellDot color={colors.accent6} size={13} />
                                  ) : thread.collaborations?.length ? (
                                    <UsersRound
                                      color={colors.accent1}
                                      size={13}
                                    />
                                  ) : thread.visibility === "public" ? (
                                    <LockOpen
                                      color={colors.accent1}
                                      size={13}
                                    />
                                  ) : thread.visibility === "protected" ? (
                                    <UserLock
                                      color={colors.accent1}
                                      size={13}
                                    />
                                  ) : null}
                                </Span>
                              ) : null}

                              {(() => {
                                const url = `/threads/${thread.id}`

                                return (
                                  <A
                                    className="link"
                                    data-testid="menu-thread-link"
                                    style={{
                                      ...styles.threadItem.style,
                                    }}
                                    onClick={(e) => {
                                      const threadApp = storeApps.find(
                                        (app) => app.id === thread.appId,
                                      )
                                      if (
                                        thread.appId &&
                                        (!threadApp || !hasStoreApps(threadApp))
                                      ) {
                                        setLoadingThreadId(thread.id)
                                        setLoadingAppId(thread.appId)
                                        plausible({
                                          name: ANALYTICS_EVENTS.THREAD_CLICK_MENU,
                                          props: {
                                            threadId: thread.id,
                                          },
                                        })
                                        toggleMenuIfSmallDevice()
                                        return
                                      }
                                      plausible({
                                        name: ANALYTICS_EVENTS.THREAD_CLICK_MENU,
                                        props: {
                                          threadId: thread.id,
                                        },
                                      })
                                      if (e.metaKey || e.ctrlKey) {
                                        return
                                      }
                                      e.preventDefault()
                                      isSmallDevice
                                        ? toggleMenu()
                                        : addHapticFeedback()
                                      router.push(url)
                                    }}
                                    href={url}
                                  >
                                    {thread.title}
                                  </A>
                                )
                              })()}

                              {loadingThreadId === thread.id ? (
                                <Loading
                                  style={{
                                    ...styles.star.style,
                                    width: 14,
                                    height: 14,
                                  }}
                                />
                              ) : collaborationStatus === "pending" ? (
                                <CollaborationStatus
                                  dataTestId="menu"
                                  onSave={() => {
                                    if (threads.totalCount === 1) {
                                      setCollaborationStatus(undefined)
                                    }
                                    refetchThreads()
                                  }}
                                  style={styles.collaborationStatus.style}
                                  thread={thread}
                                  isIcon
                                />
                              ) : (
                                <Bookmark
                                  dataTestId="menu"
                                  onSave={() => {
                                    refetchThreads()
                                  }}
                                  style={{
                                    ...styles.star.style,
                                    ...(thread.bookmarks?.some(
                                      (b) => b.userId === thread.userId,
                                    ) && styles.starActive.style),
                                  }}
                                  thread={thread}
                                />
                              )}
                            </MotiView>
                          ))}
                      </Div>
                      {!threads?.totalCount && (
                        <>
                          <Div style={styles.noThreadsContainer.style}>
                            {t("Nothing here yet")}
                          </Div>
                        </>
                      )}
                      {threads?.threads?.length
                        ? (() => {
                            return (
                              <Div
                                suppressHydrationWarning
                                style={styles.loadMoreButtonContainer.style}
                              >
                                <Button
                                  data-testid="load-more-threads-menu"
                                  onClick={() => {
                                    addHapticFeedback()
                                    plausible({
                                      name: ANALYTICS_EVENTS.LOAD_MORE_THREADS_MENU,
                                    })
                                    toggleMenuIfSmallDevice()
                                    collaborationStatus
                                      ? goToThreads({
                                          collaborationStatus,
                                        })
                                      : goToThreads()
                                  }}
                                  className="button transparent small"
                                  style={styles.loadMoreButton.style}
                                >
                                  <LoaderCircle size={14} /> {t("Load more")}
                                </Button>
                              </Div>
                            )
                          })()
                        : null}
                      {!threads?.threads?.length ||
                      threads?.threads?.length < 2 ? (
                        <EmptyStateTips style={{ marginTop: 15 }} />
                      ) : null}
                    </>
                  )}
                </Div>
              )}
            </Div>
          </Div>
          <Div style={styles.footer.style}>
            <Div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 3,
                fontSize: "0.7rem",
                color: "var(--shade7)",
              }}
            >
              <Img icon="hamster" showLoading={false} width={26} height={26} />
              {hasHydrated ? <Span>{new Date().getFullYear()}</Span> : null}
              <Button
                style={{
                  marginLeft: "auto",
                  gap: 7.5,
                  color: "#f87171",
                  fontSize: "0.8rem",
                }}
                onClick={() => {
                  if (checkIsExtension()) {
                    BrowserInstance?.runtime?.sendMessage({
                      action: "openInSameTab",
                      url: `${FRONTEND_URL}/affiliate`,
                    })

                    isSmallDevice && toggleMenu()

                    return
                  }
                  router.push("/affiliate")
                  isSmallDevice && toggleMenu()
                }}
                className={"link"}
              >
                <Span
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: "120px",
                  }}
                >
                  {city || "Amsterdam"}
                </Span>
                <Img icon="heart" width={22} height={22} />
              </Button>
            </Div>

            <Div style={styles.colorSchemeContainer.style}>
              <ColorScheme style={styles.colorScheme.style} />
              {!hasHydrated ? null : isThemeLocked ? (
                <Button
                  title={t("Unlock theme")}
                  onClick={() => {
                    setIsThemeLocked(false)
                    toast.success(t("Theme unlocked"))
                  }}
                  style={{
                    color: colors.accent6,
                    marginLeft: 5,
                    fontSize: "0.5rem",
                  }}
                  className={"link"}
                >
                  <LockOpen size={15} />
                </Button>
              ) : (
                <Button
                  title={t("Lock theme")}
                  onClick={() => {
                    setIsThemeLocked(true)
                    toast.success(t("Theme locked"))
                  }}
                  style={{
                    color: colors.accent6,
                    marginLeft: 5,
                    fontSize: "0.7rem",
                  }}
                  className={"link"}
                >
                  <Lock size={15} />
                </Button>
              )}

              {hasHydrated && (
                <Button
                  title={t("Motion")}
                  onClick={() => {
                    setReduceMotion(!reduceMotionContext)
                  }}
                  style={{
                    ...styles.reduceMotionButton.style,
                    marginLeft: "auto",
                  }}
                  className={"link"}
                >
                  <Tornado
                    color={
                      !reduceMotionContext ? colors.accent6 : colors.shade3
                    }
                    size={20}
                  />
                </Button>
              )}
            </Div>

            <Div style={styles.bottom.style}>
              <A
                openInNewTab
                href={`/?subscribe=true&plan=${app?.store?.slug?.includes("sushi") ? "coder" : app?.store?.slug === "wine" ? (app?.slug === "pear" ? "pear" : "grape") : "watermelon"}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  alignSelf: "flex-start",
                }}
                onClick={(e) => {
                  e.preventDefault()
                  addParams({
                    subscribe: true,
                    plan: app?.store?.slug?.includes("sushi")
                      ? "coder"
                      : app?.store?.slug === "wine"
                        ? app?.slug === "pear"
                          ? "pear"
                          : "grape"
                        : "watermelon",
                  })
                  toggleMenuIfSmallDevice()
                }}
                target="_blank"
                rel="noopener noreferrer"
                className="button transparent small"
              >
                <Img
                  logo={
                    app?.store?.slug?.includes("sushi")
                      ? "sushi"
                      : app?.store?.slug === "wine"
                        ? app?.slug === "pear"
                          ? "pear"
                          : "grape"
                        : "watermelon"
                  }
                  width={20}
                  height={20}
                />
                {app?.store?.slug?.includes("sushi")
                  ? "Sushi"
                  : app?.store?.slug === "wine"
                    ? app?.slug === "pear"
                      ? "Pear"
                      : "Grape"
                    : "WM"}
                &#169;
              </A>

              <ThemeSwitcher />
              {hasHydrated && (
                <Span style={{ marginLeft: "auto", fontSize: 12 }}>
                  v{VERSION}
                </Span>
              )}
            </Div>
          </Div>
        </>
      </Div>
    </>
  )
}
