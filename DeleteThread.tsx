import React, { useState } from "react"
import clsx from "clsx"
import { Trash2, CircleX } from "./icons"
import toast from "react-hot-toast"
import ConfirmButton from "./ConfirmButton"
import Loading from "./Loading"
import { useAppContext } from "./context/AppContext"
import { useAuth, useNavigationContext } from "./context/providers"
import { apiFetch } from "./utils"

export default function DeleteThread({
  className,
  onDelete,
  id,
}: {
  className?: string
  onDelete?: () => void
  id: string
}) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { t } = useAppContext()
  const { token, API_URL } = useAuth()

  const { refetchThreads } = useNavigationContext()

  if (!token || !id) {
    return null
  }
  return (
    <ConfirmButton
      dataTestId="delete-thread-button"
      className={clsx("transparent small", className)}
      confirm={
        <>
          {isDeleting ? (
            <Loading color="var(--accent-0)" width={16} height={16} />
          ) : (
            <Trash2 color="var(--accent-0)" size={16} />
          )}
          {t("Are you sure?")}
        </>
      }
      onConfirm={async () => {
        setIsDeleting(true)
        try {
          const result = await apiFetch(`${API_URL}/threads/${id}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          })
          if (!result.ok) {
            toast.error("Failed to delete thread")
          } else {
            const data = await result.json()
            if (data.error) {
              toast.error(data.error)
            } else {
              await refetchThreads()
              toast.success("Thread deleted")
              onDelete?.()
            }
          }
        } catch (error) {
          toast.error("Failed to delete thread")
        } finally {
          setIsDeleting(false)
        }
      }}
    >
      <CircleX color="var(--accent-0)" size={16} /> {t("Delete")}
    </ConfirmButton>
  )
}
