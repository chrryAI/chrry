import React from "react"
import styles from "./TypingIndicator.module.scss"
import { ThreadParticipant } from "./hooks/useThreadPresence"
import { CircleUserRound } from "./icons"
import Img from "./Img"

interface TypingIndicatorProps {
  typingUsers: ThreadParticipant[]
  className?: string
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  typingUsers,
  className,
}) => {
  if (typingUsers.length === 0) return null

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0]?.name || "Someone"} is typing...`
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0]?.name || "Someone"} and ${typingUsers[1]?.name || "someone else"} are typing...`
    } else {
      return `${typingUsers.length} people are typing...`
    }
  }

  return (
    <div className={`${styles.typingIndicator} ${className || ""}`}>
      <div className={styles.avatars}>
        {typingUsers.slice(0, 3).map((user) => (
          <div key={user.userId} className={styles.avatar}>
            {user.image ? (
              <Img
                src={user.image}
                width={20}
                height={20}
                alt={user.name || ""}
                className={styles.userImage}
              />
            ) : (
              <CircleUserRound size={20} />
            )}
          </div>
        ))}
      </div>
      <div className={styles.typingText}>{getTypingText()}</div>
      <div className={styles.dots}>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  )
}

export default TypingIndicator
