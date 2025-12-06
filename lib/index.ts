import {
  aiAgent,
  app,
  appWithStore,
  collaboration,
  guest,
  message,
  Paginated,
  store,
  thread,
  user,
  messages,
  paginatedMessages,
} from "../types"
import * as utils from "../utils"
import z from "zod"
import { createCalendarEventSchema } from "../utils/calendarValidation"
import { stringify as superjsonStringify } from "./superjson"
import { appFormData } from "../schemas/appSchema"
import { session } from "../context/providers/AuthProvider"

export const getImageSrc = ({
  app,
  icon,
  logo,
  store,
  PROD_FRONTEND_URL,
  src,
  slug,
  size = 24,
  BASE_URL = utils.FRONTEND_URL,
  width,
  height,
  canEditApp,
  image,
}: {
  slug?: "atlas" | "peach" | "vault" | "bloom"
  className?: string
  size?: number
  title?: string
  showLoading?: boolean
  dataTestId?: string
  src?: string
  logo?:
    | "lifeOS"
    | "isMagenta"
    | "isVivid"
    | "vex"
    | "chrry"
    | "blossom"
    | "focus"
    | "grape"
  icon?:
    | "spaceInvader"
    | "pacman"
    | "heart"
    | "plus"
    | "hamster"
    | "frog"
    | "calendar"
    | "deepSeek"
    | "perplexity"
    | "claude"
    | "chatGPT"
    | "gemini"
    | "flux"
    | "chrry"
    | "raspberry"
    | "strawberry"
    | "sushi"

  app?: appWithStore
  width?: number | string
  height?: number | string
  onLoad?: () => void
  store?: store
  PROD_FRONTEND_URL?: string
  BASE_URL?: string
  canEditApp?: boolean
  image?: string
}) => {
  // Helper to check if string is purely numeric (not "100%", "100px", etc.)
  const isNumericString = (val: string) => /^\d+$/.test(val)

  const finalWidth =
    typeof width === "number"
      ? width
      : typeof width === "string" && isNumericString(width)
        ? parseInt(width, 10)
        : width || size

  const finalHeight =
    typeof height === "number"
      ? height
      : typeof height === "string" && isNumericString(height)
        ? parseInt(height, 10)
        : height || size

  const finalSize =
    typeof finalWidth === "number"
      ? finalWidth
      : typeof finalHeight === "number"
        ? finalHeight
        : size

  const iconSrc = icon
    ? icon === "spaceInvader"
      ? `${PROD_FRONTEND_URL}/images/pacman/space-invader.png`
      : icon === "pacman"
        ? `${BASE_URL}/images/pacman/pacman.png`
        : icon === "heart"
          ? `${BASE_URL}/images/pacman/heart.png`
          : icon === "plus"
            ? `${BASE_URL}/icons/plus-128.png`
            : icon === "hamster"
              ? `${BASE_URL}/hamster.png`
              : icon === "frog"
                ? `${BASE_URL}/frog.png`
                : icon === "calendar"
                  ? `${BASE_URL}/icons/calendar-128.png`
                  : icon === "sushi"
                    ? `${BASE_URL}/icons/sushi.png`
                    : `${BASE_URL}/icons/${icon}-128.png`
    : null

  const logoSrc =
    logo === "focus"
      ? `${BASE_URL}/images/focus.png`
      : logo === "blossom"
        ? `${BASE_URL}/images/apps/blossom.png`
        : logo === "grape"
          ? `${BASE_URL}/images/apps/grape.png`
          : logo === "chrry" || store?.slug === "explore"
            ? `${BASE_URL}/logo/cherry-500.png`
            : logo === "lifeOS" || store?.slug === "lifeOS"
              ? `${BASE_URL}/icons/lifeOS-128.png`
              : logo === "vex" || store?.slug === "vex"
                ? `${BASE_URL}/icons/icon-128.png`
                : logo
                  ? `${BASE_URL}/icons/icon-128${logo === "isMagenta" ? "-m" : ""}${logo === "isVivid" ? "-v" : ""}.png`
                  : null // Remote web asset

  // Pick the right image size based on requested size
  // images array: [512px, 192px, 180px, 128px, 32px]
  const getImageBySize = (size: number) => {
    if (!app?.images?.length) return null
    if (size <= 32) return app.images[4]?.url // 32px
    if (size <= 128) return app.images[3]?.url // 128px
    if (size <= 180) return app.images[2]?.url // 180px
    if (size <= 192) return app.images[1]?.url // 192px
    return app.images[0]?.url // 512px
  }

  const appImageSrc =
    logo || store
      ? null
      : app &&
          [
            "atlas",
            "bloom",
            "vault",
            "peach",
            "vex",
            "chrry",
            "popcorn",
            "sushi",
            "focus",
            "grape",
            "zarathustra",
          ].includes(app.slug)
        ? `${BASE_URL}/images/apps/${app.slug}.png`
        : getImageBySize(size) ||
          app?.image ||
          (slug
            ? `${BASE_URL}/icons/${slug}-128.png`
            : canEditApp
              ? image || iconSrc
              : undefined) // Remote web asset

  const finalSrc =
    src || logoSrc || (!app && iconSrc) || appImageSrc || undefined

  // Use size as the primary dimension, fallback to width/height if size not provided

  return {
    src: finalSrc,
    width: finalWidth,
    height: finalHeight,
    size: finalSize,
  }
}

export const getThreads = async ({
  pageSize,
  token,
  search,
  sort,
  threadId,
  userName,
  collaborationStatus,
  myPendingCollaborations,
  onError,
  slug,
  appId,
  API_URL = utils.API_URL,
}: {
  pageSize?: number
  token: string
  sort?: "bookmark" | "date"
  search?: string
  threadId?: string
  userName?: string
  collaborationStatus?: "pending" | "active" | null
  myPendingCollaborations?: boolean
  onError?: (status: number) => void
  appId?: string
  API_URL?: string
  slug?: "Atlas" | "Peach" | "Vault" | "Bloom" | string | null
}) => {
  const url = new URL(`${API_URL}/threads`)

  url.searchParams.set("pageSize", pageSize?.toString() || "10")
  collaborationStatus === null
    ? url.searchParams.set("collaborationStatus", "null")
    : collaborationStatus &&
      url.searchParams.set("collaborationStatus", collaborationStatus)

  appId && url.searchParams.set("appId", appId)
  if (search) url.searchParams.set("search", search)
  if (sort) url.searchParams.set("sort", sort)
  if (threadId) url.searchParams.set("threadId", threadId)
  if (userName) url.searchParams.set("userName", userName)
  if (myPendingCollaborations)
    url.searchParams.set("myPendingCollaborations", "true")
  if (slug) url.searchParams.set("slug", slug)

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    onError?.(response.status)
    return null
  }

  return response.json()
}

export const getThread = async ({
  pageSize,
  id,
  token,
  liked,
  onError,
  API_URL = utils.API_URL,
}: {
  pageSize?: number
  id: string
  token: string
  liked?: boolean
  onError?: (status: number) => void

  API_URL?: string
}) => {
  const response = await fetch(
    `${API_URL}/threads/${id}?pageSize=${pageSize}${liked ? `&liked=${liked}` : ""}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  )

  if (!response.ok) {
    onError?.(response.status)
    return undefined
  }

  return (await response.json()) as {
    thread: thread
    messages: paginatedMessages
  }
}

export const getUser = async ({
  token,
  API_URL = utils.API_URL,
}: {
  token: string
  API_URL?: string
}) => {
  const response = await fetch(`${API_URL}/user`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    return null
  }

  return response.json()
}

export const getUsers = async ({
  pageSize,
  search,
  token,
  find,
  similarTo,
  API_URL = utils.API_URL,
}: {
  pageSize?: number
  search?: string
  token: string
  find?: string
  similarTo?: string
  API_URL?: string
}) => {
  const response = await fetch(
    `${API_URL}/users?pageSize=${pageSize}${search ? `&search=${search}` : ""}${find ? `&find=${find}` : ""}${similarTo ? `&similarTo=${similarTo}` : ""}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  )

  if (!response.ok) {
    return null
  }

  return response.json()
}

export const getGuest = async ({
  token,
  API_URL = utils.API_URL,
}: {
  token: string
  API_URL?: string
}) => {
  const response = await fetch(`${API_URL}/guest`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    return null
  }

  return response.json()
}

export const getLastMessage = async ({
  threadId,
  token,
  API_URL = utils.API_URL,
}: {
  threadId?: string
  token: string
  API_URL?: string
}) => {
  const messagesResponse = await fetch(
    `${API_URL}/messages?limit=1${threadId ? `&threadId=${threadId}` : ""}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  )

  if (messagesResponse.ok) {
    const messagesData = await messagesResponse.json()
    const latestMessage = messagesData?.messages?.[0]

    return latestMessage as {
      message: message
      user?: user
      guest?: guest
      aiAgent?: aiAgent
      thread?: thread & {
        likeCount: number
        collaborations?: {
          collaboration: collaboration
          user: user
        }[]
      }
    }
  }

  return undefined
}

export const uploadUserImage = async ({
  token,
  file,
  API_URL = utils.API_URL,
}: {
  token: string
  file: File | null
  API_URL?: string
}) => {
  const formData = new FormData()
  file && formData.append("image", file)
  const response = await fetch(`${API_URL}/user/image`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })
  return response.json()
}

export const updateThread = async ({
  id,
  star,
  instructions,
  token,
  title,
  regenerateTitle,
  regenerateInstructions,
  language,
  bookmarked,
  visibility,
  files,
  pinCharacterProfile,
  characterProfileVisibility,
  API_URL = utils.API_URL,
  appId,
}: {
  id: string
  star?: number | null
  instructions?: string | null
  token: string
  title?: string
  regenerateTitle?: boolean
  regenerateInstructions?: boolean
  language?: string
  visibility?: string
  bookmarked?: boolean
  files?: File[]
  pinCharacterProfile?: boolean
  characterProfileVisibility?: string
  API_URL?: string
  appId?: string | null
}) => {
  let postRequestBody: FormData | string
  let postRequestHeaders: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  }

  if (files && files.length > 0) {
    const formData = new FormData()
    language && formData.append("language", language)
    regenerateTitle &&
      formData.append("regenerateTitle", regenerateTitle.toString())
    instructions && formData.append("instructions", instructions)
    title && formData.append("title", title)
    regenerateInstructions &&
      formData.append(
        "regenerateInstructions",
        regenerateInstructions.toString(),
      )
    visibility && formData.append("visibility", visibility)
    bookmarked && formData.append("bookmarked", bookmarked.toString())
    files.forEach((file, index) => {
      formData.append(`artifact_${index}`, file)
    })
    if (appId) {
      formData.append("appId", appId)
    }
    pinCharacterProfile !== undefined &&
      formData.append("pinCharacterProfile", pinCharacterProfile.toString())
    characterProfileVisibility &&
      formData.append("characterProfileVisibility", characterProfileVisibility)
    postRequestBody = formData
  } else {
    postRequestHeaders["Content-Type"] = "application/json"
    postRequestBody = JSON.stringify({
      language,
      regenerateTitle,
      instructions,
      title,
      regenerateInstructions,
      visibility,
      bookmarked,
      pinCharacterProfile:
        pinCharacterProfile !== undefined ? pinCharacterProfile : undefined,
      characterProfileVisibility,
      appId: appId !== undefined ? appId : undefined,
    })
  }

  const response = await fetch(`${API_URL}/threads/${id}`, {
    method: "PATCH",
    body: postRequestBody,
    headers: postRequestHeaders,
  })

  return response.json()
}

export const deleteMessage = async ({
  messageId,
  token,
  API_URL = utils.API_URL,
}: {
  messageId: string
  token: string
  API_URL?: string
}) => {
  const response = await fetch(`${API_URL}/messages/${messageId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })

  return response.json()
}

export const deleteMemories = async ({
  token,
  API_URL = utils.API_URL,
}: {
  token: string
  API_URL?: string
}) => {
  const response = await fetch(`${API_URL}/memories`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })

  return response.json()
}

export const updateUser = async ({
  language,
  name,
  image,
  userName,
  favouriteAgent,
  characterProfilesEnabled,
  memoriesEnabled,
  token,
  city,
  country,
  API_URL = utils.API_URL,
}: {
  language?: string
  name?: string
  image?: string
  userName?: string
  favouriteAgent?: string
  characterProfilesEnabled?: boolean
  memoriesEnabled?: boolean
  token: string
  API_URL?: string
  city?: string
  country?: string
}) => {
  const response = await fetch(`${API_URL}/user`, {
    method: "PATCH",
    body: JSON.stringify({
      language,
      name,
      image,
      userName,
      favouriteAgent,
      characterProfilesEnabled,
      memoriesEnabled,
      city,
      country,
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })

  return response.json()
}

export const updateGuest = async ({
  favouriteAgent,
  characterProfilesEnabled,
  memoriesEnabled,
  city,
  country,
  token,
  API_URL = utils.API_URL,
}: {
  favouriteAgent?: string
  characterProfilesEnabled?: boolean
  city?: string
  country?: string
  memoriesEnabled?: boolean
  API_URL?: string
  token: string
}) => {
  const response = await fetch(`${API_URL}/guest`, {
    method: "PATCH",
    body: JSON.stringify({
      favouriteAgent,
      characterProfilesEnabled,
      memoriesEnabled,
      city,
      country,
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })

  return response.json()
}

export const updateMessage = async ({
  messageId,
  like,
  token,
  API_URL = utils.API_URL,
}: {
  messageId: string
  like?: boolean | null
  token: string
  API_URL?: string
}) => {
  const response = await fetch(`${API_URL}/messages/${messageId}`, {
    method: "PATCH",
    body: JSON.stringify({
      like,
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })

  return response.json()
}

export const updateCollaboration = async ({
  id,
  status,
  token,
  API_URL = utils.API_URL,
}: {
  id: string
  status: string
  token: string
  API_URL?: string
}) => {
  const response = await fetch(`${API_URL}/collaborations/${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      status,
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })

  return response.json()
}

export const removeUser = async ({
  token,
  API_URL = utils.API_URL,
}: {
  token: string
  API_URL?: string
}) => {
  const response = await fetch(`${API_URL}/user`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
  const data = await response.json()
  return data
}

export const deleteSubscription = async ({
  token,
  API_URL = utils.API_URL,
}: {
  token: string
  API_URL?: string
}) => {
  const response = await fetch(`${API_URL}/subscriptions`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
  const data = await response.json()
  return data
}

export type CalendarEventFormData = z.infer<typeof createCalendarEventSchema>

export const createCalendarEvent = async ({
  event,
  token,
  API_URL = utils.API_URL,
}: {
  event: CalendarEventFormData
  token: string
  API_URL?: string
}) => {
  const response = await fetch(`${API_URL}/calendar`, {
    method: "POST",
    body: superjsonStringify(event), // Serialize Dates properly
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
  const data = await response.json()
  return data
}

export const updateCalendarEvent = async ({
  id,
  event,
  token,
  API_URL = utils.API_URL,
}: {
  id: string
  event: CalendarEventFormData // ← Allow partial updates!
  token: string
  API_URL?: string
}) => {
  const response = await fetch(`${API_URL}/calendar/${id}`, {
    method: "PATCH",
    body: superjsonStringify({ ...event, id }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
  const data = await response.json()
  return data
}

export const deleteCalendarEvent = async ({
  id,
  token,
  API_URL = utils.API_URL,
}: {
  id: string
  API_URL?: string
  token: string
}) => {
  const response = await fetch(`${API_URL}/calendar/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
  const data = await response.json()
  return data
}

export const syncGoogleCalendar = async ({
  token,
  API_URL = utils.API_URL,
}: {
  token: string
  API_URL?: string
}) => {
  const response = await fetch(`${API_URL}/calendar/googleSync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
  const data = await response.json()
  return data
}

export const exportToGoogleCalendar = async ({
  eventId,
  API_URL = utils.API_URL,
  token,
}: {
  eventId: string
  token: string
  API_URL?: string
}) => {
  const response = await fetch(`${API_URL}/calendar/google-sync`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ eventId }),
  })
  const data = await response.json()
  return data
}

export const getCalendarEvents = async ({
  token,
  startDate,
  endDate,
  API_URL = utils.API_URL,
}: {
  token: string
  startDate?: string
  endDate?: string
  API_URL?: string
}) => {
  const params = new URLSearchParams()
  startDate && params.append("startDate", startDate)
  endDate && params.append("endDate", endDate)
  const response = await fetch(`${API_URL}/calendar?${params.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
  const data = await response.json()
  return data
}

export async function createApp({
  token,
  data,
  API_URL = utils.API_URL,
}: {
  token: string
  data: appFormData
  API_URL?: string
}) {
  const response = await fetch(`${API_URL}/apps`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })

  return await response.json()
}

export async function updateApp({
  token,
  id,
  data,
  API_URL = utils.API_URL,
}: {
  token: string
  id: string
  data: appFormData
  API_URL?: string
}) {
  const response = await fetch(`${API_URL}/apps/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })

  return await response.json()
}

export async function deleteApp({
  token,
  id,
  API_URL = utils.API_URL,
}: {
  token: string
  id: string
  API_URL?: string
}) {
  const response = await fetch(`${API_URL}/apps/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })

  return await response.json()
}

export async function reorderApps({
  token,
  apps,
  autoInstall,
  storeId,
  API_URL = utils.API_URL,
}: {
  token: string
  apps: app[]
  autoInstall?: boolean
  storeId?: string
  API_URL?: string
}) {
  const response = await fetch(`${API_URL}/apps/reorder`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      storeId, // Optional: store context for ordering
      apps: apps.map((app, index) => ({
        appId: app.id,
        order: index,
        autoInstall, // Auto-install if not already installed
      })),
    }),
  })

  return await response.json()
}

export const getSession = async ({
  deviceId,
  fingerprint,
  gift,
  isStandalone,
  appId,
  token,
  API_URL = utils.API_URL,
  VERSION = utils.VERSION,
  app,
  appSlug,
  agentName,
  chrryUrl,
  routeType,
  userAgent,
  pathname,
  screenWidth,
  screenHeight,
  translate,
  locale,
  source = "client",
}: {
  appId?: string
  pathname?: string
  deviceId: string | undefined
  fingerprint?: string
  gift?: string
  isStandalone?: boolean
  token: string
  API_URL?: string
  VERSION?: string
  app?: "extension" | "pwa" | "web"
  appSlug?: string
  agentName?: string
  chrryUrl?: string
  routeType?: string
  userAgent?: string
  screenWidth?: number
  screenHeight?: number
  translate?: boolean
  locale?: string
  source?: string
}) => {
  if (!deviceId) {
    return
  }

  const params = new URLSearchParams({
    ...(agentName ? { agent: agentName } : {}),
    ...(fingerprint ? { fp: fingerprint } : {}),
    appVersion: VERSION,
    ...(app ? { app } : {}),
    ...(appSlug ? { appSlug } : {}),
    ...(gift ? { gift } : {}),
    ...(chrryUrl ? { chrryUrl } : {}),
    ...(appId ? { appId } : {}),
    ...(routeType ? { routeType } : {}),
    ...(translate ? { translate: "true" } : {}),
    ...(isStandalone ? { isStandalone: "true" } : {}),
    ...(locale ? { locale } : {}),
    ...(source ? { source } : {}),
  })

  const response = await fetch(`${API_URL}/session?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "x-device-id": deviceId,
      ...(source ? { "x-source": source } : {}),
      ...(screenWidth ? { "x-screen-width": screenWidth?.toString() } : {}),
      ...(screenHeight ? { "x-screen-height": screenHeight?.toString() } : {}),
      "x-timezone": Intl.DateTimeFormat().resolvedOptions().timeZone,
      ...(appId ? { "x-app-id": appId } : {}),
      ...(userAgent ? { "user-agent": userAgent } : {}),
      ...(appSlug ? { "x-app-slug": appSlug } : {}),
      ...(routeType ? { "x-route-type": routeType } : {}),
      ...(pathname ? { "x-pathname": pathname } : {}),
      ...(locale ? { "x-locale": locale } : {}),
      ...(fingerprint ? { "x-fp": fingerprint } : {}),
      ...(chrryUrl ? { "x-chrry-url": chrryUrl } : {}),
    },
  })

  if (!response.ok) {
    // Disable further requests on rate limit
    if (response.status === 429) {
      return {
        error: "Rate limit exceeded",
        status: 429,
      } as unknown as session
    }

    // Return error with status for other non-OK responses
    const text = await response.text()
    return {
      error: `API error (${response.status}): ${text.substring(0, 200)}`,
      status: response.status,
    } as unknown as session
  }

  // Try to parse JSON, catch if it's HTML or invalid
  try {
    const result = await response.json()
    return result as session
  } catch (error) {
    const text = await response.text()
    return {
      error: `API error (${response.status}): ${text.substring(0, 200)}`,
      status: response.status,
    } as unknown as session
  }
}

export type ApiActions = ReturnType<typeof getActions>

export const getApps = async ({
  API_URL = utils.API_URL,
  token,
  chrryUrl,
  appId,
}: {
  API_URL?: string
  token: string
  appId?: string
  chrryUrl?: string
}) => {
  const params = new URLSearchParams()
  appId && params.append("appId", appId)
  chrryUrl && params.append("chrryUrl", chrryUrl)
  const response = await fetch(`${API_URL}/apps?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      ...(chrryUrl ? { "x-chrry-url": chrryUrl } : {}),
    },
  })

  if (!response.ok) {
    return {
      error: `API error (${response.status})`,
      status: response.status,
    }
  }

  const data = await response.json()

  return data as appWithStore[]
}

export const getApp = async ({
  API_URL = utils.API_URL,
  token,
  appId,
  chrryUrl,
}: {
  API_URL?: string
  token: string
  appId: string
  chrryUrl?: string
}) => {
  const params = new URLSearchParams()
  chrryUrl && params.append("chrryUrl", chrryUrl)
  const response = await fetch(`${API_URL}/apps/${appId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "x-app-id": appId,
      ...(chrryUrl ? { "x-chrry-url": chrryUrl } : {}),
    },
  })

  const data = await response.json()
  return data as appWithStore
}

export const getTranslations = async ({
  API_URL = utils.API_URL,
  token,
  locale,
}: {
  API_URL?: string
  token?: string
  locale?: string
} = {}) => {
  const response = await fetch(`${API_URL}/translations?locale=${locale}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    return {
      error: `API error (${response.status})`,
      status: response.status,
    }
  }

  const data = await response.json()
  return data as Record<string, any>
}

export const getActions = ({
  API_URL,
  token,
}: {
  API_URL: string
  token: string
}) => {
  return {
    // Thread operations
    getThreads: (params?: {
      appId?: string
      pageSize?: number
      sort?: "bookmark" | "date"
      search?: string
      threadId?: string
      userName?: string
      collaborationStatus?: "pending" | "active" | null
      myPendingCollaborations?: boolean
      onError?: (status: number) => void
      slug?: "Atlas" | "Peach" | "Vault" | "Bloom" | string | null
    }) => getThreads({ token, ...params, API_URL }),
    getTranslations: (params?: { locale?: string }) =>
      getTranslations({ token, ...params, API_URL }),
    getThread: (params: {
      pageSize?: number
      id: string
      liked?: boolean
      onError?: (status: number) => void
    }) => getThread({ token, ...params, API_URL }),
    updateThread: (params: {
      id: string
      star?: number | null
      instructions?: string | null
      title?: string
      regenerateTitle?: boolean
      regenerateInstructions?: boolean
      language?: string
      bookmarked?: boolean
      visibility?: string
      files?: File[]
      pinCharacterProfile?: boolean
      characterProfileVisibility?: string
      appId?: string | null
    }) => updateThread({ token, ...params, API_URL }),

    // User operations
    getUser: () => getUser({ token, API_URL }),
    getUsers: (params?: {
      pageSize?: number
      search?: string
      find?: string
      similarTo?: string
    }) => getUsers({ token, ...params, API_URL }),
    updateUser: (params: {
      language?: string
      name?: string
      image?: string
      userName?: string
      favouriteAgent?: string
      characterProfilesEnabled?: boolean
      memoriesEnabled?: boolean
      city?: string
      country?: string
    }) => updateUser({ token, ...params, API_URL }),
    uploadUserImage: (file: File | null) =>
      uploadUserImage({ token, file, API_URL }),
    removeUser: () => removeUser({ token, API_URL }),

    // Guest operations
    getGuest: () => getGuest({ token, API_URL }),
    updateGuest: (params: {
      favouriteAgent?: string
      characterProfilesEnabled?: boolean
      city?: string
      country?: string
      memoriesEnabled?: boolean
    }) => updateGuest({ token, ...params, API_URL }),

    // Message operations
    getLastMessage: (threadId?: string) =>
      getLastMessage({ token, threadId, API_URL }),
    updateMessage: (params: { messageId: string; like?: boolean | null }) =>
      updateMessage({ token, ...params, API_URL }),
    deleteMessage: (messageId: string) =>
      deleteMessage({ token, messageId, API_URL }),

    // Memory operations
    deleteMemories: () => deleteMemories({ token, API_URL }),

    // Collaboration operations
    updateCollaboration: (params: { id: string; status: string }) =>
      updateCollaboration({ token, ...params, API_URL }),

    // Subscription operations
    deleteSubscription: () => deleteSubscription({ token, API_URL }),

    // Calendar operations
    createCalendarEvent: (event: CalendarEventFormData) =>
      createCalendarEvent({ token, event, API_URL }),
    updateCalendarEvent: (params: {
      id: string
      event: CalendarEventFormData
    }) => updateCalendarEvent({ token, ...params, API_URL }),
    deleteCalendarEvent: (id: string) =>
      deleteCalendarEvent({ token, id, API_URL }),
    getCalendarEvents: (params?: { startDate?: string; endDate?: string }) =>
      getCalendarEvents({ token, ...params, API_URL }),
    syncGoogleCalendar: () => syncGoogleCalendar({ token, API_URL }),
    exportToGoogleCalendar: (eventId: string) =>
      exportToGoogleCalendar({ token, eventId, API_URL }),

    // App operations
    createApp: (data: appFormData) => createApp({ token, data, API_URL }),
    updateApp: (id: string, data: appFormData) =>
      updateApp({ token, id, data, API_URL }),
    deleteApp: (id: string) => deleteApp({ token, id, API_URL }),
    reorderApps: (apps: app[], autoInstall?: boolean, storeId?: string) =>
      reorderApps({ token, apps, autoInstall, storeId, API_URL }),
    getApps: () => getApps({ token, API_URL }),
    getApp: ({ appId }: { appId: string }) => getApp({ token, appId, API_URL }),

    getSession: (params: {
      deviceId: string | undefined
      fingerprint?: string
      gift?: string
      isStandalone: boolean
      API_URL?: string
      VERSION?: string
      app?: "extension" | "pwa" | "web"
    }) => getSession({ ...params, API_URL, token }),
  }
}
