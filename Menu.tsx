"use client"

import React, { useEffect, useRef, useState } from "react"
import styles from "./Menu.module.scss"
import clsx from "clsx"
import {
  ArrowLeft,
  AtSign,
  BellDot,
  HatGlasses,
  LoaderCircle,
  LockOpen,
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
import { hasThreadNotification } from "./utils/hasThreadNotification"
import Loading from "./Loading"
import { useAppContext } from "./context/AppContext"
import {
  useAuth,
  useNavigationContext,
  useApp,
  useChat,
} from "./context/providers"
import { usePlatform, useTheme } from "./platform"
import { animate, stagger } from "motion"
import { useHasHydrated } from "./hooks"
import Bookmark from "./Bookmark"
import CollaborationStatus from "./CollaborationStatus"
import ColorScheme from "./ColorScheme"
import { defaultLocale } from "./locales"
import Img from "./Image"
import EmptyStateTips from "./EmptyStateTips"
import ThemeSwitcher from "./ThemeSwitcher"

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
  const { user, guest, profile, track, language, allApps, getAppSlug } =
    useAuth()

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
    slug,
    goToThreads,
  } = useNavigationContext()

  // App context
  const { app } = useApp()

  // Platform context
  const { os, isStandalone } = usePlatform()

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
  } = useTheme()

  const [previousThreads, setPreviousThreads] = useState<typeof threads>({
    threads: [],
    totalCount: 0,
  })

  const toggleMenu = () => {
    addHapticFeedback()
    track({
      name: "menu-toggle",
      props: {
        isDrawerOpen,
        isSmallDevice,
      },
    })
    setIsDrawerOpen(!isDrawerOpen)
  }

  const hasHydrated = useHasHydrated()

  const reload = () => {
    // if (isExtension) return
    // const page = document.querySelector("[data-url]")
    // if (page) {
    //   const attr = page.getAttribute("data-url")
    //   if (!attr) return
    //   const pathname = window.location.pathname
    //   if (pathname !== attr) {
    //     window.location.href = attr
    //   }
    // }
  }

  const timelineListRef = useRef<HTMLDivElement>(null)

  // Custom loading state that waits for actual DOM rendering

  const [hasAnimatedThreads, setHasAnimatedThreads] = useState(false)
  const animateThreads = (
    reduceMotion: boolean = reduceMotionContext,
  ): void => {
    if (typeof window === "undefined") return
    // const menuThreadList = document?.querySelector(".menuThreadList")

    // Check for reduced motion preference
    const prefersReducedMotion =
      reduceMotion ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (prefersReducedMotion) {
      // Just make visible without animation
      const menuThreadList = document?.querySelector(".menuThreadList")
      const menuThreadItems = document?.querySelectorAll(".menuThreadItem")

      if (menuThreadList) {
        ;(menuThreadList as HTMLElement).style.opacity = "1"
      }
      menuThreadItems?.forEach((item) => {
        ;(item as HTMLElement).style.opacity = "1"
      })
    } else {
      // Animate with motion
      animate([
        [".menuThreadList", { opacity: [0, 1] }, { duration: 0 }],
        [
          ".menuThreadItem",
          {
            y: [-10, 0],
            opacity: [0, 1],
            transform: ["translateX(-10px)", "none"],
          },
          {
            delay: stagger(0.05),
            duration: 0.1,
          },
        ],
      ])
      setHasAnimatedThreads(true)
    }
  }

  const innerRef = React.useRef<HTMLDivElement>(null)

  useEffect(() => {
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
  }, [isSmallDevice])

  useEffect(() => {
    isDrawerOpen && animateThreads()
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsDrawerOpen(!isDrawerOpen)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isDrawerOpen])

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

  useEffect(() => {
    setPreviousThreads(threads)

    if (threads?.threads?.length === 0) return

    const areEqual =
      previousThreads.threads.length === threads.threads.length &&
      previousThreads.threads.every(
        (prev, i) =>
          prev.id === threads.threads[i]?.id &&
          prev.bookmarks?.length === threads.threads[i]?.bookmarks?.length,
      )
    setTimeout(() => {
      ;(!hasAnimatedThreads || !areEqual) && animateThreads()
    }, 150)
  }, [threads, hasAnimatedThreads])

  return (
    <>
      <div
        key={isDrawerOpen ? "open" : "closed"}
        ref={innerRef}
        className={clsx(
          styles.menu,
          isDrawerOpen ? styles.open : styles.closed,
          className,
        )}
      >
        <>
          <div className={clsx(styles.menuHeader)}>
            {isDrawerOpen ? (
              <>
                <a
                  data-testid="menu-home-button"
                  className={clsx("link")}
                  href={FRONTEND_URL}
                  onClick={(e) => {
                    addHapticFeedback()
                    track({
                      name: "home-click",
                    })
                    if (e.metaKey || e.ctrlKey) {
                      return
                    }
                    e.preventDefault()

                    isSmallDevice ? toggleMenu() : null
                    setIsNewChat(true)
                    reload()
                  }}
                >
                  <Img app={app} size={28} />
                  <span className={styles.brand}>{app?.name || "Vex"}</span>
                </a>
                <button
                  className={clsx("link", styles.menuButton)}
                  onClick={toggleMenu}
                >
                  <PanelRight color={"var(--shade-4)"} size={20} />
                </button>
              </>
            ) : (
              <button className={clsx("link")} onClick={toggleMenu}>
                <Img app={app} size={28} />
              </button>
            )}
          </div>

          <div
            className={clsx(
              styles.menuContent,
              isDrawerOpen ? styles.open : styles.closed,
            )}
          >
            <div className={styles.menuItems}>
              <a
                data-testid="new-chat-button"
                href={FRONTEND_URL}
                onClick={(e) => {
                  track({
                    name: "new-chat-click",
                  })
                  if (e.metaKey || e.ctrlKey) {
                    return
                  }
                  e.preventDefault()

                  isSmallDevice ? toggleMenu() : addHapticFeedback()
                  setIsNewChat(true)
                  reload()
                }}
                className={clsx("button", "transparent", styles.menuItemButton)}
              >
                <MessageCirclePlus size={18} /> {t("New chat")}
              </a>
              <a
                href={
                  isStandalone ? undefined : `${FRONTEND_URL}/?incognito=true`
                }
                onClick={(e) => {
                  track({
                    name: "private-chat-click",
                  })
                  if (e.metaKey || e.ctrlKey) {
                    return
                  }
                  e.preventDefault()

                  isSmallDevice ? toggleMenu() : addHapticFeedback()
                  router.push("/?incognito=true")
                  reload()
                }}
                className={clsx("button", "transparent", styles.menuItemButton)}
              >
                <HatGlasses size={18} /> {t("Incognito Chat")}
              </a>
              <a
                href={
                  isStandalone
                    ? undefined
                    : `${app ? getAppSlug(app, "") : ""}/threads`
                }
                onClick={(e) => {
                  track({
                    name: "threads-click-menu",
                  })
                  if (e.metaKey || e.ctrlKey) {
                    return
                  }
                  e.preventDefault()

                  isSmallDevice ? toggleMenu() : addHapticFeedback()
                  goToThreads()
                }}
                className={clsx("button", "transparent", styles.menuItemButton)}
              >
                <Search size={18} /> {t("Search chats")}
              </a>
              {showThreads && (
                <div
                  className={clsx(
                    styles.threads,
                    isLoadingThreads && styles.loading,
                  )}
                >
                  <h4 className={styles.threadsTitle}>
                    {collaborationStatus === "active" ? (
                      <>
                        <UsersRound size={15} color="var(--accent-6)" />{" "}
                        {t("Collaborations")}
                      </>
                    ) : collaborationStatus === "pending" ? (
                      <>
                        <UsersRound size={15} color="var(--accent-6)" />{" "}
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
                                <button
                                  className={clsx("link", styles.profileButton)}
                                  onClick={() => {
                                    addHapticFeedback()
                                    isMobileDevice && setIsDrawerOpen(false)
                                    setIsAccountVisible(true)
                                  }}
                                >
                                  <UserRoundCog size={18} />{" "}
                                  <span
                                    style={{
                                      color: isMobileDevice
                                        ? undefined
                                        : "var(--foreground)",
                                    }}
                                  >
                                    {name || t("Threads")}
                                  </span>
                                </button>
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
                    <div
                      style={{
                        marginLeft: "auto",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 7.5,
                      }}
                    >
                      {profile && profile.userName !== user?.userName ? (
                        <button
                          className={clsx("link")}
                          onClick={() => {
                            setIsNewChat(true)
                          }}
                        >
                          <ArrowLeft color="var(--accent-6)" size={17} />
                        </button>
                      ) : (
                        <>
                          {activeCollaborationThreadsCount > 0 ? (
                            <>
                              {collaborationStatus === "active" ? (
                                <button
                                  className={clsx("link")}
                                  onClick={() => {
                                    setIsNewChat(true)
                                  }}
                                >
                                  <ArrowLeft
                                    color="var(--accent-6)"
                                    size={17}
                                  />
                                </button>
                              ) : (
                                <button
                                  title={t("Active Collaborations")}
                                  className={clsx("link")}
                                  onClick={() => {
                                    addHapticFeedback()

                                    if (guest) {
                                      router.push("/?signIn=register")
                                      return
                                    }
                                    setCollaborationStatus("active")
                                  }}
                                >
                                  <UsersRound
                                    color="var(--accent-1)"
                                    size={17}
                                  />
                                </button>
                              )}
                            </>
                          ) : null}
                          {!profile && pendingCollaborationThreadsCount > 0 ? (
                            collaborationStatus === "pending" ? (
                              <button
                                className={clsx("link")}
                                onClick={() => {
                                  setIsNewChat(true)
                                }}
                              >
                                <ArrowLeft color="var(--accent-6)" size={16} />
                              </button>
                            ) : (
                              <button
                                title={t("Pending Collaborations")}
                                className={clsx("link")}
                                onClick={() => {
                                  addHapticFeedback()
                                  setCollaborationStatus("pending")
                                }}
                              >
                                <UserRoundPlus
                                  color="var(--accent-6)"
                                  size={17}
                                />
                              </button>
                            )
                          ) : null}
                        </>
                      )}
                    </div>
                  </h4>
                  {isLoadingThreads ? (
                    <div className={styles.loadingContainer}>
                      <Loading width={20} />
                    </div>
                  ) : (
                    <>
                      <div
                        ref={timelineListRef}
                        className={clsx(styles.threadsList, "menuThreadList")}
                      >
                        {threads.threads.map((thread) => (
                          <div
                            data-testid="menu-thread-item"
                            style={{
                              paddingRight:
                                collaborationStatus === "pending" ? 0 : 17,
                            }}
                            ref={(el) => {
                              threadRefs.current[thread.id] = el
                            }}
                            className={clsx(
                              styles.threadItem,
                              "menuThreadItem",
                            )}
                            key={`${thread.id}-${thread.bookmarks?.length}`}
                          >
                            {thread.visibility !== "private" ||
                            thread.collaborations?.length ? (
                              <span
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
                                  <BellDot color="var(--accent-6)" size={13} />
                                ) : thread.collaborations?.length ? (
                                  <UsersRound
                                    color="var(--accent-1)"
                                    size={13}
                                  />
                                ) : thread.visibility === "public" ? (
                                  <LockOpen color="var(--accent-1)" size={13} />
                                ) : thread.visibility === "protected" ? (
                                  <UserLock color="var(--accent-1)" size={13} />
                                ) : null}
                              </span>
                            ) : null}

                            {(() => {
                              const url = `/threads/${thread.id}`

                              return (
                                <a
                                  data-testid={`thread-link-${thread.id}`}
                                  onClick={(e) => {
                                    track({
                                      name: "thread-click-menu",
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
                                </a>
                              )
                            })()}

                            {collaborationStatus === "pending" ? (
                              <CollaborationStatus
                                dataTestId="menu"
                                onSave={() => {
                                  if (threads.totalCount === 1) {
                                    setCollaborationStatus(undefined)
                                  }
                                  refetchThreads()
                                }}
                                className={styles.collaborationStatus}
                                thread={thread}
                                isIcon
                              />
                            ) : (
                              <Bookmark
                                dataTestId="menu"
                                onSave={() => {
                                  refetchThreads()
                                }}
                                className={clsx(
                                  styles.star,
                                  thread.bookmarks?.some(
                                    (b) => b.userId === thread.userId,
                                  ) && styles.starActive,
                                )}
                                thread={thread}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                      {!isLoadingThreads && threads.threads.length === 0 && (
                        <>
                          <div className={styles.noThreadsContainer}>
                            {t("Nothing here yet")}
                          </div>
                        </>
                      )}
                      {threads.threads.length
                        ? (() => {
                            const url = `/threads${collaborationStatus ? `?collaborationStatus=${collaborationStatus}` : ""}`

                            return (
                              <div className={styles.loadMoreButtonContainer}>
                                <a
                                  href={url}
                                  data-testid="load-more-threads-menu"
                                  onClick={(e) => {
                                    addHapticFeedback()

                                    track({
                                      name: "load-more-threads-menu",
                                    })

                                    if (e.metaKey || e.ctrlKey) {
                                      return
                                    }
                                    e.preventDefault()
                                    isSmallDevice ? toggleMenu() : null
                                    router.push(url)
                                  }}
                                  className={clsx(
                                    "button",
                                    "transparent",
                                    "small",
                                    styles.loadMoreButton,
                                  )}
                                >
                                  <LoaderCircle size={14} /> {t("Load more")}
                                </a>
                              </div>
                            )
                          })()
                        : null}
                      {threads.threads.length < 2 && <EmptyStateTips />}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div
            className={clsx(
              styles.footer,
              os && styles[os],
              isStandalone ? styles.standalone : undefined,
            )}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 3,
                fontSize: "0.7rem",
                color: "var(--shade-7)",
              }}
            >
              <Img icon="hamster" showLoading={false} width={26} height={26} />
              {hasHydrated ? (
                <>
                  {new Date().getFullYear()}
                  &#169;
                </>
              ) : null}
              <button
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
                {"Amsterdam"}
                <Img icon="heart" width={22} height={22} />
              </button>
            </div>

            <div className={styles.colorSchemeContainer}>
              <ColorScheme className={styles.colorScheme} />
              {hasHydrated && (
                <button
                  title={t("Motion")}
                  onClick={() => {
                    reduceMotionContext && animateThreads(false)

                    setReduceMotion(!reduceMotionContext)
                  }}
                  style={{
                    marginLeft: "auto",
                    color: !reduceMotionContext
                      ? "var(--accent-6)"
                      : "var(--shade-3)",
                  }}
                  className={clsx("link", styles.reduceMotionButton)}
                >
                  <Tornado size={18} />
                  Motion
                </button>
              )}
            </div>

            <div className={styles.bottom}>
              <a
                onClick={(e) => {
                  if (checkIsExtension()) {
                    e.preventDefault()
                    BrowserInstance?.runtime?.sendMessage({
                      action: "openInSameTab",
                      url: `https://focusbutton.com${language === defaultLocale ? "" : `/${language}`}`,
                    })
                    return
                  }
                }}
                href={`https://wannathis.one`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  alignSelf: "flex-start",
                  gap: 3,
                  paddingInline: 8.5,
                }}
                target="_blank"
                rel="noopener noreferrer"
                className="button transparent"
              >
                <WannathisIcon width={18} height={18} />
                Wannathis
              </a>

              <ThemeSwitcher />
              {hasHydrated && (
                <span style={{ marginLeft: "auto", fontSize: 12 }}>
                  v{VERSION}
                </span>
              )}
            </div>
          </div>
        </>
      </div>
    </>
  )
}
