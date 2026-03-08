import { type CSSProperties, useEffect, useState } from "react"
import toast from "react-hot-toast"
import { useCollaborationStatusStyles } from "./CollaborationStatus.styles"
import ConfirmButton from "./ConfirmButton"
import { useAppContext } from "./context/AppContext"
import { useAuth } from "./context/providers"
import { useChat } from "./context/providers/ChatProvider"
import { useData } from "./context/providers/DataProvider"
import { useStyles } from "./context/StylesContext"
import { CircleCheck, CircleX, UsersRound } from "./icons"
import Loading from "./Loading"
import { Button, Div, useTheme } from "./platform"
import type { thread } from "./types"

export default function CollaborationStatus({
  thread,
  className,
  isIcon,
  onSave,
  style,
  dataTestId,
}: {
  thread: thread
  className?: string
  isIcon?: boolean
  onSave?: (status: "active" | "pending" | "revoked" | "rejected") => void
  dataTestId?: string
  style?: CSSProperties
}) {
  const { utilities } = useStyles()

  const styles = useCollaborationStatusStyles()

  const { t } = useAppContext()
  const { setCollaborationStatus } = useChat()
  const { user, token } = useAuth()
  const { isMobileDevice } = useTheme()
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<
    "active" | "pending" | "revoked" | "rejected"
  >("pending")

  const collaboration = thread.collaborations?.find(
    (collaboration) => collaboration.user.id === user?.id,
  )

  const { actions } = useData()

  useEffect(() => {
    if (collaboration) {
      collaboration.collaboration.status &&
        setStatus(collaboration.collaboration.status)
    }
  }, [collaboration?.collaboration.status])

  if (!collaboration) return null

  const collaborationId = collaboration.collaboration.id
  const iconSize = 16
  const fontSize = iconSize - 3

  const handleStatusChange = async (
    status: "active" | "pending" | "revoked" | "rejected",
  ) => {
    if (!token) return
    setStatus(status)
    setIsLoading(true)
    try {
      const data = await actions.updateCollaboration({
        id: collaborationId,
        status,
      })

      if (data.error) {
        toast.error(data.error)
        return
      }
      toast.success(t("Updated"))
      onSave?.(status)
      if (status === "revoked" || status === "rejected") {
        setCollaborationStatus(null)
      } else {
        setCollaborationStatus(status)
      }
    } catch (_error) {
      toast.error(t("Failed to update collaboration"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Div
      style={{
        ...styles.collaborationStatus.style,
        gap: isIcon ? 7.5 : 10,
        ...style,
      }}
      className={className}
    >
      {!isIcon && <UsersRound color="var(--accent-1)" size={16} />}

      {collaboration?.collaboration.status === "pending" ? (
        <>
          <ConfirmButton
            data-testid={`${dataTestId}-reject-collaboration`}
            style={{ fontSize }}
            title={t("Reject")}
            confirmTitle={t("Are you sure?")}
            className="link"
            processing={isLoading && status === "rejected"}
            onConfirm={() => handleStatusChange("rejected")}
          >
            {isLoading && status === "rejected" ? (
              <Loading width={iconSize} height={iconSize} />
            ) : (
              <CircleX color="var(--accent-0)" size={iconSize} />
            )}
          </ConfirmButton>
          <Button
            title={t("Accept")}
            data-testid={`${dataTestId}-accept-collaboration`}
            style={{ fontSize }}
            className="link"
            disabled={isLoading}
            onClick={() => handleStatusChange("active")}
          >
            {isLoading && status === "active" ? (
              <Loading width={iconSize} height={iconSize} />
            ) : (
              <CircleCheck color="var(--accent-4)" size={iconSize} />
            )}
          </Button>
        </>
      ) : (
        <ConfirmButton
          disabled={isLoading}
          title={t("Leave")}
          style={{ fontSize }}
          className="link"
          processing={isLoading && status === "revoked"}
          onConfirm={() => handleStatusChange("revoked")}
        >
          <>
            {isLoading && status === "revoked" ? (
              <Loading width={iconSize} height={iconSize} />
            ) : (
              <CircleX color="var(--accent-0)" size={iconSize} />
            )}
          </>
        </ConfirmButton>
      )}
    </Div>
  )
}
