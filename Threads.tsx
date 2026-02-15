"use client"

import React, { useEffect, useRef, useState } from "react"
import { collaboration, thread, user } from "../ui/types"
import { useAppContext } from "./context/AppContext"
import Loading from "./Loading"
import useSWR from "swr"
import {
  AtSign,
  BellDot,
  CalendarIcon,
  LoaderCircle,
  Sparkles,
  StarIcon,
  UsersRound,
} from "./icons"
import { pageSizes } from "./utils"
import { MotiView } from "./platform/MotiView"
import Search from "./Search"
import Skeleton from "./Skeleton"
import EditThread from "./EditThread"
import { useLocalStorage } from "./hooks"
import Share from "./Share"
import Bookmark from "./Bookmark"
import Img from "./Image"
import { useAuth, useData, useNavigationContext } from "./context/providers"
import { A, Button, Div, H2, P, Span, useTheme } from "./platform"
import { useThreadsStyles } from "./Threads.styles"

const Threads = ({ className }: { className?: string; userName?: string }) => {
  const { t } = useAppContext()

  const {
    router,
    pathname,
    isVisitor,
    refetchThreads,
    searchParams,
    collaborationStatus,
    setCollaborationStatus: setCollaborationStatusInternal,
  } = useNavigationContext()

  const { reduceMotion } = useTheme()

  const [animationKey, setAnimationKey] = useState(0)

  useEffect(() => {
    if (!reduceMotion) {
      setAnimationKey((prev) => prev + 1)
    }
  }, [reduceMotion])

  const {
    token,
    user,
    language,
    setProfile,
    profile,
    app,
    storeApps,
    baseApp,
    getAppSlug,
    timeAgo,
    loadingAppId,
    setLoadingAppId,
    hasStoreApps,
  } = useAuth()

  const styles = useThreadsStyles()

  const [sortByDate, setSortByDate] = useLocalStorage("sortByDate", true)

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

  const [loadingThreadId, setLoadingThreadId] = useState<string | null>(null)

  useEffect(() => {
    if (!loadingAppId) {
      setLoadingThreadId(null)
      loadingThreadId && router.push(`/threads/${loadingThreadId}`)
    }
  }, [loadingAppId])

  const [lastStarredId, setLastStarredId] = useState<string | null>(null)

  // Use backend sorting - no client-side sorting needed when sortByDate is false
  const sortedThreads = threads.threads.sort((a, b) => {
    return (b.isMainThread ? 1 : 0) - (a.isMainThread ? 1 : 0)
  })

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
        // userName,
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

  const [isLoadingMore, setIsLoadingMore] = useState(false)

  useEffect(() => {
    if (threadsData && Array.isArray(threadsData.threads)) {
      setThreads(threadsData)
      setIsLoading(false)

      // setProfile(threadsData.user || threadsData?.threads?.[0]?.user)
    }
  }, [threadsData, user])

  return (
    <Skeleton>
      <Div className={className} style={{ ...styles.threads.style }}>
        <H2 style={{ ...styles.threadsTitle.style }}>
          {profile?.image ? (
            <Img
              style={{ ...styles.profileImage.style }}
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
        </H2>
        <Div style={{ ...styles.characterProfiles.style }}>
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
        </Div>
        <Div style={{ ...styles.searchContainer.style }}>
          <>
            <Search
              dataTestId="threads-search"
              placeholder={t("Search threads...")}
              scroll={false}
              onChange={(search) => setSearch(search)}
            />
            {!isVisitor && (
              <>
                <Button
                  data-testid="threads-collaboration"
                  className={"inverted"}
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
                </Button>
                <Button
                  className={"inverted"}
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
                </Button>
                <Button
                  data-testid={`threads-sort-button-${sortByDate ? "date" : "star"}`}
                  title={!sortByDate ? t("Sort by date") : t("Sort by star")}
                  className={"inverted"}
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
                </Button>
              </>
            )}
          </>
        </Div>
        {isLoading && !isLoadingMore && !search ? (
          <Div style={{ ...styles.loadingContainer.style }}>
            <Loading />
          </Div>
        ) : (
          <>
            <Div
              data-testid="threads-container"
              style={{ ...styles.threadsContainer.style }}
            >
              {sortedThreads.map((thread, index) => (
                <MotiView
                  key={`${thread.id}-${animationKey}`}
                  from={{ opacity: 0, translateY: 0, translateX: -10 }}
                  animate={{ opacity: 1, translateY: 0, translateX: 0 }}
                  transition={{
                    duration: reduceMotion ? 0 : 100,
                    delay: reduceMotion ? 0 : index * 50,
                  }}
                >
                  <Div
                    data-testid="threads-item"
                    ref={(el) => {
                      threadRefs.current[thread.id] = el
                    }}
                    className={"threadsItem"}
                  >
                    <Div style={{ ...styles.threadItemTitle.style }}>
                      {loadingThreadId === thread.id ? (
                        <Loading
                          style={{
                            width: 14,
                            height: 14,
                          }}
                        />
                      ) : (
                        !isVisitor && (
                          <EditThread
                            refetch={async () => {
                              await refetch()
                            }}
                            isIcon
                            thread={thread}
                          />
                        )
                      )}
                      {(() => {
                        const url = `/threads/${thread.id}`
                        return (
                          <A
                            data-testid="threads-item-title"
                            onClick={(e) => {
                              if (e.metaKey || e.ctrlKey) {
                                return
                              }

                              e.preventDefault()

                              const threadApp = storeApps.find(
                                (app) => app.id === thread.appId,
                              )

                              if (
                                thread.appId &&
                                (!threadApp || !hasStoreApps(threadApp))
                              ) {
                                setLoadingThreadId(thread.id)
                                setLoadingAppId(thread.appId)
                                return
                              }

                              router.push(url)
                            }}
                            href={url}
                            key={thread.id}
                          >
                            {thread.title}
                          </A>
                        )
                      })()}

                      {!isVisitor && (
                        <>
                          {thread.isMainThread ? (
                            <Span
                              title={t("DNA thread")}
                              style={{
                                marginRight: 3,
                                marginLeft: 3,
                                fontSize: 12,
                              }}
                            >
                              🧬
                            </Span>
                          ) : null}
                          <Bookmark
                            dataTestId="threads"
                            onSave={() => {
                              refetch()
                              refetchThreads()
                            }}
                            thread={thread}
                          />
                        </>
                      )}
                      <Div style={{ ...styles.right.style }}>
                        <Span style={{ ...styles.threadItemDate.style }}>
                          {timeAgo(thread.createdOn, language)}
                        </Span>
                        {!isVisitor && <Share thread={thread} size={13} />}
                      </Div>
                    </Div>

                    <Span style={{ ...styles.threadAiResponse.style }}>
                      {thread.aiResponse}
                    </Span>
                  </Div>
                </MotiView>
              ))}
              {threads?.threads?.length === 0 && <P>{t("Nothing here yet")}</P>}
              {threads?.hasNextPage && (
                <Div style={{ ...styles.loadMoreButtonContainer.style }}>
                  <Button
                    onClick={() => {
                      setIsLoadingMore(true)
                      setUntil(until + 1)
                    }}
                    style={{ ...styles.loadMoreButton.style }}
                  >
                    {isLoadingThreads ? (
                      <Loading size={16} />
                    ) : (
                      <LoaderCircle size={16} />
                    )}
                    {t("Load more")}
                  </Button>
                </Div>
              )}
            </Div>
          </>
        )}
      </Div>
    </Skeleton>
  )
}

export default Threads
