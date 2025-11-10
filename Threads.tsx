"use client"

import React, { useEffect, useRef, useState } from "react"
import clsx from "clsx"
import styles from "./Threads.module.scss"
import { collaboration, thread, user } from "../ui/types"
import { useAppContext } from "./context/AppContext"
import Loading from "./Loading"
import useSWR from "swr"
import {
  ArrowLeft,
  AtSign,
  BellDot,
  CalendarIcon,
  LoaderCircle,
  Sparkles,
  StarIcon,
  UsersRound,
} from "./icons"
import {
  BrowserInstance,
  checkIsExtension,
  FRONTEND_URL,
  pageSizes,
} from "./utils"
import { animate, stagger } from "motion"
import Search from "./Search"
import Skeleton from "./Skeleton"
import EditThread from "./EditThread"
import { useLocalStorage } from "./hooks"
import Share from "./Share"
import Bookmark from "./Bookmark"
import Img from "./Image"
import Logo from "./Logo"
import {
  useApp,
  useAuth,
  useChat,
  useData,
  useNavigationContext,
} from "./context/providers"
import { useTheme } from "./platform"

const Threads = ({
  className,
  ...rest
}: {
  className?: string
  userName?: string
}) => {
  const { t } = useAppContext()

  const {
    router,
    pathname,
    isVisitor,
    refetchThreads,
    searchParams,
    collaborationStatus,
    setCollaborationStatus: setCollaborationStatusInternal,
    slug,
    userNameByUrl,
  } = useNavigationContext()

  const { reduceMotion } = useTheme()

  const {
    token,
    user,
    language,
    setProfile,
    profile,
    app,
    allApps,
    baseApp,
    getAppSlug,
    timeAgo,
  } = useAuth()

  const [sortByDate, setSortByDate] = useLocalStorage("sortByDate", true)

  // Extract username based on URL pattern
  let userName = rest.userName || userNameByUrl

  const [threads, setThreads] = useState<{
    threads: (thread & {
      collaborations?: { collaboration: collaboration; user: user }[]
    })[]
    hasNextPage: boolean
    nextPage: number | null
  }>({
    threads: [],
    hasNextPage: false,
    nextPage: null,
  })

  const setCollaborationStatus = (
    status: "pending" | "active" | undefined | null,
    pn: string = pathname,
  ) => {
    setCollaborationStatusInternal(status)

    const currentSearchStatus = searchParams.get("collaborationStatus")

    if (currentSearchStatus === status) {
      return
    }
    if (status) {
      router.push(`${pn}?collaborationStatus=${status}`)
    } else {
      router.push(pn)
    }
  }

  const [lastStarredId, setLastStarredId] = useState<string | null>(null)

  // Use backend sorting - no client-side sorting needed when sortByDate is false
  let sortedThreads = threads.threads

  const threadRefs = useRef<{ [id: string]: HTMLDivElement | null }>({})

  useEffect(() => {
    if (lastStarredId && threadRefs.current[lastStarredId]) {
      threadRefs.current[lastStarredId]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })
      setLastStarredId(null) // reset after scrolling
    }
  }, [sortedThreads, lastStarredId])

  const [until, setUntil] = useState<number>(1)
  const [search, setSearch] = useState("")

  const [isLoading, setIsLoading] = useState(true)

  const { actions } = useData()

  const {
    data: threadsData,
    mutate: refetch,
    isLoading: isLoadingThreads,
    error,
  } = useSWR(
    ["threads", until, search, sortByDate, app?.id],
    () => {
      if (!token) return
      return actions.getThreads({
        pageSize: pageSizes.threads * until,
        appId: app?.id,
        search,
        sort: sortByDate ? "date" : "bookmark",
        userName,
        collaborationStatus: collaborationStatus ?? undefined,
      })
    },
    {
      // revalidateOnMount: true,
    },
  )

  useEffect(() => {
    if (token && until) {
      refetch()
    }
  }, [token, until, sortByDate, collaborationStatus])

  useEffect(() => {
    if (error) {
      setIsLoading(false)
    }
  }, [error])

  // useEffect(() => {
  //   if (!isLoading) {
  //     searchInputRef.current?.focus()
  //   }
  // }, [isLoading])

  const animateThreads = (): void => {
    // Always ensure menu is visible by default

    // Only animate if we haven't before and don't prefer reduced motion
    if (typeof window !== "undefined") {
      // Check for reduced motion preference
      const prefersReducedMotion =
        reduceMotion ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches

      if (prefersReducedMotion) {
        // Just make visible without animation
        const menuThreadList = document?.querySelector(".threadList")
        const menuThreadItems = document?.querySelectorAll(".threadsItem")

        if (menuThreadList) {
          ;(menuThreadList as HTMLElement).style.opacity = "1"
        }
        menuThreadItems?.forEach((item) => {
          ;(item as HTMLElement).style.opacity = "1"
        })
      } else {
        animate([
          [".threadList", { opacity: [0, 1] }, { duration: 0 }],
          [
            ".threadsItem",
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
      }
    }
  }

  const [isLoadingMore, setIsLoadingMore] = useState(false)

  useEffect(() => {
    if (threadsData && Array.isArray(threadsData.threads)) {
      setThreads(threadsData)
      setIsLoading(false)

      setProfile(threadsData.user || threadsData?.threads?.[0]?.user)
    }
  }, [threadsData, user])

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      !isLoading &&
      !isLoadingMore &&
      !search
    ) {
      setTimeout(() => {
        animateThreads()
      }, 200)
    }
  }, [isLoading, isLoadingMore, search, sortByDate, collaborationStatus])

  return (
    <Skeleton>
      <div className={clsx(styles.threads, className)}>
        <h2 className={clsx(styles.threadsTitle)}>
          {profile?.image ? (
            <Img
              className={styles.profileImage}
              src={profile?.image!}
              width={22}
              height={22}
              alt={profile?.name || ""}
            />
          ) : (
            <>
              <AtSign size={22} />
            </>
          )}
          {profile?.name ?? t("Threads")}
          {baseApp && baseApp?.id !== app?.id && (
            <a
              style={{
                marginLeft: "auto",
                fontSize: "0.8rem",
                fontWeight: "normal",
              }}
              href={getAppSlug(baseApp)}
            >
              <Img app={baseApp} size={22} />
              {t("back to Vex").replace("Vex", baseApp?.name || "")}
            </a>
          )}
        </h2>
        <div className={styles.characterProfiles}>
          {(profile?.characterProfiles || [])
            .slice(0, 3)
            .map((characterProfile) => (
              <a
                key={characterProfile.id}
                onClick={(e) => {
                  e.preventDefault()

                  router.push(`/u?similarTo=${characterProfile.id}`)
                }}
                className="button inverted xSmall"
                href={`/u?similarTo=${characterProfile.id}`}
              >
                <Sparkles
                  size={16}
                  color="var(--accent-1)"
                  fill="var(--accent-1)"
                />
                {characterProfile.name}
              </a>
            ))}
        </div>
        <div className={clsx(styles.searchContainer)}>
          <>
            <Search
              dataTestId="threads-search"
              className={clsx(styles.searchInput)}
              placeholder={t("Search threads...")}
              scroll={false}
              onChange={(search) => setSearch(search)}
            />
            {!isVisitor && (
              <>
                <button
                  data-testid="threads-collaboration"
                  className={clsx("inverted")}
                  title={t("Pending Collaborations")}
                  onClick={() => {
                    setIsLoading(true)
                    collaborationStatus === "pending"
                      ? setCollaborationStatus(null)
                      : setCollaborationStatus("pending")
                  }}
                >
                  <BellDot
                    color={
                      collaborationStatus === "pending"
                        ? "var(--accent-1)"
                        : undefined
                    }
                    size={20}
                  />
                </button>
                <button
                  className={clsx("inverted")}
                  title={t("Active Collaborations")}
                  onClick={() => {
                    setIsLoading(true)
                    setCollaborationStatus(
                      collaborationStatus === "active" ? null : "active",
                    )
                  }}
                >
                  <UsersRound
                    color={
                      collaborationStatus === "active"
                        ? "var(--accent-1)"
                        : undefined
                    }
                    size={20}
                  />
                </button>
                <button
                  data-testid={`threads-sort-button-${sortByDate ? "date" : "star"}`}
                  title={!sortByDate ? t("Sort by date") : t("Sort by star")}
                  className={clsx("inverted", styles.sortButton)}
                  onClick={() => {
                    setSortByDate(!sortByDate)
                  }}
                >
                  {!sortByDate ? (
                    <CalendarIcon size={20} />
                  ) : (
                    <StarIcon
                      fill="var(--accent-1)"
                      color="var(--accent-1)"
                      size={20}
                    />
                  )}
                </button>
              </>
            )}
          </>
        </div>
        {isLoading && !isLoadingMore && !search ? (
          <div className={clsx(styles.loadingContainer)}>
            <Loading />
          </div>
        ) : (
          <>
            <div
              data-testid="threads-container"
              className={clsx(styles.threadsContainer, "threadList")}
            >
              {sortedThreads.map((thread) => (
                <div
                  data-testid="threads-item"
                  ref={(el) => {
                    threadRefs.current[thread.id] = el
                  }}
                  className={clsx(styles.threadItem, "threadsItem")}
                  key={thread.id}
                >
                  <div className={clsx(styles.threadItemTitle)}>
                    {!isVisitor && (
                      <EditThread
                        refetch={async () => {
                          await refetch()
                        }}
                        isIcon
                        thread={thread}
                      />
                    )}
                    {(() => {
                      const url = `/threads/${thread.id}`
                      return (
                        <a
                          data-testid="threads-item-title"
                          onClick={(e) => {
                            if (e.metaKey || e.ctrlKey) {
                              return
                            }
                            e.preventDefault()
                            router.push(url)
                          }}
                          href={url}
                          key={thread.id}
                          className={clsx(styles.threadItem)}
                        >
                          {thread.title}
                        </a>
                      )
                    })()}

                    {!isVisitor && (
                      <Bookmark
                        dataTestId="threads"
                        onSave={() => {
                          refetch()
                          refetchThreads()
                        }}
                        thread={thread}
                      />
                    )}
                    <div className={clsx(styles.right)}>
                      <span className={clsx(styles.threadItemDate)}>
                        {timeAgo(thread.createdOn, language)}
                      </span>
                      {!isVisitor && (
                        <Share
                          className={clsx(styles.share)}
                          thread={thread}
                          size={13}
                        />
                      )}
                    </div>
                  </div>

                  <p className={clsx(styles.threadAiResponse)}>
                    {thread.aiResponse}
                  </p>
                </div>
              ))}
              {threads.threads.length === 0 && (
                <p className={clsx(styles.noThreads)}>
                  {t("Nothing here yet")}
                </p>
              )}
              {threads.hasNextPage && (
                <div className={clsx(styles.loadMoreButtonContainer)}>
                  <button
                    onClick={() => {
                      setIsLoadingMore(true)
                      setUntil(until + 1)
                    }}
                    className={clsx("transparent", styles.loadMoreButton)}
                  >
                    <LoaderCircle size={18} />
                    {t("Load more")}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Skeleton>
  )
}

export default Threads
