type OwnerCheck = { userId?: string | null; guestId?: string | null }

const isOwner = (
  owner?: OwnerCheck,
  ctx?: { userId?: string | null; guestId?: string | null },
): boolean => {
  if (!owner || !ctx) return false
  if (owner.userId && ctx.userId === owner.userId) return true
  if (owner.guestId && ctx.guestId === owner.guestId) return true
  return false
}

export default isOwner
