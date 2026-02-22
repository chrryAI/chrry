"use client"

import type React from "react"
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import useCache from "../../hooks/useCache"
import { toast, useLocalStorage, useNavigation } from "../../platform"

import { type appFormData, appSchema } from "../../schemas/appSchema"
import type {
  appWithStore,
  instruction,
  Paginated,
  storeWithApps,
} from "../../types"
import { getExampleInstructions } from "../../utils"
import { ANALYTICS_EVENTS } from "../../utils/analyticsEvents"
import { customZodResolver } from "../../utils/customZodResolver"
import type { instructionBase } from "../../utils/getExampleInstructions"
import isOwner from "../../utils/isOwner"
import console from "../../utils/log"
import { useAuth } from "./AuthProvider"
import { useData } from "./DataProvider"
import { useError } from "./ErrorProvider"

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

export type TabType =
  | "settings"
  | "api"
  | "monetization"
  | "systemPrompt"
  | "extends"
  | "customModel"
  | "tribe"
  | "moltBook"

interface AppStatus {
  step?: "add" | "success" | "warning" | "cancel" | "update" | "restore"
  part?: "name" | "description" | "highlights" | "settings" | "image" | "title"
  text?: Record<string, string>
}

interface AppFormContextType {
  minimize: boolean
  tab: TabType
  setTab: React.Dispatch<React.SetStateAction<TabType>>
  isAgentModalOpen: boolean
  setIsAgentModalOpen: (value: boolean) => void
  setMinimize: React.Dispatch<React.SetStateAction<boolean>>
  defaultExtends: string[]
  setStoreSlug: (storeSlug: string) => void
  currentStore: storeWithApps | undefined
  showingCustom: boolean
  hasCustomInstructions: boolean
  isAppInstructions: boolean
  toggleInstructions: (item?: appWithStore) => void
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
  setIsManagingApp: (isManagingApp: boolean) => void
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
    roles?: ("coder" | "architect")[]
    addons?: ("grape" | "pear")[]
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
      openrouter?: string
    }
    isDefaultValues?: boolean
    canSubmit: boolean
  }
}

const AppFormContext = createContext<AppFormContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const {
    token,
    user,
    guest,
    slug,
    setSlug,
    fetchSession,
    fetchApps,
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
    storeApps,
    isSavingApp,
    setIsSavingApp,
    defaultInstructions,
    sushi,
    focus,
    setLoadingApp,
    setNewApp,
    setUpdatedApp,
    setBaseAccountApp,
    setIsManagingApp,
    isManagingApp,
    isRemovingApp,
    setIsRemovingApp,
    burn,
    burnApp,
    burning,
    setBurn,
    plausible,
    minimize,
    setMinimize: setMinimizeInternal,
    ...auth
  } = useAuth()
  const threadId = auth.threadId || auth?.threadIdRef.current
  const { actions } = useData()

  const { t } = useTranslation()

  const { searchParams, push, pathname, removeParams, addParams } =
    useNavigation()

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
    setFormDraft(defaultFormValues)
    appForm.reset(defaultFormValues)
    // Don't clear appStatus here - it should be managed by URL params
    // setAppStatusInternal(undefined)
  }

  const isManagingAppInternal = !!appStatus?.part || isSavingApp

  useEffect(() => {
    setIsManagingApp(isManagingAppInternal)
  }, [isManagingAppInternal])

  const setApp = (app: appWithStore | undefined) => {
    setAppInternal(app)
  }

  const { captureException } = useError()

  const { clear } = useCache()

  const [tab, setTab] = useState<TabType>(
    (searchParams.get("tab") as TabType) || "settings",
  )

  useEffect(() => {
    if (appStatus?.part === "settings") {
      !tab && setTab("settings")
    }
  }, [tab, appStatus, setTab])

  const [isAgentModalOpen, setIsAgentModalOpenInternal] = useState<boolean>(
    appStatus?.part === "settings",
  )

  const setIsAgentModalOpen = (value: boolean) => {
    setIsAgentModalOpenInternal(value)
    // if (!value) {
    //   removeParams(["settings", "tab", "trial"])
    // }
  }

  useEffect(() => {
    setIsAgentModalOpen(appStatus?.part === "settings")
    appStatus?.part && auth.setShowTribe(false)
  }, [appStatus, auth, setIsAgentModalOpen])

  useEffect(() => {
    if (searchParams.get("settings")) {
      setAppStatus({ part: "settings" })
    }
  }, [searchParams.get("settings")])

  const saveApp = async () => {
    try {
      clear("app")

      setIsSavingApp(true)
      const formValues = appForm.getValues()

      // Schema already sanitizes via sanitizedString helper
      const result = canEditApp
        ? await actions.updateApp(app.id, formValues)
        : await actions.createApp(formValues)

      if (result?.error) {
        toast.error(result.error)
        setIsSavingApp(false)
        plausible({
          name: ANALYTICS_EVENTS.APP_SAVE_ERROR,
          props: {
            success: false,
            error: result.error,
          },
        })
        return false
      }

      if (result) {
        if (canEditApp) {
          setUpdatedApp(result)
          await fetchApps()
        } else {
          setNewApp(result)
          await fetchApps()
        }
        plausible({
          name: ANALYTICS_EVENTS.APP_SAVE_SUCCESS,
          props: {
            success: true,
          },
        })
        clearFormDraft()
        setAppStatus(undefined)
        return true
      }
    } catch (error) {
      toast.error(t("Something went wrong"))
      captureException(error)
      plausible({
        name: ANALYTICS_EVENTS.APP_SAVE_ERROR,
        props: {
          success: false,
          error: error,
        },
      })
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

        clear("app")

        await fetchSession()
        await fetchApps()

        // setApps(apps.filter((app) => app.id !== app?.id))

        // setApp(undefined)
        setBaseAccountApp(undefined)
        // setBaseAccountApp(undefined)

        // setApps(storeApps.filter((app) => app.id !== app?.id))

        // clearFormDraft()
        setAppStatus(undefined)

        toast.success(`${t("Deleted")} 😭`)
        plausible({
          name: ANALYTICS_EVENTS.APP_DELETE_SUCCESS,
          props: {
            success: true,
          },
        })

        push("/")

        return true
      } catch (error) {
        toast.error(t("Something went wrong"))
        captureException(error)
        return false
      } finally {
        setIsRemovingApp(false)
        setIsSavingApp(false)
      }
    }

    setAppStatus(undefined)

    // toast.success(`${t("Deleted")} 😭`)
    clearFormDraft()
    return true
  }

  const defaultExtends =
    chrry?.store?.apps
      ?.filter((a) =>
        [
          "sushi",
          "vex",
          "chrry",
          "grape",
          "zarathustra",
          "claude",
          "atlas",
          "perplexity",
        ].includes(a.slug),
      )
      .map((app) => app.id) || []

  const defaultFormValues = {
    name: t("MyAgent"),
    title: t("Your personal AI agent"),
    tone: "professional" as const,
    language: "en",
    defaultModel: "sushi",
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
    extends: defaultExtends, // Default: Chrry (required) and base app (if exists)
    tools: ["calendar", "location", "weather"],
    apiEnabled: false,
    apiPricing: "per-request" as const,
    displayMode: "standalone" as const,
  }
  // Cross-platform localStorage hook (works on web, native, extension)
  const [formDraft, setFormDraftInternal] = useLocalStorage<
    Partial<appFormData> | undefined
  >("draft", defaultFormValues)

  const setFormDraft = (
    draft:
      | Partial<appFormData>
      | undefined
      | ((
          prev: Partial<appFormData> | undefined,
        ) => Partial<appFormData> | undefined),
  ) => {
    setFormDraftInternal(draft)
  }

  const blossom = chrry?.store?.apps

  useEffect(() => {
    if (!blossom) return
    // Guard: Only run if formDraft has extends
    if (!formDraft?.extends || formDraft.extends.length === 0) return

    // Filter out stale app IDs that no longer exist in storeApps
    const validAppIds = new Set(blossom.map((app) => app.id))
    const validExtends = formDraft.extends.filter((id) => validAppIds.has(id))

    // Guard: Only update if something actually changed
    const hasStaleExtends = validExtends.length !== formDraft.extends.length
    if (!hasStaleExtends) return

    // If all extends were stale, reset to defaults
    if (validExtends.length === 0) {
      console.log("✅ All extends stale, setting defaults")
      setFormDraft({
        ...formDraft,
        extends: defaultExtends,
      })
      return
    }

    // If some were stale, keep only valid ones
    console.log("✅ Filtering out stale extends:", {
      before: formDraft.extends.length,
      after: validExtends.length,
    })
    setFormDraft({
      ...formDraft,
      extends: validExtends,
    })
  }, [blossom, defaultExtends]) // Removed formDraft from deps

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
        extends: app.extends?.map((e) => e.id) || defaultExtends,
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
    resolver: customZodResolver(appSchema),
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

  // const [minimize, setMinimizeInternal] = useLocalStorage<boolean>(
  //   "minimize",
  //   true,
  // )

  const setMinimize = (value: boolean | ((prev: boolean) => boolean)) => {
    const newValue = typeof value === "function" ? value(minimize) : value

    // Update state
    setMinimizeInternal(newValue)

    // Track state change - plausible will automatically calculate duration
    plausible({
      name: newValue ? ANALYTICS_EVENTS.MINIMIZE : ANALYTICS_EVENTS.MAXIMIZE,
    })
  }

  const contextInstructions = useMemo(() => {
    if (!app) return []

    // Special case: Zarathustra in burning mode gets custom instructions
    if (app?.slug === "zarathustra" && burning) {
      return getExampleInstructions({ slug: "zarathustra" }) as instruction[]
    }

    // Normal case: use user/guest/auth instructions
    const instructions =
      auth?.instructions || user?.instructions || guest?.instructions || []

    // Filter by appId
    return instructions.filter((i) => i.appId === app?.id) as instruction[]
  }, [
    burn,
    burnApp,
    app,
    auth?.instructions,
    user?.instructions,
    guest?.instructions,
    burning,
  ])

  const [_storeSlug, setStoreSlug] = useState(pathname.replace("/", ""))

  useEffect(() => {
    setStoreSlug(pathname.replace("/", ""))
  }, [pathname])

  const getCurrentStoreApp = () => {
    const pathSegments = pathname.split("/").filter(Boolean)
    const lastSegment = pathSegments[pathSegments.length - 1] || ""

    const matchedApp = storeApps?.find(
      (app) => app?.store?.slug === lastSegment && app?.store?.apps?.length,
    )

    return matchedApp
  }

  const [currentStore, setCurrentStore] = useState(getCurrentStoreApp()?.store)
  useEffect(() => {
    const matchedApp = getCurrentStoreApp()
    if (currentStore && matchedApp && !matchedApp?.store?.apps?.length) {
      setLoadingApp(matchedApp)
      return
    }
    matchedApp?.store && setCurrentStore(matchedApp.store)
  }, [pathname, storeApps, currentStore])

  const appFormWatcher = {
    ...watcher,
    image: appForm.watch("image"),
    id: appForm.watch("id"),
    defaultModel: appForm.watch("defaultModel"),
    systemPrompt: appForm?.watch("systemPrompt"),
    pricing: appForm.watch("pricing"),
    tier: appForm.watch("tier"),
    extends: appForm.watch("extends") || defaultExtends,
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
      isManagingApp && appFormWatcher?.highlights?.length
        ? (appFormWatcher.highlights as instruction[])
        : contextInstructions?.length > 0
          ? contextInstructions
          : app?.highlights?.length
            ? (app.highlights as instruction[])
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
    instructionsInternal.length && setInstructions(instructionsInternal)
  }, [instructionsInternal])

  const hasCustomInstructions = contextInstructions?.some(
    (i) => app && !app?.highlights?.some((h) => h.id === i.id),
  )

  const [showingCustom, setShowingCustom] = useState(hasCustomInstructions)

  useEffect(() => {
    setShowingCustom(hasCustomInstructions)
  }, [hasCustomInstructions])

  const isAppInstructions = contextInstructions?.every((i) =>
    app?.highlights?.some((h) => h.id === i.id),
  )

  const toggleInstructions = (item = app) => {
    if (!hasCustomInstructions) return // Nothing to toggle

    // Toggle between custom and app instructions
    if (showingCustom) {
      // Switch to app instructions
      if (item?.highlights?.length) {
        setInstructions(item.highlights as instruction[])
      }
      setShowingCustom(false)
    } else {
      // Switch to custom instructions
      setInstructions(contextInstructions)
      setShowingCustom(true)
    }
  }

  const suggestSaveApp = !!(
    !!appStatus?.part &&
    !appFormWatcher.id &&
    appFormWatcher.systemPrompt &&
    appFormWatcher.canSubmit
  )

  const canEditApp = isAppOwner

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
    setMinimize(false)
    setAppStatusInternal(payload)

    plausible({
      name: ANALYTICS_EVENTS.APP_STATUS,
      props: payload,
    })

    if (payload) {
      addParams({ settings: "true" })

      auth.setShowTribe(false)
      auth.setShowFocus(false)
    }

    const { step, part } = payload || {}

    if (step || part) {
      if (part === "settings") {
        addParams({ settings: "true" })
      }

      if (appStatus?.step !== step || appStatus?.part !== part)
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
          id: undefined, // Explicitly clear id to prevent conflicts
        }
        appForm.reset(freshDefaults)
        if ((threadId || currentStore || pathname === "/tribe") && chrry) {
          push(auth.getAppSlug(chrry))
        }
      } else if (step === "restore") {
        // Restore app data from current app into form for editing
        if (app && isAppOwner) {
          const appValues = getInitialFormValues()
          appForm.reset(appValues)
          setFormDraft(appValues)
        }
      }
    }
  }

  useEffect(() => {
    const subscription = appForm.watch((data) => {
      // Only update if data actually changed
      setFormDraft((prev) => {
        if (JSON.stringify(prev) === JSON.stringify(data)) {
          return prev // No change, don't trigger re-render
        }
        return data as Partial<appFormData>
      })
    })

    return () => subscription.unsubscribe()
  }, [appForm])
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

  return (
    <AppFormContext.Provider
      value={{
        defaultExtends,
        currentStore,
        showingCustom,
        storeApp,
        chrry,
        toggleInstructions,
        defaultInstructions,
        instructions,
        appStatus,
        setAppStatus,
        app,
        setApp,
        apps,
        setApps,
        isAgentModalOpen,
        setIsAgentModalOpen,
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
        isAppInstructions,
        hasCustomInstructions,
        setStoreSlug,
        setIsManagingApp,
        tab,
        setTab,
        minimize,
        setMinimize,
      }}
    >
      {children}
    </AppFormContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppFormContext)
  if (!context) {
    throw new Error("useApp must be used within AppProvider")
  }
  return context
}
