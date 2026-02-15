"use client"

import { useState, useEffect, useRef } from "react"
import { Brain, CircleX, Download, LinkIcon, Settings2, Trash2 } from "./icons"

import { useAppContext } from "./context/AppContext"
import {
  useAuth,
  useNavigationContext,
  useApp,
  useError,
  useData,
} from "./context/providers"
import { apiFetch, isE2E } from "./utils"
import { ANALYTICS_EVENTS } from "./utils/analyticsEvents"
import ConfirmButton from "./ConfirmButton"
import Loading from "./Loading"
import { updateUser } from "./lib"
import toast from "react-hot-toast"
import { useMemoryConsentStyles } from "./MemoryConsent.styles"
import { Button, Div, Input } from "./platform"
import { useStyles } from "./context/StylesContext"
import { useHasHydrated } from "./hooks"
import useCache from "./hooks/useCache"
import Checkbox from "./Checkbox"

export default function MemoryConsent({
  style,
}: {
  isVisible?: boolean
  style?: React.CSSProperties
}): React.ReactElement | null {
  const styles = useMemoryConsentStyles()
  const { utilities } = useStyles()
  const { t } = useAppContext()

  const {
    user,
    guest,
    token,
    memoriesEnabled,
    setUser,
    setGuest,
    API_URL,
    isLiveTest,
    burnApp,
    setBurn,
    refetchSession,
    app,
    plausible,
    ...auth
  } = useAuth()

  const burn = !!(auth.burn || (burnApp && app && burnApp?.id === app?.id))

  const {
    router,
    isMemoryConsentManageVisible,
    setIsMemoryConsentManageVisible,
  } = useNavigationContext()

  const { clear } = useCache()
  const { isManagingApp, canEditApp, minimize } = useApp()
  const { actions } = useData()

  const { captureException } = useError()

  const [isDeleting, setIsDeleting] = useState(false)

  const isHydrated = useHasHydrated()

  const [isDeletingSession, setIsDeletingSession] = useState(false)
  const [isDeleted, setIsDeleted] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        isMemoryConsentManageVisible && setIsMemoryConsentManageVisible(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isMemoryConsentManageVisible])

  const [isUpdatingMemories, setIsUpdatingMemories] = useState(false)

  if (!user && !guest) {
    return null
  }

  if (isManagingApp || !isHydrated) {
    return null
  }

  if (burn) {
    return (
      <Div
        ref={containerRef}
        className="slideUp"
        style={{
          // ...styles.container.style,
          padding: ".8rem",
          borderRadius: 20,
          maxWidth: "40rem",
          margin: "0 auto",
          marginTop: "1rem",
          position: "relative",
          top: -12.5,
        }}
      >
        <Div>
          <Div
            style={{
              fontWeight: 600,
              marginBottom: "0.25rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: ".9rem",
            }}
          >
            <span style={{ fontSize: "1.5rem" }}>🔥</span>

            <Checkbox
              style={{ marginLeft: "auto" }}
              checked={auth.burn}
              children={""}
              onChange={() => {
                setBurn(!auth.burn)
              }}
            />
          </Div>
        </Div>
      </Div>
    )
  }

  return (
    <Div
      ref={containerRef}
      data-testid="memory-consent-content"
      style={{ ...styles.memoryConsent.style, ...style }}
    >
      {isDeleted && (
        <Input
          type="hidden"
          value={isDeleted.toString()}
          onChange={() => {}}
          data-testid="is-deleted"
        />
      )}

      <Div style={styles.buttons.style}>
        <>
          {memoriesEnabled && !isMemoryConsentManageVisible && !minimize ? (
            <Button
              className="link"
              style={{ ...utilities.link.style }}
              onClick={() => setIsMemoryConsentManageVisible(true)}
            >
              <Settings2 size={22} />
            </Button>
          ) : !minimize && !isMemoryConsentManageVisible ? (
            <Button
              className="transparent"
              style={{ ...utilities.transparent.style }}
              onClick={() => {
                router.push("/privacy")
              }}
            >
              <LinkIcon size={16} /> {t("Privacy")}
            </Button>
          ) : (
            <></>
          )}
          {memoriesEnabled ? (
            isMemoryConsentManageVisible ? (
              <>
                <Button
                  onClick={() => setIsMemoryConsentManageVisible(false)}
                  title={t("Close")}
                  className="link"
                  style={{ ...utilities.link.style }}
                >
                  <CircleX size={20} />
                </Button>
                {(user || guest)?.memoriesCount ? (
                  <Button
                    className="inverted"
                    style={{ ...utilities.inverted.style }}
                    onClick={async () => {
                      const response = await apiFetch(`${API_URL}/memories`, {
                        method: "GET",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`,
                        },
                      })
                      const data = await response.json()
                      const blob = new Blob([JSON.stringify(data, null, 2)], {
                        type: "application/json",
                      })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement("a")
                      a.href = url
                      a.download = `vex-memories-${new Date().toISOString()}.json`
                      a.click()
                    }}
                  >
                    <Download size={18} />
                    {t("Export")}
                  </Button>
                ) : null}

                <Button
                  className="transparent"
                  style={{ ...utilities.transparent.style }}
                  onClick={() => {
                    router.push("/privacy")
                  }}
                >
                  <LinkIcon size={16} /> {t("Privacy")}
                </Button>
                {(user || guest)?.memoriesCount ? (
                  <ConfirmButton
                    processing={isDeleting}
                    disabled={isDeleting}
                    title={t("Delete")}
                    className={"transparent"}
                    style={{
                      ...utilities.transparent.style,
                      ...styles.deleteButton.style,
                      fontSize: 15,
                    }}
                    onConfirm={async () => {
                      if (!token) return
                      setIsDeleting(true)
                      try {
                        const result = await actions.deleteMemories()
                        if (result.success) {
                          await refetchSession()
                          toast.success(t("Memories deleted"))
                          setIsMemoryConsentManageVisible(false)
                        } else {
                          toast.error(t("Something went wrong"))
                        }
                        plausible({
                          name: ANALYTICS_EVENTS.MEMORY_DELETE,
                          props: {
                            success: result.success,
                          },
                        })
                      } catch (error) {
                        toast.error(t("Something went wrong"))
                        captureException(error)
                        console.error("Error deleting memories:", error)
                      } finally {
                        setIsDeleting(false)
                      }
                    }}
                  >
                    <Trash2 size={15} color="var(--accent-0)" />
                  </ConfirmButton>
                ) : null}
              </>
            ) : (
              !minimize && (
                <>
                  <ConfirmButton
                    confirm={
                      <>
                        {isUpdatingMemories ? (
                          <Loading width={18} height={18} />
                        ) : (
                          <Brain color="#ef5350" size={18} />
                        )}
                        {t("Are you sure?")}
                      </>
                    }
                    disabled={isUpdatingMemories}
                    title={t(
                      "💭 We use conversation memory to improve responses.",
                    )}
                    className="transparent"
                    style={{
                      ...utilities.transparent.style,
                      borderStyle: "dashed",
                    }}
                    onConfirm={async () => {
                      setBurn(!burn)
                      if (!token) return
                      setIsUpdatingMemories(true)
                      try {
                        if (user) {
                          const updatedUser = await updateUser({
                            token,
                            memoriesEnabled: !memoriesEnabled,
                          })

                          setUser(updatedUser)
                        }

                        if (guest) {
                          const updatedGuest = await actions.updateGuest({
                            memoriesEnabled: !memoriesEnabled,
                          })

                          setGuest(updatedGuest)
                        }
                      } catch (error) {
                        console.error("Error updating guest:", error)
                      } finally {
                        setIsUpdatingMemories(false)
                      }
                    }}
                  >
                    {isUpdatingMemories ? (
                      <Loading width={18} height={18} />
                    ) : (
                      <Brain color="var(--shade-5)" size={18} />
                    )}
                    {t("Disable Memories")}
                  </ConfirmButton>

                  {isE2E && isLiveTest && (
                    <ConfirmButton
                      dataDeleted={isDeleted}
                      className="transparent"
                      processing={isDeletingSession}
                      data-testid="clear-session"
                      key={String(isDeletingSession)}
                      onConfirm={async () => {
                        if (!token) return
                        try {
                          setIsDeletingSession(true)
                          const result = await apiFetch(`${API_URL}/clear`, {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${token}`,
                            },
                          })
                          const data = await result.json()

                          if (data.error) {
                            toast.error(data.error)
                            return
                          }

                          setIsDeleted(true)

                          data.success && toast.success(t("Session cleared"))
                          clear()
                        } catch (error) {
                          console.error("Error updating guest:", error)
                        } finally {
                          setIsUpdatingMemories(false)
                          setIsDeletingSession(false)
                        }
                      }}
                    >
                      {isDeletingSession ? (
                        <Loading width={13} height={13} />
                      ) : (
                        <Trash2 color="red" size={13} />
                      )}
                    </ConfirmButton>
                  )}
                </>
              )
            )
          ) : (
            <Button
              disabled={isUpdatingMemories}
              style={{
                borderColor: "var(--accent-6)",
              }}
              onClick={async () => {
                if (!token) return
                try {
                  setIsUpdatingMemories(true)

                  if (user) {
                    const updatedUser = await updateUser({
                      token,
                      memoriesEnabled: true,
                    })

                    setUser(updatedUser)
                  }

                  if (guest) {
                    const updatedGuest = await actions.updateGuest({
                      memoriesEnabled: true,
                    })

                    setGuest(updatedGuest)
                  }
                } catch (error) {
                  console.error("Error updating guest:", error)
                } finally {
                  setIsUpdatingMemories(false)
                }
              }}
            >
              {isUpdatingMemories ? (
                <Loading color="white" width={18} height={18} />
              ) : (
                <Brain size={16} />
              )}
              {t("Enable Memories")}
            </Button>
          )}
        </>
      </Div>
    </Div>
  )
}
