"use client"

import { memo } from "react"
import { useAppContext } from "./context/AppContext"
import { useAuth } from "./context/providers"
import { useThreadPresence } from "./hooks/useThreadPresence"
import { useMessageStyles } from "./Message.styles"
import { Div, Span } from "./platform"
import type { aiAgent, guest, message, thread, user } from "./types"
import { isOwner } from "./utils"

interface MessageUserStatusProps {
  message: {
    message: message & {
      isStreaming?: boolean
      isStreamingStop?: boolean
    }
    user?: user
    guest?: guest
    aiAgent?: aiAgent
    thread?: thread
    parentMessage?: message
  }
  isTyping?: boolean
  isOnline?: boolean
}

function MessageUserStatus({
  message,
  isTyping: isTypingProp,
  isOnline: isOnlineProp,
}: MessageUserStatusProps) {
  const { t } = useAppContext()
  const { user, guest } = useAuth()
  const styles = useMessageStyles()

  const ownerId = user?.id || guest?.id
  const threadId = message.message.threadId

  const { typingUsers, onlineUsers } = useThreadPresence({
    threadId,
  })

  const isTypingFromPresence = typingUsers.some(
    (u) =>
      (u.userId && u.userId === message.user?.id) ||
      (u.guestId && u.guestId === message.guest?.id),
  )

  const isTyping = isTypingProp ?? isTypingFromPresence

  const isOnlineFromPresence = onlineUsers.some(
    (u) => u.userId === message.user?.id || u.guestId === message.guest?.id,
  )

  const isOnline = isOnlineProp ?? isOnlineFromPresence

  const owner = isOwner(message.message, {
    userId: user?.id,
    guestId: guest?.id,
  })

  return (
    <Span style={styles.name.style}>
      <Div
        style={{
          ...styles.presenceIndicator.style,
          ...(isTyping ||
          message.user?.id === ownerId ||
          message.guest?.id === ownerId ||
          isOnline
            ? styles.online.style
            : styles.offline.style),
        }}
      />
      <Span style={{ ...styles.nameWithPresence.style }}>
        {owner
          ? t("You")
          : message.user?.name || message.user?.email || t("Guest")}
      </Span>
      {isTyping && (
        <Div
          className="typing"
          data-testid="typing-indicator"
          style={styles.dots.style}
        >
          <Span style={styles.dotsSpan.style}></Span>
          <Span style={styles.dotsSpan.style}></Span>
          <Span style={styles.dotsSpan.style}></Span>
        </Div>
      )}
    </Span>
  )
}

export default memo(MessageUserStatus)
