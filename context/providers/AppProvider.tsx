"use client"

import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useMemo,
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
  step?: "add" | "success" | "warning" | "cancel" | "update" | "restore"
  part?: "name" | "description" | "highlights" | "settings" | "image" | "title"
  text?: Record<string, string>
}

interface AppFormContextType {
  setInstructions: React.Dispatch<React.SetStateAction<instruction[]>>
  baseApp?: appWithStore
  stores: Paginated<storeWithApps> | undefined
  store: storeWithApps | undefined
  defaultInstructions: instructionBase[]
  instructions: instruction[]
  isManagingApp: boolean
  appStatus: AppStatus | undefined
  setAppStatus: (appStatus: AppStatus | undefined, path?: string) => void
  app: appWithStore | undefined
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
  sushi: appWithStore | undefined
  focus: appWithStore | undefined
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
    vex,
    baseApp,
    userBaseApp,
    store,
    guestBaseApp,
    stores,
    allApps,
    isSavingApp,
    setIsSavingApp,
    defaultInstructions,
    sushi,
    focus,
  } = useAuth()
  const { actions } = useData()

  const { t } = useTranslation()

  const { searchParams, push } = useNavigation()

  // useEffect(() => {
  //   session?.apps.length && setApps(session?.apps)
  // }, [session?.apps, apps])

  const step = searchParams.get("step") as
    | "add"
    | "success"
    | "warning"
    | "cancel"
    | "update"
    | "restore"
    | undefined

  const part = searchParams.get("part") as
    | "name"
    | "description"
    | "highlights"
    | "settings"
    | "image"
    | "title"
    | undefined

  useEffect(() => {
    // Update appStatus when step or part changes
    if (step || part) {
      setAppStatusInternal({
        step: step,
        part: part,
      })
    }
  }, [step, part])

  const [appStatus, setAppStatusInternal] = useState<
    | {
        step?: "add" | "success" | "warning" | "cancel" | "update" | "restore"
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
    step: step,
    part: part,
  })

  const isAppOwner = !!(
    app &&
    isOwner(app, {
      userId: user?.id,
      guestId: guest?.id,
    })
  )

  const clearFormDraft = () => {
    setFormDraft(undefined)
    appForm.reset(defaultFormValues)
    // Don't clear appStatus here - it should be managed by URL params
    // setAppStatusInternal(undefined)
  }

  const isManagingApp = !!appStatus?.part || isSavingApp

  const setApp = (app: appWithStore | undefined) => {
    setAppInternal(app)
  }

  const [isRemovingApp, setIsRemovingApp] = useState(false)

  const saveApp = async () => {
    try {
      setIsSavingApp(true)
      const formValues = appForm.getValues()

      // Schema already sanitizes via sanitizedString helper
      const result = canEditApp
        ? await actions.updateApp(app.id, formValues)
        : await actions.createApp(formValues)

      if (result?.error) {
        toast.error(result.error)
        setIsSavingApp(false)
        return false
      }

      if (result) {
        if (canEditApp) {
          setApp(result)
          await refetchSession()
          toast.success(`${t("Updated")} 🚀`)
        } else {
          await refetchSession(result)
        }
        clearFormDraft()
        setAppStatus(undefined)
        return true
      }
    } catch (error) {
      toast.error(t("Something went wrong"))
      return false
    } finally {
      canEditApp && setIsSavingApp(false)
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

        setApp(undefined)
        await refetchSession()
        clearFormDraft()
        toast.success(`${t("Deleted")} 😭`)
        push("/")
        return true
      } catch (error) {
        toast.error(t("Something went wrong"))
        return false
      } finally {
        setIsRemovingApp(false)
      }

      clearFormDraft()
      return true
    }

    setAppStatus(undefined)

    // toast.success(`${t("Deleted")} 😭`)
    clearFormDraft()
    return true
  }

  // Cross-platform localStorage hook (works on web, native, extension)
  const [formDraft, setFormDraft] = useLocalStorage<
    Partial<appFormData> | undefined
  >("draft", undefined)
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
    extends: [
      chrry?.id,
      baseApp?.id || userBaseApp?.id || guestBaseApp?.id,
    ].filter(Boolean) as string[], // Default: Chrry (required) and base app (if exists)
    tools: ["calendar", "location", "weather"],
    apiEnabled: false,
    apiPricing: "per-request" as const,
    displayMode: "standalone" as const,
  }

  useEffect(() => {
    if (!formDraft || !formDraft.extends) return

    // Filter out stale app IDs that no longer exist in allApps
    const validAppIds = new Set(allApps.map((app) => app.id))
    const validExtends = formDraft.extends.filter((id) => validAppIds.has(id))

    // If all extends were stale, reset to defaults
    if (validExtends.length === 0 && vex && chrry) {
      console.log("✅ All extends stale, setting defaults")
      setFormDraft({
        ...formDraft,
        extends: [vex.id, chrry.id],
      })
    }
    // If some were stale, keep only valid ones
    else if (validExtends.length !== formDraft.extends.length) {
      console.log("✅ Filtering out stale extends:", {
        before: formDraft.extends.length,
        after: validExtends.length,
      })
      setFormDraft({
        ...formDraft,
        extends: validExtends,
      })
    }
  }, [formDraft, vex, chrry, allApps])

  const getInitialFormValues = (): Partial<appFormData> => {
    if (app && isOwner(app, { userId: user?.id, guestId: guest?.id })) {
      return {
        id: app.id,
        name: app.name || "",
        title: app.title || "",
        description: app.description || "",
        tone: app.tone || "professional",
        language: app.language || "en",
        defaultModel: app.defaultModel || "sushi",
        temperature: app.temperature || 0.7,
        pricing: app.pricing || "free",
        backgroundColor: app.backgroundColor || "#000000",
        tier: app.tier || "free",
        visibility: app.visibility || "private",
        capabilities: app.capabilities || defaultFormValues.capabilities,
        themeColor: app.themeColor || "orange",
        extends: app.extends?.map((e) => e.id),
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
  const owningApps = apps.filter((app) =>
    isOwner(app, {
      userId: user?.id,
      guestId: guest?.id,
    }),
  )

  const contextInstructions = useMemo(
    () =>
      app
        ? (user?.instructions || guest?.instructions || []).filter(
            (i) => i.appId === app?.id,
          )
        : [],
    [app?.id, user?.instructions, guest?.instructions],
  )

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

  const instructionsInternal = useMemo(
    () =>
      contextInstructions.length > 0
        ? contextInstructions
        : app?.highlights?.length
          ? (app.highlights as instruction[])
          : isManagingApp && appFormWatcher?.highlights?.length
            ? (appFormWatcher.highlights as instruction[])
            : (getExampleInstructions({
                slug: app?.slug || undefined,
              }) as instruction[]),
    [
      contextInstructions,
      app?.id, // IMPORTANT: Track app changes
      app?.highlights,
      isManagingApp,
      JSON.stringify(watcher.highlights), // Stringify for deep comparison
      app?.slug,
    ],
  )

  const [instructions, setInstructions] =
    useState<instruction[]>(instructionsInternal)

  useEffect(() => {
    setInstructions(instructionsInternal)
  }, [instructionsInternal])

  const siteConfig = getSiteConfig()

  const suggestSaveApp = !!(
    appFormWatcher.systemPrompt && appFormWatcher.canSubmit
  )

  const canEditApp =
    isAppOwner &&
    !!appFormWatcher?.id &&
    (step === "update" || step === "restore")

  const setAppStatus = (
    payload:
      | {
          step?: "add" | "success" | "warning" | "cancel" | "update" | "restore"
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
    setAppStatusInternal(payload)

    if (payload) {
      // Add query params to current URL
      const params: Record<string, string> = {}
      if (payload.step) params.step = payload.step || appStatus?.step
      if (payload.part) params.part = payload.part || appStatus?.part

      const newSearchParams = new URLSearchParams(searchParams?.toString())

      Object.entries(payload).forEach(([key, value]) => {
        newSearchParams.set(key, String(value))
      })

      const slug = userBaseApp?.slug || guestBaseApp?.slug || baseApp?.slug
      const newUrl = `${slug === chrry?.slug ? "" : (slug ?? chrry?.slug)}/?${newSearchParams.toString()}`
      push(newUrl)
    } else {
      push("/")
    }
  }

  useEffect(() => {
    if (step || part) {
      setAppStatusInternal({
        step: step,
        part: part,
      })

      if (step === "add") {
        // Clear localStorage draft first
        setFormDraft(undefined)
        // Then reset form to default values (clears id and all fields)
        // Recalculate default extends to include chrry and base app
        const freshDefaults = {
          ...defaultFormValues,
          extends: [
            chrry?.id,
            baseApp?.id || userBaseApp?.id || guestBaseApp?.id,
          ].filter(Boolean) as string[],
          id: undefined, // Explicitly clear id to prevent conflicts
        }
        appForm.reset(freshDefaults)
      } else if (step === "restore") {
        // Restore app data from current app into form for editing
        if (app && isAppOwner) {
          const appValues = getInitialFormValues()
          appForm.reset(appValues)
          setFormDraft(appValues)
        }
      }
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
  }, [app, user, guest])

  // Restore form draft only on mount (but not when step is "add")
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false)
  useEffect(() => {
    if (
      formDraft &&
      Object.keys(formDraft).length > 0 &&
      !hasRestoredDraft &&
      step !== "add" // Don't restore draft when creating new app
    ) {
      const currentValues = appForm.getValues()
      const isDifferent = !isDeepEqual(formDraft, currentValues)

      if (isDifferent) {
        appForm.reset(formDraft)
      }
      setHasRestoredDraft(true)
    }
  }, [formDraft, step]) // Only run on mount or when step changes

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
      newFavicon.href = `/${siteConfig.mode}.ico`
    }

    // Apple touch icon uses 180px version
    if (app?.images?.[2]?.url) {
      newAppleTouchIcon.href = `${app.images[2].url}?t=${Date.now()}`
    } else if (app?.images?.[0]?.url) {
      newAppleTouchIcon.href = `${app.images[0].url}?t=${Date.now()}`
    } else {
      newAppleTouchIcon.href = `/${siteConfig.mode}.ico`
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
        sushi,
        focus,
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
        setInstructions,
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
