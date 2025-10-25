"use client"

import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react"
import {
  useLocalStorage,
  useNavigation,
  usePlatform,
  toast,
} from "../../platform"
import { appFormData, appSchema } from "../../schemas/appSchema"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import isOwner from "../../utils/isOwner"
import { useAuth } from "./AuthProvider"
import type { app, appWithStore, instruction } from "../../types"
import { getExampleInstructions } from "../../utils"
import { useTranslation } from "react-i18next"
import { COLORS, useTheme } from "../ThemeContext"
import { useData } from "./DataProvider"
import { instructionBase } from "../../utils/getExampleInstructions"
import { session, Paginated, storeWithApps } from "../../types"
import { getSiteConfig } from "chrry/utils/siteConfig"

export { COLORS } from "../ThemeContext"

const isDeepEqual = (obj1: any, obj2: any): boolean => {
  if (obj1 === obj2) return true
  if (
    typeof obj1 !== "object" ||
    obj1 === null ||
    typeof obj2 !== "object" ||
    obj2 === null
  ) {
    return false
  }

  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)

  if (keys1.length !== keys2.length) return false

  for (const key of keys1) {
    if (!keys2.includes(key)) return false
    if (!isDeepEqual(obj1[key], obj2[key])) return false
  }

  return true
}

interface AppStatus {
  currentStep?: "add" | "success" | "warning" | "cancel" | "update"
  part?: "name" | "description" | "highlights" | "settings" | "image" | "title"
  text?: Record<string, string>
}

interface AppFormContextType {
  baseApp?: appWithStore
  stores: Paginated<storeWithApps> | undefined
  store: storeWithApps | undefined
  defaultInstructions: instructionBase[]
  instructions: instruction[]
  isManagingApp: boolean
  appStatus: AppStatus | undefined
  setAppStatus: (appStatus: AppStatus | undefined, path?: string) => void
  app: (appWithStore & { image?: string }) | undefined
  setApp: (app: (appWithStore & { image?: string }) | undefined) => void
  apps: appWithStore[]
  setApps: (apps: appWithStore[]) => void
  suggestSaveApp: boolean
  saveApp: () => Promise<boolean>
  isSavingApp: boolean
  setIsSavingApp: (isSavingApp: boolean) => void
  isRemovingApp: boolean
  clearFormDraft: () => void
  canEditApp: boolean
  isAppOwner: boolean
  slug: string | undefined
  setSlug: (slug: string | undefined) => void
  removeApp: () => Promise<boolean>
  owningApps: appWithStore[]
  storeApp: appWithStore | undefined
  chrry: appWithStore | undefined
  appForm: ReturnType<typeof useForm<appFormData>>
  appFormWatcher: {
    id?: string
    name?: string
    description?: string
    image?: string
    systemPrompt?: string
    defaultModel?: string
    extends?: string[]
    tools?: string[]
    capabilities?: {
      text: boolean
      image: boolean
      audio: boolean
      video: boolean
      webSearch: boolean
      imageGeneration: boolean
      codeExecution: boolean
      pdf: boolean
    }
    highlights?: {
      id: string
      title: string
      content?: string | undefined
      emoji?: string | undefined
      requiresWebSearch?: boolean
      appName?: string
    }[]
    title?: string
    pricing?: "free" | "one-time" | "subscription"
    tier?: "free" | "plus" | "pro"
    apiKeys?: {
      openai?: string
      anthropic?: string
      google?: string
      deepseek?: string
      perplexity?: string
      replicate?: string
    }
    isDefaultValues?: boolean
    canSubmit: boolean
  }
}

const AppFormContext = createContext<AppFormContextType | undefined>(undefined)

export function AppProvider({
  children,
  ...rest
}: {
  children: ReactNode
  session?: session
}) {
  const {
    token,
    user,
    guest,
    slug,
    setSlug,
    refetchSession,
    apps,
    setApps,
    app,
    setApp: setAppInternal,
    storeApp,
    chrry,
    baseApp,
    stores,
    store,
  } = useAuth()

  const { actions } = useData()

  const { isWeb } = usePlatform()

  const ableToToHydrate = !isWeb

  const { t } = useTranslation()
  const {
    colorScheme,
    setColorScheme: setColorSchemeInternal,
    setTheme,
  } = useTheme()

  const getSlugFromPathname = (path: string): string | null => {
    // Remove locale prefix if present (e.g., /ja/atlas -> /atlas)
    const pathWithoutLocale = path.replace(/^\/[a-z]{2}\//, "/")

    // Extract first path segment (could be slug or UUID)
    const match = pathWithoutLocale.match(/^\/([^\/]+)/)
    if (!match) return null

    const segment = match[1]

    // Exclude non-app routes
    const excludedRoutes = [
      "threads",
      "settings",
      "profile",
      "apps",
      "api",
      "_next",
      "signin",
      "signup",
      "onboarding",
      "lifeOS",
    ]
    if (segment && excludedRoutes.includes(segment)) return null

    return segment || null
  }

  const { pathname, searchParams, addParams, replace, push } = useNavigation()

  // useEffect(() => {
  //   session?.apps.length && setApps(session?.apps)
  // }, [session?.apps, apps])

  const step = searchParams.get("step") as
    | "add"
    | "success"
    | "warning"
    | "cancel"
    | "update"
    | undefined
  const part = searchParams.get("part") as
    | "name"
    | "description"
    | "highlights"
    | "settings"
    | "image"
    | "title"
    | undefined

  const [appStatus, setAppStatusInternal] = useState<
    | {
        currentStep?: "add" | "success" | "warning" | "cancel" | "update"
        part?:
          | "name"
          | "description"
          | "highlights"
          | "settings"
          | "image"
          | "title"
        text?: Record<string, string>
      }
    | undefined
  >({
    currentStep: step,
    part: part,
  })

  const isAppOwner = !!(
    app &&
    isOwner(app, {
      userId: user?.id,
      guestId: guest?.id,
    })
  )

  const canEditApp = isAppOwner

  const clearFormDraft = () => {
    setFormDraft(undefined)
    appForm.reset(defaultFormValues)
    setAppStatusInternal(undefined)
  }
  const isManagingApp = !!appStatus?.part

  const setApp = (app: appWithStore | undefined) => {
    setAppInternal(app)
  }

  const defaultInstructions = getExampleInstructions()
    .map((inst) => ({
      ...inst,
      title: t(inst.title),
      content: t(inst.content || ""),
    }))
    .map((inst) => ({
      ...inst,
      title: t(inst.title),
      content: t(inst.content || ""),
    }))

  const [isRemovingApp, setIsRemovingApp] = useState(false)

  const { removeParams } = useNavigation()

  const [isSavingApp, setIsSavingApp] = useState(false)

  useEffect(() => {
    if (searchParams.get("appCreated") === "true") {
      toast.success(t("🥳 WOW!, you created something amazing"))
      removeParams(["appCreated"])
    }
    if (searchParams.get("appUpdated") === "true") {
      toast.success(`${t("Updated")} 🚀`)
      removeParams(["appUpdated"])
    }
    if (searchParams.get("appDeleted") === "true") {
      toast.success(`${t("Deleted")} 😭`)
      removeParams(["appDeleted"])
    }
  }, [searchParams])

  const saveApp = async () => {
    if (!token) return false
    try {
      setIsSavingApp(true)
      const result =
        app?.id && canEditApp
          ? await actions.updateApp(app.id, appForm.getValues())
          : await actions.createApp(appForm.getValues())

      if (result?.error) {
        toast.error(result.error)
        return false
      }

      if (result) {
        if (ableToToHydrate) {
          await refetchSession()

          !canEditApp
            ? toast.success(t("🥳 WOW!, you created something amazing"))
            : toast.success(`${t("Updated")} 🚀`)
        }

        // Navigate to the new app page

        clearFormDraft()

        const finalURL =
          result?.visibility === "public" ? result.slug : result.id

        if (isDeepEqual(result.highlights, defaultFormValues.highlights)) {
          ableToToHydrate
            ? push(`/${finalURL}?part=highlights`)
            : (window.location.href = `/${finalURL}?part=highlights&${canEditApp ? "appUpdated=true" : "appCreated=true"}`)
        } else {
          ableToToHydrate
            ? push(`/${finalURL}`)
            : (window.location.href = `/${finalURL}?part=highlights&${canEditApp ? "appUpdated=true" : "appCreated=true"}`)
        }

        return true
      }
    } catch (error) {
      toast.error(t("Something went wrong"))
      return false
    } finally {
      ableToToHydrate && setIsSavingApp(false)
    }

    toast.error(t("Something went wrong"))
    return false
  }

  const removeApp = async () => {
    if (canEditApp) {
      if (!app?.id || !token) {
        return false
      }

      setIsRemovingApp(true)

      try {
        const response = await actions.deleteApp(app?.id)

        if (response.error) {
          toast.error(response.error)
          return false
        }

        if (ableToToHydrate) {
          setApp(undefined)
          await refetchSession()
          clearFormDraft()
          toast.success(`${t("Deleted")} 😭`)
          push("/")
          return true
        } else {
          // toast.success(`${t("Deleted")} 😭`)
          window.location.href = "/?appDeleted=true"
          return true
        }

        return true
      } catch (error) {
        toast.error(t("Something went wrong"))
        return false
      } finally {
        ableToToHydrate && setIsRemovingApp(false)
      }
    }

    // toast.success(`${t("Deleted")} 😭`)
    clearFormDraft()
    return true
  }

  // Cross-platform localStorage hook (works on web, native, extension)
  const [formDraft, setFormDraft] = useLocalStorage<
    Partial<appFormData> | undefined
  >("vex-app-form-draft", undefined)
  const defaultFormValues = {
    name: t("MyAgent"),
    title: t("Your personal AI agent"),
    tone: "professional" as const,
    language: "en",
    defaultModel: "claude",
    isDefaultValues: true,
    temperature: 0.7,
    pricing: "free" as const,
    tier: "free" as const,
    highlights: defaultInstructions,
    visibility: "private" as const,
    capabilities: {
      text: true,
      image: true,
      audio: true,
      video: true,
      webSearch: true,
      imageGeneration: true,
      codeExecution: true,
      pdf: true,
    },
    themeColor: "#8B5CF6", // Default purple color
    extends: ["Vex", "Chrry"], // Default: Vex (optional) and Chrry (required)
    tools: ["calendar", "location", "weather"],
    apiEnabled: false,
    apiPricing: "per-request" as const,
    displayMode: "standalone" as const,
  }
  const getInitialFormValues = (): Partial<appFormData> => {
    if (app && isOwner(app, { userId: user?.id, guestId: guest?.id })) {
      return {
        id: app.id,
        name: app.name || "",
        title: app.title || "",
        description: app.description || "",
        tone: app.tone || "professional",
        language: app.language || "en",
        defaultModel: app.defaultModel || "claude",
        temperature: app.temperature || 0.7,
        pricing: app.pricing || "free",
        tier: app.tier || "free",
        visibility: app.visibility || "private",
        capabilities: app.capabilities || defaultFormValues.capabilities,
        themeColor: app.themeColor || "#8B5CF6",
        extends: app.extend || [],
        tools: app.tools || [],
        apiEnabled: app.apiEnabled || false,
        apiPricing: app.apiPricing || "per-request",
        displayMode: app.displayMode || "standalone",
        image: app.image || app.images?.[0]?.url,
        placeholder: app.placeholder || "",
        systemPrompt: app.systemPrompt || "",
        highlights: app.highlights || defaultInstructions,
        apiKeys: app.apiKeys || {},
      }
    }
    return defaultFormValues
  }

  const appForm = useForm<appFormData>({
    resolver: zodResolver(appSchema),
    mode: "onChange",
    defaultValues: { ...getInitialFormValues(), ...formDraft },
  })

  const watcher = {
    name: formDraft?.name || appForm?.watch("name"),
    description: formDraft?.description || appForm?.watch("description"),
    highlights: formDraft?.highlights || appForm?.watch("highlights"),
    title: formDraft?.title || appForm?.watch("title"),
  }

  const [instructions, setInstructions] = useState<instruction[]>(
    user?.instructions ||
      guest?.instructions ||
      (app?.highlights as instruction[]) ||
      [],
  )

  const owningApps = apps.filter((app) =>
    isOwner(app, {
      userId: user?.id,
      guestId: guest?.id,
    }),
  )

  useEffect(() => {
    if (!apps?.length) return
    if (!user && !guest) return

    const i = user?.instructions || guest?.instructions || []

    if (!app) {
      setInstructions(i.filter((x) => !x.appId))
    } else {
      setInstructions(i.filter((x) => x.appId === app.id))
    }
  }, [user, guest, app, apps])

  const siteConfig = getSiteConfig()

  const appFormWatcher = {
    ...watcher,
    image: appForm.watch("image"),
    id: appForm.watch("id"),
    defaultModel: appForm.watch("defaultModel"),
    systemPrompt: appForm?.watch("systemPrompt"),
    pricing: appForm.watch("pricing"),
    tier: appForm.watch("tier"),
    extends: appForm.watch("extends"),
    tools: appForm.watch("tools"),
    capabilities: appForm.watch("capabilities"),
    apiKeys: appForm.watch("apiKeys"),
    isDefaultValues:
      watcher.name === t("MyAgent") &&
      watcher.title === t("Your personal AI agent") &&
      !watcher.description &&
      (!watcher.highlights || watcher.highlights.length === 0),
    canSubmit:
      !!(watcher.name && watcher.title) &&
      Object.keys(appForm?.formState.errors).length === 0,
  }

  const suggestSaveApp = !!(
    appFormWatcher.systemPrompt && appFormWatcher.canSubmit
  )

  const setAppStatus = (
    appStatus:
      | {
          currentStep?: "add" | "success" | "warning" | "cancel" | "update"
          part?:
            | "name"
            | "description"
            | "highlights"
            | "settings"
            | "image"
            | "title"
          text?: Record<string, string>
        }
      | undefined,
  ) => {
    setAppStatusInternal(appStatus)

    if (appStatus) {
      // Add query params to current URL
      const params: Record<string, string> = {}
      if (appStatus.currentStep) params.step = appStatus.currentStep
      if (appStatus.part) params.part = appStatus.part

      const newSearchParams = new URLSearchParams(searchParams?.toString())

      Object.entries(appStatus).forEach(([key, value]) => {
        newSearchParams.set(key, String(value))
      })
      const newUrl = `${baseApp?.slug === chrry?.slug ? "" : chrry?.slug}/?${newSearchParams.toString()}`
      push(newUrl)
    } else {
    }
  }

  useEffect(() => {
    if (step || part) {
      setAppStatusInternal({
        currentStep: step,
        part: part,
      })
    }
  }, [step, part]) // Run once on mount

  useEffect(() => {
    const subscription = appForm.watch((data) => {
      setFormDraft(data as Partial<appFormData>)
    })

    return () => subscription.unsubscribe()
  }, [appForm, setFormDraft])

  useEffect(() => {
    if (app && isOwner(app, { userId: user?.id, guestId: guest?.id })) {
      const appValues = getInitialFormValues()
      appForm.reset(appValues)
    }
  }, [app?.id, user?.id, guest?.id])

  // Restore form draft only on mount
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false)
  useEffect(() => {
    if (formDraft && Object.keys(formDraft).length > 0 && !hasRestoredDraft) {
      const currentValues = appForm.getValues()
      const isDifferent = !isDeepEqual(formDraft, currentValues)

      if (isDifferent) {
        appForm.reset(formDraft)
      }
      setHasRestoredDraft(true)
    }
  }, [formDraft]) // Only run on mount

  // Update favicons when app changes (moved from ThemeProvider to avoid circular dependency)
  useEffect(() => {
    if (typeof document === "undefined") return

    let favicon = document.querySelector(
      'link[rel="icon"]',
    ) as HTMLLinkElement | null
    let appleTouchIcon = document.querySelector(
      'link[rel="apple-touch-icon"]',
    ) as HTMLLinkElement | null

    if (favicon) {
      favicon.remove()
      favicon = null
    }
    if (appleTouchIcon) {
      appleTouchIcon.remove()
      appleTouchIcon = null
    }

    // Create new favicon element
    const newFavicon = document.createElement("link")
    newFavicon.rel = "icon"
    newFavicon.type = "image/png"

    const newAppleTouchIcon = document.createElement("link")
    newAppleTouchIcon.rel = "apple-touch-icon"

    // images array: [512px, 192px, 180px, 128px, 32px]
    if (app?.images?.[4]?.url) {
      // Use favicon version (32x32) with cache buster
      const faviconUrl = `${app.images[4].url}?t=${Date.now()}`
      newFavicon.href = faviconUrl
    } else if (app?.images?.[0]?.url) {
      // Fallback to large version with cache buster
      const faviconUrl = `${app.images[0].url}?t=${Date.now()}`
      newFavicon.href = faviconUrl
    } else {
      // Reset to default
      newFavicon.href = `${siteConfig.mode}.ico`
      console.log(
        `🚀 ~ file: AppProvider.tsx:677 ~ newFavicon.href :`,
        newFavicon.href,
      )
    }

    // Apple touch icon uses 180px version
    if (app?.images?.[2]?.url) {
      newAppleTouchIcon.href = `${app.images[2].url}?t=${Date.now()}`
    } else if (app?.images?.[0]?.url) {
      newAppleTouchIcon.href = `${app.images[0].url}?t=${Date.now()}`
    } else {
      newAppleTouchIcon.href = `${siteConfig.mode}.ico`
    }

    // Append new favicons to head
    document.head.appendChild(newFavicon)
    document.head.appendChild(newAppleTouchIcon)
  }, [app?.images])

  return (
    <AppFormContext.Provider
      value={{
        storeApp,
        chrry,
        defaultInstructions,
        instructions,
        appStatus,
        setAppStatus,
        app,
        setApp,
        apps,
        setApps,
        appForm,
        appFormWatcher,
        isManagingApp,
        canEditApp,
        isAppOwner,
        slug,
        setSlug,
        saveApp,
        suggestSaveApp,
        clearFormDraft,
        removeApp,
        isSavingApp,
        setIsSavingApp,
        isRemovingApp,
        owningApps,
        stores,
        store,
        baseApp,
      }}
    >
      {children}
    </AppFormContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppFormContext)
  if (!context) {
    throw new Error("useAppForm must be used within AppProvider")
  }
  return context
}
