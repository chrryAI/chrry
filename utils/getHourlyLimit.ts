import type { user, app, guest } from "../types"
import isOwner from "./isOwner"
import { isE2E } from "../utils"

export const getHourlyLimit = ({
  member,
  guest,
  app,
}: {
  app?: app
  member?: user
  guest?: guest
}) => {
  if (app && isOwner(app, { userId: app?.userId, guestId: app?.guestId }))
    return 5000
  if (member?.role === "admin" && !isE2E) return 500

  if (member?.subscription || guest?.subscription) {
    return member?.subscription?.plan === "pro" ? 200 : 100
  } else if (member) {
    return 30
  } else {
    return 10
  }
}
