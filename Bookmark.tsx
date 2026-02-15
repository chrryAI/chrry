"use client"
import React, { useEffect } from "react"
import type { thread } from "./types"
import { isOwner } from "./utils"
import { updateThread } from "./lib"
import { Star } from "./icons"
import { useAppContext } from "./context/AppContext"
import { useAuth, useNavigationContext } from "./context/providers"
import { Button } from "./platform"
import { useBookmarkStyles } from "./Bookmark.styles"
import { useStyles } from "./context/StylesContext"
import { ANALYTICS_EVENTS } from "./utils/analyticsEvents"

export default function Bookmark({
  thread,
  size = 14,
  onClick,
  children,
  onSave,
  dataTestId,
  style,
}: {
  defaultBookmarked?: boolean
  thread: thread
  size?: number
  children?: React.ReactNode
  onClick?: (bookmarked: boolean) => void
  onSave?: () => void
  dataTestId: string
  style?: React.CSSProperties
}) {
  const styles = useBookmarkStyles()
  const { utilities } = useStyles()

  const { t } = useAppContext()

  const { token, user, guest, plausible } = useAuth()

  const { threads } = useNavigationContext()

  const [bookmarked, setBookmarkedInternal] = React.useState(
    thread.bookmarks?.some((b) =>
      isOwner(b, { userId: user?.id, guestId: guest?.id }),
    ),
  )

  useEffect(() => {
    const t = threads?.threads?.find((t) => t.id === thread.id)
    if (t) {
      t.bookmarks?.some((b) =>
        isOwner(b, { userId: user?.id, guestId: guest?.id }),
      )
        ? setBookmarkedInternal(true)
        : setBookmarkedInternal(false)
    }
  }, [threads])

  const setBookmarked = async (bookmarked: boolean) => {
    setBookmarkedInternal(bookmarked)
    plausible({
      name: ANALYTICS_EVENTS.BOOKMARK,
      props: {
        bookmarked,
        visibility: thread?.visibility,
        hasCollaborations: !!thread?.collaborations?.length,
      },
    })

    onClick?.(bookmarked)

    token &&
      updateThread({
        id: thread.id,
        bookmarked,
        token,
      }).then(() => {
        onSave?.()
      })
  }

  return (
    <Button
      className={`bookmark link ${bookmarked ? "bookmarked" : ""}`}
      onClick={() => setBookmarked(!bookmarked)}
      style={{
        ...(bookmarked && styles.starActive.style),
        ...utilities.link.style,
        ...style,
      }}
      aria-pressed={bookmarked}
      aria-label={bookmarked ? t("Remove bookmark") : t("Bookmark thread")}
      data-testid={`${dataTestId}-${bookmarked ? "bookmarked" : "not-bookmarked"}`}
    >
      {bookmarked ? (
        <Star size={size} color="var(--accent-1)" fill="var(--accent-1)" />
      ) : (
        <Star size={size} color="var(--shade-2)" fill="var(--shade-1)" />
      )}
      {children}
    </Button>
  )
}
