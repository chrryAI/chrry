"use client"

import { useState, useEffect, useRef } from "react"
import clsx from "clsx"
import {
  Brain,
  BrainCog,
  CircleX,
  Download,
  LinkIcon,
  Settings2,
  Trash2,
} from "./icons"

import styles from "./MemoryConsent.module.scss"

import { useAppContext } from "./context/AppContext"
import {
  useAuth,
  useNavigationContext,
  useApp,
  useError,
  useData,
} from "./context/providers"
import { apiFetch } from "./utils"
import ConfirmButton from "./ConfirmButton"
import Loading from "./Loading"
import { deleteMemories, updateGuest, updateUser } from "./lib"
import toast from "react-hot-toast"

export default function MemoryConsent({
  className,
  ...props
}: {
  isVisible?: boolean
  className?: string
}): React.ReactElement | null {
  // Split contexts for better organization
  const { t } = useAppContext()

  // Auth context
  const { user, guest, token, memoriesEnabled, setUser, setGuest, API_URL } =
    useAuth()

  // Navigation context (router is the wrapper)
  const {
    router,
    isMemoryConsentManageVisible,
    setIsMemoryConsentManageVisible,
  } = useNavigationContext()

  // App context
  const { isManagingApp, canEditApp } = useApp()
  const { actions } = useData()

  // Error context
  const { captureException } = useError()

  const [isDeleting, setIsDeleting] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsMemoryConsentManageVisible(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const [isUpdatingMemories, setIsUpdatingMemories] = useState(false)

  if (!user && !guest) {
    return null
  }

  if (isManagingApp || canEditApp) {
    return null
  }
  return (
    <div
      ref={containerRef}
      data-testid="memory-consent-content"
      className={clsx(styles.memoryConsent, className)}
    >
      <div className={styles.buttons}>
        <>
          {memoriesEnabled && !isMemoryConsentManageVisible ? (
            <button
              className="link"
              onClick={() => setIsMemoryConsentManageVisible(true)}
            >
              <Settings2 size={22} />
            </button>
          ) : !isMemoryConsentManageVisible ? (
            <button
              className="transparent"
              onClick={() => {
                router.push("/privacy")
              }}
            >
              <LinkIcon size={16} /> {t("Privacy")}
            </button>
          ) : (
            <></>
          )}
          {memoriesEnabled ? (
            isMemoryConsentManageVisible ? (
              <>
                <button
                  onClick={() => setIsMemoryConsentManageVisible(false)}
                  title={t("Close")}
                  className="link"
                >
                  <CircleX size={20} />
                </button>
                {(user || guest)?.memoriesCount ? (
                  <button
                    className="inverted"
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
                  </button>
                ) : null}

                <button
                  className="transparent"
                  onClick={() => {
                    router.push("/privacy")
                  }}
                >
                  <LinkIcon size={16} /> {t("Privacy")}
                </button>
                {(user || guest)?.memoriesCount ? (
                  <ConfirmButton
                    confirm={
                      <>
                        {isDeleting ? (
                          <Loading width={18} height={18} />
                        ) : (
                          <Trash2 size={16} color="var(--accent-0)" />
                        )}
                        {t("Are you sure?")}
                      </>
                    }
                    disabled={isDeleting}
                    title={t("Disable")}
                    className={clsx(styles.deleteButton, "transparent")}
                    onConfirm={async () => {
                      if (!token) return
                      setIsDeleting(true)
                      try {
                        const result = await actions.deleteMemories()
                        if (result.success) {
                          toast.success(t("Memories deleted"))
                          setIsMemoryConsentManageVisible(false)
                        } else {
                          toast.error(t("Something went wrong"))
                        }
                      } catch (error) {
                        toast.error(t("Something went wrong"))
                        captureException(error)
                        console.error("Error deleting memories:", error)
                      } finally {
                        setIsDeleting(false)
                      }
                    }}
                  >
                    <Trash2 size={18} color="var(--accent-0)" />
                    {t("Delete")}
                  </ConfirmButton>
                ) : null}
              </>
            ) : (
              <ConfirmButton
                confirm={
                  <>
                    {isUpdatingMemories ? (
                      <Loading width={18} height={18} />
                    ) : (
                      <Trash2 size={16} color="var(--accent-0)" />
                    )}
                    {t("Are you sure?")}
                  </>
                }
                disabled={isUpdatingMemories}
                title={t("💭 We use conversation memory to improve responses.")}
                className="transparent"
                style={{
                  borderStyle: "dashed",
                }}
                onConfirm={async () => {
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
                  <Brain color="#ef5350" size={18} />
                )}
                {t("Disable Memories")}
              </ConfirmButton>
            )
          ) : (
            <button
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
                <BrainCog size={18} />
              )}
              {t("Enable Memories")}
            </button>
          )}
        </>
      </div>
    </div>
  )
}
