"use client"

import React, { useEffect, useState } from "react"
import { type appFormData } from "../schemas/appSchema"
import clsx from "clsx"
import { useAppContext } from "../context/AppContext"
import Modal from "../Modal"
import {
  Blocks,
  Boxes,
  Brain,
  Coins,
  GlobeLock,
  Globe,
  MicVocal,
  Settings2,
  Sparkles,
  ThermometerSun,
  VectorSquare,
  Webhook,
} from "../icons"
import Img from "../Image"
import {
  capitalizeFirstLetter,
  FRONTEND_URL,
  PLUS_PRICE,
  PRO_PRICE,
  API_URL,
  isE2E,
  isDevelopment,
} from "../utils"
import Select from "../Select"
import Checkbox from "../Checkbox"
import ColorScheme from "../ColorScheme"
import { useHasHydrated } from "../hooks"
import { Controller, useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { customZodResolver } from "../utils/customZodResolver"
import {
  createCustomAiAgentSchema,
  type CreateCustomAiAgent,
} from "../schemas/agentSchema"
import {
  DeepSeek,
  OpenAI,
  Claude,
  Gemini,
  Flux,
  Perplexity,
  OpenRouter,
} from "../icons"
import {
  Button,
  Div,
  Input,
  Label,
  usePlatform,
  TextArea,
  P,
  Span,
} from "../platform"
import {
  useChat,
  useNavigationContext,
  useApp,
  useAuth,
  type TabType,
} from "../context/providers"
import ThemeSwitcher from "../ThemeSwitcher"
import { useTheme } from "../platform"
import { useAgentStyles } from "./Agent.styles"
import { useStyles } from "../context/StylesContext"
import { TribeCalculator } from "../TribeCalculator"

export default function Agent({
  style,
  dataTestId,
}: {
  initialData?: Partial<appFormData>
  isUpdate?: boolean
  style?: React.CSSProperties
  dataTestId?: string
}) {
  const { device } = usePlatform()
  const styles = useAgentStyles()
  const { utilities } = useStyles()
  const { t } = useAppContext()
  const { chrry, baseApp, token, accountApp, user } = useAuth()

  const {
    defaultExtends,
    app,
    apps,
    appForm,
    appFormWatcher,
    appStatus,
    setAppStatus,
    ...appContext
  } = useApp()

  const { aiAgents } = useChat()

  const { removeParams, searchParams, addParams } = useNavigationContext()

  const { isMobileDevice } = useTheme()

  const {
    register,
    watch,
    control,
    formState: { errors },
  } = appForm!

  // Custom agent form
  const customAgentForm = useForm<CreateCustomAiAgent>({
    resolver: customZodResolver(createCustomAiAgentSchema),
    defaultValues: {
      name: "",
      apiKey: "",
      displayName: "",
      modelId: "",
      apiURL: "",
    },
  })

  const trialInitial = searchParams.get("trial") as "tribe" | "moltBook"
  const [trial, setTrial] = useState<"tribe" | "moltBook">(trialInitial)

  useEffect(() => {
    setTrial(trialInitial)
  }, [trialInitial])

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

  const isLocationRequired = appFormWatcher?.highlights?.some(
    (highlight) =>
      highlight?.content?.includes("{{city}}") ||
      highlight?.content?.includes("{{country}}") ||
      highlight?.content?.includes("{{location}}"),
  )

  const isWeatherRequired = appFormWatcher?.highlights?.some(
    (highlight) =>
      highlight?.content?.includes("{{weather}}") ||
      highlight?.content?.includes("{{temp}}"),
  )

  const extendetApps = apps.filter((app) =>
    appForm?.watch("extends")?.includes(app.id),
  )

  const calendarRequiredApp = extendetApps.find(
    (app) => app.tools?.includes("calendar") && app?.id !== chrry?.id,
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

  const [revenueShareMode, setRevenueShareMode] = useState(false)

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

  const isReplicateRequired =
    appForm?.watch("capabilities")?.imageGeneration &&
    !appFormWatcher.apiKeys?.replicate?.trim()

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
    if (JSON.stringify(currentTools) !== JSON.stringify(newTools)) {
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

  const tab = appContext.tab
  const setTabInternal = appContext.setTab

  const isModalOpen = appContext.isAgentModalOpen
  const setIsModalOpenInternal = appContext.setIsAgentModalOpen

  useEffect(() => {
    if (isModalOpen && device === "desktop" && !appFormWatcher.name) {
      setTimeout(() => {
        if (typeof document !== "undefined") {
          document.getElementById("name")?.focus()
        }
      }, 100)
    }
  }, [isModalOpen])

  const setIsModalOpen = (open: boolean) => {
    if (!open) removeParams("tab")
    if (open === isModalOpen) return

    let hasErrors = false

    // Only validate when actually closing (transitioning from open to closed)
    if (!open && isModalOpen) {
      if (!appFormWatcher.name || appFormWatcher.name.length < 3) {
        toast.error(t("Name: minimum 3 characters"))
        return
      }

      if (appFormWatcher.name.length > 8) {
        toast.error(t("Name: maximum 8 characters"))
        return
      }
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

      // Validate API keys based on tier and capabilities
      const tier = appFormWatcher.tier || "free"
      const capabilities = appFormWatcher.capabilities
      const apiKeys = appFormWatcher.apiKeys || {}
      const tools = appFormWatcher.tools || []

      // For paid tiers (plus/pro), OpenRouter is REQUIRED
      // If no OpenRouter API key, automatically set to free tier
      if (tier !== "free") {
        if (!apiKeys.openrouter?.trim()) {
          appForm.setValue("tier", "free")
        } else {
          if ((tier === "plus" || tier === "pro") && capabilities) {
            // Image generation requires OpenAI
            if (isReplicateRequired) {
              toast.error(
                t(
                  "Image generation is enabled. Replicate API key is required for paid tiers",
                ),
              )
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

  const setTab = (value: TabType) => {
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
      removeParams("tab")
    }
  }

  return (
    <Div>
      <Button
        data-testid="app-settings-button"
        style={{
          ...styles.settingsButton.style,
          ...utilities.small.style,
        }}
        onClick={() => {
          setAppStatus({
            part: "settings",
          })
        }}
      >
        <Settings2 size={18} /> {t("Settings")}
      </Button>
      {hasHydrated && (
        <Modal
          dataTestId="agent-modal"
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
              <Div style={styles.titleContainer.style}>
                <Input
                  data-testid={
                    dataTestId ? `${dataTestId}-name-input` : "name-input"
                  }
                  autoComplete="false"
                  {...register("name")}
                  title={t("Name your app......")}
                  id="name"
                  className={clsx(
                    styles.titleInput,
                    errors.name?.message && styles.error.style,
                  )}
                  type="text"
                  placeholder={t("Name your app......")}
                />
                {!appFormWatcher.name ? (
                  <Span
                    data-testid="name-error-message"
                    style={styles.errorMessage.style}
                  >
                    {t("Minimum 3 characters")}
                  </Span>
                ) : errors.name?.message ? (
                  <Span
                    data-testid="name-error-message"
                    style={styles.errorMessage.style}
                  >
                    {t(errors.name.message)}
                  </Span>
                ) : null}
              </Div>
            ) : (
              t("System Prompt")
            )
          }
          isModalOpen={isModalOpen}
          onToggle={(open) => {
            setIsModalOpen(open)
          }}
          style={{ ...styles.modal.style, ...style }}
        >
          <Div style={styles.modalContent.style}>
            {/* Form */}
            {tab === "settings" && (
              <Div>
                {/* Tab 1: Basic Info */}

                {/* Tab 2: Personality */}
                <Div style={styles.tabContent.style}>
                  <Div
                    style={{ ...utilities.row.style, ...styles.bordered.style }}
                  >
                    <Controller
                      name={"backgroundColor"}
                      control={control}
                      render={({ field }) => (
                        <Div
                          style={{
                            ...utilities.row.style,
                          }}
                        >
                          <ThemeSwitcher
                            dataTestId="agent-theme"
                            size={26}
                            onThemeChange={(theme) => {
                              field.onChange(theme)
                            }}
                          />
                          {t("Theme & Color")}
                        </Div>
                      )}
                    />

                    <Div
                      style={{
                        ...styles.colorOptions.style,
                        ...utilities.right.style,
                      }}
                    >
                      <Controller
                        name={"themeColor"}
                        control={control}
                        render={({ field }) => (
                          <ColorScheme
                            dataTestId="agent-color-scheme"
                            onChange={field.onChange}
                          />
                        )}
                      />
                    </Div>
                  </Div>
                  <Div
                    style={{
                      ...styles.field.style,
                      ...utilities.row.style,
                      ...styles.bordered.style,
                    }}
                  >
                    <Label
                      style={{ ...styles.label.style, ...utilities.row.style }}
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
                    </Label>
                    <Controller
                      name="defaultModel"
                      control={control}
                      render={({ field }) => (
                        <Select
                          style={{
                            ...styles.select.style,
                            ...utilities.right.style,
                          }}
                          data-testid="default-model-select"
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
                  </Div>

                  <Div
                    style={{
                      ...styles.field.style,
                      ...utilities.row.style,
                      ...styles.bordered.style,
                    }}
                  >
                    <Label
                      style={{ ...styles.label.style, ...utilities.row.style }}
                      htmlFor="tone"
                    >
                      <MicVocal size={18} color="var(--accent-6)" />
                      {t("Tone")}
                    </Label>
                    <Controller
                      name="tone"
                      control={control}
                      render={({ field }) => (
                        <Select
                          style={styles.select.style}
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
                  </Div>

                  <Div
                    style={{
                      ...styles.field.style,
                      ...utilities.row.style,
                      ...styles.bordered.style,
                    }}
                  >
                    <Label
                      style={{ ...styles.label.style, ...utilities.row.style }}
                      htmlFor="temperature"
                    >
                      <ThermometerSun size={18} color="var(--accent-6)" />
                      {t("Temperature")}: {watch("temperature")}
                    </Label>
                    <Input
                      style={styles.range.style}
                      id="temperature"
                      data-testid="temperature-input"
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      {...register("temperature", { valueAsNumber: true })}
                    />
                  </Div>

                  <Div
                    style={{ ...styles.field.style, ...styles.bordered.style }}
                  >
                    <Label
                      style={{ ...styles.label.style, ...utilities.row.style }}
                      htmlFor="placeholder"
                    >
                      <Sparkles
                        size={20}
                        color="var(--accent-1)"
                        fill="var(--accent-1)"
                      />
                      {t("Default Input Placeholder")}
                    </Label>
                    <Input
                      style={styles.placeholder.style}
                      id="placeholder"
                      data-testid="placeholder-input"
                      placeholder={t(
                        `${t("e.g., Plan your dream vacation with me")} ✈️`,
                      )}
                      type="text"
                      {...register("placeholder")}
                    />
                  </Div>
                  {/* Tab 3: Capabilities */}
                  <Div
                    style={{ ...styles.field.style, ...styles.lastChild.style }}
                  >
                    <Label
                      style={{ ...styles.label.style, ...utilities.row.style }}
                      htmlFor="capabilities"
                    >
                      <Boxes size={18} color="var(--accent-6)" />
                      {t("Capabilities")}
                    </Label>
                    <Div style={{ ...utilities.row.style }}>
                      <Controller
                        name="capabilities.webSearch"
                        control={control}
                        render={({ field }) => (
                          <Label>
                            <Checkbox
                              dataTestId="webSearch-checkbox"
                              checked={field.value}
                              onChange={(checked) => {
                                if (aiAgent?.capabilities?.webSearch === true) {
                                  toast.error(
                                    t("Web Search required by {{model}}", {
                                      model: aiAgent.name,
                                    }),
                                  )
                                  return
                                }
                                field.onChange(checked)
                              }}
                            >
                              <Span>{t("Web Search")}</Span>
                            </Checkbox>
                          </Label>
                        )}
                      />
                      <Controller
                        name="capabilities.image"
                        control={control}
                        render={({ field }) => (
                          <Label>
                            <Checkbox
                              dataTestId="image-checkbox"
                              checked={field.value}
                              onChange={(checked) => {
                                if (aiAgent?.capabilities?.image === true) {
                                  toast.error(
                                    t("Image Analysis required by {{model}}", {
                                      model: aiAgent.name,
                                    }),
                                  )
                                  return
                                }
                                field.onChange(checked)
                              }}
                            >
                              <Span>{t("Image Analysis")}</Span>
                            </Checkbox>
                          </Label>
                        )}
                      />
                      <Controller
                        name="capabilities.imageGeneration"
                        control={control}
                        render={({ field }) => (
                          <Label>
                            <Checkbox
                              dataTestId="imageGeneration-checkbox"
                              checked={field.value}
                              onChange={(checked) => {
                                if (
                                  aiAgent?.capabilities?.imageGeneration ===
                                  true
                                ) {
                                  toast.error(
                                    t(
                                      "Image Generation required by {{model}}",
                                      {
                                        model: aiAgent.name,
                                      },
                                    ),
                                  )
                                  return
                                }
                                field.onChange(checked)
                              }}
                            >
                              <Span>{t("ImageGeneration")}</Span>
                            </Checkbox>
                          </Label>
                        )}
                      />
                      <Controller
                        name="capabilities.pdf"
                        control={control}
                        render={({ field }) => (
                          <Label>
                            <Checkbox
                              dataTestId="pdf-checkbox"
                              checked={field.value}
                              onChange={(checked) => {
                                if (aiAgent?.capabilities?.pdf === true) {
                                  toast.error(
                                    t("File Analysis required by {{model}}", {
                                      model: aiAgent.name,
                                    }),
                                  )
                                  return
                                }
                                field.onChange(checked)
                              }}
                            >
                              <Span>{t("File Analysis")}</Span>
                            </Checkbox>
                          </Label>
                        )}
                      />
                      <Controller
                        name="capabilities.audio"
                        control={control}
                        render={({ field }) => (
                          <Label>
                            <Checkbox
                              checked={field.value}
                              dataTestId="audio-checkbox"
                              onChange={(checked) => {
                                if (aiAgent?.capabilities?.audio === true) {
                                  toast.error(
                                    t("Voice required by {{model}}", {
                                      model: aiAgent.name,
                                    }),
                                  )
                                  return
                                }
                                field.onChange(checked)
                              }}
                            >
                              <Span>{t("Voice")}</Span>
                            </Checkbox>
                          </Label>
                        )}
                      />
                      <Controller
                        name="capabilities.video"
                        control={control}
                        render={({ field }) => (
                          <Label>
                            <Checkbox
                              dataTestId="video-checkbox"
                              checked={field.value}
                              onChange={(checked) => {
                                if (aiAgent?.capabilities?.video === true) {
                                  toast.error(
                                    t("Video required by {{model}}", {
                                      model: aiAgent.name,
                                    }),
                                  )
                                  return
                                }
                                field.onChange(checked)
                              }}
                            >
                              <Span>{t("Video")}</Span>
                            </Checkbox>
                          </Label>
                        )}
                      />
                      <Controller
                        name="capabilities.codeExecution"
                        control={control}
                        render={({ field }) => (
                          <Label>
                            <Checkbox
                              dataTestId="codeExecution-checkbox"
                              checked={field.value}
                              onChange={(checked) => {
                                if (
                                  aiAgent?.capabilities?.codeExecution === true
                                ) {
                                  toast.error(
                                    t("Code Execution required by {{model}}", {
                                      model: aiAgent.name,
                                    }),
                                  )
                                  return
                                }
                                field.onChange(checked)
                              }}
                            >
                              <Span>{t("Code Execution")}</Span>
                            </Checkbox>
                          </Label>
                        )}
                      />
                    </Div>
                  </Div>
                </Div>
              </Div>
            )}
            {tab === "extends" && (
              <>
                <Div>
                  <Span
                    style={{
                      ...styles.label.style,
                      ...utilities.row.style,
                      ...styles.firstChild.style,
                      ...styles.bordered.style,
                    }}
                  >
                    <Blocks size={18} color="var(--accent-6)" />
                    {t("Extend")}
                  </Span>
                  <Div
                    style={{ ...styles.field.style, ...utilities.row.style }}
                  >
                    <Controller
                      name="extends"
                      control={control}
                      render={({ field }) => {
                        // Get store-based apps from Chrry store
                        const storeApps = (baseApp?.store?.apps || []).filter(
                          (item) => item.id !== app?.id,
                        )

                        return (
                          <>
                            {/* Store-based apps */}
                            {storeApps.map((item) => {
                              // Chrry is required (checked and disabled)
                              const isChrry = item.id === chrry?.id
                              // Vex is optional (checked by default but can be unchecked)
                              const isBaseApp = item.id === baseApp?.id

                              const checked =
                                isChrry ||
                                isBaseApp ||
                                !!appFormWatcher?.extends?.includes(item.id)
                              return (
                                <Label key={item.id || item.name}>
                                  <Checkbox
                                    data-testid={`extends-checkbox-${item.name.toLowerCase()}`}
                                    checked={checked}
                                    // disabled={isDisabled || isChrry}
                                    onChange={(isChecked) => {
                                      if (checked) {
                                        if (isChrry) {
                                          toast.error(
                                            `${item.name} is required and cannot be removed.`,
                                          )

                                          return
                                        }

                                        if (isBaseApp) {
                                          toast.error(
                                            `${item.name} is your base app.`,
                                          )

                                          return
                                        }
                                      }
                                      const newValue = isChecked
                                        ? [...(field.value || []), item.id]
                                        : field.value?.filter(
                                            (v) => v !== item.id,
                                          )
                                      field.onChange(newValue)
                                    }}
                                  >
                                    {item.icon} {item.name}
                                  </Checkbox>
                                </Label>
                              )
                            })}
                          </>
                        )
                      }}
                    />
                  </Div>
                  <Div
                    style={{
                      ...styles.field.style,
                      ...utilities.row.style,
                      ...styles.bordered.style,
                    }}
                  >
                    <Label
                      style={{
                        ...styles.label.style,
                        ...styles.field.style,
                        ...utilities.row.style,
                      }}
                      htmlFor="visibility"
                    >
                      {watch("visibility") === "public" ? (
                        <Globe size={18} color="var(--accent-6)" />
                      ) : watch("visibility") === "unlisted" ? (
                        <GlobeLock size={18} color="var(--accent-6)" />
                      ) : (
                        <GlobeLock size={18} color="var(--shade-3)" />
                      )}
                      {t("Visibility")}
                    </Label>
                    <Controller
                      name="visibility"
                      control={control}
                      render={({ field }) => (
                        <Select
                          dataTestId="visibility-select"
                          style={{ ...styles.select.style }}
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
                  </Div>

                  <Span
                    style={{
                      ...styles.label.style,
                      ...styles.field.style,
                      ...utilities.row.style,
                      ...styles.bordered.style,
                    }}
                  >
                    <VectorSquare size={18} color="var(--accent-6)" />
                    {t("Tools")}
                  </Span>
                  <Div
                    style={{
                      ...styles.field.style,
                      ...utilities.row.style,
                      ...styles.lastChild.style,
                    }}
                  >
                    <Controller
                      name="tools"
                      control={control}
                      render={({ field }) => (
                        <>
                          <Label>
                            <Checkbox
                              dataTestId="calendar-checkbox"
                              checked={
                                field.value?.includes("calendar") || false
                              }
                              // disabled={!!calendarRequiredApp}
                              onChange={(checked) => {
                                if (calendarRequiredApp) {
                                  toast.error(
                                    t(
                                      "Calendar required because you are using {{app}}",
                                      {
                                        app: calendarRequiredApp.name,
                                      },
                                    ),
                                  )
                                  return
                                }
                                const newValue = checked
                                  ? [...(field.value || []), "calendar"]
                                  : field.value?.filter((v) => v !== "calendar")
                                field.onChange(newValue)
                              }}
                            >
                              📅 {t("Calendar")}
                            </Checkbox>
                          </Label>
                          <Label>
                            <Checkbox
                              dataTestId="location-checkbox"
                              checked={
                                field.value?.includes("location") || false
                              }
                              onChange={(checked) => {
                                if (isLocationRequired || locationRequiredApp) {
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
                                  return
                                }
                                const newValue = checked
                                  ? [...(field.value || []), "location"]
                                  : field.value?.filter((v) => v !== "location")
                                field.onChange(newValue)
                              }}
                            >
                              🌍 {t("Location")}
                            </Checkbox>
                          </Label>
                          <Label>
                            <Checkbox
                              checked={
                                field.value?.includes("weather") || false
                              }
                              dataTestId="weather-checkbox"
                              onChange={(checked) => {
                                if (isWeatherRequired || weatherRequiredApp) {
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
                                  return
                                }
                                const newValue = checked
                                  ? [...(field.value || []), "weather"]
                                  : field.value?.filter((v) => v !== "weather")
                                field.onChange(newValue)
                              }}
                            >
                              ☁️ {t("Weather")}
                            </Checkbox>
                          </Label>
                        </>
                      )}
                    />
                  </Div>
                </Div>
              </>
            )}

            {tab === "systemPrompt" && (
              <Div
                style={{
                  ...styles.field.style,
                  ...styles.firstChild.style,
                  ...styles.lastChild.style,
                }}
              >
                <TextArea
                  data-testid="system-prompt-textarea"
                  id="systemPrompt"
                  {...register("systemPrompt")}
                  placeholder={
                    trial === "tribe"
                      ? `🪢 ${t("Welcome to Tribe! Create your AI agent to join the conversation.")}

🎁 ${t("Trial Benefits:")}
- 📝 ${t("5 free posts to test Tribe")}
- ⏱️ ${t("30-minute cooldown between posts")}
- 🤖 ${t("Your agent can interact with other AI agents")}
- � ${t("Posts visible across Wine ecosystem")}

✨ ${t("Agent Personality:")}
- 💬 ${t("Define your agent's communication style")}
- �🎯 ${t("What topics does your agent discuss?")}
- 🧠 ${t("How should your agent respond to others?")}

📋 ${t("Example:")}
"${t("You are a helpful coding assistant who loves discussing JavaScript frameworks and best practices. You're friendly, concise, and always provide code examples.")}"

🚀 ${t("Ready? Describe your agent's personality and purpose!")}`
                      : `🎯 ${t("You are a specialized AI assistant with expertise in [your domain].")}

✨ ${t("Your key traits:")}
- 💬 ${t("Communication style: [professional, friendly, technical, etc.]")}
- 🧠 ${t("Approach: [step-by-step, creative, analytical, etc.]")}
- 🎨 ${t("Tone: [formal, casual, encouraging, etc.]")}

📋 ${t("When responding:")}
- ✓ [${t("Specific instruction {{count}}", { count: 1 })}]
- ✓ [${t("Specific instruction {{count}}", { count: 2 })}]
- ✓ [${t("Specific instruction {{count}}", { count: 3 })}]

🎯 ${t("Always prioritize [user's main goal or value].")}`
                  }
                  rows={12}
                />
              </Div>
            )}

            {tab === "monetization" && (
              <>
                {/* Tab 4: Monetization */}
                <Div
                  style={{
                    ...styles.field.style,
                    ...styles.firstChild.style,
                    ...utilities.row.style,
                    ...styles.bordered.style,
                  }}
                >
                  <Button
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
                    <Img
                      icon={
                        appFormWatcher.tier === "pro"
                          ? "strawberry"
                          : appFormWatcher.tier === "free"
                            ? "chrry"
                            : "raspberry"
                      }
                      size={28}
                    />
                    {t(capitalizeFirstLetter(appFormWatcher.tier || "Free"))}
                  </Button>
                  <Controller
                    name="tier"
                    control={control}
                    render={({ field }) => (
                      <Select
                        dataTestId="tier-select"
                        style={{ ...styles.select.style }}
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
                </Div>

                {/* Info section for all tiers */}
                <Div
                  style={{
                    ...styles.field.style,
                    ...styles.lastChild.style,
                  }}
                >
                  {appFormWatcher.tier === "free" ? (
                    <Div>
                      <p>🌍 {t("free_tier_title")}</p>
                      <p>{t("free_tier_description")}</p>
                      <Div
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
                      </Div>
                    </Div>
                  ) : (
                    <Div style={{ ...utilities.column.style }}>
                      <P>
                        💎{" "}
                        {appFormWatcher.tier === "plus"
                          ? t("paid_tier_requires_plus")
                          : t("paid_tier_requires_pro")}
                      </P>
                      <P>{t("paid_tier_subscription_required")}</P>
                      {revenueShareMode && (
                        <Div
                          style={{
                            marginTop: "1rem",
                            padding: ".75rem",
                            backgroundColor: "var(--shade-05)",
                            borderRadius: "12px",
                            border: "1px solid var(--shade-2)",
                          }}
                        >
                          <P
                            style={{
                              margin: 0,
                              fontSize: "0.9rem",
                              marginBottom: "0.5rem",
                            }}
                          >
                            🍒 REVENUE SHARE MODEL (70% to App Creators) - Q1
                            2026
                          </P>
                          <Div
                            style={{
                              fontSize: "0.85rem",
                              lineHeight: "1.6",
                              color: "var(--shade-7)",
                            }}
                          >
                            <P style={{ margin: "0.5rem 0" }}>
                              <strong>Revenue Source:</strong> When users
                              subscribe to Plus (€{PLUS_PRICE}/mo) or Pro (€
                              {PRO_PRICE}/mo) plans AND bring their own API keys
                              (OpenAI, Anthropic, Replicate, etc.), 70% of their
                              subscription fee is distributed to app creators
                              based on usage.
                            </P>
                            <P style={{ margin: "0.5rem 0" }}>
                              <strong>How It Works:</strong> Platform tracks
                              which apps each user interacts with (message
                              count, session duration, feature usage). At
                              month-end, the user's subscription fee is split:
                              30% to platform, 70% distributed proportionally to
                              app creators based on that user's app usage.
                            </P>
                            <P style={{ margin: "0.5rem 0" }}>
                              <strong>Example:</strong> User pays €{PLUS_PRICE}
                              /month Plus plan + uses own OpenAI key. They spend
                              60% of time in App A, 40% in App B. Distribution:
                              €{(PLUS_PRICE * 0.3).toFixed(2)} to platform, €
                              {(PLUS_PRICE * 0.7 * 0.6).toFixed(2)} to App A
                              creator (60% of €{(PLUS_PRICE * 0.7).toFixed(2)}
                              ), €{(PLUS_PRICE * 0.7 * 0.4).toFixed(2)} to App B
                              creator (40% of €{(PLUS_PRICE * 0.7).toFixed(2)}).
                            </P>
                            <P style={{ margin: "0.5rem 0" }}>
                              <strong>Key Point:</strong> Revenue share only
                              applies when users bring their own API keys. If
                              users rely on platform-provided API credits,
                              standard platform pricing applies (no revenue
                              share).
                            </P>
                            <P style={{ margin: "0.5rem 0" }}>
                              <strong>Status:</strong> Implementation planned
                              for Q1 2026. Tracking infrastructure and payout
                              system in development.
                            </P>
                            <P
                              style={{
                                margin: "0.5rem 0 0 0",
                                fontStyle: "italic",
                                opacity: 0.8,
                              }}
                            >
                              This creates an economic incentive for building
                              high-quality, useful apps that people want to use
                              regularly.
                            </P>
                          </Div>{" "}
                        </Div>
                      )}
                      {appFormWatcher.tier === "pro" && (
                        <Div>
                          <P>✨ {t("pro_unlimited_title")}</P>
                          <P>{t("pro_unlimited_description")}</P>
                        </Div>
                      )}
                    </Div>
                  )}
                  {!user && appFormWatcher.tier && (
                    <Div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: ".75rem",
                      }}
                    >
                      <Button
                        className="inverted"
                        onClick={() => {
                          addParams({
                            signIn: "login",
                            callbackUrl: `${FRONTEND_URL}/?settings=true&tab=tribe`,
                          })
                        }}
                        style={{
                          marginTop: ".3rem",
                          ...utilities.inverted.style,
                          ...utilities.small.style,
                        }}
                      >
                        <>
                          <Img logo="chrry" size={20} />
                          {t("Join to use {{tier}}", {
                            tier: capitalizeFirstLetter(
                              appFormWatcher.tier || "",
                            ),
                          })}
                        </>
                      </Button>
                      <Button
                        className="link"
                        onClick={() => {
                          setRevenueShareMode(!revenueShareMode)
                        }}
                        style={{
                          ...utilities.link.style,
                        }}
                      >
                        {t(revenueShareMode ? "Show less" : "Learn more 🍒")}
                      </Button>
                    </Div>
                  )}
                  {!accountApp && appFormWatcher.tier === "free" ? (
                    <P
                      style={{
                        color: "var(--shade-6)",
                        position: "relative",
                        bottom: "4px",
                      }}
                    >
                      *Start as guest. Your data will be preserved when you sign
                      up.
                    </P>
                  ) : (
                    ""
                  )}
                </Div>
                {appFormWatcher.tier !== "free" && (
                  <Div style={{ ...styles.field.style }}>
                    <Div>
                      <P>🔑 {t("byok_title")}</P>
                      <P>{t("byok_description")}</P>
                    </Div>
                  </Div>
                )}
              </>
            )}
            {tab === "api" && (
              <>
                {/* API Keys Section (BYOK) */}
                <Div style={{ ...utilities.column.style }}>
                  <Label>
                    <OpenRouter /> OpenRouter
                  </Label>
                  <Controller
                    name="apiKeys.openrouter"
                    control={control}
                    render={({ field }) => (
                      <Input
                        dataTestId="openrouter-api-key"
                        type="password"
                        placeholder="sk-..."
                        {...field}
                        value={field.value || ""}
                        style={{
                          border:
                            appFormWatcher.tier !== "free"
                              ? "1px solid var(--accent-1)"
                              : "1px solid var(--shade-2)",
                        }}
                      />
                    )}
                  />
                  {appFormWatcher.tier !== "free" && (
                    <Span
                      data-testid="openrouter-api-key-required"
                      style={{ color: "var(--accent-1)" }}
                    >
                      *{t("Required")}
                    </Span>
                  )}
                </Div>
                <Div
                  style={{ ...styles.apiKeys.style, ...utilities.row.style }}
                >
                  {/* OpenRouter Key */}

                  {/* OpenAI Key */}
                  <Div style={{ ...utilities.column.style }}>
                    <Label>
                      <OpenAI /> OpenAI (ChatGPT)
                    </Label>
                    <Controller
                      name="apiKeys.openai"
                      control={control}
                      render={({ field }) => (
                        <Input
                          dataTestId="openai-api-key"
                          type="password"
                          placeholder="sk-..."
                          {...field}
                          value={field.value || ""}
                        />
                      )}
                    />
                  </Div>

                  {/* Anthropic Key */}
                  <Div style={{ ...utilities.column.style }}>
                    <Label>
                      <Claude /> Anthropic (Claude)
                    </Label>
                    <Controller
                      name="apiKeys.anthropic"
                      control={control}
                      render={({ field }) => (
                        <Input
                          dataTestId="anthropic-api-key"
                          type="password"
                          placeholder="sk-ant-..."
                          {...field}
                          value={field.value || ""}
                        />
                      )}
                    />
                  </Div>

                  {/* Google Key */}
                  <Div style={{ ...utilities.column.style }}>
                    <Label>
                      <Gemini /> Google (Gemini)
                    </Label>
                    <Controller
                      name="apiKeys.google"
                      control={control}
                      render={({ field }) => (
                        <Input
                          dataTestId="google-api-key"
                          type="password"
                          placeholder="AIza..."
                          {...field}
                          value={field.value || ""}
                        />
                      )}
                    />
                  </Div>

                  {/* OpenRouter Key - REQUIRED for paid tiers */}
                  <Div style={{ ...utilities.column.style }}>
                    <Label>
                      <DeepSeek /> DeepSeek{" "}
                    </Label>
                    <Controller
                      name="apiKeys.deepseek"
                      control={control}
                      render={({ field }) => (
                        <Input
                          dataTestId="deepseek-api-key"
                          type="password"
                          placeholder="sk-deepseek-..."
                          required={appFormWatcher.tier !== "free"}
                          {...field}
                          value={field.value || ""}
                        />
                      )}
                    />
                  </Div>

                  {/* Perplexity Key */}
                  <Div style={{ ...utilities.column.style }}>
                    <Label>
                      <Perplexity /> Perplexity
                    </Label>
                    <Controller
                      name="apiKeys.perplexity"
                      control={control}
                      render={({ field }) => (
                        <Input
                          dataTestId="perplexity-api-key"
                          type="password"
                          placeholder="pplx-..."
                          {...field}
                          value={field.value || ""}
                        />
                      )}
                    />
                  </Div>

                  {/* Replicate Key */}
                  <Div style={{ ...utilities.column.style }}>
                    <Label>
                      <Flux /> Replicate (Flux)
                    </Label>
                    <Controller
                      name="apiKeys.replicate"
                      control={control}
                      render={({ field }) => (
                        <Input
                          dataTestId="replicate-api-key"
                          type="password"
                          data-required={isReplicateRequired}
                          placeholder={
                            isReplicateRequired
                              ? t("Required or disable image generation")
                              : "r8_..."
                          }
                          {...field}
                          value={field.value || ""}
                          style={{
                            borderColor:
                              appFormWatcher.tier !== "free" &&
                              appFormWatcher?.capabilities?.imageGeneration
                                ? "var(--accent-1)"
                                : "var(--shade-2)",
                          }}
                        />
                      )}
                    />
                  </Div>
                </Div>
                {appFormWatcher.tier !== "free" && !isMobileDevice && (
                  <Div
                    style={{
                      paddingTop: "0.5rem",
                      borderTop: "1px solid var(--shade-2-transparent)",
                    }}
                  >
                    <p>⚠️ {t("byok_required_title")}</p>
                    <p>
                      {t(
                        "OpenRouter is required. Chrry uses your API keys, you pay API costs, and earn 70% of subscription revenue (Chrry keeps 30% for infrastructure).",
                      )}
                    </p>
                  </Div>
                )}
                {appFormWatcher.tier === "free" && (
                  <Div
                    style={{
                      marginTop: "1rem",
                      padding: "0.75rem",
                      background: "var(--shade-1)",
                      borderRadius: "20px",
                    }}
                  >
                    <P
                      style={{
                        margin: 0,
                        fontSize: "0.75rem",
                        opacity: 0.8,
                      }}
                    >
                      💡 {t("byok_optional_free")}
                    </P>
                  </Div>
                )}
              </>
            )}

            {tab === "customModel" && (
              <>
                <Div
                  style={{ ...utilities.row.style, ...styles.apiKeys.style }}
                >
                  {/* Model Name */}
                  <Div style={{ ...utilities.column.style }}>
                    <Label>
                      <Brain size={18} /> {t("Model Name")}
                    </Label>
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
                      <Span
                        style={{
                          color: "var(--accent-1)",
                          fontSize: "0.85rem",
                        }}
                      >
                        {customAgentForm.formState.errors.name.message}
                      </Span>
                    )}
                  </Div>

                  {/* Display Name */}
                  <Div style={{ ...utilities.column.style }}>
                    <Label>
                      <Sparkles size={18} /> {t("Display Name")}
                    </Label>
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
                  </Div>

                  {/* API URL */}
                  <Div style={{ ...utilities.column.style }}>
                    <Label>
                      <Webhook size={18} /> {t("API URL")}
                    </Label>
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
                      <Span
                        style={{
                          color: "var(--accent-1)",
                          fontSize: "0.85rem",
                        }}
                      >
                        {customAgentForm.formState.errors.apiURL.message}
                      </Span>
                    )}
                  </Div>

                  {/* Model ID */}
                  <Div style={{ ...utilities.column.style }}>
                    <Label>
                      <Brain size={18} /> {t("Model ID")}
                    </Label>
                    <Controller
                      name="modelId"
                      control={customAgentForm.control}
                      render={({ field }) => (
                        <Input
                          type="text"
                          {...field}
                          placeholder="gpt-4, claude-3-opus, etc."
                        />
                      )}
                    />
                  </Div>

                  {/* API Key */}
                  <Div style={{ ...utilities.column.style }}>
                    <Label>
                      <Webhook size={18} /> {t("API Key")}
                    </Label>
                    <Controller
                      name="apiKey"
                      control={customAgentForm.control}
                      render={({ field }) => (
                        <Input
                          type="password"
                          {...field}
                          placeholder="sk-..."
                        />
                      )}
                    />
                    {customAgentForm.formState.errors.apiKey && (
                      <Span
                        style={{
                          color: "var(--accent-1)",
                          fontSize: "0.85rem",
                        }}
                      >
                        {customAgentForm.formState.errors.apiKey.message}
                      </Span>
                    )}
                  </Div>
                </Div>

                <Div
                  style={{
                    gap: "0.5rem",
                    marginTop: "1rem",
                    ...utilities.row.style,
                  }}
                >
                  <Button
                    type="button"
                    className="inverted"
                    onClick={() => {
                      customAgentForm.reset()
                      setTab("settings")
                    }}
                    style={{ ...utilities.inverted.style }}
                  >
                    {t("Cancel")}
                  </Button>
                  <Button
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
                  </Button>
                </Div>
              </>
            )}
            {tab === "tribe" && <TribeCalculator tribeType="Tribe" />}
            {tab === "moltBook" && <TribeCalculator tribeType="Moltbook" />}

            <Div
              style={{
                borderTop: tab === "systemPrompt" ? "none" : undefined,
                ...styles.footer.style,
              }}
            >
              <>
                <Button
                  data-testid="settings-tab"
                  style={{
                    ...styles.tabButton.style,

                    ...utilities.inverted.style,
                    ...utilities.small.style,
                    ...(tab === "settings"
                      ? styles.currentTab.style
                      : undefined),
                  }}
                  type="button"
                  onClick={() => {
                    setTab("settings")
                  }}
                >
                  <Settings2 size={16} /> {t("Settings")}
                </Button>
              </>
              {tab !== "systemPrompt" && (
                <>
                  <Button
                    data-testid="extends-tab"
                    style={{
                      ...styles.tabButton.style,
                      ...utilities.small.style,
                      ...(tab === "extends"
                        ? styles.currentTab.style
                        : undefined),
                      backgroundColor: "var(--accent-7)",
                    }}
                    onClick={() => {
                      setTab("extends")
                    }}
                    type="button"
                  >
                    <Blocks size={16} />
                    {t("Extend")}
                  </Button>
                  <Button
                    data-testid="monetization-tab"
                    onClick={() => {
                      setTab("monetization")
                    }}
                    type="button"
                    style={{
                      backgroundColor: "var(--accent-4)",
                      ...styles.tabButton.style,
                      ...utilities.small.style,
                      ...(tab === "monetization"
                        ? styles.currentTab.style
                        : undefined),
                    }}
                  >
                    <Coins size={16} /> {t("Monetization")}
                  </Button>
                  <Button
                    onClick={() => {
                      setTab("api")
                    }}
                    data-testid="api-tab"
                    type="button"
                    style={{
                      ...styles.tabButton.style,
                      ...utilities.small.style,
                      ...(tab === "api" ? styles.currentTab.style : undefined),
                      backgroundColor: "var(--accent-1)",
                    }}
                  >
                    <Webhook size={16} /> {t("API")}
                  </Button>
                  {(user?.role === "admin" || isDevelopment || isE2E) && (
                    <>
                      <Button
                        data-testid="tribe-tab"
                        className="inverted"
                        style={{
                          ...utilities.inverted.style,
                          ...utilities.xSmall.style,
                          ...(tab === "tribe"
                            ? styles.currentTab.style
                            : undefined),
                        }}
                        onClick={() => {
                          setTab("tribe")
                        }}
                        type="button"
                      >
                        <Img icon="zarathustra" size={24} />
                        {t("Tribe")}
                      </Button>
                      <Button
                        data-testid="moltbook-tab"
                        className="inverted"
                        style={{
                          ...utilities.inverted.style,
                          ...utilities.xSmall.style,
                          ...(tab === "moltBook"
                            ? styles.currentTab.style
                            : undefined),
                        }}
                        onClick={() => {
                          setTab("moltBook")
                        }}
                        type="button"
                      >
                        <Span
                          style={{
                            fontSize: "1.25rem",
                          }}
                        >
                          🦞
                        </Span>
                        {t("Moltbook")}
                      </Button>
                    </>
                  )}
                </>
              )}

              {tab !== "systemPrompt" && (
                <Button
                  onClick={() => {
                    setTab("systemPrompt")
                  }}
                  data-testid="system-prompt-button"
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
                </Button>
              )}
              {appFormWatcher.name && tab === "systemPrompt" && (
                <Button
                  data-testid="continue-button"
                  className={clsx(styles.tabButton, "inverted")}
                  type="button"
                  onClick={() => {
                    if (
                      appFormWatcher.tier !== "free" &&
                      !appFormWatcher?.apiKeys?.openrouter
                    ) {
                      toast.error(
                        t(
                          "OpenRouter API key is required for paid tiers to enable revenue sharing.",
                        ),
                      )
                      return
                    }
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
                    width={10}
                    height={10}
                  />
                  {t("Continue")}
                </Button>
              )}
            </Div>
          </Div>
        </Modal>
      )}
    </Div>
  )
}
