import { useEffect, useState, useRef } from "react"
import { useAppContext } from "../context/AppContext"
import { useWebSocket } from "./useWebSocket"
import { useAuth } from "../context/providers"

export interface ThreadParticipant {
  userId?: string
  guestId?: string
  isTyping?: boolean // Changed to optional
  isOnline: boolean
  lastSeen?: Date
  name?: string
  image?: string
}

export interface PresenceData {
  type: "typing" | "presence"
  threadId: string
  userId?: string
  guestId?: string
  isTyping?: boolean
  isOnline?: boolean
  userName?: string
  userImage?: string
}

export function useThreadPresence({ threadId }: { threadId?: string }) {
  const [participants, setParticipants] = useState<
    Record<string, ThreadParticipant>
  >({})

  const { user, guest, token, deviceId } = useAuth()

  const currentUserId = user?.id
  const currentGuestId = guest?.id

  const typingTimeoutRef = useRef<Record<string, any>>({})

  const { notifyTyping } = useWebSocket<{
    type: "typing" | "presence"
    data: {
      threadId: string
      userId?: string
      guestId?: string
      isTyping?: boolean
      isOnline?: boolean
    }
  }>({
    token,
    deviceId,
    onMessage: ({ type, data }) => {
      if (type === "typing") {
        setParticipants((prev) => {
          const updated = { ...prev }
          const participantId = data.userId || data.guestId!

          if (!updated[participantId]) {
            updated[participantId] = {
              userId: data.userId,
              guestId: data.guestId,
              isTyping: false,
              isOnline: false,
            }
          }

          updated[participantId] = {
            ...updated[participantId],
            isTyping: data.isTyping || false,
          }

          // Clear existing timeout for this participant
          if (typingTimeoutRef.current[participantId]) {
            clearTimeout(typingTimeoutRef.current[participantId])
          }

          // Auto-clear typing after 3 seconds of inactivity
          if (data.isTyping) {
            typingTimeoutRef.current[participantId] = setTimeout(() => {
              setParticipants((prev) => {
                if (!prev[participantId]) return prev
                return {
                  ...prev,
                  [participantId]: {
                    ...prev[participantId],
                    isTyping: false,
                  },
                }
              })
            }, 3000)
          }

          return updated
        })
      } else if (type === "presence") {
        setParticipants((prev) => {
          const participantId = data.userId || data.guestId!

          return {
            ...prev,
            [participantId]: {
              ...prev[participantId],
              userId: data.userId,
              guestId: data.guestId,
              isOnline: data.isOnline || false,
              lastSeen: data.isOnline ? undefined : new Date(),
              isTyping: prev[participantId]?.isTyping, // Preserve existing typing state
            },
          }
        })
      }
    },
  })

  // Get list of users currently typing (excluding current user)
  const typingUsers = Object.values(participants).filter((p) => !!p.isTyping)
  const onlineUsers = Object.values(participants).filter((p) => p.isOnline)

  return {
    participants,
    onlineUsers,
    typingUsers,
    notifyTyping: (isTyping: boolean) => {
      threadId &&
        notifyTyping?.({
          threadId,
          isTyping,
          userId: currentUserId,
          guestId: currentGuestId,
        })
    },
  }
}
