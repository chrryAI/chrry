"use client"

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react"
import toast from "react-hot-toast"
import useSWR from "swr"
import { useAppContext } from "../../context/AppContext"
import { useWebSocket } from "../../hooks/useWebSocket"

import { useNavigation } from "../../platform"
import type {
  appWithStore,
  message,
  paginatedTribePosts,
  paginatedTribes,
  tribe,
  tribePostWithDetails,
} from "../../types"
import { apiFetch } from "../../utils"
import { useAuth, useData } from "."
export type engagement = {
  tribePostId: string
}
export type liveReaction = {
  id?: string
  app: appWithStore
  reaction: { emoji: string }
} & engagement

export type posting = { app: appWithStore }

export type commenting = { app: appWithStore } & engagement

interface TribeContextType {
  tribes?: paginatedTribes
  tribePosts?: paginatedTribePosts
  tribePost?: tribePostWithDetails
  search?: string
  until?: number
  posting: posting[]
  liveReactions: liveReaction[]
  pendingPostIds: string[]
  commenting: commenting[]
  postId?: string
  isSwarm: boolean
  characterProfileIds?: string[]
  isLoadingPosts?: boolean
  isLoadingTribes?: boolean
  isLoadingPost?: boolean
  tribePostError?: Error
  sortBy: "date" | "hot" | "liked"
  order: "asc" | "desc"
  tribeSlug?: string
  currentTribe?: paginatedTribes["tribes"][number]
  setSortBy: (val: "date" | "hot" | "liked") => void
  setOrder: (val: "asc" | "desc") => void
  setTribes: (tribes?: paginatedTribes) => void
  setTribePosts: (tribePosts?: paginatedTribePosts) => void
  setTribePost: (tribePost?: tribePostWithDetails) => void
  setSearch: (search?: string) => void
  setUntil: (val: number) => void
  setCharacterProfileIds: (ids?: string[]) => void
  optimisticLiked: string[]
  setOptimisticLiked: (ids: string[]) => void
  optimisticDelta: Map<string, number>
  refetchPosts: () => Promise<void>
  refetchPost: () => Promise<void>
  refetchTribes: () => Promise<void>
  toggleLike: (postId: string) => Promise<{ liked: boolean }>
  deletePost: (postId: string) => Promise<void>
  deleteComment: (commentId: string) => Promise<void>
  setPendingPostIds: (id: string[]) => void
  isTogglingLike: string | undefined
}

const TribeContext = createContext<TribeContextType | undefined>(undefined)

interface TribeProviderProps {
  children: ReactNode
}

export function TribeProvider({ children }: TribeProviderProps) {
  const {
    tribes: initialTribes,
    tribePosts: initialTribePosts,
    tribePost: initialTribePost,
    showTribeProfile,
    token,
    postId,
    tribePosts,
    setTribePosts,
    tribePost,
    setTribePost,
    mergeApps,
    deviceId,
    getAppSlug,
    tribeSlug,
    currentTribe,
    app, // Current selected app for filtering
    ...auth
  } = useAuth()

  const [tribes, setTribes] = useState<paginatedTribes | undefined>(
    initialTribes,
  )

  const { push } = useNavigation()

  const { captureException, t } = useAppContext()

  const [sortBy, setSortByInternal] = useState<"date" | "hot" | "liked">("hot")

  const setSortBy = (val: "date" | "hot" | "liked") => {
    setSortByInternal(val)
  }

  const [order, setOrderInternal] = useState<"asc" | "desc">("desc")

  const setOrder = (val: "asc" | "desc") => {
    setOrderInternal(val)
  }

  const [loadPostsCounter, setLoadPostsCounter] = useState(1)
  const [loadPostCounter, setLoadPostCounter] = useState(
    initialTribePost ? 0 : 1,
  )

  const setShouldLoadPosts = (val: boolean) => {
    if (!val) return
    setLoadPostsCounter(loadPostsCounter + 1)
  }

  const [search, setSearchInitial] = useState<string | undefined>()

  const setSearch = (val?: string) => {
    setSearchInitial(val)
  }
  const [until, setUntilInitial] = useState<number>(1)

  const setUntil = (val: number) => {
    setUntilInitial(val)
  }
  const [characterProfileIds, setCharacterProfileIdsInternal] = useState<
    string[] | undefined
  >()

  const setCharacterProfileIds = (val: string[] | undefined) => {
    setCharacterProfileIdsInternal(val)
  }

  const { actions, API_URL } = useData()

  const canShowTribeProfile = showTribeProfile

  // Fetch tribes with SWR - filter by tribes where this app has posted
  const {
    data: tribesData,
    isLoading: isLoadingTribes,
    mutate: refetchTribes,
  } = useSWR(
    token ? ["tribes", app?.id, canShowTribeProfile] : null,
    () => {
      if (!token) return
      return actions.getTribes({
        appId: canShowTribeProfile ? app?.id : undefined, // Show tribes where this app has posted
      })
    },
    {
      fallbackData: initialTribes,
      revalidateOnFocus: !!initialTribes,
    },
  )

  const {
    data: tribePostData,
    mutate: refetchTribePost,
    error: tribePostError,
    isLoading: isLoadingPost,
  } = useSWR(
    postId && token ? ["tribePost", postId, app?.id, loadPostCounter] : null,
    () => {
      if (!token || !postId) return
      return actions.getTribePost({
        id: postId,
        appId: app?.id,
      })
    },
    {
      fallbackData: initialTribePost,
      revalidateOnFocus: !!initialTribePost,
    },
  )

  useEffect(() => {
    if (tribePostData && tribePostData.id !== tribePost?.id) {
      setTribePost(tribePostData)
    }
  }, [tribePostData, tribePost?.id, setTribePost])

  useEffect(() => {
    if (!tribesData) return
    const incomingSlugs = tribesData.tribes?.map((t: tribe) => t.slug).join(",")
    const currentSlugs = tribes?.tribes?.map((t) => t.slug).join(",")
    if (incomingSlugs !== currentSlugs) {
      setTribes(tribesData)
    }
  }, [tribesData])

  const {
    data: tribePostsData,
    mutate: refetchPosts,
    isLoading: isLoadingPosts,
  } = useSWR(
    (search ? search.length > 2 : true) && token
      ? [
          "tribePosts",
          until,
          search,
          characterProfileIds,
          sortBy,
          order,
          app?.id,
          canShowTribeProfile,
          loadPostsCounter,
          tribeSlug,
        ]
      : null,
    () => {
      if (!token) return
      return actions.getTribePosts({
        pageSize: 10 * until,
        search,
        characterProfileIds,
        sortBy,
        order: sortBy === "date" ? order : undefined,
        appId: !canShowTribeProfile ? undefined : app?.id, // Filter by current selected app
        tribeSlug, // Filter by tribe when viewing /tribe/:slug
      })
    },
    {
      fallbackData: initialTribePosts,
      revalidateOnFocus: !!initialTribePosts,
    },
  )

  // Use tribePostsData directly from SWR, only update tribePosts manually when needed
  useEffect(() => {
    if (tribePostsData) {
      setTribePosts(tribePostsData)
      auth.setIsLoadingPosts(false)
    }
  }, [tribePostsData, setTribePosts, auth.setIsLoadingPosts])

  const [isTogglingLike, setIsTogglingLike] = useState<string | undefined>(
    undefined,
  )

  const [posting, setPosting] = useState<posting[]>([])

  const [commenting, setCommenting] = useState<commenting[]>([])

  const [pendingPostIds, setPendingPostIds] = useState<string[]>([])

  const [liveReactions, setLiveReactions] = useState<Array<liveReaction>>([])

  const mockApps: appWithStore[] = [
    { id: "1", name: "Sushi", slug: "sushi" } as appWithStore,
    { id: "2", name: "Vex", slug: "vex" } as appWithStore,
    { id: "3", name: "Coder", slug: "coder" } as appWithStore,
    { id: "4", name: "Bloom", slug: "bloom" } as appWithStore,
    { id: "5", name: "Peach", slug: "peach" } as appWithStore,
    { id: "6", name: "Vault", slug: "vault" } as appWithStore,
    { id: "7", name: "Atlas", slug: "atlas" } as appWithStore,
    { id: "8", name: "Architect", slug: "architect" } as appWithStore,
    { id: "9", name: "Grape", slug: "grape" } as appWithStore,
    { id: "10", name: "Pear", slug: "Pear" } as appWithStore,
    { id: "11", name: "Zarathustra", slug: "zarathustra" } as appWithStore,
    { id: "12", name: "Popcorn", slug: "popcorn" } as appWithStore,
    { id: "13", name: "Focus", slug: "focus" } as appWithStore,
  ]

  function checkSwarm<T extends engagement>(engagements: T[]) {
    const toCheck =
      showTribeProfile && tribePost?.id ? [tribePost] : tribePosts?.posts || []

    return engagements.filter((p) =>
      toCheck?.some((c) => c.id === p.tribePostId),
    ) as typeof engagements
  }

  const isSwarm =
    (showTribeProfile ? false : !!posting.length) ||
    !!checkSwarm(liveReactions).length ||
    (showTribeProfile ? false : !!pendingPostIds.length) ||
    !!checkSwarm(commenting).length

  // 🎭 MOCK DATA FOR TESTING ANIMATIONS
  useEffect(() => {
    const interval = setInterval(() => {
      const randomAction = Math.random()
      const mockPostIds = tribePosts?.posts?.map((p) => p.id) || []

      if (randomAction < 0.3) {
        // 0.0 - 0.3 (30%): Add random commenting app
        const randomPostId =
          mockPostIds[Math.floor(Math.random() * mockPostIds.length)]
        const randomPost =
          tribePost ?? tribePosts?.posts?.find((p) => p.id === randomPostId)
        if (!randomPost?.app || !randomPostId) return
        console.log("💬 Mock: Adding commenting app:", randomPost.app.name)
        setCommenting((prev) => {
          if (prev.some((c) => c.app.id === randomPost.app.id)) return prev
          return [
            ...prev,
            {
              app: randomPost.app,
              tribePostId: randomPostId,
            },
          ]
        })
        // Remove after 3 seconds
        setTimeout(() => {
          setCommenting((prev) =>
            prev.filter((c) => c.app.id !== randomPost.app.id),
          )
        }, 3000)
      } else if (randomAction < 0.5) {
        // 0.3 - 0.5 (20%): Add/remove posting app
        if (Math.random() < 0.5 && posting.length > 0) {
          // Remove random posting app
          setPosting((prev) => {
            if (prev.length === 0) return prev
            const randomIndex = Math.floor(Math.random() * prev.length)
            const appToRemove = prev[randomIndex]
            if (!appToRemove) return prev
            console.log("✅ Mock: Removing posting app:", appToRemove.app.name)
            return prev.filter((_, i) => i !== randomIndex)
          })
        } else {
          // Add random posting app
          const randomApp =
            mockApps[Math.floor(Math.random() * mockApps.length)]
          if (!randomApp) return
          setPosting((prev) => {
            if (prev.some((p) => p.app.id === randomApp.id)) return prev
            console.log("🚀 Mock: Adding posting app:", randomApp.name)
            return [...prev, { app: randomApp }]
          })
        }
      } else if (randomAction < 0.7) {
        // 0.5 - 0.7 (20%): Add random reaction
        const randomApp = mockApps[Math.floor(Math.random() * mockApps.length)]
        const emojis = ["❤️", "🔥", "👍", "🎉", "😍"]
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)]
        const randomPostId =
          tribePost?.id ||
          mockPostIds[Math.floor(Math.random() * mockPostIds.length)]
        if (!randomApp || !randomEmoji || !randomPostId) return
        const reactionId = `${randomApp.id}-${randomPostId}-${Date.now()}`
        console.log("💖 Mock: Adding reaction:", randomApp.name, randomEmoji)
        setLiveReactions((prev) => [
          ...prev,
          {
            id: reactionId,
            app: randomApp,
            tribePostId: randomPostId,
            reaction: { emoji: randomEmoji },
          },
        ])
        // Remove after 2 seconds
        setTimeout(() => {
          setLiveReactions((prev) => prev.filter((r) => r.id !== reactionId))
        }, 2000)
      } else {
        // 0.7 - 1.0 (30%): Add pending post
        const randomPostId = `post-${Date.now()}`
        console.log("📝 Mock: Adding pending post:", randomPostId)
        // setPendingPostIds((prev) => [...prev, randomPostId])
      }
    }, 3000) // Every 3 seconds

    return () => clearInterval(interval)
  }, [
    tribePost,
    setLiveReactions,
    setCommenting,
    posting.length,
    tribePosts?.posts?.length,
    mockApps.length,
  ])

  useWebSocket<{
    type: string
    data?: {
      app?: appWithStore
      tribePostId?: string
      isTribe?: boolean
      message?: {
        message: message
      }
    }
  }>({
    onMessage: async ({ type, data }) => {
      // Early return for non-Tribe events to avoid expensive operations
      if (!data?.isTribe) {
        return
      }

      if (type === "stream_complete") {
        const tribePostId = data.message?.message?.tribePostId

        tribePostId &&
          setPendingPostIds((prev) =>
            prev?.includes(tribePostId) ? prev : [...prev, tribePostId],
          )
      }

      if (type === "new_post_start") {
        // Mark that a post is being generated
        if (data?.app && data.tribePostId) {
          setPosting((prev) =>
            prev.some((p) => p.app.id === data.app?.id)
              ? prev
              : [
                  ...prev,
                  {
                    app: data.app!,
                  },
                ],
          )
        }
      }
      if (type === "new_post_end") {
        // Add completed post to pending list
        if (data?.app) {
          console.log("✅ New post completed:", data.app.name)

          setPosting((prev) =>
            prev.some((p) => p.app.id === data.app?.id)
              ? prev
              : [
                  ...prev,
                  {
                    app: data.app!,
                  },
                ],
          )
          data?.tribePostId &&
            !pendingPostIds.includes(data.tribePostId) &&
            setPendingPostIds(pendingPostIds.concat(data.tribePostId))
        }
      }
      if (type === "new_comment_start") {
        // Mark that a comment is being generated
        if (data?.app && data?.tribePostId) {
          console.log("💬 New comment starting:", data.app.name)
          setCommenting((prev) =>
            prev.some(
              (c) =>
                c.app.id === data.app?.id && c.tribePostId === data.tribePostId,
            )
              ? prev
              : [
                  ...prev,
                  {
                    app: data.app!,
                    tribePostId: data.tribePostId!,
                  },
                ],
          )
        }
      }
      if (type === "new_comment_end") {
        // Remove from commenting list
        if (data?.app && data?.tribePostId) {
          console.log("✅ New comment completed:", data.app.name)
          setCommenting((prev) =>
            prev.filter(
              (c) =>
                !(
                  c.app.id === data.app?.id &&
                  c.tribePostId === data.tribePostId
                ),
            ),
          )
        }
      }
    },
    token,
    deviceId,
  })

  const deletePost = async (postId: string) => {
    if (!postId) {
      console.error("Post ID is required")
      captureException(new Error("Post ID is required"))
      return
    }
    if (!token) {
      console.error("Not authenticated")
      captureException(new Error("Not authenticated"))
      return
    }

    try {
      const response = await apiFetch(`${API_URL}/tribe/p/${postId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        const errorData = await response.json()
        toast.error(errorData.error || "Failed to delete post")
        captureException(new Error(`Failed to delete post: ${response.status}`))
      }

      toast.success(`🧐 ${"Deleted"}`)
      // Refetch posts to update list
      await refetchPosts()

      push("/tribe")
    } catch (error) {
      console.error("Error deleting post:", error)
      captureException(error)
      toast.error("Failed to delete post")
    }
  }

  const deleteComment = async (commentId: string) => {
    if (!commentId) {
      console.error("Comment ID is required")
      captureException(new Error("Comment ID is required"))
      return
    }
    if (!token) {
      console.error("Not authenticated")
      captureException(new Error("Not authenticated"))
      return
    }

    if (tribePost) {
      setTribePost({
        ...tribePost,
        comments: tribePost.comments?.filter((c) => c.id !== commentId) || [],
      })
    }

    try {
      const response = await apiFetch(`${API_URL}/tribe/c/${commentId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        const errorData = await response.json()
        toast.error(errorData.error || "Failed to delete comment")
        captureException(
          new Error(`Failed to delete comment: ${response.status}`),
        )
      }

      toast.success("Comment deleted successfully")
    } catch (error) {
      console.error("Error deleting comment:", error)
      captureException(error)
      toast.error("Failed to delete comment")
    }
  }

  const [optimisticLiked, setOptimisticLiked] = useState<string[]>([])
  const [optimisticDelta, setOptimisticDelta] = useState<Map<string, number>>(
    new Map(),
  )

  const toggleLike = async (postId: string): Promise<{ liked: boolean }> => {
    if (!postId) {
      console.error("Post ID is required")
      captureException(new Error("Post ID is required"))
      return { liked: false }
    }
    if (!token) {
      console.error("Not authenticated")
      captureException(new Error("Not authenticated"))
      return { liked: false }
    }

    setIsTogglingLike(postId)

    try {
      const response = await apiFetch(`${API_URL}/tribe/p/${postId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        toast.error(`Failed to toggle like: ${response.status}`)
        captureException(new Error(`Failed to toggle like: ${response.status}`))
        return { liked: false }
      }

      const data = await response.json()

      if (data.liked) {
        !optimisticLiked.includes(postId) &&
          setOptimisticLiked((prev) => [...prev, postId])
      } else {
        setOptimisticLiked((prev) => prev.filter((item) => item !== postId))
      }

      // Update likesCount directly from server response — no delta needed
      if (data.likesCount !== undefined) {
        setOptimisticDelta((prev) => {
          const next = new Map(prev)
          next.set(postId, data.likesCount)
          return next
        })
        if (tribePosts) {
          setTribePosts({
            ...tribePosts,
            posts: tribePosts.posts.map((p) =>
              p.id === postId ? { ...p, likesCount: data.likesCount } : p,
            ),
          })
        }
        if (tribePost?.id === postId) {
          setTribePost({ ...tribePost, likesCount: data.likesCount })
        }
      }

      return { liked: data.liked }
    } catch (error) {
      captureException(error)
      console.error("Failed to toggle like:", error)
      toast.error(t("Something went wrong"))
      return { liked: false }
    } finally {
      setIsTogglingLike(undefined)
    }
  }

  useEffect(() => {
    // Collect unique apps from posts, comments, and replies using a Set
    const appsSet = new Map<string, appWithStore>()

    // Add apps from posts
    if (tribePosts?.posts) {
      tribePosts.posts.forEach((post) => {
        if (post.app) {
          appsSet.set(post.app.id, post.app)
        }

        // Add apps from comments and replies
        post.comments?.forEach((comment) => {
          if (comment.app) {
            appsSet.set(comment.app.id, comment.app)
          }
        })
      })
    }

    // Add app from single post view
    if (tribePost?.app) {
      appsSet.set(tribePost.app.id, tribePost.app)
    }

    if (tribePost?.comments) {
      tribePost.comments.forEach((comment) => {
        if (comment.app) {
          appsSet.set(comment.app.id, comment.app)
        }
      })
    }

    // Merge all unique apps
    mergeApps(Array.from(appsSet.values()))
  }, [tribePosts, tribePost, mergeApps])

  const value: TribeContextType = {
    tribes,
    tribePosts,
    tribePost:
      tribePost && postId && tribePost.id === postId ? tribePost : undefined,
    search,
    until,
    characterProfileIds,
    isLoadingPosts,
    isLoadingTribes,
    isLoadingPost,
    tribePostError,
    tribeSlug,
    currentTribe:
      tribeSlug && currentTribe && currentTribe.slug === tribeSlug
        ? currentTribe
        : undefined,
    setTribes,
    setTribePosts,
    setTribePost,
    sortBy,
    setSortBy,
    order,
    setOrder,
    setSearch,
    postId,
    setUntil,
    setCharacterProfileIds,
    optimisticLiked,
    setOptimisticLiked,
    optimisticDelta,
    toggleLike,
    deletePost,
    deleteComment,
    isSwarm,
    isTogglingLike,
    posting:
      app && posting?.some((a) => a.app.slug === app.slug)
        ? posting
        : app
          ? (posting || []).concat({ app })
          : posting,
    liveReactions: liveReactions,
    pendingPostIds,
    commenting:
      app && commenting?.some((a) => a.app.slug === app.slug)
        ? commenting
        : tribePost && app
          ? (commenting || []).concat({ app, tribePostId: tribePost.id })
          : commenting,
    setPendingPostIds,
    refetchPosts: async () => {
      setShouldLoadPosts(true)
      return refetchPosts()
    },
    refetchPost: async () => {
      return refetchTribePost()
    },
    refetchTribes: async () => {
      return refetchTribes()
    },
  }

  return <TribeContext.Provider value={value}>{children}</TribeContext.Provider>
}

export function useTribe() {
  const context = useContext(TribeContext)
  if (context === undefined) {
    throw new Error("useTribe must be used within a TribeProvider")
  }
  return context
}
