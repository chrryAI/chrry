import type { guest, thread, user } from "../types"

export const hasThreadNotification = ({
  thread,
  guest,
  user,
}: {
  thread: thread
  guest?: guest
  user?: user
}) => {
  if (!thread.lastMessage?.createdOn) return false

  // Handle thread owner cases first
  if (thread.guestId === guest?.id) {
    return guest.activeOn && thread.lastMessage.createdOn > guest.activeOn
  }

  if (thread.userId === user?.id) {
    return user.activeOn && thread.lastMessage.createdOn > user.activeOn
  }

  return !!(
    thread.lastMessage?.createdOn && // Safe access with optional chaining
    thread.collaborations?.some(
      (c) =>
        c.user?.id === user?.id &&
        c.collaboration?.activeOn && // Check activeOn exists
        c.collaboration.activeOn < thread.lastMessage!.createdOn, // Non-null assertion since we already checked
    )
  )
}
