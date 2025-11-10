"use client"

import React, { useEffect, useState } from "react"
import clsx from "clsx"
import styles from "./Share.module.scss"
import { collaboration, thread, user } from "./types"
import {
  Circle,
  CircleCheck,
  CircleUser,
  CircleUserRound,
  CircleX,
  Copy,
  Link2,
  LockIcon,
  LockOpen,
  Rss,
  ShareIcon,
  Trash2,
  UserLock,
  UsersRound,
  X,
} from "./icons"
import Modal from "./Modal"
import toast from "react-hot-toast"
import { useAppContext } from "./context/AppContext"
import Checkbox from "./Checkbox"
import { updateCollaboration, updateThread } from "./lib"
import Loading from "./Loading"
import ConfirmButton from "./ConfirmButton"
import Img from "./Img"
import {
  useAuth,
  useChat,
  useData,
  useNavigationContext,
} from "./context/providers"
import { apiFetch } from "./utils"

export default function Share({
  className,
  size,
  onChangeVisibility,
  thread,
  onCollaborationChange,
  ...rest
}: {
  dataTestId?: string
  thread: thread
  className?: string
  size?: number
  onCollaborationChange?: (
    collaborations?: { collaboration: collaboration; user: user }[],
  ) => void
  onChangeVisibility?: (visibility: "private" | "protected" | "public") => void
}) {
  const dataTestId = rest.dataTestId ? `${rest.dataTestId}-` : ""

  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const { collaborationStep } = useNavigationContext()
  const { token, FRONTEND_URL, API_URL } = useAuth()
  const { t } = useAppContext()
  const [visibility, setVisibility] = useState(thread.visibility)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(
        `${FRONTEND_URL}/threads/${thread.id}`,
      )
      setCopied(true)
      toast.success(t("Copied"))
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error("Failed to copy code")
    }
  }

  const [loading, setLoading] = useState(false)

  const handleVisibilityChange = async (
    visibility: "private" | "protected" | "public",
  ) => {
    if (!token) return
    setLoading(true)

    try {
      const result = await updateThread({
        ...thread,
        visibility,
        token,
      })

      if (result.error) {
        toast.error(result.error)
        setLoading(false)
        return
      }

      setVisibility(visibility)
      onChangeVisibility?.(visibility)
    } catch (error) {
      toast.error("Failed to update thread visibility")
    } finally {
      setLoading(false)
    }
  }

  const [isCollaborating, setIsCollaborating] = useState(
    (thread?.collaborations && thread?.collaborations?.length > 0) ||
      collaborationStep === 3,
  )

  const [search, setSearch] = useState("")

  const [isAdding, setIsAdding] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isRevoking, setIsRevoking] = useState(false)

  const [collaborations, setCollaborations] = useState<
    { collaboration: collaboration; user: user }[]
  >(thread?.collaborations || [])

  useEffect(() => {
    setCollaborations(thread?.collaborations || [])
  }, [thread?.collaborations])

  const [isInviting, setIsInviting] = useState(false)
  const [isInvitingSending, setIsInvitingSending] = useState(false)

  const handleInvite = async () => {
    if (!token) return
    setIsInvitingSending(true)
    try {
      const result = await apiFetch(`${API_URL}/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          threadId: thread.id,
          email: search,
        }),
      })

      if (!result.ok) {
        setIsInvitingSending(false)
        toast.error(t("Failed to invite user"))
        return
      }

      const data = await result.json()
      if (data.error) {
        toast.error(data.error)
        return
      }
      toast.success(t("User invited"))
    } catch (error) {
      toast.error(t("Failed to invite user"))
    } finally {
      setIsInvitingSending(false)
      setSearch("")
      setIsInviting(false)
    }
  }

  const handleSearch = async () => {
    if (!search) return
    try {
      setIsAdding(true)
      const result = await apiFetch(`${API_URL}/users?search=${search}`)

      if (!result.ok) {
        setIsAdding(false)
        if (result.status === 404) {
          if (search.includes("@")) {
            toast.error(t("User not found"))
            setIsInviting(true)
            return
          }
          toast.error(t("User not found"))
          return
        }
        toast.error(t("Failed to fetch users"))
        return
      }

      const data = await result.json()

      if (data.user) {
        try {
          const collaborationResponse = await apiFetch(
            `${API_URL}/collaborations`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                threadId: thread.id,
                userId: data.user.id,
                status: "pending",
              }),
            },
          )

          if (!collaborationResponse.ok) {
            toast.error(t("Failed to add user"))
            return
          }

          const collaborationData = await collaborationResponse.json()

          if (collaborationData.error) {
            toast.error(collaborationData.error)
            setIsAdding(false)

            return
          }

          setSearch("")

          setCollaborations((prev) =>
            prev.some((collaboration) => collaboration.user.id === data.user.id)
              ? prev
              : [
                  ...prev,
                  {
                    collaboration: {
                      ...collaborationData.collaboration,
                      status: "pending",
                    },
                    user: data.user,
                  },
                ],
          )

          onCollaborationChange?.(collaborations)

          toast.success(t("User added"))
        } catch (error) {
          toast.error(t("Failed to add user"))
        }
        return
      }
    } catch (error) {
      toast.error(t("Failed to fetch users"))
    } finally {
      setIsAdding(false)
    }
  }

  const { actions } = useData()
  const handleRevoke = async (collaborationId: string) => {
    if (!token) return
    setIsRevoking(true)
    try {
      const data = await actions.updateCollaboration({
        id: collaborationId,
        status: "revoked",
      })

      if (data.error) {
        toast.error(data.error)
        return
      }
      toast.success(t("Revoked"))

      setCollaborations((prev) =>
        prev.filter(
          (collaboration) => collaboration.collaboration.id !== collaborationId,
        ),
      )

      onCollaborationChange?.(collaborations)
    } catch (error) {
      toast.error(t("Failed to revoke"))
    } finally {
      setIsRevoking(false)
    }
  }
  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await apiFetch(
        `${API_URL}/threads/${thread.id}/collaborations`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (!result.ok) {
        toast.error(t("Failed to delete"))
        return
      }
      const data = await result.json()
      if (data.error) {
        toast.error(data.error)
        return
      }
      toast.success(t("Deleted"))
    } catch (error) {
      toast.error(t("Failed to delete"))
    } finally {
      setIsDeleting(false)
      setIsOpen(false)
    }
  }
  return (
    <>
      <div
        key={dataTestId}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 7.5,
          fontSize: 12,
          color: "var(--accent-1)",
        }}
        className={clsx(styles.shareContainer, className)}
      >
        {thread.visibility === "public" ? (
          <LockOpen
            color="var(--accent-1)"
            size={size ? size - 3 : undefined}
          />
        ) : thread.visibility === "protected" ? (
          <UserLock
            color="var(--accent-1)"
            size={size ? size - 3 : undefined}
          />
        ) : (
          <LockIcon color="var(--shade-3)" size={size ? size - 3 : undefined} />
        )}
        <button
          title={t("Share")}
          data-testid={`${dataTestId}share-button`}
          onClick={() => {
            setIsOpen(true)
          }}
          className={clsx("link", styles.share, className)}
        >
          <ShareIcon strokeWidth={2.5} size={size} />
        </button>
      </div>
      <Modal
        dataTestId={`${dataTestId}share-modal`}
        isModalOpen={isOpen}
        onToggle={(open) => {
          setIsOpen(open)
        }}
        title={t("Share Thread")}
        className={styles.shareModal}
        hasCloseButton
        icon={
          loading ? <Loading width={22} height={22} /> : <ShareIcon size={20} />
        }
      >
        <div className={styles.shareModalContent}>
          {isCollaborating ? (
            <>
              <div className={styles.shareModalInputContainer}>
                <input
                  data-testid={`${dataTestId}share-input`}
                  className={styles.shareModalInput}
                  type="text"
                  defaultValue={`${FRONTEND_URL}/threads/${thread.id}`}
                />
                <button
                  data-testid={`${dataTestId}share-copy-button`}
                  className="inverted"
                  onClick={copyToClipboard}
                >
                  <Copy size={14} /> {t("Copy")}
                </button>
              </div>
              <div className={styles.collaborateInputContainer}>
                <input
                  type="email"
                  data-testid={`${dataTestId}collaborate-input`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={styles.collaborateInput}
                  placeholder={t("Find by username or email")}
                />
                {isInviting ? (
                  <button
                    data-testid={`${dataTestId}collaborate-add-button`}
                    onClick={() => handleInvite()}
                  >
                    {isAdding || isInvitingSending ? (
                      <Loading width={22} color="white" height={22} />
                    ) : (
                      t("Invite")
                    )}
                  </button>
                ) : (
                  search && (
                    <button
                      data-testid={`${dataTestId}collaborate-add-button`}
                      onClick={() => handleSearch()}
                    >
                      {isAdding ? (
                        <Loading width={22} color="white" height={22} />
                      ) : (
                        t("Add")
                      )}
                    </button>
                  )
                )}
              </div>
              {collaborations?.length > 0 && (
                <div className={styles.collaborators}>
                  {collaborations.map((collaboration) => (
                    <div
                      key={`${collaboration.user.id}-${collaboration.collaboration.status}`}
                      className={styles.collaborator}
                    >
                      {collaboration.user.image ? (
                        <Img
                          className={styles.collaboratorImage}
                          src={collaboration.user.image}
                          width={20}
                          height={20}
                          alt={collaboration.user.name || ""}
                        />
                      ) : (
                        <CircleUserRound size={20} />
                      )}
                      <div className={styles.collaboratorDetails}>
                        <p
                          data-testid={`${dataTestId}collaborator-name`}
                          className={styles.collaboratorName}
                        >
                          {collaboration.user.name} (
                          {collaboration.user.userName})
                        </p>
                        <p
                          data-testid={`${dataTestId}collaborator-email`}
                          className={styles.collaboratorEmail}
                        >
                          <span className={styles.collaboratorStatus}>
                            {collaboration.collaboration.status ===
                            "pending" ? (
                              <Circle size={12} color="var(--accent-1)" />
                            ) : collaboration.collaboration.status ===
                              "rejected" ? (
                              <CircleX size={12} color="var(--accent-0)" />
                            ) : (
                              <CircleCheck size={12} color="var(--accent-4)" />
                            )}
                            <span
                              data-testid={`${dataTestId}collaborator-status`}
                            >
                              {collaboration.collaboration.status}
                            </span>
                            {collaboration.user.email}
                          </span>
                        </p>
                      </div>
                      <div className={clsx(styles.collaboratorActions)}>
                        <ConfirmButton
                          dataTestId={`${dataTestId}collaborator-revoke-button`}
                          disabled={isRevoking}
                          className="transparent"
                          confirm={
                            <>
                              {isRevoking ? (
                                <Loading width={16} height={16} />
                              ) : (
                                <Trash2 color="var(--accent-0)" size={16} />
                              )}
                              {t("Are you sure?")}
                            </>
                          }
                          onConfirm={() => {
                            handleRevoke(collaboration.collaboration.id)
                          }}
                        >
                          {t("Revoke")}
                        </ConfirmButton>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className={styles.collaborateFooter}>
                <button
                  className="transparent"
                  onClick={() => {
                    setIsCollaborating(false)
                  }}
                >
                  {t("Back")}
                </button>

                {collaborations?.length > 0 && (
                  <ConfirmButton
                    className="transparent"
                    confirm={
                      <>
                        {isDeleting ? (
                          <Loading width={14} height={14} />
                        ) : (
                          <LockIcon size={14} />
                        )}
                        {t("Are you sure?")}
                      </>
                    }
                    onConfirm={() => {
                      handleDelete()
                    }}
                  >
                    <Trash2 size={14} />
                    {t("Delete")}
                  </ConfirmButton>
                )}
                {visibility !== "private" && (
                  <button
                    className="transparent"
                    onClick={() => {
                      handleVisibilityChange("private")
                    }}
                  >
                    <LockIcon size={14} />
                    {t("Make it private")}
                  </button>
                )}
                {visibility !== "public" && (
                  <button
                    className="inverted"
                    onClick={() => {
                      handleVisibilityChange("public")
                    }}
                  >
                    <Rss size={14} />
                    {t("Make it public")}
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              {visibility !== "private" && (
                <div className={styles.shareModalInputContainer}>
                  <input
                    className={styles.shareModalInput}
                    type="text"
                    defaultValue={`${FRONTEND_URL}/threads/${thread.id}`}
                  />
                  <button className="inverted" onClick={copyToClipboard}>
                    <Copy size={14} /> {t("Copy")}
                  </button>
                </div>
              )}
              <div className={styles.shareModalDescription}>
                {visibility === "private" ? (
                  <>
                    <button
                      data-testid={`${dataTestId}collaborate-button`}
                      onClick={() => {
                        setIsCollaborating(true)
                      }}
                    >
                      <UsersRound size={14} />
                      {t("Collaborate")}
                    </button>
                    <button
                      className="inverted"
                      onClick={() => {
                        handleVisibilityChange("protected")
                      }}
                    >
                      <Link2 size={14} />
                      {t("Get shareable link")}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="transparent"
                      onClick={() => {
                        handleVisibilityChange("private")
                      }}
                    >
                      <LockIcon size={14} />
                      {t("Make it private")}
                    </button>
                    {visibility === "protected" && (
                      <button
                        onClick={() => {
                          handleVisibilityChange("public")
                        }}
                      >
                        <Rss size={14} />
                        {t("Make it public")}
                      </button>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  )
}
