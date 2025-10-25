import {
  aiAgent,
  app,
  collaboration,
  guest,
  message,
  thread,
  user,
} from "../types"
import * as utils from "../utils"
import z from "zod"
import { createCalendarEventSchema } from "../utils/calendarValidation"
import superjson from "superjson"
import { appFormData } from "../schemas/appSchema"
import { session } from "../context/providers/AuthProvider"

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
  collaborationStatus?: "pending" | "active"
  myPendingCollaborations?: boolean
  onError?: (status: number) => void
  appId?: string
  API_URL?: string
  slug?: "Atlas" | "Peach" | "Vault" | "Bloom" | string | null
}) => {
  const url = new URL(`${API_URL}/threads`)

  url.searchParams.set("pageSize", pageSize?.toString() || "10")
  collaborationStatus &&
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
    return null
  }

  return response.json()
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
    appId !== undefined && formData.append("appId", appId ?? "null")
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
      appId: appId !== undefined ? appId : "null",
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
    body: superjson.stringify(event), // Serialize Dates properly
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
    body: superjson.stringify({ ...event, id }),
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
  API_URL = utils.API_URL,
}: {
  token: string
  apps: app[]
  autoInstall?: boolean
  API_URL?: string
}) {
  const response = await fetch(`${API_URL}/apps/reorder`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
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
  token,
  API_URL = utils.API_URL,
  VERSION = utils.VERSION,
  app,
  appSlug,
  agentName,
  chrryUrl,
}: {
  deviceId: string | undefined
  fingerprint?: string
  gift?: string
  isStandalone: boolean
  token: string
  API_URL?: string
  VERSION?: string
  app?: "extension" | "pwa" | "web"
  appSlug?: string
  agentName?: string
  chrryUrl?: string
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
  })

  const response = await fetch(`${API_URL}/session?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "x-device-id": deviceId,
      "x-screen-width": window.screen.width.toString(),
      "x-screen-height": window.screen.height.toString(),
      "x-timezone": Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  })

  if (!response.ok) {
    // Disable further requests on rate limit
    if (response.status === 429) {
      return {
        error: "Rate limit exceeded",
        status: 429,
      }
    }
  }

  const result = await response.json()

  return result as session | { error?: string; status?: number }
}

export type ApiActions = ReturnType<typeof getActions>

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
      collaborationStatus?: "pending" | "active"
      myPendingCollaborations?: boolean
      onError?: (status: number) => void
      slug?: "Atlas" | "Peach" | "Vault" | "Bloom" | string | null
    }) => getThreads({ token, ...params, API_URL }),
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
    reorderApps: (apps: app[], autoInstall?: boolean) =>
      reorderApps({ token, apps, autoInstall, API_URL }),

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
