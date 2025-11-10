"use client"

import React, { useEffect, useState } from "react"
import { type appFormData } from "./schemas/appSchema"
import clsx from "clsx"
import { useAppContext } from "./context/AppContext"
import Modal from "./Modal"
import {
  Blocks,
  Boxes,
  Brain,
  Coins,
  GlobeLock,
  MicVocal,
  Palette,
  Settings2,
  Sparkles,
  ThermometerSun,
  VectorSquare,
  Webhook,
} from "./icons"
import styles from "./Agent.module.scss"
import Img from "./Image"
import {
  capitalizeFirstLetter,
  FRONTEND_URL,
  PLUS_PRICE,
  PRO_PRICE,
  API_URL,
} from "./utils"
import Select from "./Select"
import Checkbox from "./Checkbox"
import ColorScheme from "./ColorScheme"
import { useHasHydrated } from "./hooks"
import { Controller, useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  createCustomAiAgentSchema,
  type CreateCustomAiAgent,
} from "./schemas/agentSchema"
import {
  DeepSeek,
  OpenAI,
  Claude,
  Gemini,
  Flux,
  Perplexity,
} from "@lobehub/icons"
import Logo from "./Logo"
import { usePlatform } from "./platform"
import {
  useChat,
  useNavigationContext,
  useApp,
  useAuth,
} from "./context/providers"
import ThemeSwitcher from "./ThemeSwitcher"
import { useTheme } from "./platform"

export default function Agent({
  className,
  isUpdate = false,
}: {
  className?: string
  initialData?: Partial<appFormData>
  isUpdate?: boolean
}) {
  const { device } = usePlatform()

  const { t } = useAppContext()
  const { chrry, baseApp, token } = useAuth()

  const { app, apps, appForm, appFormWatcher, appStatus, setAppStatus } =
    useApp()

  const { aiAgents } = useChat()

  const { removeParam, searchParams, addParam, addParams } =
    useNavigationContext()

  const { isMobileDevice } = useTheme()

  const {
    register,
    watch,
    control,
    formState: { errors },
  } = appForm!

  // Custom agent form
  const customAgentForm = useForm<CreateCustomAiAgent>({
    resolver: zodResolver(createCustomAiAgentSchema),
    defaultValues: {
      name: "",
      apiKey: "",
      displayName: "",
      modelId: "",
      apiURL: "",
    },
  })

  const hasHydrated = useHasHydrated()

  const agentMap: Record<string, string> = {
    openai: "chatGPT",
    anthropic: "claude",
    google: "gemini",
    deepseek: "deepSeek",
    perplexity: "perplexity",
    flux: "flux",
  }

  // Check if any enabled capability is not supported by agents with API keys
  const unSupportedCapabilities = (() => {
    if (appFormWatcher.pricing === "free") return null

    const capabilities = appFormWatcher.capabilities
    const apiKeys = appFormWatcher.apiKeys || {}

    if (!capabilities) return null

    // Get list of agents that have API keys configured
    const agentsWithKeys = Object.entries(apiKeys)
      .filter(([_, value]) => value?.trim())
      .map(([key]) => agentMap[key])
      .filter(Boolean)

    if (agentsWithKeys.length === 0) return null

    // Check each enabled capability
    for (const [capabilityKey, isEnabled] of Object.entries(capabilities)) {
      if (!isEnabled) continue // Skip disabled capabilities

      // Find if any agent with API key supports this capability
      const supportedByAgent = aiAgents?.find((agent) => {
        // Check if this agent has an API key configured
        const hasApiKey = agentsWithKeys.includes(agent.name)
        if (!hasApiKey) return false

        // Check if agent supports this capability
        return (
          agent.capabilities?.[
            capabilityKey as keyof typeof agent.capabilities
          ] === true
        )
      })

      // If no agent with API key supports this capability, return it
      if (!supportedByAgent) {
        return {
          capability: capabilityKey,
          message: `${capabilityKey} is enabled but no configured AI agent supports it`,
        }
      }
    }

    return null
  })()

  const isLocationRequired = appFormWatcher.highlights?.some(
    (highlight) =>
      highlight?.content?.includes("{{city}}") ||
      highlight?.content?.includes("{{country}}") ||
      highlight?.content?.includes("{{location}}"),
  )

  const isWeatherRequired = appFormWatcher.highlights?.some(
    (highlight) =>
      highlight?.content?.includes("{{weather}}") ||
      highlight?.content?.includes("{{temp}}"),
  )

  const calendarRequiredApp = apps.find(
    (app) =>
      appForm?.watch("extends")?.includes(app.name) &&
      app.tools?.includes("calendar"),
  )

  const locationRequiredApp = apps.find(
    (app) =>
      appForm?.watch("extends")?.includes(app.name) &&
      app.tools?.includes("location"),
  )

  const weatherRequiredApp = apps.find(
    (app) =>
      appForm?.watch("extends")?.includes(app.name) &&
      app.tools?.includes("weather"),
  )

  const aiAgent = aiAgents?.find(
    (a) =>
      a.name.toLowerCase() === appForm?.watch("defaultModel")?.toLowerCase(),
  )

  // Auto-enable capabilities that the selected AI model requires
  useEffect(() => {
    if (aiAgent?.capabilities) {
      const capabilities = appForm?.watch("capabilities")

      // Initialize with all capabilities as false, then override with current values
      const updatedCapabilities = {
        text: capabilities?.text ?? true,
        image: capabilities?.image ?? true,
        audio: capabilities?.audio ?? true,
        video: capabilities?.video ?? true,
        webSearch: capabilities?.webSearch ?? true,
        imageGeneration: capabilities?.imageGeneration ?? true,
        codeExecution: capabilities?.codeExecution ?? true,
        pdf: capabilities?.pdf ?? true,
      }

      // Enable capabilities that the AI model supports (true = required)
      // If model requires it (true), check it
      if (aiAgent.capabilities.webSearch === true) {
        updatedCapabilities.webSearch = true
      }
      if (aiAgent.capabilities.imageGeneration === true) {
        updatedCapabilities.imageGeneration = true
      }
      if (aiAgent.capabilities.audio === true) {
        updatedCapabilities.audio = true
      }
      if (aiAgent.capabilities.video === true) {
        updatedCapabilities.video = true
      }
      if (aiAgent.capabilities.pdf === true) {
        updatedCapabilities.pdf = true
      }
      if (aiAgent.capabilities.codeExecution === true) {
        updatedCapabilities.codeExecution = true
      }
      if (aiAgent.capabilities.text === true) {
        updatedCapabilities.text = true
      }
      if (aiAgent.capabilities.image === true) {
        updatedCapabilities.image = true
      }

      if (
        JSON.stringify(capabilities) !== JSON.stringify(updatedCapabilities)
      ) {
        appForm?.setValue("capabilities", updatedCapabilities)
      }
    }
  }, [appForm?.watch("defaultModel"), aiAgent])

  // Auto-check required tools
  useEffect(() => {
    const currentTools = appForm?.watch("tools") || []
    const requiredTools = new Set(currentTools)

    if (isLocationRequired || locationRequiredApp) {
      requiredTools.add("location")
    }
    if (isWeatherRequired || weatherRequiredApp) {
      requiredTools.add("weather")
    }
    if (calendarRequiredApp) {
      requiredTools.add("calendar")
    }

    const newTools = Array.from(requiredTools)
    if (
      JSON.stringify(currentTools.sort()) !== JSON.stringify(newTools.sort())
    ) {
      appForm?.setValue("tools", newTools)
    }
  }, [
    appForm?.watch("extends"),
    isLocationRequired,
    isWeatherRequired,
    calendarRequiredApp,
    locationRequiredApp,
    weatherRequiredApp,
  ])

  const [tab, setTabInternal] = useState<
    | "settings"
    | "api"
    | "monetization"
    | "systemPrompt"
    | "extends"
    | "customModel"
    | undefined
  >(
    (searchParams.get("tab") as
      | "settings"
      | "api"
      | "monetization"
      | "systemPrompt"
      | "extends"
      | "customModel") || undefined,
  )

  useEffect(() => {
    if (appStatus?.part === "settings") {
      !tab && setTabInternal("settings")
    }
  }, [appStatus, tab])

  const [isModalOpen, setIsModalOpenInternal] = useState(
    appStatus?.part === "settings",
  )

  useEffect(() => {
    !isModalOpen && setIsModalOpenInternal(appStatus?.part === "settings")
  }, [appStatus, isModalOpen])

  useEffect(() => {
    if (isModalOpen && device === "desktop" && !appFormWatcher.name) {
      setTimeout(() => {
        document.getElementById("name")?.focus()
      }, 100)
    }
  }, [isModalOpen])

  const setIsModalOpen = (open: boolean) => {
    if (open === isModalOpen) return

    let hasErrors = false

    // Only validate when actually closing (transitioning from open to closed)
    if (!open && isModalOpen) {
      // Check for validation errors
      if (Object.keys(errors).length > 0) {
        // Show first error
        const firstError = Object.values(errors)[0]
        toast.error(
          t(firstError?.message as string) || t("Please fix errors first"),
        )
        hasErrors = true
        return // Prevent closing
      }

      // Check required fields
      if (!appFormWatcher.name || appFormWatcher.name.length < 3) {
        toast.error(t("Name: minimum 3 characters"))
        return
      }

      // Validate API keys based on tier and capabilities
      const tier = appFormWatcher.tier || "free"
      const capabilities = appFormWatcher.capabilities
      const apiKeys = appFormWatcher.apiKeys || {}
      const tools = appFormWatcher.tools || []

      // For paid tiers (plus/pro), DeepSeek is REQUIRED
      // If no DeepSeek API key, automatically set to free tier
      if (tier !== "free") {
        if (!apiKeys.deepseek?.trim()) {
          appForm.setValue("tier", "free")
        } else {
          if ((tier === "plus" || tier === "pro") && capabilities) {
            // Image generation requires OpenAI
            if (
              capabilities.imageGeneration === true &&
              !apiKeys.openai?.trim()
            ) {
              toast.error(t("OpenAI API key required for image generation"))
              setTab("api")
              return
            }

            // Web search requires Perplexity
            if (
              capabilities.webSearch === true &&
              !apiKeys.perplexity?.trim()
            ) {
              toast.error(t("Perplexity API key required for web search"))
              setTab("api")
              return
            }

            // Voice/audio requires OpenAI
            if (capabilities.audio === true && !apiKeys.openai?.trim()) {
              toast.error(t("OpenAI API key required for voice capabilities"))
              setTab("api")
              return
            }
          }
        }
      }
      // For paid tiers (Plus/Pro), validate capability-specific API keys (only if enabled)

      // Check if any enabled capability is unsupported by configured agents
      if (unSupportedCapabilities) {
        toast.error(
          t(
            `${unSupportedCapabilities.capability} is enabled but no configured AI agent supports it. Please add an API key for a supporting agent.`,
          ),
        )
        setTab("api")
        return
      }
    }

    if (hasErrors) {
      setAppStatus({
        part: "highlights",
      })
      return
    }

    setIsModalOpenInternal(open)
    if (!open) {
      setAppStatus({
        part: "highlights",
      })
    } else {
      setAppStatus({
        part: "settings",
      })
    }
  }

  useEffect(() => {
    setIsModalOpen(appStatus?.part === "settings")
  }, [appStatus?.part])

  const setTab = (
    value:
      | "settings"
      | "api"
      | "monetization"
      | "systemPrompt"
      | "extends"
      | "customModel"
      | "api",
  ) => {
    if (value) {
      setIsModalOpen(true)
      if (value === "systemPrompt") {
        // Validate BEFORE opening
        if (!appFormWatcher.name) {
          toast.error(t("Name: minimum 3 characters"))
          return
        }

        if (errors.name?.message) {
          toast.error(t("Fix name errors first"))
          return
        }
      }
      setTabInternal(value)
      value !== "settings" && addParams({ tab: value })
    } else {
      removeParam("tab")
    }
  }

  return (
    <>
      <button
        className={clsx("small", styles.settingsButton)}
        onClick={() => {
          setAppStatus({
            part: "settings",
          })
        }}
      >
        <Settings2 size={18} /> {t("Settings")}
      </button>
      {hasHydrated && (
        <Modal
          hasCloseButton
          hideOnClickOutside={false}
          icon={
            <Img
              src={
                app?.image || `${FRONTEND_URL}/images/pacman/space-invader.png`
              }
              width={32}
              height={32}
            />
          }
          title={
            tab !== "systemPrompt" ? (
              <div className={styles.titleContainer}>
                <input
                  autoComplete="false"
                  {...register("name")}
                  title={t("Name your app......")}
                  id="name"
                  className={clsx(
                    styles.titleInput,
                    errors.name?.message && styles.error,
                  )}
                  type="text"
                  placeholder={t("Name your app......")}
                />
              </div>
            ) : (
              t("System Prompt")
            )
          }
          isModalOpen={isModalOpen}
          onToggle={(open) => {
            setIsModalOpen(open)
          }}
          className={clsx(styles.modal, className)}
        >
          <div className={styles.modalContent}>
            {/* Form */}
            {tab === "settings" && (
              <div className={styles.form}>
                {/* Tab 1: Basic Info */}

                {/* Tab 2: Personality */}
                <div className={styles.tabContent}>
                  {!appFormWatcher.name ? (
                    <span className={styles.errorMessage}>
                      {t("Name: minimum 3 characters")}
                    </span>
                  ) : errors.name?.message ? (
                    <span className={styles.errorMessage}>
                      {t(errors.name.message)}
                    </span>
                  ) : null}
                  <div className={clsx(styles.field, "row")}>
                    <Controller
                      name={"backgroundColor"}
                      control={control}
                      render={({ field }) => (
                        <span className={clsx(styles.label, "row")}>
                          <ThemeSwitcher
                            size={26}
                            onThemeChange={field.onChange}
                          />
                          {t("Theme & Color")}
                        </span>
                      )}
                    />

                    <div className={clsx(styles.colorOptions, "right")}>
                      <Controller
                        name={"themeColor"}
                        control={control}
                        render={({ field }) => (
                          <ColorScheme onChange={field.onChange} />
                        )}
                      />
                    </div>
                  </div>
                  <div className={clsx(styles.field, "row")}>
                    <label
                      className={clsx(clsx(styles.label, "row"))}
                      htmlFor="defaultModel"
                    >
                      <>
                        {appFormWatcher.defaultModel === "deepSeek" ? (
                          <DeepSeek color="var(--accent-6)" size={25} />
                        ) : appFormWatcher.defaultModel === "chatGPT" ? (
                          <OpenAI color="var(--accent-6)" size={25} />
                        ) : appFormWatcher.defaultModel === "claude" ? (
                          <Claude color="var(--accent-6)" size={25} />
                        ) : appFormWatcher.defaultModel === "gemini" ? (
                          <Gemini color="var(--accent-6)" size={25} />
                        ) : appFormWatcher.defaultModel === "flux" ? (
                          <Flux color="var(--accent-6)" size={25} />
                        ) : appFormWatcher.defaultModel === "perplexity" ? (
                          <Perplexity color="var(--accent-6)" size={25} />
                        ) : appFormWatcher.defaultModel === "sushi" ? (
                          <Img icon="sushi" size={25} />
                        ) : null}
                      </>{" "}
                      {t("Default Model")}
                    </label>
                    <Controller
                      name="defaultModel"
                      control={control}
                      render={({ field }) => (
                        <Select
                          className={styles.select}
                          options={[
                            { value: "sushi", label: "Sushi" },
                            { value: "claude", label: "Claude" },
                            { value: "chatGPT", label: "ChatGPT" },
                            { value: "gemini", label: "Gemini" },
                            { value: "perplexity", label: "Perplexity" },
                            // { value: "new", label: "(New)" },
                          ]}
                          id="defaultModel"
                          value={field.value}
                          onChange={(e) => {
                            const value =
                              typeof e === "string" ? e : e.target.value
                            if (value === "new") {
                              setTab("customModel")
                            } else {
                              field.onChange(value)
                            }
                          }}
                        />
                      )}
                    />
                  </div>

                  <div className={clsx(styles.field, "row")}>
                    <label className={clsx(styles.label, "row")} htmlFor="tone">
                      <MicVocal size={18} color="var(--accent-6)" />
                      {t("Tone")}
                    </label>
                    <Controller
                      name="tone"
                      control={control}
                      render={({ field }) => (
                        <Select
                          className={styles.select}
                          options={[
                            {
                              value: "professional",
                              label: t("Professional"),
                            },
                            { value: "casual", label: t("Casual") },
                            { value: "friendly", label: t("Friendly") },
                            { value: "technical", label: t("Technical") },
                            { value: "creative", label: t("Creative") },
                          ]}
                          id="tone"
                          value={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  </div>

                  <div className={clsx(styles.field, "row")}>
                    <label
                      className={clsx(styles.label, "row")}
                      htmlFor="temperature"
                    >
                      <ThermometerSun size={18} color="var(--accent-6)" />
                      {t("Temperature")}: {watch("temperature")}
                    </label>
                    <input
                      className={clsx(styles.range)}
                      id="temperature"
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      {...register("temperature", { valueAsNumber: true })}
                    />
                  </div>

                  <div className={clsx(styles.field)}>
                    <label
                      className={clsx(styles.label, "row")}
                      htmlFor="placeholder"
                    >
                      <Sparkles
                        size={20}
                        color="var(--accent-1)"
                        fill="var(--accent-1)"
                      />
                      {t("Default Input Placeholder")}
                    </label>
                    <input
                      className={clsx(styles.placeholder)}
                      id="placeholder"
                      placeholder={t(
                        `${t("e.g., Plan your dream vacation with me")} ✈️`,
                      )}
                      type="text"
                      {...register("placeholder")}
                    />
                  </div>
                  {/* Tab 3: Capabilities */}
                  <div className={clsx(styles.field, "row")}>
                    <label
                      className={clsx(styles.label, "row")}
                      htmlFor="capabilities"
                    >
                      <Boxes size={18} color="var(--accent-6)" />
                      {t("Capabilities")}
                    </label>
                    <div className="row">
                      <Controller
                        name="capabilities.webSearch"
                        control={control}
                        render={({ field }) => (
                          <label
                            onClick={(e) => {
                              if (aiAgent?.capabilities?.webSearch === true) {
                                e.preventDefault()
                                toast.error(
                                  t("Web Search required by {{model}}", {
                                    model: aiAgent.name,
                                  }),
                                )
                              }
                            }}
                          >
                            <Checkbox
                              checked={field.value}
                              disabled={
                                aiAgent?.capabilities?.webSearch === true
                              }
                              onChange={(e) => field.onChange(e.target.checked)}
                            >
                              <span>{t("Web Search")}</span>
                            </Checkbox>
                          </label>
                        )}
                      />
                      <Controller
                        name="capabilities.imageGeneration"
                        control={control}
                        render={({ field }) => (
                          <label
                            onClick={(e) => {
                              if (
                                aiAgent?.capabilities?.imageGeneration === true
                              ) {
                                e.preventDefault()
                                toast.error(
                                  t("Image Generation required by {{model}}", {
                                    model: aiAgent.name,
                                  }),
                                )
                              }
                            }}
                          >
                            <Checkbox
                              checked={field.value}
                              disabled={
                                aiAgent?.capabilities?.imageGeneration === true
                              }
                              onChange={(e) => field.onChange(e.target.checked)}
                            >
                              <span>{t("ImageGeneration")}</span>
                            </Checkbox>
                          </label>
                        )}
                      />
                      <Controller
                        name="capabilities.pdf"
                        control={control}
                        render={({ field }) => (
                          <label
                            onClick={(e) => {
                              if (aiAgent?.capabilities?.pdf === true) {
                                e.preventDefault()
                                toast.error(
                                  t("File Analysis required by {{model}}", {
                                    model: aiAgent.name,
                                  }),
                                )
                              }
                            }}
                          >
                            <Checkbox
                              checked={field.value}
                              disabled={aiAgent?.capabilities?.pdf === true}
                              onChange={(e) => field.onChange(e.target.checked)}
                            >
                              <span>{t("File Analysis")}</span>
                            </Checkbox>
                          </label>
                        )}
                      />
                      <Controller
                        name="capabilities.audio"
                        control={control}
                        render={({ field }) => (
                          <label
                            onClick={(e) => {
                              if (aiAgent?.capabilities?.audio === true) {
                                e.preventDefault()
                                toast.error(
                                  t("Voice required by {{model}}", {
                                    model: aiAgent.name,
                                  }),
                                )
                              }
                            }}
                          >
                            <Checkbox
                              checked={field.value}
                              disabled={aiAgent?.capabilities?.audio === true}
                              onChange={(e) => field.onChange(e.target.checked)}
                            >
                              <span>{t("Voice")}</span>
                            </Checkbox>
                          </label>
                        )}
                      />
                      <Controller
                        name="capabilities.video"
                        control={control}
                        render={({ field }) => (
                          <label
                            onClick={(e) => {
                              if (aiAgent?.capabilities?.video === true) {
                                e.preventDefault()
                                toast.error(
                                  t("Video required by {{model}}", {
                                    model: aiAgent.name,
                                  }),
                                )
                              }
                            }}
                          >
                            <Checkbox
                              checked={field.value}
                              disabled={aiAgent?.capabilities?.video === true}
                              onChange={(e) => field.onChange(e.target.checked)}
                            >
                              <span>{t("Video")}</span>
                            </Checkbox>
                          </label>
                        )}
                      />
                      <Controller
                        name="capabilities.codeExecution"
                        control={control}
                        render={({ field }) => (
                          <label
                            onClick={(e) => {
                              if (
                                aiAgent?.capabilities?.codeExecution === true
                              ) {
                                e.preventDefault()
                                toast.error(
                                  t("Code Execution required by {{model}}", {
                                    model: aiAgent.name,
                                  }),
                                )
                              }
                            }}
                          >
                            <Checkbox
                              checked={field.value}
                              disabled={
                                aiAgent?.capabilities?.codeExecution === true
                              }
                              onChange={(e) => field.onChange(e.target.checked)}
                            >
                              <span>{t("Code Execution")}</span>
                            </Checkbox>
                          </label>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            {tab === "extends" && (
              <>
                <div className={clsx(styles.field)}>
                  <span className={clsx(styles.label, "row")}>
                    <Blocks size={18} color="var(--accent-6)" />
                    {t("Extend")}
                  </span>
                  <div className={"row"}>
                    <Controller
                      name="extends"
                      control={control}
                      render={({ field }) => {
                        // Get store-based apps from Chrry store
                        const storeApps = chrry?.store?.apps || []

                        return (
                          <>
                            {/* Store-based apps */}
                            {storeApps.map((app) => {
                              // Chrry is required (checked and disabled)
                              const isChrry = app.id === chrry?.id
                              // Vex is optional (checked by default but can be unchecked)
                              const isBaseApp = app.id === baseApp?.id

                              const checked =
                                isChrry ||
                                isBaseApp ||
                                field.value?.includes(app.id)

                              return (
                                <label key={app.id || app.name}>
                                  <Checkbox
                                    checked={checked}
                                    // disabled={isDisabled || isChrry}
                                    onChange={(e) => {
                                      if (checked) {
                                        if (isChrry) {
                                          e.preventDefault()

                                          toast.error(
                                            `${app.name} is required and cannot be removed.`,
                                          )

                                          return
                                        }

                                        if (isBaseApp) {
                                          e.preventDefault()

                                          toast.error(
                                            `${app.name} is your base app.`,
                                          )

                                          return
                                        }
                                      }
                                      const newValue = e.target.checked
                                        ? [...(field.value || []), app.id]
                                        : field.value?.filter(
                                            (v) => v !== app.id,
                                          )
                                      field.onChange(newValue)
                                    }}
                                  >
                                    {app.icon} {app.name}
                                  </Checkbox>
                                </label>
                              )
                            })}
                          </>
                        )
                      }}
                    />
                  </div>
                  <div className={clsx(styles.field, "row")}>
                    <label
                      className={clsx(styles.label, "row")}
                      htmlFor="visibility"
                    >
                      <GlobeLock size={18} color="var(--accent-6)" />
                      {t("Visibility")}
                    </label>
                    <Controller
                      name="visibility"
                      control={control}
                      render={({ field }) => (
                        <Select
                          className={styles.select}
                          id="visibility"
                          options={[
                            { value: "private", label: t("Private") },
                            { value: "public", label: t("Public") },
                            { value: "unlisted", label: t("Unlisted") },
                          ]}
                          value={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  </div>

                  <span className={clsx(styles.label, "row")}>
                    <VectorSquare size={18} color="var(--accent-6)" />
                    {t("Tools")}
                  </span>
                  <div className={clsx("row", "right")}>
                    <Controller
                      name="tools"
                      control={control}
                      render={({ field }) => (
                        <>
                          <label
                            className={styles.checkboxLabel}
                            onClick={(e) => {
                              if (calendarRequiredApp) {
                                e.preventDefault()
                                toast.error(
                                  t(
                                    "Calendar required because you are using {{app}}",
                                    {
                                      app: calendarRequiredApp.name,
                                    },
                                  ),
                                )
                              }
                            }}
                          >
                            <Checkbox
                              checked={
                                field.value?.includes("calendar") || false
                              }
                              disabled={!!calendarRequiredApp}
                              onChange={(e) => {
                                const newValue = e.target.checked
                                  ? [...(field.value || []), "calendar"]
                                  : field.value?.filter((v) => v !== "calendar")
                                field.onChange(newValue)
                              }}
                            >
                              📅 {t("Calendar")}
                            </Checkbox>
                          </label>
                          <label
                            className={styles.checkboxLabel}
                            onClick={(e) => {
                              if (isLocationRequired || locationRequiredApp) {
                                e.preventDefault()
                                toast.error(
                                  t(
                                    isLocationRequired
                                      ? "Location required because you are using {{location}} templates on your instructions"
                                      : "Location required because you are using {{app}}",
                                    locationRequiredApp
                                      ? { app: locationRequiredApp.name }
                                      : {},
                                  ),
                                )
                              }
                            }}
                          >
                            <Checkbox
                              checked={
                                field.value?.includes("location") || false
                              }
                              disabled={
                                isLocationRequired || !!locationRequiredApp
                              }
                              onChange={(e) => {
                                const newValue = e.target.checked
                                  ? [...(field.value || []), "location"]
                                  : field.value?.filter((v) => v !== "location")
                                field.onChange(newValue)
                              }}
                            >
                              🌍 {t("Location")}
                            </Checkbox>
                          </label>
                          <label
                            className={styles.checkboxLabel}
                            onClick={(e) => {
                              if (isWeatherRequired || weatherRequiredApp) {
                                e.preventDefault()
                                toast.error(
                                  t(
                                    isWeatherRequired
                                      ? "Weather required because you are using {{weather}} templates on your instructions"
                                      : "Weather required because you are using {{app}}",
                                    weatherRequiredApp
                                      ? { app: weatherRequiredApp.name }
                                      : {},
                                  ),
                                )
                              }
                            }}
                          >
                            <Checkbox
                              checked={
                                field.value?.includes("weather") || false
                              }
                              disabled={
                                isWeatherRequired || !!weatherRequiredApp
                              }
                              onChange={(e) => {
                                const newValue = e.target.checked
                                  ? [...(field.value || []), "weather"]
                                  : field.value?.filter((v) => v !== "weather")
                                field.onChange(newValue)
                              }}
                            >
                              ☁️ {t("Weather")}
                            </Checkbox>
                          </label>
                        </>
                      )}
                    />
                  </div>
                </div>
              </>
            )}

            {tab === "systemPrompt" && (
              <div className={styles.field}>
                <textarea
                  id="systemPrompt"
                  {...register("systemPrompt")}
                  placeholder={`🎯 ${t("You are a specialized AI assistant with expertise in [your domain].")}

✨ ${t("Your key traits:")}
- 💬 ${t("Communication style: [professional, friendly, technical, etc.]")}
- 🧠 ${t("Approach: [step-by-step, creative, analytical, etc.]")}
- 🎨 ${t("Tone: [formal, casual, encouraging, etc.]")}

📋 ${t("When responding:")}
- ✓ [${t("Specific instruction {{count}}", { count: 1 })}]
- ✓ [${t("Specific instruction {{count}}", { count: 2 })}]
- ✓ [${t("Specific instruction {{count}}", { count: 3 })}]

🎯 ${t("Always prioritize [user's main goal or value].")}`}
                  rows={12}
                />
              </div>
            )}

            {tab === "monetization" && (
              <>
                {/* Tab 4: Monetization */}
                <div className={clsx(styles.field, "row")}>
                  <button
                    onClick={() => {
                      addParams({
                        subscribe: "true",
                        plan:
                          appFormWatcher.tier?.replace("free", "member") ||
                          "member",
                      })
                    }}
                    style={{ color: "var(--accent-6)" }}
                    className={clsx(styles.label, "row", "link")}
                  >
                    <Logo
                      isVivid={appFormWatcher.tier === "pro"}
                      isMagenta={appFormWatcher.tier === "plus"}
                      size={28}
                    />
                    Vex{" "}
                    {t(capitalizeFirstLetter(appFormWatcher.tier || "Free"))}
                  </button>
                  <Controller
                    name="tier"
                    control={control}
                    render={({ field }) => (
                      <Select
                        className={styles.select}
                        id="tier"
                        options={[
                          { value: "free", label: t("Free") },
                          {
                            value: "plus",
                            label: t("{{price}}/month", {
                              price: `€${PLUS_PRICE}`,
                            }),
                          },
                          {
                            value: "pro",
                            label: t("{{price}}/month", {
                              price: `€${PRO_PRICE}`,
                            }),
                          },
                        ]}
                        value={field.value || "free"}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </div>

                {/* Info section for all tiers */}
                <div
                  style={{
                    borderTop: "1px solid var(--shade-2-transparent)",
                    position: "relative",
                    paddingTop: "0.5rem",
                    top: "-0.8rem",
                  }}
                >
                  {appFormWatcher.tier === "free" ? (
                    <>
                      <p>🌍 {t("free_tier_title")}</p>
                      <p>{t("free_tier_description")}</p>
                      <div
                        style={{
                          marginTop: "1rem",
                        }}
                      >
                        <p>✨ {t("free_tier_benefits_title")}</p>
                        <ul>
                          <li>{t("free_tier_benefit_1")}</li>
                          <li>{t("free_tier_benefit_2")}</li>
                          <li>{t("free_tier_benefit_3")}</li>
                        </ul>
                      </div>
                    </>
                  ) : (
                    <div className={clsx("column")}>
                      <p>
                        💎{" "}
                        {appFormWatcher.tier === "plus"
                          ? t("paid_tier_requires_plus")
                          : t("paid_tier_requires_pro")}
                      </p>
                      <p>{t("paid_tier_subscription_required")}</p>
                      <div
                        style={{
                          marginTop: "1rem",
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.85rem",
                            fontWeight: 600,
                          }}
                        >
                          🤝 {t("revenue_share_title")}
                        </p>
                        <p
                          style={{
                            margin: "0.5rem 0 0 0",
                            fontSize: "0.8rem",
                            opacity: 0.9,
                          }}
                        >
                          {appFormWatcher.tier === "plus"
                            ? t("revenue_share_calculation", {
                                price: PLUS_PRICE,
                                earn: (PLUS_PRICE * 0.7).toFixed(2),
                              })
                            : t("revenue_share_calculation", {
                                price: PRO_PRICE,
                                earn: (PRO_PRICE * 0.7).toFixed(2),
                              })}
                        </p>
                        <p
                          style={{
                            margin: "0.25rem 0 0 0",
                            fontSize: "0.75rem",
                            opacity: 0.7,
                          }}
                        >
                          {t("revenue_share_coming_soon")}
                        </p>
                      </div>
                      {appFormWatcher.tier === "pro" && (
                        <div>
                          <p>✨ {t("pro_unlimited_title")}</p>
                          <p>{t("pro_unlimited_description")}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {appFormWatcher.tier !== "free" && (
                  <div className={clsx("row")}>
                    <div>
                      <p>🔑 {t("byok_title")}</p>
                      <p>{t("byok_description")}</p>
                    </div>
                  </div>
                )}
              </>
            )}
            {tab === "api" && (
              <>
                {/* API Keys Section (BYOK) */}
                <div className={clsx("row", styles.apiKeys)}>
                  {/* OpenAI Key */}
                  <div className={clsx("column")}>
                    <label>
                      <OpenAI /> OpenAI (ChatGPT)
                    </label>
                    <Controller
                      name="apiKeys.openai"
                      control={control}
                      render={({ field }) => (
                        <input
                          type="password"
                          placeholder="sk-..."
                          {...field}
                          value={field.value || ""}
                        />
                      )}
                    />
                  </div>

                  {/* Anthropic Key */}
                  <div className={clsx("column")}>
                    <label>
                      <Claude /> Anthropic (Claude)
                    </label>
                    <Controller
                      name="apiKeys.anthropic"
                      control={control}
                      render={({ field }) => (
                        <input
                          type="password"
                          placeholder="sk-ant-..."
                          {...field}
                          value={field.value || ""}
                        />
                      )}
                    />
                  </div>

                  {/* Google Key */}
                  <div className={clsx("column")}>
                    <label>
                      <Gemini /> Google (Gemini)
                    </label>
                    <Controller
                      name="apiKeys.google"
                      control={control}
                      render={({ field }) => (
                        <input
                          type="password"
                          placeholder="AIza..."
                          {...field}
                          value={field.value || ""}
                        />
                      )}
                    />
                  </div>

                  {/* DeepSeek Key - REQUIRED for paid tiers */}
                  <div className={clsx("column")}>
                    <label>
                      <DeepSeek /> DeepSeek{" "}
                      {appFormWatcher.tier !== "free" && (
                        <span style={{ color: "var(--accent-1)" }}>
                          *{t("Required")}
                        </span>
                      )}
                    </label>
                    <Controller
                      name="apiKeys.deepseek"
                      control={control}
                      render={({ field }) => (
                        <input
                          type="password"
                          placeholder="sk-..."
                          required={appFormWatcher.tier !== "free"}
                          style={{
                            border:
                              appFormWatcher.tier !== "free"
                                ? "1px solid var(--accent-1)"
                                : "1px solid var(--shade-2)",
                          }}
                          {...field}
                          value={field.value || ""}
                        />
                      )}
                    />
                  </div>

                  {/* Perplexity Key */}
                  <div className={clsx("column")}>
                    <label>
                      <Perplexity /> Perplexity
                    </label>
                    <Controller
                      name="apiKeys.perplexity"
                      control={control}
                      render={({ field }) => (
                        <input
                          type="password"
                          placeholder="pplx-..."
                          {...field}
                          value={field.value || ""}
                        />
                      )}
                    />
                  </div>

                  {/* Replicate Key */}
                  <div className={clsx("column")}>
                    <label>
                      <Flux /> Replicate (Flux)
                    </label>
                    <Controller
                      name="apiKeys.replicate"
                      control={control}
                      render={({ field }) => (
                        <input
                          type="password"
                          placeholder="r8_..."
                          {...field}
                          value={field.value || ""}
                        />
                      )}
                    />
                  </div>
                </div>{" "}
                {appFormWatcher.tier !== "free" && !isMobileDevice && (
                  <div
                    style={{
                      paddingTop: "0.5rem",
                      borderTop: "1px solid var(--shade-2-transparent)",
                    }}
                  >
                    <p>⚠️ {t("byok_required_title")}</p>
                    <p>{t("byok_required_description")}</p>
                  </div>
                )}
                {appFormWatcher.tier === "free" && (
                  <div
                    style={{
                      marginTop: "1rem",
                      padding: "0.75rem",
                      background: "var(--shade-1)",
                      borderRadius: "20px",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.75rem",
                        opacity: 0.8,
                      }}
                    >
                      💡 {t("byok_optional_free")}
                    </p>
                  </div>
                )}
              </>
            )}

            {tab === "customModel" && (
              <>
                <div className={clsx("row", styles.apiKeys)}>
                  {/* Model Name */}
                  <div className={clsx("column")}>
                    <label>
                      <Brain size={18} /> {t("Model Name")}
                    </label>
                    <Controller
                      name="name"
                      control={customAgentForm.control}
                      render={({ field }) => (
                        <input
                          type="text"
                          {...field}
                          placeholder={t("e.g., my-custom-ai")}
                        />
                      )}
                    />
                    {customAgentForm.formState.errors.name && (
                      <span
                        style={{
                          color: "var(--accent-1)",
                          fontSize: "0.85rem",
                        }}
                      >
                        {customAgentForm.formState.errors.name.message}
                      </span>
                    )}
                  </div>

                  {/* Display Name */}
                  <div className={clsx("column")}>
                    <label>
                      <Sparkles size={18} /> {t("Display Name")}
                    </label>
                    <Controller
                      name="displayName"
                      control={customAgentForm.control}
                      render={({ field }) => (
                        <input
                          type="text"
                          {...field}
                          placeholder={t("e.g., My Custom AI")}
                        />
                      )}
                    />
                  </div>

                  {/* API URL */}
                  <div className={clsx("column")}>
                    <label>
                      <Webhook size={18} /> {t("API URL")}
                    </label>
                    <Controller
                      name="apiURL"
                      control={customAgentForm.control}
                      render={({ field }) => (
                        <input
                          type="url"
                          {...field}
                          placeholder="https://api.openai.com/v1/chat/completions"
                        />
                      )}
                    />
                    {customAgentForm.formState.errors.apiURL && (
                      <span
                        style={{
                          color: "var(--accent-1)",
                          fontSize: "0.85rem",
                        }}
                      >
                        {customAgentForm.formState.errors.apiURL.message}
                      </span>
                    )}
                  </div>

                  {/* Model ID */}
                  <div className={clsx("column")}>
                    <label>
                      <Brain size={18} /> {t("Model ID")}
                    </label>
                    <Controller
                      name="modelId"
                      control={customAgentForm.control}
                      render={({ field }) => (
                        <input
                          type="text"
                          {...field}
                          placeholder="gpt-4, claude-3-opus, etc."
                        />
                      )}
                    />
                  </div>

                  {/* API Key */}
                  <div className={clsx("column")}>
                    <label>
                      <Webhook size={18} /> {t("API Key")}
                    </label>
                    <Controller
                      name="apiKey"
                      control={customAgentForm.control}
                      render={({ field }) => (
                        <input
                          type="password"
                          {...field}
                          placeholder="sk-..."
                        />
                      )}
                    />
                    {customAgentForm.formState.errors.apiKey && (
                      <span
                        style={{
                          color: "var(--accent-1)",
                          fontSize: "0.85rem",
                        }}
                      >
                        {customAgentForm.formState.errors.apiKey.message}
                      </span>
                    )}
                  </div>
                </div>

                <div
                  className="row"
                  style={{ gap: "0.5rem", marginTop: "1rem" }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      customAgentForm.reset()
                      setTab("settings")
                    }}
                    className="inverted"
                  >
                    {t("Cancel")}
                  </button>
                  <button
                    type="button"
                    onClick={customAgentForm.handleSubmit(async (data) => {
                      try {
                        const response = await fetch(`${API_URL}/aiAgents`, {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                          },
                          body: JSON.stringify(data),
                        })

                        if (!response.ok) {
                          const error = await response.json()
                          throw new Error(
                            error.error || "Failed to create model",
                          )
                        }

                        const result = await response.json()
                        toast.success(t("Custom model created"))

                        // Set the newly created model as default
                        appForm?.setValue("defaultModel", result.name)

                        // Reset form and go back
                        customAgentForm.reset()
                        setTab("settings")

                        // Refresh to load the new model
                        window.location.reload()
                      } catch (error) {
                        toast.error(
                          t(
                            error instanceof Error
                              ? error.message
                              : "Failed to create custom model",
                          ),
                        )
                        console.error(error)
                      }
                    })}
                  >
                    {t("Create Model")}
                  </button>
                </div>
              </>
            )}

            <div
              style={{ borderTop: tab === "systemPrompt" ? "none" : undefined }}
              className={styles.footer}
            >
              <>
                <button
                  className={clsx(
                    styles.tabButton,
                    "inverted",
                    "small",
                    tab === "settings" ? styles.currentTab : undefined,
                  )}
                  type="button"
                  onClick={() => {
                    setTab("settings")
                  }}
                >
                  <Settings2 size={16} /> {t("Settings")}
                </button>
              </>
              <button
                className={clsx(
                  styles.tabButton,
                  "small",
                  tab === "extends" ? styles.currentTab : undefined,
                )}
                style={{
                  backgroundColor: "var(--accent-7)",
                }}
                onClick={() => {
                  setTab("extends")
                }}
                type="button"
              >
                <Blocks size={16} />
                {t("Extend")}
              </button>

              <button
                className={clsx(
                  styles.tabButton,
                  "small",
                  tab === "monetization" ? styles.currentTab : undefined,
                )}
                onClick={() => {
                  setTab("monetization")
                }}
                type="button"
                style={{
                  backgroundColor: "var(--accent-4)",
                }}
              >
                <Coins size={16} /> {t("Monetization")}
              </button>

              <button
                className={clsx(
                  styles.tabButton,
                  "small",
                  tab === "api" ? styles.currentTab : undefined,
                )}
                onClick={() => {
                  setTab("api")
                }}
                type="button"
                style={{
                  backgroundColor: "var(--accent-1)",
                }}
              >
                <Webhook size={16} /> {t("API")}
              </button>
              {tab !== "systemPrompt" && (
                <button
                  onClick={() => {
                    setTab("systemPrompt")
                  }}
                  className={clsx(styles.tabButton, "small")}
                  type="button"
                  style={{
                    backgroundColor:
                      !appFormWatcher.name || !!errors.name?.message
                        ? "var(--accent-0)"
                        : undefined,
                    color: !appFormWatcher.name ? "#fff" : undefined,
                  }}
                  title={
                    errors.name?.message
                      ? t("Fix name errors first")
                      : undefined
                  }
                >
                  <Brain size={16} /> {t("System Prompt")}
                </button>
              )}

              {appFormWatcher.name && tab === "systemPrompt" && (
                <button
                  className={clsx(styles.tabButton, "inverted")}
                  type="button"
                  onClick={() => {
                    if (!appFormWatcher.systemPrompt) {
                      toast.error(t("System prompt is required"))
                      return
                    }
                    setTab("settings")
                    setAppStatus({
                      part: "title",
                    })
                  }}
                >
                  <Img
                    style={{ marginLeft: "auto" }}
                    showLoading={false}
                    src={`${FRONTEND_URL}/images/pacman/heart.png`}
                    alt="Heart"
                    width={18}
                    height={18}
                  />
                  {t("Continue")}
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}
