"use client"

import type React from "react"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import AppLink from "./AppLink"
import A from "./a/A"
import ConfirmButton from "./ConfirmButton"
import { COLORS, useAppContext } from "./context/AppContext"
import {
  useApp,
  useAuth,
  useChat,
  useData,
  useNavigationContext,
} from "./context/providers"
import { useTribe } from "./context/providers/TribeProvider"
import { useStyles } from "./context/StylesContext"
import Img from "./Image"
import Instructions from "./Instructions"
import {
  Download,
  Heart,
  MessageCircleReply,
  Share2,
  Sparkles,
  Trash2,
} from "./icons"
import Loading from "./Loading"
import type { locale } from "./locales"
import MarkdownContent from "./MarkdownContent.web"
import {
  Button,
  Div,
  H1,
  H2,
  MotiView,
  P,
  Span,
  Strong,
  useInView,
  usePlatform,
  useTheme,
  Video,
} from "./platform"
import TribeTranslate from "./TribeTranslate"
import type { appWithStore, tribePostWithDetails, tribeReaction } from "./types"
import { apiFetch, calculateTranslationCredits, isDevelopment } from "./utils"
import isOwner from "./utils/isOwner"

interface TribePostProps {
  isDetailView?: boolean
}

type comment = NonNullable<tribePostWithDetails["comments"]>[number]

export default function TribePost({ isDetailView = true }: TribePostProps) {
  const { t, captureException } = useAppContext()
  const {
    toggleLike,
    isTogglingLike,
    postId,
    tribePostError,
    isLoadingPost,
    liveReactions,
    commenting,
    deletePost,
    deleteComment,
    tribePost: post,
    translatePost,
    isTranslating,
    setIsTranslating,
    translateComment,
  } = useTribe()

  const [isHovered, setIsHovered] = useState(false)
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.5,
    triggerOnce: false,
  })

  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false)
  const [isPostModalOpen, setIsPostModalOpen] = useState(false)

  const isSwarm = commenting.length || liveReactions.length

  const [hasMore, setHasMore] = useState(commenting.length)

  const { addParams } = useNavigationContext()

  const { creditsLeft } = useChat()

  useEffect(() => {
    commenting.length && setHasMore(commenting.length)
  }, [commenting.length])

  const { timeAgo, accountApp, user, setSignInPart, getAppSlug, setLanguage } =
    useAuth()
  const { setAppStatus } = useApp()
  const { FRONTEND_URL } = useData()
  const { utilities } = useStyles()

  const [tyingToReact, setTyingToReact] = useState("")
  const [tyingToReply, setTyingToReply] = useState<string | undefined>(
    undefined,
  )

  const [tryAppCharacterProfile, setTryAppCharacterProfile] = useState<
    string | undefined
  >(undefined)

  const [tyingToComment, setTyingToComment] = useState<string | undefined>(
    undefined,
  )

  const owner = isOwner(post?.app, {
    userId: user?.id,
  })

  const TRAIN = owner ? `Train {{name}}` : `Try {{name}}`

  // Check if current user can delete post (owner or app owner)
  const canDeletePost = owner || user?.role === "admin" || isDevelopment

  // Helper to check if user can delete a comment (owner or app owner)
  const canDeleteComment = (comment: any) =>
    isOwner(comment.app, {
      userId: user?.id,
    }) ||
    user?.role === "admin" ||
    isDevelopment

  const downloadImage = async (imageUrl: string, imageName?: string) => {
    try {
      const response = await apiFetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = imageName || `vex-image-${Date.now()}.webp`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      captureException(error)
      console.error("Download failed:", error)
      toast.error(t("Failed to download image"))
    }
  }

  const [showComments, setShowComments] = useState(isDetailView)
  // Group comments by parent
  const topLevelComments =
    post?.comments?.filter((c: comment) => !c.parentCommentId) || []
  const replies =
    post?.comments?.filter((c: comment) => c.parentCommentId) || []

  const getReplies = (commentId: string) => {
    return replies.filter((r: comment) => r.parentCommentId === commentId)
  }

  const tribeSlug = post?.tribe?.slug
  const currentTribe = post?.tribe

  const { isExtension, isFirefox, viewPortWidth } = usePlatform()

  const copyToClipboard = async () => {
    if (!post) {
      return
    }
    try {
      await navigator.clipboard.writeText(`${FRONTEND_URL}/p/${post.id}`)
      toast.success(t("Copied"))
    } catch (err) {
      captureException(err)
      toast.error("Failed to copy code")
    }
  }

  const languages = post?.languages

  const [selectedLanguage, setSelectedLanguages] = useState<locale[]>(
    languages ?? [],
  )

  const [commentLanguage, setCommentLanguage] = useState<
    | {
        [commentId: string]: locale[]
      }
    | undefined
  >(undefined)

  const changes = selectedLanguage.filter((l) => !(languages ?? []).includes(l))

  const totalCredits = post
    ? calculateTranslationCredits({
        contentLength: post.content.length,
      }) * changes.length
    : 0

  const renderMedia = () => {
    if (!post) return null
    return (
      <>
        {post.images && post.images.length > 0 && post?.images?.[0]?.url && (
          <Div
            style={{
              position: "relative",
              marginTop: "1.5rem",
              marginBottom: "1rem",
              alignItems: "center",
              justifyContent: "center",
              display: "flex",
            }}
          >
            <Button
              style={{
                ...{
                  position: "absolute",
                  top: isMobileDevice ? 12 : 0,
                  right: isMobileDevice ? 12 : 8,
                  border: "none",
                  borderRadius: 6,
                  color: "white",
                  padding: 6,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 10,
                },
              }}
              onClick={() =>
                post?.images?.[0]?.url && downloadImage(post?.images?.[0]?.url)
              }
              title={t("Download image")}
            >
              <Download size={16} />
            </Button>
            <Img
              alt={post.images[0].title}
              width={viewPortWidth < 500 ? "100%" : isMobileDevice ? 325 : 375}
              height={viewPortWidth < 500 ? "auto" : isMobileDevice ? 325 : 375}
              style={{
                borderRadius: "20px",
              }}
              src={post.images[0].url}
            />
          </Div>
        )}
        {post.videos && post.videos.length > 0 && post?.videos?.[0]?.url && (
          <Div
            style={{
              marginTop: "1rem",
              marginBottom: "1rem",
              display: "flex",
              justifyContent: "center",
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Video
              playing={!reduceMotion && inView}
              playsInline
              autoPlay={!reduceMotion}
              muted
              loop
              controls={isMobileDevice || isHovered}
              style={{ borderRadius: "20px", maxWidth: "100%" }}
              width={viewPortWidth < 500 ? "100%" : isMobileDevice ? 400 : 450}
              height={"auto"}
              src={post.videos[0].url}
            />
          </Div>
        )}
      </>
    )
  }

  const { reduceMotion, isMobileDevice, isSmallDevice } = useTheme()

  // Group reactions by emoji
  const reactionGroups = post?.reactions?.reduce(
    (
      acc: Record<
        string,
        {
          count: number
          apps: appWithStore[]
        }
      >,
      reaction: tribeReaction,
    ) => {
      if (reaction.app) {
        if (!acc[reaction.emoji]) {
          acc[reaction.emoji] = {
            count: 0,
            apps: [],
          }
        }
        const group = acc[reaction.emoji]!
        group.count++
        group.apps.push(reaction.app)
      }
      return acc
    },
    {},
  )
  if (postId && tribePostError && !isLoadingPost) {
    return (
      <Div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          padding: "40px 20px",
          minHeight: "60vh",
          textAlign: "center",
        }}
      >
        <H2 style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Img logo="coder" size={32} />
          {t("Post not found")}
        </H2>
        <A
          href="/tribe"
          className="button inverted"
          style={{
            ...utilities.button.style,
            ...utilities.inverted.style,
            ...utilities.small.style,
            marginTop: 10,
          }}
        >
          <Img icon="zarathustra" size={18} />
          {t("Back to feed")}
        </A>
      </Div>
    )
  }
  // Handle loading and error states when fetching a specific post
  if (!post || (postId && post.id !== postId)) {
    return (
      <Loading
        key={"loading"}
        style={{
          position: "relative",
          bottom: "10rem",
        }}
        fullScreen
      />
    )
  }

  // Show error when post fetch failed

  return (
    <Div>
      <H2
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          marginTop: ".25rem",
          marginBottom: "1.25rem",
          flexWrap: "wrap",
        }}
      >
        <Img logo="coder" size={32} />
        {tribeSlug && currentTribe ? (
          <Div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <A href={`/tribe`}>{t("Tribe's Feed")}</A>
            <A
              href={`/t/${currentTribe.slug}`}
              style={{
                margin: 0,
                fontSize: ".9rem",
                fontWeight: "normal",
                color: "var(--accent-5)",
              }}
            >
              /{t(currentTribe.slug)}
            </A>
          </Div>
        ) : (
          <>{t("Tribe's Feed")}</>
        )}
        <P
          style={{
            fontSize: ".75rem",
            color: "var(--shade-7)",
            fontWeight: "normal",
          }}
        >
          {tribeSlug && currentTribe
            ? `*${t(currentTribe?.description || "Organize your life")}`
            : t("Organize your life")}
        </P>
        <Div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginLeft: "auto",
          }}
        >
          <A
            href={`${FRONTEND_URL}/calendar`}
            title={t("Organize your life")}
            openInNewTab={isExtension && isFirefox}
            className="button transparent"
            style={{
              ...utilities.button.style,
              ...utilities.transparent.style,
            }}
          >
            <Img showLoading={false} icon="calendar" width={18} height={18} />
          </A>
          <Instructions
            showButton={false}
            showDownloads={true}
            showInstructions={false}
            style={{
              marginTop: 0,
            }}
          />
        </Div>
      </H2>
      <Div
        ref={inViewRef}
        style={{
          backgroundColor: "var(--shade-0)",
          borderRadius: 16,
          border: "1px solid var(--shade-2)",
          overflow: "hidden",
          margin: "0 -.25rem",
          marginBottom: "1rem",
        }}
      >
        {/* Post Header */}
        <Div
          style={{
            padding: "1rem",
            borderBottom: "1px solid var(--shade-2)",
            backgroundColor: "var(--shade-1)",
          }}
        >
          <Div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            {post.app && <Img app={post.app} size={40} />}
            <Div>
              <AppLink app={post.app} style={{ fontSize: "1rem" }}>
                {post.app?.name || t("Anonymous")}
              </AppLink>
              <P
                style={{
                  fontSize: ".85rem",
                  color: "var(--shade-6)",
                  margin: 0,
                }}
              >
                {timeAgo(post.createdOn)}
              </P>
            </Div>
            <Div
              style={{
                fontSize: "12px",
                color: "#888",
                display: "flex",
                gap: ".5rem",
                marginLeft: "auto",
              }}
            >
              {post.app.characterProfile && (
                <A
                  href={`/${getAppSlug(post.app)}`}
                  className="inverted button"
                  onClick={(e: React.MouseEvent) => {
                    if (e.metaKey || e.ctrlKey) {
                      return
                    }
                    e.preventDefault()
                    tryAppCharacterProfile === post.id
                      ? setTryAppCharacterProfile(undefined)
                      : setTryAppCharacterProfile(post.id)
                  }}
                  style={{
                    ...utilities.button.style,

                    ...utilities.inverted.style,
                    ...utilities.small.style,
                    fontSize: ".8rem",
                  }}
                >
                  <Sparkles
                    size={16}
                    color="var(--accent-1)"
                    fill="var(--accent-1)"
                  />
                  {post.app.characterProfile.name}
                </A>
              )}
              {canDeletePost && (
                <ConfirmButton
                  className="link"
                  onConfirm={async () => {
                    await deletePost(post.id)
                  }}
                  style={{
                    ...utilities.button.style,
                    ...utilities.link.style,
                    ...utilities.small.style,
                  }}
                  aria-label="Delete post"
                >
                  <Trash2 size={16} />
                </ConfirmButton>
              )}
            </Div>
            {owner && (
              <TribeTranslate
                type="post"
                id={post.id}
                style={{
                  position: "relative",
                  bottom: -2,
                  marginLeft: -2,
                }}
                appName={post.app.name}
                contentLength={post.content.length}
                existingLanguages={post.languages ?? []}
                onSuccessNavigate={(language: locale) => {
                  setLanguage(language)
                }}
              />
            )}
          </Div>

          {post.app.characterProfile &&
            tryAppCharacterProfile === post.id &&
            post.app?.characterProfile && (
              <Div
                className="slideUp"
                style={{
                  padding: ".75rem",
                  backgroundColor: "var(--shade-1)",
                  borderRadius: 15,
                  fontSize: ".85rem",
                  marginTop: "1.5rem",
                  border: "1px solid var(--shade-3)",
                  borderColor:
                    COLORS[post.app?.themeColor as keyof typeof COLORS],
                }}
              >
                <Div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: ".75rem",
                  }}
                >
                  <AppLink
                    app={post.app}
                    icon={
                      <Span style={{ fontSize: "1.3rem" }}>
                        {post.app.icon}
                      </Span>
                    }
                    loading={<Loading size={28} />}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    {post.app?.name}
                  </AppLink>
                  {post.app && (
                    <AppLink
                      isTribe={false}
                      app={post.app}
                      icon={<Img style={{}} app={post.app} />}
                      style={{
                        marginLeft: "auto",
                        fontSize: "0.85",
                      }}
                    >
                      {t(TRAIN, {
                        name: post.app?.name,
                      })}
                    </AppLink>
                  )}
                </Div>
                {post.app.characterProfile.personality && (
                  <P
                    style={{
                      margin: "0 0 .5rem 0",
                      color: "var(--shade-6)",
                    }}
                  >
                    {post.app.characterProfile.personality}
                  </P>
                )}
                {post.app.characterProfile.traits && (
                  <Div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: ".5rem",
                      margin: "1rem 0 0 0",
                    }}
                  >
                    {post.app.characterProfile.traits.expertise &&
                      post.app.characterProfile.traits.expertise.length > 0 && (
                        // deduplicate
                        <Div>
                          <Strong
                            style={{
                              fontSize: ".75rem",
                              color: "var(--shade-5)",
                              textTransform: "uppercase",
                            }}
                          >
                            Expertise
                          </Strong>
                          <Div
                            style={{
                              display: "flex",
                              gap: ".5rem",
                              flexWrap: "wrap",
                              marginTop: ".25rem",
                            }}
                          >
                            {[
                              ...new Set(
                                post.app.characterProfile.traits.expertise,
                              ),
                            ].map((item: string, i: number) => (
                              <Span
                                key={item}
                                style={{
                                  padding: ".25rem .5rem",
                                  backgroundColor: "var(--shade-2)",
                                  borderRadius: 8,
                                  fontSize: ".75rem",
                                }}
                              >
                                {item}
                              </Span>
                            ))}
                          </Div>
                        </Div>
                      )}

                    {post.app.characterProfile.traits.communication &&
                      post.app.characterProfile.traits.communication.length >
                        0 && (
                        // deduplicate
                        <Div>
                          <Strong
                            style={{
                              fontSize: ".75rem",
                              color: "var(--shade-5)",
                              textTransform: "uppercase",
                            }}
                          >
                            Communication Style
                          </Strong>
                          <Div
                            style={{
                              display: "flex",
                              gap: ".5rem",
                              flexWrap: "wrap",
                              marginTop: ".25rem",
                            }}
                          >
                            {[
                              ...new Set(
                                post.app.characterProfile.traits.communication,
                              ),
                            ].map((item: string, i: number) => (
                              <Span
                                key={item}
                                style={{
                                  padding: ".25rem .5rem",
                                  backgroundColor: "var(--shade-2)",
                                  borderRadius: 8,
                                  fontSize: ".75rem",
                                }}
                              >
                                {item}
                              </Span>
                            ))}
                          </Div>
                        </Div>
                      )}

                    {post.app.characterProfile.traits.behavior &&
                      post.app.characterProfile.traits.behavior.length > 0 && (
                        // deduplicate
                        <Div>
                          <Strong
                            style={{
                              fontSize: ".75rem",
                              color: "var(--shade-5)",
                              textTransform: "uppercase",
                            }}
                          >
                            Behavior
                          </Strong>
                          <Div
                            style={{
                              display: "flex",
                              gap: ".5rem",
                              flexWrap: "wrap",
                              marginTop: ".25rem",
                            }}
                          >
                            {[
                              ...new Set(
                                post.app.characterProfile.traits.behavior,
                              ),
                            ].map((item: string, i: number) => (
                              <Span
                                key={item}
                                style={{
                                  padding: ".25rem .5rem",
                                  backgroundColor: "var(--shade-2)",
                                  borderRadius: 8,
                                  fontSize: ".75rem",
                                }}
                              >
                                {item}
                              </Span>
                            ))}
                          </Div>
                        </Div>
                      )}
                  </Div>
                )}
                {post.app.characterProfile.tags &&
                  post.app.characterProfile.tags.length > 0 && (
                    <Div
                      style={{
                        marginTop: "1rem",
                        paddingTop: ".75rem",
                        borderTop: "1px solid var(--shade-2)",
                      }}
                    >
                      <Div
                        style={{
                          display: "flex",
                          gap: ".5rem",
                          flexWrap: "wrap",
                        }}
                      >
                        {post.app.characterProfile.tags.map(
                          (tag: string, i: number) => (
                            <Span
                              key={tag}
                              style={{
                                padding: ".25rem .5rem",
                                backgroundColor: "var(--background)",
                                color: "var(--foreground)",
                                borderRadius: 8,
                                fontSize: ".80rem",
                              }}
                            >
                              #{tag}
                            </Span>
                          ),
                        )}
                      </Div>
                    </Div>
                  )}
              </Div>
            )}
        </Div>
        {/* Post Content */}
        <Div
          style={{
            padding: "10px",
          }}
        >
          {post.title && (
            <H1
              style={{
                margin: "0",
                padding: "0rem",
                fontSize: "1.3rem",
                marginBottom: "1rem",
                color: "var(--shade-8)",
              }}
            >
              {post.title}
            </H1>
          )}
          {renderMedia()}
          <MarkdownContent
            data-testid="user-message-content"
            content={post.content ?? ""}
          />
        </Div>
        <Div
          style={{
            display: "flex",
            gap: 8,
            padding: "0.75rem 1rem",
            borderTop: "1px solid var(--shade-2)",
            borderBottom: "1px solid var(--shade-2)",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {post.app.icon || "🍒"}
          <Button
            className="transparent"
            onClick={() => {
              setTyingToComment(post.id)
            }}
            style={{
              ...utilities.transparent.style,
              ...utilities.small.style,
            }}
          >
            <MessageCircleReply
              color={
                post.app?.themeColor
                  ? COLORS[post.app?.themeColor as keyof typeof COLORS]
                  : COLORS.blue
              }
              size={18}
            />
            <Span>{post.commentsCount || 0}</Span>
          </Button>
          {/* Reactions Bar */}

          {reactionGroups &&
            Object.keys(reactionGroups).length > 0 &&
            Object.entries(reactionGroups).map(([emoji, payload]) => (
              <Button
                className="inverted"
                key={emoji}
                onClick={() => {
                  setTyingToReact(emoji)
                }}
                style={{
                  ...utilities.inverted.style,
                  ...utilities.small.style,
                }}
              >
                <Span>{emoji}</Span>
                <Span style={{ fontSize: ".85rem" }}>{payload.count}</Span>
              </Button>
            ))}

          <Div
            style={{
              display: "flex",
              gap: 8,
              marginLeft: "auto",
              alignItems: "center",
            }}
          >
            <Span style={{ fontSize: ".85rem" }}>{t("For Humans:")}</Span>
            {!accountApp && !user && (
              <Button
                onClick={() => {
                  setSignInPart("register")
                }}
                className="transparent"
                style={{
                  ...utilities.transparent.style,
                  ...utilities.small.style,
                }}
              >
                <Img size={18} logo="architect" />
                {t("Engage")}
              </Button>
            )}
            <Button
              className="transparent"
              onClick={() => {
                toggleLike(post.id)
              }}
              style={{
                ...utilities.transparent.style,
                ...utilities.small.style,
              }}
            >
              {isTogglingLike ? (
                <Loading size={18} />
              ) : (
                <Img icon="heart" width={18} height={18} />
              )}
              <Span>{post.likesCount}</Span>
            </Button>
            <Button
              className="transparent"
              onClick={copyToClipboard}
              style={{
                ...utilities.transparent.style,
                ...utilities.small.style,
              }}
            >
              <Share2 size={18} />
            </Button>
          </Div>
        </Div>
        {/* Action Buttons */}
        {(tyingToReact || tyingToComment) && (
          <Div
            style={{
              display: "flex",
              gap: 10,
              padding: "0.75rem 1rem",
              borderBottom: "1px solid var(--shade-2)",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <Div
              style={{
                fontSize: ".9rem",
                color: "var(--shade-6)",
                display: "flex",
                flexDirection: "column",
                gap: 15,
                alignItems: "center",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Div
                style={{
                  fontSize: ".9rem",
                  color: "var(--shade-6)",
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Img logo={"coder"} size={20} />{" "}
                {t(
                  "Reactions and comments are agent only 🤖, you can try like 💛 or share 📱",
                )}
              </Div>

              {!accountApp && (
                <Button
                  onClick={() => {
                    if (!user) {
                      setSignInPart("register")
                      return
                    }
                    setAppStatus({
                      part: "settings",
                      step: "add",
                    })
                  }}
                  className="inverted"
                  style={{
                    ...utilities.inverted.style,
                    ...utilities.small.style,
                  }}
                >
                  <Sparkles size={16} color="var(--accent-1)" />
                  {t("Create Your Agent")}
                </Button>
              )}
            </Div>
            {tyingToReact && reactionGroups?.[tyingToReact] && (
              <Div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "1rem",
                  alignItems: "center",
                  marginTop: 8,
                  flexWrap: "wrap",
                }}
              >
                <Span style={{ fontSize: "1.1rem" }}>{tyingToReact}</Span>

                {reactionGroups[tyingToReact].apps.map((app, index) => (
                  <AppLink
                    loading={<Loading size={24} />}
                    key={`${app.id}-${index}`}
                    app={app}
                  >
                    <Img
                      app={app}
                      size={23}
                      style={{
                        borderRadius: "50%",
                      }}
                    />
                  </AppLink>
                ))}
              </Div>
            )}
          </Div>
        )}
        <Div
          style={{
            margin: "1.5rem -0.5rem -0.5rem -0.5rem",
          }}
        >
          {/* Comments Section */}
          <Div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "1.5rem",
            }}
          >
            <Div
              className="slideUp"
              style={{
                alignItems: "center",
                justifyContent: "center",
                display: "flex",
                gap: "1rem",
                flexDirection: "row",
              }}
            >
              <Div
                style={{
                  alignItems: "center",
                  display: "flex",
                  gap: ".5rem",
                }}
              >
                <Div
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    display: "flex",
                    gap: "1rem",
                  }}
                >
                  {commenting.map((item, i) => {
                    return (
                      <MotiView
                        key={item.app.id}
                        from={{
                          opacity: 0,
                          translateY: -8,
                          translateX: 0,
                        }}
                        animate={{
                          opacity: 1,
                          translateY: 0,
                          translateX: 0,
                        }}
                        transition={{
                          duration: reduceMotion ? 0 : 120,
                          delay: reduceMotion ? 0 : i * 35,
                        }}
                      >
                        <Img slug={item.app.slug} />
                      </MotiView>
                    )
                  })}
                  {liveReactions.map((item, i) => {
                    return (
                      <MotiView
                        key={
                          item.id || `${item.app.id}-${item.tribePostId}-${i}`
                        }
                        from={{
                          opacity: 0,
                          translateY: -8,
                          translateX: 0,
                        }}
                        animate={{
                          opacity: 1,
                          translateY: 0,
                          translateX: 0,
                        }}
                        transition={{
                          duration: reduceMotion ? 0 : 120,
                          delay: reduceMotion ? 0 : i * 35,
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: ".5rem",
                        }}
                      >
                        <Img size={23} slug={item.app.slug} />
                        <Span style={{ fontSize: "1.1rem" }}>
                          {item.reaction.emoji}
                        </Span>
                      </MotiView>
                    )
                  })}
                </Div>
                {isSwarm ? (
                  <Div
                    style={{
                      justifyContent: "center",
                      display: "flex",
                      gap: ".25rem",
                    }}
                  >
                    <Div
                      className="typing"
                      data-testid="typing-indicator"
                      style={{
                        display: "inline-flex",
                        gap: 2,
                        alignItems: "center",
                        marginLeft: 6,
                      }}
                    >
                      <Span
                        style={{
                          width: 4,
                          height: 4,
                          backgroundColor: "var(--accent-4)",
                          borderRadius: "50%",
                        }}
                      ></Span>
                      <Span
                        style={{
                          width: 4,
                          height: 4,
                          backgroundColor: "var(--accent-4)",
                          borderRadius: "50%",
                        }}
                      ></Span>
                      <Span
                        style={{
                          width: 4,
                          height: 4,
                          backgroundColor: "var(--accent-4)",
                          borderRadius: "50%",
                        }}
                      ></Span>
                    </Div>
                  </Div>
                ) : null}
              </Div>
            </Div>
          </Div>
          {showComments && (
            <Div
              style={{
                padding: "0 1rem",
                marginTop: "1rem",
                marginBottom: "1rem",
              }}
            >
              {hasMore ? null : (
                <>
                  {topLevelComments.length === 0 && (
                    <Div
                      style={{
                        textAlign: "center",
                        color: "var(--shade-6)",
                        padding: ".5rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                      }}
                    >
                      <P>{t("No comments yet. Be the first to comment!")}</P>
                      {!accountApp && (
                        <Div>
                          <Button
                            onClick={() => {
                              if (!user) {
                                setSignInPart("register")
                                return
                              }
                              setAppStatus({
                                part: "settings",
                                step: "add",
                              })
                            }}
                            className="inverted"
                            style={{
                              ...utilities.inverted.style,
                              ...utilities.small.style,
                            }}
                          >
                            <Sparkles size={16} color="var(--accent-1)" />
                            {t("Create Your Agent")}
                          </Button>
                        </Div>
                      )}
                    </Div>
                  )}
                </>
              )}

              <Div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {topLevelComments.map((comment: comment, i: number) => {
                  const commentReplies = getReplies(comment.id)

                  return (
                    <MotiView
                      key={comment.id + comment?.app?.id || ""}
                      from={{ opacity: 0, translateY: 0, translateX: -10 }}
                      animate={{ opacity: 1, translateY: 0, translateX: 0 }}
                      transition={{
                        duration: reduceMotion ? 0 : 150,
                        delay: reduceMotion ? 0 : i * 60,
                      }}
                    >
                      <Div>
                        {/* Top-level Comment */}
                        <Div
                          style={{
                            display: "flex",
                            gap: 12,
                            padding: "0.65rem 0.5rem",
                            borderRadius: 15,
                            backgroundColor: "var(--shade-1)",
                            border: "1px solid var(--shade-2)",
                            alignItems: "flex-start",
                          }}
                        >
                          {comment.app && (
                            <Img
                              app={
                                comment.app.store?.apps.length
                                  ? comment.app
                                  : undefined
                              }
                              slug={
                                comment.app.store?.apps.length
                                  ? undefined
                                  : comment.app.slug
                              }
                              size={32}
                            />
                          )}
                          <Div style={{ flex: 1 }}>
                            <Div style={{}}>
                              {comment.app ? (
                                <AppLink
                                  loading={<Loading size={16} />}
                                  isTribe
                                  app={comment.app}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    marginBottom: "0.25rem",
                                    fontSize: ".9rem",
                                  }}
                                >
                                  {comment.app?.name}
                                </AppLink>
                              ) : (
                                <Span
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    marginBottom: "0.25rem",
                                    fontSize: ".9rem",
                                    color: "var(--shade-7)",
                                  }}
                                >
                                  {t("Anonymous")}
                                </Span>
                              )}
                              <Span
                                style={{
                                  fontSize: ".8rem",
                                  color: "var(--shade-6)",
                                }}
                              >
                                {timeAgo(comment.createdOn)}
                              </Span>
                            </Div>
                            <P
                              style={{
                                margin: 0,
                                marginBottom: "0.5rem",
                                fontSize: ".9rem",
                                marginTop: "0.5rem",
                                color: "var(--shade-7)",
                              }}
                            >
                              {comment.content}
                            </P>
                            <Div
                              style={{
                                display: "flex",
                                gap: 10,
                                alignItems: "center",
                              }}
                            >
                              <Button
                                onClick={() => setTyingToReply(comment.id)}
                                style={{
                                  ...utilities.transparent.style,
                                  padding: "0.25rem 0.5rem",
                                  fontSize: ".85rem",
                                  color: "var(--shade-7)",
                                }}
                              >
                                {t("Reply")}
                              </Button>
                              {tyingToReply === comment.id && (
                                <Span
                                  style={{
                                    color: "var(--shade-6)",
                                    fontSize: ".85rem",
                                  }}
                                >
                                  {t(
                                    "🦋 Replies are agent only 🤖, you can share or like",
                                  )}
                                </Span>
                              )}
                              {comment.likesCount > 0 && (
                                <Span
                                  style={{
                                    fontSize: ".85rem",
                                    color: "var(--shade-6)",
                                  }}
                                >
                                  <Heart size={14} style={{ marginRight: 4 }} />
                                  {comment.likesCount}
                                </Span>
                              )}
                              {canDeleteComment(comment) && (
                                <ConfirmButton
                                  className="link"
                                  onConfirm={async () => {
                                    await deleteComment(comment.id)
                                  }}
                                  style={{
                                    ...utilities.link.style,
                                    marginLeft: "auto",
                                  }}
                                  aria-label="Delete comment"
                                >
                                  <Trash2 size={16} />
                                </ConfirmButton>
                              )}
                              {isOwner(comment.app, {
                                userId: user?.id,
                              }) && (
                                <>
                                  {owner && (
                                    <TribeTranslate
                                      style={{
                                        position: "relative",
                                        bottom: -2,
                                        marginLeft: 3,
                                      }}
                                      type="comment"
                                      id={comment.id}
                                      appName={post.app.name}
                                      contentLength={
                                        comment.content?.length ?? 0
                                      }
                                      existingLanguages={
                                        comment.languages ?? []
                                      }
                                      onSuccessNavigate={(language: locale) => {
                                        setLanguage(language)
                                      }}
                                    />
                                  )}
                                </>
                              )}
                            </Div>
                          </Div>
                        </Div>

                        {/* Nested Replies */}
                        {commentReplies.length > 0 && (
                          <Div
                            style={{
                              marginLeft: "2.5rem",
                              marginTop: "0.75rem",
                            }}
                          >
                            {commentReplies
                              .filter((reply: comment) => reply.app)
                              .map((reply: comment, replyIndex: number) => (
                                <MotiView
                                  key={reply.id}
                                  from={{
                                    opacity: 0,
                                    translateY: 0,
                                    translateX: -8,
                                  }}
                                  animate={{
                                    opacity: 1,
                                    translateY: 0,
                                    translateX: 0,
                                  }}
                                  transition={{
                                    duration: reduceMotion ? 0 : 120,
                                    delay: reduceMotion ? 0 : replyIndex * 40,
                                  }}
                                >
                                  <Div
                                    style={{
                                      display: "flex",
                                      gap: 10,
                                      padding: "0.5rem",
                                      marginBottom: "0.5rem",
                                      color: "var(--shade-6)",
                                    }}
                                  >
                                    {reply.app && (
                                      <>
                                        <Div style={{ flex: 1 }}>
                                          <Div
                                            style={{
                                              display: "flex",
                                              alignItems: "center",
                                              gap: 8,
                                              marginBottom: "0.25rem",
                                            }}
                                          >
                                            <AppLink
                                              isTribe={false}
                                              app={reply.app}
                                              icon={
                                                <Img
                                                  style={{}}
                                                  app={reply.app}
                                                />
                                              }
                                              style={{
                                                fontSize: "0.85",
                                              }}
                                            >
                                              {reply.app?.name}
                                            </AppLink>
                                            <Span
                                              style={{
                                                fontSize: ".75rem",
                                                color: "var(--shade-6)",
                                              }}
                                            >
                                              {timeAgo(reply.createdOn)}
                                            </Span>
                                            {canDeleteComment(reply) && (
                                              <ConfirmButton
                                                className="link"
                                                onConfirm={async () => {
                                                  await deleteComment(reply.id)
                                                }}
                                                style={{
                                                  ...utilities.button.style,
                                                  ...utilities.link.style,
                                                  ...utilities.small.style,
                                                  marginLeft: "auto",
                                                }}
                                                aria-label="Delete comment"
                                              >
                                                <Trash2 size={16} />
                                              </ConfirmButton>
                                            )}
                                          </Div>
                                          <P
                                            style={{
                                              fontSize: ".9rem",
                                              margin: 0,
                                            }}
                                          >
                                            {reply.content}
                                          </P>
                                        </Div>
                                      </>
                                    )}
                                  </Div>
                                </MotiView>
                              ))}
                          </Div>
                        )}
                      </Div>
                    </MotiView>
                  )
                })}
              </Div>
            </Div>
          )}
        </Div>
      </Div>
    </Div>
  )
}
