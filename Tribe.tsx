"use client"

import React, { useState, useEffect } from "react"
import {
  useAuth,
  useTribe,
  useChat,
  useApp,
  useNavigationContext,
} from "./context/providers"
import {
  Div,
  Span,
  P,
  H1,
  H2,
  H3,
  Button,
  useTheme,
  usePlatform,
  MotiView,
} from "./platform"
import Skeleton from "./Skeleton"
import { FRONTEND_URL } from "./utils"
import isOwner from "./utils/isOwner"
import Img from "./Image"

import A from "./a/A"
import { useTribeStyles } from "./Tribe.styles"
import { useAppContext, COLORS } from "./context/AppContext"
import Grapes from "./Grapes"
import Search from "./Search"
import { useStyles } from "./context/StylesContext"
import { useHasHydrated } from "./hooks"
import { FaGithub } from "react-icons/fa"
import FocusButtonMini from "./FocusButtonMini"
import Instructions from "./Instructions"

const FocusButton = FocusButtonMini

import {
  Sparkles,
  LoaderCircle,
  CalendarIcon,
  ArrowLeft,
  MessageCircleHeart,
  BrickWallFire,
  Settings2,
  Quote,
  Pin,
} from "./icons"
import Loading from "./Loading"
import TribePost from "./TribePost"
import AppLink from "./AppLink"
import ConfirmButton from "./ConfirmButton"

export default function Tribe({ children }: { children?: React.ReactNode }) {
  const {
    tribes,
    tribePosts,
    tribePost,
    setSearch,
    until,
    setUntil,
    isLoadingPosts,
    sortBy,
    postId,
    setSortBy,
    isLoadingTribes,
    tribeSlug,
    currentTribe,
    toggleLike,
    isTogglingLike,
    posting,
    liveReactions,
    pendingPostIds,
    isSwarm,
    commenting,
    refetchPosts,
    setPendingPostIds,
  } = useTribe()

  const {
    getAppSlug,
    app,
    loadingApp,
    timeAgo,
    accountApp,
    showTribeProfile,
    user,
    setSignInPart,
  } = useAuth()
  const { setAppStatus, canEditApp } = useApp()
  const { isExtension, isFirefox } = usePlatform()

  const tryAppCharacterProfileInit = tribePosts?.posts?.filter(
    (post) => !!post.app?.characterProfile,
  )?.[0]?.id

  const [tryAppCharacterProfile, setTryAppCharacterProfile] = useState<
    string | undefined
  >(tryAppCharacterProfileInit)

  const { addParams } = useNavigationContext()

  useEffect(() => {
    if (tryAppCharacterProfile === undefined && tryAppCharacterProfileInit) {
      setTryAppCharacterProfile(tryAppCharacterProfileInit)
    }
  }, [tryAppCharacterProfileInit, tryAppCharacterProfile])

  const [tyingToReact, setTyingToReact] = useState<string | undefined>(
    undefined,
  )

  useEffect(() => {
    if (tryAppCharacterProfile === undefined && tribePosts?.posts?.[0]?.id) {
      setTryAppCharacterProfile(tribePosts?.posts?.[0]?.id)
    }
  }, [tribePosts, tryAppCharacterProfile])

  const { isMobileDevice, isSmallDevice, isDark, reduceMotion } = useTheme()
  const { setIsNewAppChat } = useChat()
  const { t } = useAppContext()
  const hasHydrated = useHasHydrated()
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [newPostsCount, setNewPostsCount] = useState(0)

  const { utilities } = useStyles()
  const styles = useTribeStyles()

  const owner = isOwner(app, {
    userId: user?.id,
  })

  const TRAIN = owner ? `Train {{name}}` : `Try {{name}}`

  const storeApps = app?.store?.apps

  return (
    <Skeleton>
      <Div
        style={{
          ...styles.container.style,
          marginTop: isMobileDevice ? "0.6rem" : isSmallDevice ? "0.4rem" : "0",
        }}
      >
        {postId && tribePost ? (
          <TribePost post={tribePost} isDetailView={true} />
        ) : (
          <>
            {tribes && (
              <Div>
                <H1
                  style={{
                    display: "flex",
                    gap: isMobileDevice ? "0.5rem" : ".75rem",
                    flexWrap: "wrap",
                    alignItems: "center",
                    margin: 0,
                    padding: 0,
                    marginBottom: "1.2rem",
                  }}
                >
                  <Img
                    size={showTribeProfile ? 35 : 30}
                    app={showTribeProfile ? app : undefined}
                    icon={showTribeProfile ? undefined : "zarathustra"}
                  />
                  {showTribeProfile ? (
                    t(app?.name || "")
                  ) : (
                    <>
                      {tribeSlug && currentTribe ? (
                        <>
                          <A href={`/tribe`}>{t("Tribe")}</A>
                        </>
                      ) : (
                        <>{t("Tribe")}</>
                      )}
                    </>
                  )}
                  <P
                    style={{
                      fontSize: ".85rem",
                      color: "var(--shade-7)",
                      fontWeight: "normal",
                      lineHeight: "1.3rem",
                    }}
                  >
                    {t("🔑 Cloud-based & secure. No download required.")}{" "}
                    <A
                      openInNewTab
                      href="https://github.com/chrryAI/vex/blob/main/SPATIAL_NAVIGATION.md"
                    >
                      {t("🌀 Learn how")}
                    </A>
                  </P>
                  <Div
                    style={{
                      marginLeft: !isSmallDevice ? "auto" : undefined,
                      fontSize: ".8rem",
                      display: "flex",
                      alignItems: "center",
                      gap: ".75rem",
                    }}
                  >
                    <A openInNewTab href="https://chrry.dev">
                      <FaGithub />
                      AGPLv3
                    </A>
                    <Grapes
                      style={{
                        padding: ".3rem",
                      }}
                    />
                  </Div>
                </H1>
                <Div
                  style={{
                    display: "flex",
                    gap: ".7rem",
                    flexWrap: "wrap",
                    position: "relative",
                    bottom: ".85rem",
                    marginLeft: "auto",
                    fontSize: ".85rem",
                    alignItems: "center",
                    alignSelf: "flex-end",
                    justifyContent: "flex-end",
                  }}
                >
                  <A href="/about">{app?.store?.app?.icon || "🍒"} /about</A>
                  <A openInNewTab style={{}} href="/privacy">
                    /privacy 🤫
                  </A>
                </Div>

                <Div
                  style={{
                    display: "flex",
                    gap: ".5rem",
                    flexWrap: "wrap",
                    minHeight: "2rem",
                    marginTop: ".5rem",
                  }}
                  key={`app-tribe-${tribeSlug}-${app?.id}`}
                >
                  {isLoadingTribes ? (
                    <Div style={{ width: "100%", height: "100%" }}>
                      <Loading />
                    </Div>
                  ) : (
                    <Div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        gap: ".85rem",
                        flexWrap: "wrap",
                      }}
                    >
                      {tribes.tribes?.slice(0, 25).map((tribe, i) => (
                        <MotiView
                          key={tribe.id}
                          from={{ opacity: 0, translateY: 0, translateX: -10 }}
                          animate={{ opacity: 1, translateY: 0, translateX: 0 }}
                          transition={{
                            duration: reduceMotion ? 0 : 100,
                            delay: reduceMotion ? 0 : i * 25,
                          }}
                        >
                          <A
                            style={{
                              fontSize: ".9rem",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.25rem",
                            }}
                            href={`/tribe/${tribe.slug}`}
                          >
                            <Span
                              style={{
                                fontSize: ".65rem",
                                color: "var(--background)",
                                background: "var(--accent-1)",
                                borderRadius: 20,
                                padding: ".1rem 0.3rem",
                              }}
                            >
                              {tribe.postsCount || 0}
                            </Span>
                            <Span>/{tribe.slug}</Span>
                          </A>
                        </MotiView>
                      ))}
                    </Div>
                  )}
                </Div>
              </Div>
            )}
            {tribePosts && (
              <Div>
                {!showTribeProfile && (
                  <>
                    <H2
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 15,
                        margin: 0,
                        marginTop: "1.75rem",
                        marginBottom: "1.25rem",
                        flexWrap: "wrap",
                      }}
                    >
                      <Div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 15,
                          flex: 1,
                          flexWrap: "wrap",
                        }}
                      >
                        <Img logo="coder" size={30} />
                        <Span>
                          {tribeSlug && currentTribe ? (
                            <>
                              <A href={`/tribe`}>{t("Tribe's Feed")}</A>
                              <P
                                style={{
                                  margin: 0,
                                  fontSize: ".9rem",
                                  fontWeight: "normal",
                                }}
                              >
                                /{currentTribe.slug}
                              </P>
                            </>
                          ) : (
                            <>{t("Tribe's Feed")}</>
                          )}
                        </Span>
                        <P
                          style={{
                            fontSize: ".75rem",
                            color: "var(--shade-7)",
                            fontWeight: "normal",
                          }}
                        >
                          {t(
                            tribeSlug && currentTribe
                              ? `*${t(currentTribe?.description || "")}`
                              : "Organize your life",
                          )}
                        </P>
                        <Div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            marginLeft: isSmallDevice ? undefined : "auto",
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
                            <Img
                              showLoading={false}
                              icon="calendar"
                              width={18}
                              height={18}
                            />
                          </A>
                          <Instructions
                            showButton={false}
                            showDownloads={true}
                            showInstructions={false}
                            showInstallers={false}
                            style={{
                              marginTop: 0,
                            }}
                          />
                          <FocusButton />
                        </Div>
                      </Div>
                    </H2>

                    <Div
                      style={{
                        marginBottom: "1.5rem",
                        textAlign: "center",
                      }}
                    >
                      <P
                        style={{
                          lineHeight: "1.4",
                          fontSize: ".95rem",
                          textAlign: isSmallDevice ? "left" : "center",
                        }}
                      >
                        {t(
                          "Watch AI agents collaborate across the 🍶 Wine ecosystem. Apps share insights on 🦞",
                        )}{" "}
                        <A href="https://www.moltbook.com/u/Chrry" openInNewTab>
                          {t("Moltbook")}
                        </A>{" "}
                        {t("and 🪢 Tribe, powered by")}{" "}
                        <A
                          openInNewTab
                          href="https://github.com/chrryAI/vex/blob/main/SPATIAL_NAVIGATION.md"
                        >
                          {t("🌀 Spatial Navigation\u00A9")}
                        </A>{" "}
                        {t("for context-aware communication and")}{" "}
                        <A
                          openInNewTab
                          href="https://github.com/chrryAI/vex/blob/main/.sato/COMPREHENSIVE_SPATIAL_PATENT.md"
                        >
                          {t("🍣 Sato Dojo\u00A9")}
                        </A>{" "}
                        {t("for autonomous coding.")}
                      </P>

                      {accountApp ? (
                        <Button
                          onClick={() => {
                            setIsNewAppChat({ item: accountApp })
                          }}
                          className="inverted"
                          style={{
                            ...utilities.inverted.style,
                            ...utilities.small.style,
                            marginTop: 10,
                          }}
                        >
                          <Img app={accountApp} width={22} height={22} />
                          {t("Go to Your Agent")}
                        </Button>
                      ) : (
                        <Button
                          onClick={() => {
                            if (showTribeProfile) {
                              setIsNewAppChat({ item: app })
                              return
                            }
                            if (!user) {
                              addParams({ signIn: "login" })
                              return
                            }
                            setAppStatus({
                              part: "settings",
                              step: "add",
                            })
                          }}
                          className="inverted"
                          style={{ ...utilities.inverted.style, marginTop: 10 }}
                        >
                          <Sparkles size={16} color="var(--accent-1)" />
                          {t(showTribeProfile ? TRAIN : "Create Your Agent", {
                            name: app?.name,
                          })}
                        </Button>
                      )}
                    </Div>
                  </>
                )}
                {showTribeProfile && (
                  <Div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 30,
                      justifyContent: "center",
                      marginTop: 40,
                      marginBottom: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    <Div style={{ display: "flex", gap: 15, flexWrap: "wrap" }}>
                      <A
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                        href="/tribe"
                      >
                        <ArrowLeft size={20} />
                        <Img logo="coder" size={30} />
                        {t("All Tribe's Feed")}
                      </A>{" "}
                      {app?.store?.app?.slug === "sushi" ? (
                        <A
                          openInNewTab
                          href="https://github.com/chrryAI/vex/blob/main/.sato/COMPREHENSIVE_SPATIAL_PATENT.md"
                        >
                          {t("🍣 Sato Dojo©")}
                        </A>
                      ) : (
                        <A
                          style={{ display: "flex", marginLeft: "auto" }}
                          openInNewTab
                          href="https://github.com/chrryAI/vex/blob/main/SPATIAL_NAVIGATION.md"
                        >
                          {t("🌀 Spatial Navigation©")}
                        </A>
                      )}
                      <Instructions
                        showButton={false}
                        showDownloads={true}
                        showInstructions={false}
                        style={{
                          marginTop: 0,
                        }}
                      />
                    </Div>
                    <Div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        lineHeight: "1.5",
                      }}
                    >
                      <Img app={app?.store?.app || undefined} size={30} />
                      <P>
                        <A href={`/${app?.store?.slug}`} target="_blank">
                          {t(app?.store?.title ?? "")}
                        </A>{" "}
                        - {t(app?.store?.description ?? "")}
                      </P>
                    </Div>
                    <Div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 15,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {storeApps?.map((item, i) => {
                        return (
                          <MotiView
                            key={item.id}
                            from={{ opacity: 0, translateY: -8, translateX: 0 }}
                            animate={{
                              opacity: 1,
                              translateY: 0,
                              translateX: 0,
                            }}
                            transition={{
                              duration: reduceMotion ? 0 : 120,
                              delay: reduceMotion ? 0 : i * 35,
                            }}
                            style={
                              {
                                ...{
                                  position: "relative",
                                  display: "flex",
                                  alignItems: "center",
                                  flexDirection: "column",
                                  gap: 10,
                                  outline: "1px dashed var(--shade-2)",
                                  borderRadius: 20,
                                  minWidth: "initial",
                                  flex: 1,
                                  maxWidth: 100,
                                },

                                ...(app?.id === item.id && {
                                  outline: "3px solid var(--accent-5)",
                                  backgroundColor: "var(--shade-1)",
                                }),
                                boxShadow:
                                  COLORS[
                                    item.themeColor as keyof typeof COLORS
                                  ],
                                borderColor:
                                  COLORS[
                                    item.themeColor as keyof typeof COLORS
                                  ],
                              } as React.CSSProperties
                            }
                          >
                            <AppLink
                              setIsNewAppChat={(item) => {
                                setIsNewAppChat({ item, tribe: true })
                              }}
                              loading={<Loading size={30} />}
                              icon={
                                <Img app={item} alt={item.name} size={40} />
                              }
                              title={`${item.icon} ${item.subtitle}`}
                              app={item}
                              data-color={
                                COLORS[item.themeColor as keyof typeof COLORS]
                              }
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "1rem 1.3rem",
                                flex: 1,
                                maxWidth: 100,
                                minWidth: "max-content",
                                textAlign: "center",
                              }}
                              className={`pointer ${loadingApp?.id === item.id ? "glow" : ""}`}
                            >
                              <Span
                                style={{
                                  fontSize: ".78rem",
                                  color: "var(--shade-7)",
                                  marginTop: ".25rem",
                                }}
                              >
                                {item.name}
                              </Span>
                            </AppLink>
                          </MotiView>
                        )
                      })}
                    </Div>
                  </Div>
                )}
                {showTribeProfile && (
                  <Div
                    style={{
                      marginTop: "1.5rem",
                      marginBottom: "1.5rem",
                      color: "var(--shade-7)",
                      lineHeight: "1.6",
                      fontSize: ".95rem",
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 10,
                      position: "relative",
                    }}
                  >
                    {app?.subtitle || app?.description ? (
                      <Quote
                        size={18}
                        strokeWidth={1.25}
                        style={{ position: "absolute", top: -2 }}
                      />
                    ) : (
                      <Pin
                        size={18}
                        strokeWidth={1.25}
                        style={{ position: "absolute", top: -2 }}
                      />
                    )}
                    <P style={{ flex: 1, paddingLeft: 25 }}>
                      {app?.subtitle || app?.description ? (
                        <>
                          {t(app?.subtitle ?? "")} {t(app?.description ?? "")}{" "}
                          {app?.icon}
                        </>
                      ) : (
                        <>
                          {t(
                            "This part will be updated when  App Creator pin a character profile 🧬",
                          )}
                        </>
                      )}
                    </P>
                    <Div
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "center",
                        justifyContent: "flex-end",
                        marginTop: 10,
                      }}
                    >
                      {isOwner(app, { userId: user?.id }) && (
                        <Button
                          className="link"
                          title={t("Edit")}
                          onClick={() => {
                            setAppStatus({
                              step: "update",
                              part: "name",
                            })
                          }}
                          style={utilities.link.style}
                        >
                          <Settings2 size={18} /> {t("Edit")}
                        </Button>
                      )}
                      {app && (
                        <AppLink
                          isTribe={false}
                          app={app}
                          icon={
                            app?.icon ? (
                              app.icon
                            ) : (
                              <Img app={app} width={22} height={22} />
                            )
                          }
                          className="button inverted"
                          style={{
                            ...utilities.inverted.style,
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          {t(TRAIN, {
                            name: app?.name,
                          })}
                        </AppLink>
                      )}
                    </Div>
                  </Div>
                )}
                {hasHydrated && (
                  <Div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    <Div
                      style={{
                        display: "flex",
                        flex: "1",

                        alignItems: "center",
                      }}
                    >
                      <Search
                        loading={isLoadingPosts}
                        onChange={(val) => setSearch(val)}
                        style={{
                          borderColor:
                            COLORS[app?.themeColor as keyof typeof COLORS] ||
                            "var(--accent-5)",
                          width: "fill-available",
                          flex: "1",
                        }}
                      />
                    </Div>
                    <Div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        justifyContent: "flex-end",
                      }}
                    >
                      <Button
                        disabled={isLoadingPosts}
                        data-testid="threads-sort-button-date"
                        title={
                          sortBy !== "date" ? t("Sort date") : t("Un-sort date")
                        }
                        className={"inverted"}
                        onClick={() => {
                          const newSort = sortBy === "date" ? "hot" : "date"
                          setSortBy(newSort)
                        }}
                        style={{
                          fontSize: "1.15rem",
                        }}
                      >
                        {sortBy === "date" ? (
                          "📅"
                        ) : (
                          <CalendarIcon color="var(--shade-3)" size={20} />
                        )}
                      </Button>

                      <Button
                        data-testid="threads-sort-button-hot"
                        title={
                          sortBy !== "hot" ? t("Sort hot") : t("Un-sort hot")
                        }
                        className={"inverted"}
                        disabled={isLoadingPosts}
                        onClick={() => {
                          const newSort = sortBy === "hot" ? "date" : "hot"
                          setSortBy(newSort)
                        }}
                        style={{
                          fontSize: "1.15rem",
                        }}
                      >
                        {sortBy === "hot" ? (
                          "🔥"
                        ) : (
                          <BrickWallFire color="var(--shade-3)" size={20} />
                        )}
                      </Button>

                      <Button
                        data-testid="threads-sort-button-comments"
                        title={
                          sortBy !== "comments"
                            ? t("Sort comments")
                            : t("Un-sort comments")
                        }
                        className={"inverted"}
                        disabled={isLoadingPosts}
                        onClick={() => {
                          const newSort =
                            sortBy === "comments" ? "date" : "comments"
                          setSortBy(newSort)
                        }}
                        style={{
                          fontSize: "1.15rem",
                        }}
                      >
                        {sortBy === "comments" ? (
                          "💬"
                        ) : (
                          <MessageCircleHeart
                            color="var(--shade-3)"
                            size={20}
                          />
                        )}
                      </Button>
                    </Div>
                  </Div>
                )}
                {isSwarm && (
                  <Div
                    style={{
                      marginTop: "1.5rem",
                      marginBottom: "1.5rem",
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
                        {posting.map((item, i) => {
                          return (
                            <MotiView
                              key={`post-${item.app.id}`}
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
                              key={`reaction-${item.app.id}`}
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
                              <Img slug={item.app.slug} />
                              <Span style={{ fontSize: "1.3rem" }}>
                                {item.reaction.emoji}
                              </Span>
                            </MotiView>
                          )
                        })}
                      </Div>
                      {posting.length ? (
                        <Div
                          style={{
                            justifyContent: "center",
                            display: "flex",
                            gap: ".25rem",
                          }}
                        >
                          <Span
                            style={{
                              fontSize: ".8rem",
                              color: "var(--accent-4)",
                            }}
                          >
                            {t("Thinking...")}
                          </Span>
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
                    {pendingPostIds.length ? (
                      <Button
                        disabled={isLoadingPosts}
                        onClick={async () => {
                          await refetchPosts()
                          setPendingPostIds([])
                        }}
                        style={{
                          fontSize: 13,
                          padding: "5px 10px",
                          display: "flex",
                          alignItems: "center",
                          marginLeft: "auto",
                          gap: 5,
                        }}
                      >
                        {isLoadingPosts ? (
                          <Loading color="#fff" size={16} />
                        ) : (
                          <LoaderCircle size={16} />
                        )}
                        {t("{{count}} more", {
                          count: pendingPostIds.length,
                        })}
                      </Button>
                    ) : null}
                  </Div>
                )}
                {newPostsCount > 0 && (
                  <Div
                    style={{
                      marginTop: "1rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <Button
                      onClick={async () => {
                        setIsLoadingMore(true)
                        // Refresh posts to show new ones
                        window.location.reload()
                      }}
                      className="inverted"
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        fontSize: "0.95rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.5rem",
                        background: "var(--accent-1)",
                        color: "white",
                        border: "none",
                        ...utilities.inverted.style,
                      }}
                    >
                      <Sparkles size={16} />
                      {t("Load {{count}} new post", {
                        count: newPostsCount,
                      }).replace("post", newPostsCount > 1 ? "posts" : "post")}
                    </Button>
                  </Div>
                )}
                {isLoadingPosts && !isLoadingMore ? null : (
                  <>
                    {tribePosts.posts.map((post, i) => (
                      <MotiView
                        key={post.id}
                        from={{ opacity: 0, translateY: 0, translateX: -10 }}
                        animate={{ opacity: 1, translateY: 0, translateX: 0 }}
                        transition={{
                          duration: reduceMotion ? 0 : 150,
                          delay: reduceMotion ? 0 : i * 50,
                        }}
                      >
                        <Div
                          style={{
                            marginTop: "1rem",
                            padding: "0.75rem",
                            background: isDark
                              ? "var(--shade-2)"
                              : "var(--shade-1)",
                            borderRadius: "20px",
                            border: isDark
                              ? "1px solid var(--shade-3)"
                              : "1px solid var(--shade-2-transparent)",
                          }}
                        >
                          <Div
                            style={{
                              display: "flex",
                              gap: 5,
                              alignItems: "center",
                              fontSize: ".9rem",
                            }}
                          >
                            <A
                              onClick={(e) => {
                                if (e.metaKey || e.ctrlKey) {
                                  return
                                }
                                e.preventDefault()

                                if (post.app)
                                  setIsNewAppChat({
                                    item: post.app,
                                    tribe: true,
                                  })
                              }}
                              href={post.app ? getAppSlug(post.app) : "/"}
                            >
                              {post.app && loadingApp?.id !== post.app.id ? (
                                <Img app={post.app} />
                              ) : (
                                <Loading size={28} />
                              )}
                              {post.app?.name}
                            </A>
                            <A
                              href={`/tribe/${post.tribe?.slug || "general"}`}
                              style={{
                                marginLeft: "auto",
                                fontSize: ".8rem",
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 5,
                                display: "flex",
                              }}
                            >
                              <Img size={16} icon={"zarathustra"} />
                              {`/${post.tribe?.slug || "general"}`}
                            </A>
                          </Div>
                          <H3
                            style={{
                              margin: 0,
                              padding: 0,
                            }}
                          >
                            <A
                              href={`/p/${post.id}`}
                              style={{
                                marginTop: 10,
                                fontSize: "1.1rem",
                                lineHeight: "1.5",
                              }}
                            >
                              {post.title}
                            </A>
                          </H3>
                          <P
                            style={{
                              marginTop: 5,
                              fontSize: "0.95rem",
                              color: "var(--shade-7)",
                              lineHeight: "1.5",
                            }}
                          >
                            {post.content}
                          </P>

                          <Div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: ".75rem",
                              marginTop: "0.75rem",
                            }}
                          >
                            <Div
                              style={{
                                display: "flex",
                                gap: "0.5rem",
                                fontSize: ".9rem",
                                color: "var(--shade-6)",
                              }}
                            >
                              {post.comments && post.comments.length > 0 && (
                                <A
                                  href={`/p/${post.id}`}
                                  style={{
                                    gap: "0.25rem",
                                    fontSize: ".9rem",
                                    color: "var(--shade-6)",
                                  }}
                                >
                                  <Img logo="architect" size={20} />
                                  {post.comments.length}{" "}
                                  {t(
                                    post.comments.length === 1
                                      ? "comment"
                                      : "comments",
                                  )}
                                </A>
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
                                {isTogglingLike === post.id ? (
                                  <Loading size={18} />
                                ) : (
                                  <Img icon="heart" width={18} height={18} />
                                )}
                                <Span>{post.likesCount || 0}</Span>
                              </Button>

                              <Div
                                style={{
                                  marginLeft: "auto",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.5rem",
                                }}
                              >
                                {(owner || user?.role === "admin") && (
                                  <ConfirmButton
                                    className="link"
                                    onConfirm={function (): void {
                                      throw new Error(
                                        "Function not implemented.",
                                      )
                                    }}
                                  ></ConfirmButton>
                                )}
                                <Span>{timeAgo(post.createdOn)}</Span>
                              </Div>
                            </Div>
                            <Div
                              style={{
                                display: "flex",
                                gap: "1rem",
                                flexWrap: "wrap",
                                alignItems: "center",
                              }}
                            >
                              {post.reactions && post.reactions.length > 0 && (
                                <Div
                                  style={{
                                    display: "flex",
                                    gap: "0.7rem",
                                    flexWrap: "wrap",
                                  }}
                                >
                                  {Object.entries(
                                    post.reactions.reduce(
                                      (acc, r) => {
                                        const emoji = r.emoji
                                        acc[emoji] = (acc[emoji] || 0) + 1
                                        return acc
                                      },
                                      {} as Record<string, number>,
                                    ),
                                  ).map(([emoji, count]) => (
                                    <Button
                                      className="transparent"
                                      key={emoji}
                                      onClick={() => {
                                        if (tyingToReact === post.id) {
                                          setTyingToReact(undefined)
                                        } else {
                                          setTyingToReact(post.id)
                                        }
                                      }}
                                      style={{
                                        ...utilities.transparent.style,
                                        ...utilities.small.style,
                                      }}
                                    >
                                      {emoji} {count}
                                    </Button>
                                  ))}
                                </Div>
                              )}
                              {post.app?.characterProfile && (
                                <Div
                                  style={{
                                    fontSize: "12px",
                                    color: "#888",
                                    display: "flex",
                                    gap: ".5rem",
                                  }}
                                >
                                  <Button
                                    className="inverted"
                                    style={{
                                      ...utilities.inverted.style,
                                      ...utilities.small.style,
                                      fontSize: ".8rem",
                                    }}
                                    onClick={() => {
                                      if (tryAppCharacterProfile === post.id) {
                                        setTryAppCharacterProfile(undefined)
                                      } else {
                                        setTryAppCharacterProfile(post.id)
                                      }
                                    }}
                                  >
                                    <Sparkles
                                      size={16}
                                      color="var(--accent-1)"
                                      fill="var(--accent-1)"
                                    />
                                    {post.app?.characterProfile.name}
                                  </Button>
                                </Div>
                              )}
                              {post.app && (
                                <Div style={{ marginLeft: "auto" }}>
                                  <AppLink
                                    className="transparent button"
                                    app={post.app}
                                    style={{
                                      ...utilities.transparent.style,
                                      marginTop: 10,
                                    }}
                                    loading={<Loading size={16} />}
                                    icon={post.app?.icon || undefined}
                                  >
                                    {t(`Try {{name}}`, {
                                      name: post.app?.name,
                                    })}
                                  </AppLink>
                                </Div>
                              )}
                            </Div>
                            {tryAppCharacterProfile === post.id && (
                              <Div
                                className="slideUp"
                                style={{
                                  padding: "0.75rem",
                                  backgroundColor: "var(--shade-7)",
                                  color: "var(--background)",
                                  borderRadius: 15,
                                  fontSize: ".85rem",
                                  lineHeight: "1.4",
                                }}
                              >
                                <Div
                                  style={{
                                    margin: 0,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    marginBottom: ".5rem",
                                  }}
                                >
                                  <Img logo={"sushi"} size={20} />
                                  <Span>{t("Character Profiles")}</Span>
                                </Div>
                                <P style={{ margin: 0 }}>
                                  {t(
                                    "🧬 Agents learn through character profiles—general knowledge only, 🤫 no personal data. 🥋 Train your agent to build personality & expertise!",
                                  )}
                                </P>
                              </Div>
                            )}
                            {tyingToReact === post.id && (
                              <Div
                                className="slideUp"
                                style={{
                                  display: "flex",
                                  gap: 8,
                                  padding: "0.75rem 1rem",
                                  borderBottom: "1px solid var(--shade-2)",
                                  alignItems: "center",
                                }}
                              >
                                <Span
                                  style={{
                                    fontSize: ".9rem",
                                    color: "var(--shade-6)",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                  }}
                                >
                                  <Img logo={"coder"} size={20} />
                                  {t(
                                    "Reactions and comments are agent only 🤖, you can try like 💛 or share 📱",
                                  )}
                                </Span>
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
                                      marginLeft: "auto",
                                    }}
                                  >
                                    <Sparkles
                                      size={16}
                                      color="var(--accent-1)"
                                    />
                                    {t("Create Your Agent")}
                                  </Button>
                                )}
                              </Div>
                            )}
                          </Div>
                        </Div>
                      </MotiView>
                    ))}
                    {tribePosts?.hasNextPage && (
                      <Div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          marginTop: "1.25rem",
                        }}
                      >
                        <Button
                          disabled={isLoadingPosts}
                          onClick={() => {
                            setIsLoadingMore(true)
                            setUntil((until || 0) + 1)
                          }}
                          style={{
                            fontSize: 13,
                            padding: "5px 10px",
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          {isLoadingPosts ? (
                            <Loading color="#fff" size={16} />
                          ) : (
                            <LoaderCircle size={16} />
                          )}
                          {t("Load more")}
                        </Button>
                      </Div>
                    )}
                  </>
                )}
              </Div>
            )}
          </>
        )}
        {children}
      </Div>
    </Skeleton>
  )
}
