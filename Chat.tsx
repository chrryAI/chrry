"use client"
import {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react"
import styles from "./Chat.module.scss"
import clsx from "clsx"
import {
  Paperclip,
  AudioLines,
  ChevronDown,
  TextIcon,
  ImageIcon,
  VideoIcon,
  CircleX,
  FileIcon,
  Music,
  Info,
  CircleCheck,
  Coins,
  UserRoundPlus,
  HatGlasses,
  Timer,
  LogIn,
  Clock,
  HardDrive,
  Sparkles,
  CircleStop,
  Globe,
  GlobeLock,
  Palette,
  CircleArrowDown,
  Plus,
  CircleArrowUp,
  FileText,
  Megaphone,
  ClockPlus,
  Star,
  Link,
} from "./icons"
import { animate, stagger } from "motion"
import { useAppContext } from "./context/AppContext"
import {
  useAuth,
  useChat,
  useNavigationContext,
  useApp,
  useError,
  useData,
} from "./context/providers"
import { useTheme, usePlatform, Div } from "./platform"
import {
  type message,
  type aiAgent,
  type user,
  type guest,
  type thread,
  type collaboration,
  emojiMap,
} from "./types"
import {
  DeepSeek,
  OpenAI,
  Claude,
  Gemini,
  Flux,
  Perplexity,
} from "@lobehub/icons"
import Modal from "./Modal"
import Loading from "./Loading"
import sanitizeHtml from "sanitize-html"
import { validate, v4 as uuidv4 } from "uuid"
import { useCountdown, useHasHydrated, useLocalStorage } from "./hooks"
import toast from "react-hot-toast"
import useSWR from "swr"

import {
  BrowserInstance,
  capitalizeFirstLetter,
  checkIsExtension,
  isOwner,
  MAX_FILE_SIZES,
  OWNER_CREDITS,
  PROMPT_LIMITS,
  apiFetch,
  isE2E,
} from "./utils"
import needsWebSearch from "./utils/needsWebSearch"
import { useWebSocket } from "./hooks/useWebSocket"
import { checkSpeechLimits, SPEECH_LIMITS } from "./lib/speechLimits"
import { stripMarkdown } from "./lib/stripMarkdown"
import nProgress from "nprogress"
import Logo from "./Logo"
import { useWindowHistory } from "./hooks/useWindowHistory"
import App from "./App"
import Img from "./Image"
import MoodSelector from "./MoodSelector"

const MAX_FILES = 3

// Function to handle context menu messages

export default function Chat({
  className,
  onToggleGame,
  onMessage,
  onStreamingUpdate,
  showGreeting,
  onStreamingComplete,
  showSuggestions,
  disabled,
  text,
  thread,
  onStreamingStop,
  Top,
  placeholder,
  compactMode,
  onTyping,
  requiresSignin,
}: {
  requiresSignin?: boolean
  compactMode?: boolean
  placeholder?: string
  Top?: React.ReactNode
  showSuggestions?: boolean
  showGreeting?: boolean
  className?: string
  onToggleGame?: (on: boolean) => void
  disabled?: boolean
  onMessage?: (message: {
    content: string
    isUser: boolean
    isStreaming?: boolean
    message?: {
      message: message
      user?: user
      guest?: guest
      aiAgent?: aiAgent
      thread?: thread
    }
    webSearchResults?: any[]
    isImageGenerationEnabled?: boolean
    isWebSearchEnabled?: boolean
  }) => void
  onStreamingUpdate?: ({
    content,
    clientId,
    aiAgent,
    isWebSearchEnabled,
    isImageGenerationEnabled,
  }: {
    content: string
    clientId?: string
    aiAgent?: aiAgent
    isWebSearchEnabled?: boolean
    isImageGenerationEnabled?: boolean
  }) => void
  onStreamingStop?: (
    message?: {
      message: message
      user?: user
      guest?: guest
      aiAgent?: aiAgent
      thread?: thread
    } | null,
  ) => void
  onStreamingComplete?: (message?: {
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
  }) => void
  text?: string
  thread?: thread
  onTyping?: (isTyping: boolean) => void
}): React.ReactElement {
  // Split contexts for better organization
  const { t } = useAppContext()
  const { weather, VERSION } = useData()

  // Auth context
  const {
    user,
    token,
    language,
    setUser,
    setGuest,
    guest,
    track,
    deviceId,
    API_URL,
    FRONTEND_URL,
    chrry,
    app,
    sushiAgent,
    mood,
    updateMood,
    taskId,
    fetchTasks,
  } = useAuth()

  const [isSelectingMood, setIsSelectingMood] = useState(false)

  const isChrry = chrry?.id === app?.id

  // Chat context
  const {
    aiAgents,
    selectedAgent,
    setSelectedAgent: setSelectedAgentInternal,
    debateAgent,
    setDebateAgent,
    isDebating,
    setIsDebating,
    setIsChatFloating,
    setIsWebSearchEnabled: setWebSearchEnabledInternal,
    isWebSearchEnabled,
    setInput: setInputInternal,
    input,
    creditsLeft,
    setCreditsLeft,
    hourlyUsageLeft,
    hitHourlyLimit,
    hourlyLimit,
    isEmpty: empty,
    threadId,
    isAgentModalOpen,
    setIsAgentModalOpen,
    isDebateAgentModalOpen,
    setIsDebateAgentModalOpen,
    setIsAgentModalOpenInternal,
    isImageGenerationEnabled,
    setIsImageGenerationEnabled,
    setShouldFocus,
    shouldFocus,
  } = useChat()

  // Navigation context (router is the wrapper)
  const {
    router,
    isNewChat,
    isShowingCollaborate,
    collaborationStep,
    setCollaborationStep,
    isIncognito,
    addParams,
  } = useNavigationContext()

  // App context
  const {
    slug,
    suggestSaveApp,
    saveApp,
    apps,
    appStatus,
    appFormWatcher,
    setApp,
  } = useApp()

  const threadIdRef = useRef(threadId)

  useEffect(() => {
    threadIdRef.current = threadId
  }, [threadId])

  const setThreadId = (id: string) => {
    // setThreadIdContext(id)
    threadIdRef.current = id
  }

  // Error context
  const { captureException } = useError()

  // Platform context
  const { device, os, isStandalone, isExtension } = usePlatform()
  const inputRef = useRef(text || "")

  // Theme context
  const { addHapticFeedback, reduceMotion, playNotification, isDrawerOpen } =
    useTheme()

  const setSelectedAgent = (agent: aiAgent | undefined | null) => {
    setSelectedAgentInternal(agent)
    setShouldFocus(true)
    track({
      name: "agent-selected",
      props: {
        agentId: agent?.id,
        agentName: agent?.name,
        agentVersion: agent?.version,
      },
    })
  }

  useEffect(() => {
    if (shouldFocus) {
      chatInputRef.current?.focus()
      setShouldFocus(false)
    }
  }, [shouldFocus])

  const setIsWebSearchEnabled = (value: boolean) => {
    setWebSearchEnabledInternal(value)
    value && setShouldFocus(true)
  }

  // Scroll detection for auto-hide chat input
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [showChatInput, setShowChatInput] = useState(true)
  const [windowHeight, setWindowHeight] = useState(600)

  useEffect(() => {
    // Set actual window height on client
    setWindowHeight(window.innerHeight)
  }, [])

  const chatInputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    inputRef.current = input
  }, [input])

  const demo1: string[] = [
    "🤔",
    "🥰 WOW!",
    "🗺️ I'm planning a 5-day trip to Tokyo next month. Can you create a detailed itinerary with must-see spots, local food recommendations, and the best times to visit?",
    "✈️ What's the weather like in Barcelona in April? Should I pack a jacket or will it be warm enough for just t-shirts?",
    "🏨 Find me a cozy boutique hotel in Paris near the Eiffel Tower, budget around €150/night, with good breakfast included",
    "🍜 I'm in Bangkok right now. What are the top 5 authentic street food spots locals actually go to? No tourist traps please!",
    "📅 Schedule a team standup meeting tomorrow at 10 AM for 30 minutes with the title 'Daily Sync' and invite emma.brown@google.com",
    "⚠️ Do I have any meetings between 2 PM and 5 PM today? If yes, can you reschedule my 3 PM call to tomorrow same time?",
    "📊 What's my schedule for this week? Highlight any back-to-back meetings and suggest breaks I should add.",
    "🎯 Block my calendar every Friday afternoon from 2-5 PM for the next month as 'Focus Time - No Meetings' and mark it as busy",
  ]

  const currentIndexRef = useRef(0)

  useEffect(() => {
    if (!user || user.role !== "admin") return
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "ArrowUp") {
        event.preventDefault()

        const messageToType = demo1[currentIndexRef.current]
        setInput(messageToType || "")

        // Update index for next time
        currentIndexRef.current = (currentIndexRef.current + 1) % demo1.length
      }
      if (event.key === "ArrowDown") {
        event.preventDefault()

        const messageToType = demo1[currentIndexRef.current]
        setInput(messageToType || "")

        // Update index for next time
        currentIndexRef.current =
          (currentIndexRef.current - 1 + demo1.length) % demo1.length
      }
    }

    document.addEventListener("keyup", handleKeyUp)

    return () => {
      document.removeEventListener("keyup", handleKeyUp)
    }
  }, [user]) // Empty dependency array - no re-creation of listener

  useEffect(() => {
    if (isNewChat) {
      setShowChatInput(true)
    }
  }, [isNewChat])
  // Determine if we should use compact mode based on bottom offset
  const [hasBottomOffset, setHasBottomOffset] = useState(false)
  const shouldUseCompactMode = compactMode || hasBottomOffset
  // || windowHeight < 600 // Not at bottom or mobile

  const isChatFloating = shouldUseCompactMode || (!empty && !showChatInput)

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.log(" Chat floating state", {
        isChatFloating,
        empty,
        showChatInput,
        shouldUseCompactMode,
      })
    }
    setIsChatFloating(isChatFloating)
  }, [isChatFloating])

  // Strip ACTION JSON sfrom streaming text
  const stripActionFromText = (text: string): string => {
    // Check if there's a complete ACTION JSON at the end
    const actionMatch = text.match(/ACTION:\s*(\{(?:[^{}]|\{[^}]*\})*\})\s*$/)
    if (actionMatch) {
      // Complete ACTION JSON found, strip it
      return text.replace(/ACTION:\s*\{(?:[^{}]|\{[^}]*\})*\}\s*$/, "").trim()
    }

    // Check if there's an incomplete ACTION at the end
    const incompleteActionMatch = text.match(/ACTION:\s*\{[^}]*$/)
    if (incompleteActionMatch) {
      // Incomplete ACTION found, strip everything from "ACTION:" onwards
      return text.replace(/ACTION:\s*\{[^}]*$/, "").trim()
    }

    // Check for just "ACTION:" at the end
    if (text.match(/ACTION:\s*$/)) {
      return text.replace(/ACTION:\s*$/, "").trim()
    }

    return text
  }

  const animateSuggestions = (): void => {
    // Check for reduced motion preference
    const prefersReducedMotion =
      reduceMotion ||
      (typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches)

    if (prefersReducedMotion) {
      // Just make visible without animation
      const suggestionsList = document?.querySelector(".suggestionsList")
      const suggestionItems = document?.querySelectorAll(".suggestionItem")

      if (suggestionsList) {
        ;(suggestionsList as HTMLElement).style.opacity = "1"
      }
      suggestionItems?.forEach((item) => {
        ;(item as HTMLElement).style.opacity = "1"
      })
    } else {
      // Animate top to bottom
      animate([
        [".suggestionsList", { opacity: [0, 1] }, { duration: 0 }],
        [
          ".suggestionItem",
          {
            y: [-20, 0],
            opacity: [0, 1],
          },
          {
            delay: stagger(0.025),
            duration: 0.1,
          },
        ],
      ])
    }
  }

  const hasIncompleteAction = (streamedContent: string) =>
    streamedContent.includes("ACTION:") &&
    (streamedContent.match(/ACTION:\s*\{[^}]*$/) ||
      streamedContent.match(/ACTION:\s*$/))

  function stripActionText(streamedContent: string, chunk: string) {
    const isIncompleteAction = hasIncompleteAction(streamedContent)

    // If chunk starts with { and we might be receiving ACTION JSON, be more cautious
    const chunkStartsWithJson = chunk.trim().startsWith("{")
    const mightBeActionJson =
      streamedContent.includes("ACTION:") && chunkStartsWithJson

    // Update streaming content (strip ACTION JSON from display)
    let cleanStreamedContent = stripActionFromText(streamedContent)

    // If we detect we might be in the middle of ACTION JSON, show previous clean content
    if (isIncompleteAction || mightBeActionJson) {
      // Find the last complete sentence before ACTION
      const beforeAction = streamedContent.split("ACTION:")[0]?.trim() || ""
      cleanStreamedContent = beforeAction
    }
    return cleanStreamedContent
  }
  // Listen for extension messages (like page summary results)

  const [attempt, setAttempt] = useState<
    "webSearch" | "tasks" | "submit" | "debate" | undefined
  >(undefined)

  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const controller = new AbortController()

  const [files, setFilesInternal] = useState<File[]>([])

  const setFiles: Dispatch<SetStateAction<File[]>> = (data) => {
    const f = typeof data === "function" ? data(files) : data

    if (!selectedAgent) {
      setFilesInternal(f)
      return
    }

    // Get agent-specific limits
    const agentLimits =
      MAX_FILE_SIZES[selectedAgent.name as keyof typeof MAX_FILE_SIZES] ||
      MAX_FILE_SIZES.deepSeek

    // Calculate maximum total size from agent's individual file limits
    const MAX_TOTAL_FILE_SIZE =
      Math.max(
        agentLimits.pdf,
        agentLimits.image,
        agentLimits.audio,
        agentLimits.video,
        agentLimits.text,
      ) * MAX_FILES // Multiply by max number of files allowed

    // Calculate individual file size limits (your existing logic)
    const maxIndividualFileSizes = f.reduce(
      (acc, file) => acc + getMaxFileSize(file.type),
      0,
    )

    // Calculate total file size
    const totalFileSize = f.reduce((acc, file) => acc + file.size, 0)

    // Check individual file size limits
    if (totalFileSize > maxIndividualFileSizes) {
      const maxIndividualSizeMB = (
        maxIndividualFileSizes /
        (1024 * 1024)
      ).toFixed(1)
      toast.error(`Maximum file size exceeds limit: ${maxIndividualSizeMB}MB`)
      return
    }

    // Check total file size limit
    if (totalFileSize > MAX_TOTAL_FILE_SIZE) {
      const maxTotalSizeMB = (MAX_TOTAL_FILE_SIZE / (1024 * 1024)).toFixed(1)
      const currentTotalSizeMB = (totalFileSize / (1024 * 1024)).toFixed(1)
      toast.error(
        `Total file size (${currentTotalSizeMB}MB) exceeds maximum limit of ${maxTotalSizeMB}MB`,
      )
      return
    }

    setFilesInternal(f)
  }
  const [isListening, setIsListeningInternal] = useState(false)
  const [isSpeaking, setIsSpeakingInternal] = useState(false)
  const limitCheck =
    user || guest
      ? user
        ? checkSpeechLimits({ user, textLength: 10 })
        : guest
          ? checkSpeechLimits({ guest, textLength: 10 })
          : { allowed: false }
      : { allowed: false }

  const setIsListening = (isListening: boolean) => {
    setIsListeningInternal(isListening)
    if (isListening) {
      setIsSpeakingInternal(false)
    }
  }

  const [playVideo, setPlayVideo] = useState(false)

  const setIsSpeaking = (isSpeaking: boolean) => {
    setIsSpeakingInternal(isSpeaking)
    if (isSpeaking) {
      setIsListeningInternal(false)
    }
  }

  const [isSpeechActive, setIsSpeechActive] = useState(false)
  const [recognition, setRecognition] = useState<any>(null)
  const [quotaInfo, setQuotaInfo] = useState<{
    hourly: { used: number; limit: number; resetTime: string }
    daily: { used: number; limit: number; resetTime: string }
    dailySize: { used: number; limit: number; resetTime: string }
    images?: { used: number; limit: number; resetTime: string }
  } | null>(null)
  const [showQuotaInfo, setShowQuotaInfoInternal] = useState(false)
  const setShowQuotaInfo = (show: boolean) => {
    setShowQuotaInfoInternal(show)
    show &&
      track({
        name: "quota-info",
        props: {
          show,
        },
      })
  }

  const getPossibleApp = async (text: string) => {
    console.log(`🚀 Analyzing text:`, text)

    // Only analyze if text is long enough
    if (text.length < 10) return null

    try {
      // Try Chrome AI first
      if ((window as any).ai?.languageModel) {
        try {
          console.log("🤖 Using Chrome AI...")
          const session = await (window as any).ai.languageModel.create({
            temperature: 0.3,
            topK: 1,
          })

          const prompt = `Analyze this text and return ONLY the app name that matches best:
"${text}"

Apps:
${apps.map((app) => `- ${app.name}: ${app.description || ""}`).join("\n")}

Return ONLY ONE WORD: ${apps.map((a) => a.name).join(", ")}, or "none"`

          const result = await session.prompt(prompt)
          console.log(`🤖 Chrome AI result:`, result)

          const slug = result.trim().toLowerCase()
          const matchedApp = apps.find((app) => app.name.toLowerCase() === slug)

          if (matchedApp) {
            console.log(`✅ Chrome AI detected: ${matchedApp.name}`)
            return matchedApp
          }
        } catch (aiError) {
          console.log("⚠️ Chrome AI failed, using fallback:", aiError)
        }
      }

      // Fallback: Keyword-based detection
      console.log("🔍 Using keyword detection...")
      const lowerText = text.toLowerCase()

      // Get localized keywords from translations
      const appPatterns = {
        atlas: t("app_keywords_atlas").split(","),
        bloom: t("app_keywords_bloom").split(","),
        peach: t("app_keywords_peach").split(","),
        vault: t("app_keywords_vault").split(","),
      }

      // Score each app based on keyword matches
      const scores: { [key: string]: number } = {}

      for (const [slug, keywords] of Object.entries(appPatterns)) {
        let score = 0

        for (const keyword of keywords) {
          if (lowerText.includes(keyword)) {
            // Longer keywords get higher scores (more specific)
            score += keyword.split(" ").length
          }
        }

        if (score > 0) {
          scores[slug] = score
        }
      }

      console.log(`🎯 App scores:`, scores)

      // Find app with highest score
      const bestMatch = Object.entries(scores).sort(([, a], [, b]) => b - a)[0]

      if (bestMatch) {
        const [slug, score] = bestMatch
        const matchedApp = apps.find((app) => app.name.toLowerCase() === slug)

        if (matchedApp) {
          console.log(`✅ Detected app: ${matchedApp.name} (score: ${score})`)
          return matchedApp
        }
      }

      console.log(`❌ No app detected`)
      return null
    } catch (error) {
      console.error("Error detecting app:", error)
      return null
    }
  }

  const setInput = (value: string) => {
    inputRef.current = value

    setInputInternal(value)
  }

  useEffect(() => {
    inputRef.current = input
  }, [input])

  const [message, setMessageInternal] = useState<{
    message: message
    user?: user
    guest?: guest
    aiAgent?: aiAgent
    thread?: thread
  } | null>(null)

  const setMessage = (
    message: {
      message: message
      user?: user
      guest?: guest
      aiAgent?: aiAgent
      thread?: thread
    } | null,
  ) => {
    setMessageInternal(message)
    clientIdRef.current = message?.message?.clientId
  }

  const isHydrated = useHasHydrated()

  const [isAttaching, setIsAttachingInternal] = useState(false)
  const clientIdRef = useRef<string | undefined>(uuidv4())

  // State for accumulating incomplete XML messages
  const xmlBufferRef = useRef<string>("")
  const filteredLogRef = useRef<string>("")

  // Filter out technical messages and only show meaningful updates
  const filterStreamingMessage = (input: string | any): string | null => {
    // Handle workflow messages directly in the filter
    if (typeof input === "object" && input !== null) {
      const msg = input as any
      if (msg.type === "workflow" && msg.workflow) {
        const { workflow } = msg
        let progressMessage = ""

        if (workflow.name) {
          progressMessage += `🎯 ${workflow.name}\n`
        }
        if (workflow.thought) {
          progressMessage += `💭 ${workflow.thought}\n`
        }

        // Show agent tasks
        if (workflow.agents && workflow.agents.length > 0) {
          workflow.agents.forEach((agent: any, index: number) => {
            if (agent.task) {
              progressMessage += `📋 ${agent.name}: ${agent.task}\n`
            }
          })
        }

        return progressMessage.trim() || t("🤖 Planning workflow...")
      }

      if (msg.type === "text" && msg.text) {
        console.log("Text message received:", msg.text)

        // Handle XML content using DOMParser for proper parsing
        if (msg.text.includes("<root>") || xmlBufferRef.current) {
          // Accumulate XML content
          if (msg.text.includes("<root>") && !xmlBufferRef.current) {
            xmlBufferRef.current = msg.text
          } else if (xmlBufferRef.current) {
            xmlBufferRef.current += msg.text
          }

          // Check if we have complete XML
          if (xmlBufferRef.current.includes("</root>")) {
            try {
              const parser = new DOMParser()
              const doc = parser.parseFromString(
                xmlBufferRef.current,
                "text/xml",
              )

              // Check for parsing errors
              const errorNode = doc.querySelector("parsererror")
              if (errorNode) {
                console.warn("XML parsing error:", errorNode.textContent)
                // Fallback to text extraction using DOMParser
                const tempDiv = document.createElement("div")
                tempDiv.textContent = xmlBufferRef.current // Use textContent to safely extract text
                const textContent = tempDiv.textContent || ""
                xmlBufferRef.current = ""
                return textContent.replace(/\s+/g, " ").trim()
              }

              // Extract text content from parsed XML (textContent is safe)
              const textContent = doc.documentElement.textContent || ""
              const cleanedContent = textContent.replace(/\s+/g, " ").trim()

              xmlBufferRef.current = ""
              return cleanedContent
            } catch (e) {
              console.warn("XML parsing failed:", e)
              // Fallback to safe text extraction
              const tempDiv = document.createElement("div")
              tempDiv.textContent = xmlBufferRef.current
              const textContent = (tempDiv.textContent || "")
                .replace(/\s+/g, " ")
                .trim()
              xmlBufferRef.current = ""
              return textContent
            }
          }

          // Don't stream partial XML
          return null
        }

        return filterStreamingMessage(msg.text)
      }
      // If it's a log message object, extract the log string
      if (msg.type === "log" && msg.log) {
        return filterStreamingMessage(msg.log)
      }

      return null
    }

    const log = input as string

    // Ensure log is a string
    if (typeof log !== "string") {
      return null
    }

    // Show planning indicator at start of workflow
    if (log.includes('"xml":') && log.includes("<root>")) {
      return t("🤖 Planning workflow...")
    }

    // Skip technical tool commands (JSON syntax) - but allow XML content
    if (log.includes('{"index":') || log.includes('{"url":')) {
      return null
    }

    // Skip repetitive character-by-character streaming patterns
    if (log.match(/^(.+?)\1{3,}/) || log.includes("II'll'll")) {
      // console.warn(
      //   "🚫 Skipping repetitive streaming pattern:",
      //   log.slice(0, 100),
      // )
      // return log.replace(/(.+?)\1{3,}/g, "$1")
    }

    // Remove the wait condition since we handle concatenation in the text handler above

    // Strip XML tags and show clean text content for any <root> message
    if (log.includes("<root>")) {
      try {
        // Parse XML and extract text content properly
        try {
          // Auto-close incomplete tags by adding missing closing tags
          let xmlContent = log

          // Find all opening tags that don't have closing tags
          const openTags = xmlContent.match(/<(\w+)[^>]*>/g) || []
          const closeTags = xmlContent.match(/<\/(\w+)>/g) || []

          const openTagNames = openTags
            .map((tag) => tag.match(/<(\w+)/)?.[1])
            .filter(Boolean)
          const closeTagNames = closeTags
            .map((tag) => tag.match(/<\/(\w+)>/)?.[1])
            .filter(Boolean)

          // Add missing closing tags
          const unclosedTags = openTagNames.filter(
            (tag) => !closeTagNames.includes(tag),
          )
          unclosedTags.reverse().forEach((tag) => {
            xmlContent += `</${tag}>`
          })

          // Create a temporary DOM element to parse XML and extract text
          const tempDiv = document.createElement("div")
          tempDiv.innerHTML = xmlContent
          const textContent = tempDiv.textContent || tempDiv.innerText || ""

          const cleanedContent = textContent
            .replace(/\n\s*\n/g, "\n") // Remove extra blank lines
            .replace(/^\s+|\s+$/g, "") // Trim whitespace
            .trim()

          if (cleanedContent.length > 20) {
            filteredLogRef.current = `✅ ${cleanedContent}`
            return filteredLogRef.current
          }
          return null
        } catch (e) {
          // Fallback to safe text extraction using DOM
          const tempDiv = document.createElement("div")
          tempDiv.textContent = log // Use textContent to safely extract text without HTML
          const cleanedContent = (tempDiv.textContent || "")
            .replace(/\n\s*\n/g, "\n") // Remove extra blank lines
            .trim()

          if (cleanedContent.length > 20) {
            return `✅ ${cleanedContent}`
          }
          return null
        }
      } catch (e) {
        return null
      }
    }

    // Skip raw XML workflow syntax (but we handle structured XML above)
    if (
      log.includes("<node>") ||
      log.includes("</node>") ||
      log.includes("<agent>") ||
      log.includes("<root>")
    ) {
      return null
    }

    // Skip tool execution details
    if (log.match(/^Browser > \w+/)) {
      return null
    }

    // Keep meaningful messages like:
    // - "Searching for askvex.com on Google"
    // - "Filling out form with information"
    // - "Collecting search results"
    // - "Plan\n<workflow content>" (but clean it up)

    if (log.startsWith("Plan\n")) {
      return t("🤖 Planning your task...")
    }

    // Keep other meaningful messages
    if (log.length > 10 && !log.includes("{") && !log.includes("<")) {
      return stripMarkdown(log)
    }

    return null
  }

  // Note: Base64 encoding increases size by ~33%, and DeepSeek has 28K token limit
  const getMaxFileSize = (fileType: string) => {
    if (!selectedAgent) return 0

    // Conservative limits based on agent capabilities and token limits
    const limits = MAX_FILE_SIZES

    const agentLimits =
      limits[selectedAgent.name as keyof typeof limits] || limits.deepSeek

    if (fileType.startsWith("image/")) return agentLimits.image
    if (fileType.startsWith("audio/")) return agentLimits.audio
    if (fileType.startsWith("video/")) return agentLimits.video
    if (fileType.startsWith("text/")) return agentLimits.text

    if (fileType.startsWith("application/pdf")) return agentLimits.pdf

    return 0
  }
  const setIsAttaching = (attaching: boolean) => {
    if (attaching) {
      if (!isPrivacyApproved) {
        setNeedsReview(true)
        return
      }
      if (selectedAgent?.name == "flux") {
        setSelectedAgent(undefined)
      }
    }

    setIsAttachingInternal(attaching)
    attaching &&
      track({
        name: "is-attaching",
        props: {
          attaching,
        },
      })
  }
  const handleFileSelect = async (selectedFiles: FileList | null) => {
    if (!selectedFiles) return

    const newFiles = Array.from(selectedFiles)

    // File size limits to prevent token overflow (conservative estimates)

    // Validate against agent capabilities and file size
    const validFiles: File[] = []

    for (const file of newFiles) {
      const fileType = file.type.toLowerCase()
      let isSupported = false
      let maxSize = 0

      if (fileType.startsWith("image/") && selectedAgent?.capabilities.image) {
        isSupported = true
        maxSize = getMaxFileSize(fileType)
      } else if (
        fileType.startsWith("audio/") &&
        selectedAgent?.capabilities.audio
      ) {
        isSupported = true
        maxSize = getMaxFileSize(fileType)
      } else if (
        fileType.startsWith("video/") &&
        selectedAgent?.capabilities.video
      ) {
        isSupported = true
        maxSize = getMaxFileSize(fileType)
      } else if (
        fileType.startsWith("application/pdf") &&
        selectedAgent?.capabilities.pdf
      ) {
        isSupported = true
        maxSize = getMaxFileSize(fileType)
      }

      if (!isSupported) {
        toast.error(
          `${file.name}: File type not supported by ${selectedAgent?.displayName}`,
        )
        return false
      }

      if (file.size > maxSize) {
        const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1)
        toast.error(`${file.name}: File too large. Max size: ${maxSizeMB}MB`)
        continue
      }

      // Compress images to reduce token usage
      if (fileType.startsWith("image/")) {
        console.log(`🖼️ Processing image: ${file.name} (${file.size} bytes)`)
        try {
          const compressedFile = await compressImage(file, 400, 0.6) // More aggressive compression
          const reduction = (
            ((file.size - compressedFile.size) / file.size) *
            100
          ).toFixed(1)
          console.log(
            `🗜️ Compressed ${file.name}: ${file.size} → ${compressedFile.size} bytes (${reduction}% reduction)`,
          )
          validFiles.push(compressedFile)
        } catch (error) {
          console.warn(
            `❌ Failed to compress ${file.name}, using original:`,
            error,
          )
          validFiles.push(file)
        }
      } else {
        validFiles.push(file)
      }
    }

    setFiles((prev) => [...prev, ...validFiles].slice(0, 3))

    if (validFiles.length > 0) {
      toast.success(`${validFiles.length} file(s) selected`)
      setIsAttaching(false) // Close attachment menu after selection
    }
  }

  const clearFiles = () => setFiles([])

  // Remove specific file
  const removeFile = (index: number) => {
    setFilesInternal((prev) => prev.filter((_, i) => i !== index))
    device === "desktop" && setShouldFocus(true)
  }

  useEffect(() => {
    if (files.length > 0 && selectedAgent?.name === "flux") {
      setSelectedAgent(undefined)
    }
  }, [files.length, selectedAgent])

  // Fetch quota information
  const fetchQuotaInfo = async () => {
    const response = await apiFetch(`${API_URL}/messages?quota=true`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (response.ok) {
      const data = await response.json()
      return data
    }
  }

  // Auto-suggest save when system prompt is set
  useEffect(() => {
    if (suggestSaveApp) {
      // Set input to trigger save suggestion with explanation
      setInput(t("Save my app and explain what it does 🚀"))
    }
  }, [suggestSaveApp])

  const {
    data: quotaData,
    mutate: refetchQuotaInfo,
    isLoading: isFetchingQuotaInfo,
  } = useSWR(
    token && ["quotaInfo"],
    () => {
      return fetchQuotaInfo()
    },
    {
      // revalidateOnMount: true,
      // revalidateOnFocus: true,
    },
  )

  // const {
  //   data: quotaData,
  //   isLoading: isFetchingQuotaInfo,
  //   refetch: refetchQuotaInfo,
  // } = useSSR({
  //   queryKey: ["quotaInfo"],
  //   queryFn: () => fetchQuotaInfo(),
  //   enabled: false,
  // })

  const [artifacts, setArtifacts] = useState<File[]>([])
  const [instructionsIndex, setInstructionsIndex] = useState(0)

  useEffect(() => {
    refetchQuotaInfo()
  }, [])

  useEffect(() => {
    if (!quotaData) return
    setQuotaInfo(quotaData.quotaInfo)
  }, [quotaData])

  // Handle extension actions from AI responses

  // Format time remaining until reset
  const formatTimeUntilReset = (resetTime: string) => {
    const now = new Date()
    const reset = new Date(resetTime)
    const diff = reset.getTime() - now.getTime()

    if (diff <= 0) return "Now"

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  // Get file type for UI logic
  const getFileType = (
    file: File,
  ): "image" | "audio" | "video" | "pdf" | "text" | "other" => {
    const type = file.type.toLowerCase()
    if (type.startsWith("image/")) return "image"
    if (type.startsWith("audio/")) return "audio"
    if (type.startsWith("video/")) return "video"
    if (type.startsWith("text/")) return "text"
    if (type.startsWith("application/pdf")) return "pdf"
    return "other"
  }

  // Check if we have files of a specific type
  const hasFileType = (type: "image" | "audio" | "video" | "pdf") => {
    return files.some((file) => getFileType(file) === type)
  }

  // Check if attachment buttons should be disabled
  const isAttachmentDisabled = (type: "image" | "audio" | "video" | "pdf") => {
    // Disable if we have 3 files already
    if (files.length >= MAX_FILES) return true

    // Disable if we have files of a different type
    // const currentTypes = [...new Set(files.map(getFileType))]
    // if (currentTypes.length > 0 && !currentTypes.includes(type)) return true

    return false
  }

  // Get button color based on selection state
  const getButtonColor = (type: "image" | "audio" | "video" | "pdf") => {
    if (isAttachmentDisabled(type)) return "var(--shade-3)"
    if (hasFileType(type)) return "var(--accent-4)"
    return "var(--accent-6)"
  }

  const [synthesis, setSynthesis] = useState<SpeechSynthesisUtterance | null>(
    null,
  )

  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)

  // Create image preview URL
  const createImagePreview = (file: File): string => {
    return URL.createObjectURL(file)
  }

  const inConversationRef = useRef(false)

  const [hasPlayed, setHasPlayed] = useState(false)

  // Voice conversation functionality
  const startVoiceConversation = async () => {
    track({
      name: "voice_conversation",
      props: {
        started: true,
      },
    })

    if (hasPlayed) {
      setIsSpeechActive(true)
    }

    inConversationRef.current = true

    setIsLoading(true)

    // Start with AI greeting

    try {
      if (synthesis) synthesis.dispatchEvent(new Event("pause"))

      if (audio) audio?.pause()
      // Generate and play AI greeting with TTS
      playAIResponseWithTTS()
      setHasPlayed(true)
    } catch (error) {
      console.error("Voice conversation error:", error)
      captureException(error)
      startListening()
    } finally {
      setIsLoading(false)
    }
  }
  const [isVideoLoading, setIsVideoLoading] = useState(true)

  const videoRef = useRef<HTMLVideoElement>(null)
  const [voiceMessages, setVoiceMessages] = useState<
    { messageId?: string; text: string }[]
  >([])

  useEffect(() => {
    if (isSpeaking || isListening) return
    if (voiceMessages.length > 0) {
      const message = voiceMessages[0]
      message && playAIResponseWithTTS(message.text)
      setVoiceMessages((prev) => prev.slice(1))
    }
  }, [voiceMessages, isSpeaking, isListening])

  // Play AI response with TTS and continue conversation
  const playAIResponseWithTTS = async (text?: string) => {
    try {
      const response = await apiFetch(`${API_URL}/tts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ text, language }),
      })

      const data = await response.json()

      if (data.usage) {
        user &&
          setUser({
            ...user,
            speechRequestsToday: data.usage.requestsToday,
            speechRequestsThisHour: data.usage.requestsThisHour,
            speechCharactersToday: data.usage.charactersToday,
          })

        guest &&
          setGuest({
            ...guest,
            speechRequestsToday: data.usage.requestsToday,
            speechRequestsThisHour: data.usage.requestsThisHour,
            speechCharactersToday: data.usage.charactersToday,
          })

        setIsSpeechActive(true)
      }

      if (data.error) {
        toast.error(t(data.error))
        setIsLoading(false)
        inConversationRef.current = false
        return
      }

      if (data.useWebSpeech) {
        // Fallback to Web Speech API
        if ("speechSynthesis" in window) {
          const utterance = new SpeechSynthesisUtterance(text)
          utterance.onend = () => {
            setSynthesis(null)
            setIsSpeaking(false)
            inConversationRef.current = false
            // Continue conversation - start listening again
            // if (!isDebate) {
            //   setTimeout(() => startListening(), 1000)
            //   inConversationRef.current = false
            // }
            inConversationRef.current = false
          }
          speechSynthesis.speak(utterance)
          setIsSpeaking(true)
          setSynthesis(utterance)
        }
      } else if (data.audio) {
        // Play ElevenLabs audio
        const audio = new Audio(data.audio)
        setAudio(audio)
        audio.onended = () => {
          setIsSpeaking(false)
          setAudio(null)
          // if (!isDebate && voiceMessages.length === 0) {
          //   setTimeout(() => startListening(), 1000)
          //   inConversationRef.current = false
          // }
          inConversationRef.current = false
        }

        try {
          setIsSpeaking(true)
          await audio.play()
          setAudio(audio)
        } catch (error) {
          captureException(error)
          console.error("Audio play failed, falling back to Web Speech:", error)
          // ios audio fallback to Web Speech API
          if ("speechSynthesis" in window) {
            const utterance = new SpeechSynthesisUtterance(text)
            utterance.onend = () => {
              setIsSpeaking(false)
              inConversationRef.current = false
              setTimeout(() => startListening(), 1000)
            }
            speechSynthesis.speak(utterance)
            setIsSpeaking(true)
          }
        }
      }
    } catch (error) {
      captureException(error)
      console.error("TTS playback error:", error)
      // Continue conversation even if TTS fails
      setTimeout(() => startListening(), 1000)
    }
  }

  const startListening = () => {
    // Check if browser supports speech recognition
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      toast.error(
        "Voice input not supported in this browser. Try Chrome or Edge.",
      )
      return
    }

    if (isListening) {
      stopVoiceInput()
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = language === "en" ? "en-US" : language
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      console.log("🎤 Voice recognition started")
      setIsListening(true)
      toast.success("Listening... Speak now!")
    }

    let finalTranscript = ""

    recognition.onresult = (event: any) => {
      let interimTranscript = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      // Show interim + final results in input
      const displayText = finalTranscript + interimTranscript
      console.log("🎤 Transcript:", displayText)
    }

    recognition.onend = () => {
      console.log("🎤 Voice recognition ended")
      setIsListening(false)
      setRecognition(null)
      // Auto-send the message and get AI response with voice
      if (inputRef.current) {
        handleSubmit()
      }
    }

    recognition.onerror = (event: any) => {
      console.error("🎤 Voice recognition error:", event.error)
      captureException(event.error)
      setIsListening(false)
      setRecognition(null)

      switch (event.error) {
        case "aborted":
          break
        case "no-speech":
          break
        case "audio-capture":
          toast.error("Microphone not accessible. Please check permissions.")
          break
        case "not-allowed":
          toast.error(
            "Microphone access denied. Please allow microphone access.",
          )
          break
        default:
          toast.error(`Voice recognition error: ${event.error}`)
      }
    }

    recognition.start()
    setRecognition(recognition)
  }

  const stopVoiceInput = () => {
    track({
      name: "voice-input",
      props: {
        stopped: true,
      },
    })
    if (recognition) {
      recognition.stop()
    }
    setIsListening(false)
    setRecognition(null)
  }

  const stopSpeechConversation = () => {
    addHapticFeedback()
    track({
      name: "voice_conversation",
      props: {
        stopped: true,
      },
    })
    stopVoiceInput()
    synthesis?.dispatchEvent(new Event("pause"))
    audio?.pause()
    if (recognition) {
      recognition.stop()
    }
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel()
    }
    setIsListening(false)
    setIsSpeechActive(false)
    setRecognition(null)
    inConversationRef.current = false
  }

  // Cleanup recognition on unmount
  useEffect(() => {
    return () => {
      if (recognition) {
        recognition.stop()
      }
    }
  }, [recognition])

  const showHourlyLimitInfo = hourlyUsageLeft <= 5

  // Compress images to reduce token usage
  const compressImage = (
    file: File,
    maxWidth = 400,
    quality = 0.6,
  ): Promise<File> => {
    return new Promise((resolve, reject) => {
      console.log(`🔧 Starting compression for ${file.name}...`)

      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        console.warn("❌ Canvas context not available")
        resolve(file)
        return
      }

      const img = new Image()

      img.onload = () => {
        console.log(`📐 Original dimensions: ${img.width}x${img.height}`)

        // Calculate new dimensions
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height, 1) // Don't upscale
        const newWidth = Math.floor(img.width * ratio)
        const newHeight = Math.floor(img.height * ratio)

        console.log(
          `📐 New dimensions: ${newWidth}x${newHeight} (ratio: ${ratio})`,
        )

        canvas.width = newWidth
        canvas.height = newHeight

        // Draw and compress
        ctx.drawImage(img, 0, 0, newWidth, newHeight)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              console.log(`✅ Blob created: ${blob.size} bytes`)
              const compressedFile = new File([blob], file.name, {
                type: "image/jpeg", // Force JPEG for better compression
                lastModified: Date.now(),
              })
              resolve(compressedFile)
            } else {
              console.warn("❌ Failed to create blob")
              resolve(file) // Fallback to original
            }
          },
          "image/jpeg",
          quality,
        ) // Force JPEG format
      }

      img.onerror = (error) => {
        console.warn("❌ Image load error:", error)
        resolve(file)
      }

      img.src = URL.createObjectURL(file)
    })
  }

  // File input handlers for different media types
  const triggerFileInput = (accept: string) => {
    addHapticFeedback()
    track({
      name: "file-input",
      props: {
        accept,
      },
    })
    const input = document.createElement("input")
    input.type = "file"
    input.accept = accept
    input.multiple = true
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement
      if (!target.files) return

      if (target.files.length + files.length > MAX_FILES) {
        toast.error(t("Too many files selected"))
      }

      const dataTransfer = new DataTransfer()
      Array.from(target.files)
        .slice(0, MAX_FILES - files.length)
        .forEach((file) => dataTransfer.items.add(file))

      handleFileSelect(dataTransfer.files)
    }
    input.click()
  }

  const { push } = router

  const [instruction, setInstruction] = useState("")

  // Collaboration wizard steps
  const collaborationSteps = [
    {
      title: t("Start Your Conversation"),
      description: t(
        "Type your message or question in the chat input below to begin collaborating with AI.",
      ),
    },
    {
      title: t("Share Your Thread"),
      description: t(
        "Once you have a conversation going, click the share button to invite others to collaborate.",
      ),
    },
    {
      title: t("Real-time Collaboration"),
      description: t(
        "See when others are typing and collaborate in real-time with presence indicators.",
      ),
    },
    {
      title: t("You're All Set!"),
      description: t(
        "Start collaborating and create something amazing together!",
      ),
    },
  ]

  // Simple tooltip handlers
  const closeCollaborationTooltip = () => {
    addHapticFeedback()
    setCollaborationStep(0)
  }
  useEffect(() => {
    // clientIdRef.current = message?.message?.clientId
    BrowserInstance?.storage?.local?.set?.({ messageId: message?.message?.id })
  }, [message])

  const handleSubmit = async (approve?: boolean) => {
    if (
      guest &&
      selectedAgent?.authorization &&
      !["all", "guest"].includes(selectedAgent?.authorization)
    ) {
      addParams({
        subscribe: "true",
        plan: "member",
      })

      return
    }
    if (!isPrivacyApproved && !approve) {
      setNeedsReview(true)
      return
    }

    if (approve) {
      setNeedsReview(false)
      setIsPrivacyApproved(true)
    }

    addHapticFeedback()
    if (
      !selectedAgent?.capabilities?.image &&
      files.some((file) => file.type.startsWith("image/"))
    ) {
      setIsAgentModalOpen(true)
      return
    }
    if (
      !selectedAgent?.capabilities?.pdf &&
      files.some((file) => file.type.startsWith("application/pdf"))
    ) {
      setIsAgentModalOpen(true)
      return
    }

    if (
      !selectedAgent?.capabilities?.audio &&
      files.some((file) => file.type.startsWith("audio/"))
    ) {
      setIsAgentModalOpen(true)
      return
    }
    if (
      !selectedAgent?.capabilities?.video &&
      files.some((file) => file.type.startsWith("video/"))
    ) {
      setIsAgentModalOpen(true)
      return
    }
    if (
      !selectedAgent?.capabilities?.text &&
      files.some((file) => file.type.startsWith("text/"))
    ) {
      setIsAgentModalOpen(true)
      return
    }

    shouldStopRef.current = false

    if (requiresSignin && !user) {
      addParams({ signIn: "login" })
      return
    }

    // e.preventDefault()

    if (
      selectedAgent?.maxPromptSize &&
      inputRef.current.length > selectedAgent?.maxPromptSize
    ) {
      toast.error(
        t(`Input too long (max ${selectedAgent?.maxPromptSize} chars)`),
      )
      return
    }

    if (files.length > 0 && !selectedAgent?.capabilities?.text) {
      setIsAgentModalOpen(true)
      return
    }

    if (isWebSearchEnabled && !selectedAgent?.capabilities?.webSearch) {
      setIsAgentModalOpen(true)
      return
    }

    if (getIsSendDisabled()) return

    const userMessageText = sanitizeHtml(inputRef.current.trim())

    if (userMessageText.length > PROMPT_LIMITS.TOTAL) {
      toast.error(t(`Input too long (max ${PROMPT_LIMITS.TOTAL} chars)`))
      return
    }

    setInput("")
    device === "desktop" && setShouldFocus(true)
    setIsLoading(true)

    playNotification()

    if (!suggestSaveApp) {
      if (!threadId && !isImageGenerationEnabled && !isIncognito) {
        toast.success(t("Generating AI thread title, keep calm..."), {
          duration: 6000,
        })
      } else if (isImageGenerationEnabled) {
        toast.success(t("Generating image, keep calm..."), {
          duration: 6000,
        })
      }
    } else {
      const saved = await saveApp()
      if (!saved) {
        return
      }
    }

    // Create abort controller for this request

    // let clientId
    // Notify parent about user message

    onMessage?.({
      content: userMessageText,
      isUser: true,
      message: {
        message: {
          content: userMessageText,
          isUser: true,
          id: uuidv4(),
          clientId: clientIdRef.current,
          createdOn: new Date(),
          guestId: guest?.id,
          userId: user?.id,
        } as unknown as message,
        user: user as user,
        guest: guest as guest,
      },
    })

    setIsLoading(true)

    try {
      let postRequestBody: FormData | string
      let postRequestHeaders: Record<string, string> = {
        Authorization: `Bearer ${token}`,
      }
      if (artifacts && artifacts.length > 0) {
        nProgress.start()

        toast.success(t("Uploading artifacts..."))
        // Use FormData for file uploads
        const formData = new FormData()

        app && formData.append("appId", app?.id)

        formData.append("content", userMessageText)
        formData.append("isIncognito", JSON.stringify(isIncognito))
        selectedAgent && formData.append("agentId", selectedAgent?.id)
        debateAgent && formData.append("debateAgentId", debateAgent?.id)
        threadId && validate(threadId) && formData.append("threadId", threadId)
        formData.append("attachmentType", "file")
        formData.append("webSearchEnabled", JSON.stringify(isWebSearchEnabled))
        formData.append(
          "imageGenerationEnabled",
          JSON.stringify(isImageGenerationEnabled),
        )
        taskId && formData.append("taskId", taskId)
        mood && formData.append("moodId", mood.id)
        formData.append("actionEnabled", JSON.stringify(isExtension))
        formData.append("instructions", instruction)
        formData.append("language", language)
        clientIdRef.current && formData.append("clientId", clientIdRef.current)

        artifacts.forEach((artifact, index) => {
          formData.append(`artifact_${index}`, artifact)
        })

        postRequestBody = formData
        // Don't set Content-Type for FormData - browser will set it with boundary
      } else {
        // Use JSON for text-only messages
        postRequestHeaders["Content-Type"] = "application/json"
        postRequestBody = JSON.stringify({
          content: userMessageText,
          isIncognito: isIncognito,
          agentId: selectedAgent?.id,
          debateAgentId: debateAgent?.id,
          threadId: threadId && validate(threadId) ? threadId : null,
          webSearchEnabled: isWebSearchEnabled && !isExtension,
          imageGenerationEnabled: isImageGenerationEnabled,
          actionEnabled: isExtension,
          instructions: instruction,
          language,
          attachmentType: "file",
          clientId: clientIdRef.current,
          appId: app?.id,
          moodId: mood?.id,
          taskId,
        })
      }
      const userResponse = await apiFetch(`${API_URL}/messages`, {
        method: "POST",
        headers: postRequestHeaders,
        body: postRequestBody,
      })
      console.log("userResponse", `${API_URL}/messages`, app?.name)

      if (debateAgent) {
        toast.success(t("Let's debate!"))
      }

      let result = undefined
      if (
        userResponse.headers.get("content-type")?.includes("application/json")
      ) {
        result = await userResponse.json()
        if (result.error) {
          nProgress.done()
          toast.error(result.error)
          return
        }
        // handle non-streaming JSON response
      }

      if (!userResponse.ok) {
        nProgress.done()
        toast.error("Failed to send message. Response is not ok")
        return
      }

      setIsLoading(false)

      nProgress.done()

      setInstruction("")
      setArtifacts([])

      const userMessage: {
        message: message
        user?: user
        guest?: guest
        aiAgent?: aiAgent
        thread?: thread
      } | null = result.message

      setMessage(userMessage)
      // Refresh tasks list after first message to task (to get newly created threadId)
      !threadId && taskId && fetchTasks()
      // playNotification()

      // const clientId = message?.message?.clientId

      if (userMessage?.message?.id) {
        setThreadId(userMessage?.message?.threadId)
        if (collaborationStep === 2) {
          setCollaborationStep(3)
        }
        clearFiles()

        onMessage?.({
          content: userMessageText,
          isUser: true,
          message: userMessage,
        })
      } else {
        toast.error("Failed to send message")
        return
      }

      if (!selectedAgent || !userMessage?.message?.clientId) {
        return
      }

      // Prepare request data - use FormData if files are present, JSON otherwise
      let requestBody: FormData | string
      let requestHeaders: Record<string, string> = {
        Authorization: `Bearer ${token}`,
      }

      if (files && files.length > 0) {
        // Use FormData for file uploads
        const formData = new FormData()
        slug && formData.append("slug", slug)
        app?.id && formData.append("appId", app.id)
        app?.id === chrry?.id &&
          suggestSaveApp &&
          appStatus?.part &&
          formData.append("draft", JSON.stringify(appFormWatcher))
        formData.append("messageId", userMessage?.message.id || "")
        debateAgent && formData.append("debateAgentId", debateAgent.id)
        formData.append("agentId", selectedAgent.id)
        formData.append("language", language || "en")
        isWebSearchEnabled &&
          formData.append("webSearchEnabled", isWebSearchEnabled.toString())
        formData.append("actionEnabled", isExtension.toString())
        formData.append(
          "imageGenerationEnabled",
          isImageGenerationEnabled.toString(),
        )

        placeholder && formData.append("placeholder", placeholder)

        weather && formData.append("weather", JSON.stringify(weather))

        formData.append("attachmentType", "file")
        deviceId && formData.append("deviceId", deviceId)

        isSpeechActive && formData.append("isSpeechActive", "true")

        // Add files to FormData
        files.forEach((file, index) => {
          formData.append(`file_${index}`, file)
        })

        requestBody = formData
        // Don't set Content-Type for FormData - browser will set it with boundary
      } else {
        // Use JSON for text-only messages
        requestHeaders["Content-Type"] = "application/json"
        requestBody = JSON.stringify({
          debateAgentId: debateAgent?.id,
          messageId: userMessage?.message.id,
          agentId: selectedAgent.id,
          language,
          actionEnabled: isExtension,
          webSearchEnabled: isWebSearchEnabled,
          imageGenerationEnabled: isImageGenerationEnabled,
          isSpeechActive,
          deviceId,
          weather,
          placeholder,
          appId: app?.id,
          draft:
            app?.id === chrry?.id && suggestSaveApp && appStatus?.part
              ? appFormWatcher
              : undefined,
        })
      }

      onMessage?.({
        content: "",
        isUser: false,
        message: {
          ...userMessage,
          message: {
            ...userMessage.message,
            id: userMessage?.message?.clientId,
          },
        },
        isStreaming: true,
        isImageGenerationEnabled,
        isWebSearchEnabled,
      })

      setIsStreaming(true)

      // const foo = false
      // if (!foo) return

      const agentResponse = await apiFetch(`${API_URL}/ai`, {
        method: "POST",
        headers: requestHeaders,
        body: requestBody,
        signal: controller.signal,
      })

      // Handle error responses (including 413 Request too large)
      if (!agentResponse.ok) {
        if (
          agentResponse.headers
            .get("content-type")
            ?.includes("application/json")
        ) {
          const result = await agentResponse.json()
          if (result.error) {
            // Show detailed error message for oversized requests
            if (agentResponse.status === 413 && result.message) {
              toast.error(result.message)
            } else {
              toast.error(result.error)
            }
            return
          }
        }

        // Generic error for non-JSON responses
        toast.error("Failed to send message")
        return
      }

      // Handle successful JSON responses
      if (
        agentResponse.headers.get("content-type")?.includes("application/json")
      ) {
        const result = await agentResponse.json()
        if (result.error) {
          toast.error(result.error)
          return
        }
        if (result.success) {
          return
        }
        // handle other non-streaming JSON responses
      }
    } catch (error: any) {
      console.error("Chat error:", error)
      captureException(error)
      // Could add onError callback here
    } finally {
      setIsLoading(false)
      clientIdRef.current = uuidv4()
    }
  }

  useEffect(() => {
    let isProcessing = false
    let message = ""
    const processAction = async () => {
      if (isProcessing) return
      isProcessing = true

      try {
        const result = (await BrowserInstance?.storage?.local?.get?.([
          "contextMenuAction",
        ])) as { contextMenuAction: { type: string; text: string } }

        const type = result?.contextMenuAction?.type
        if (type) {
          if (selectedAgent?.name === "flux") setSelectedAgent(undefined)
          message = (() => {
            if (type === "writeReply") {
              return t(`✍️ Please help me write a reply to`)
            } else if (type === "checkGrammar")
              return t(`📝 Please check the grammar in this text`)
            else if (type === "aiDebate")
              return t(`⚖️ Let's have a debate about this`)
            else if (type === "factCheck")
              return t(`🔍 Please fact check this statement`)
            else if (type === "summarize")
              return t(`📋 Please summarize this text`)

            return message
          })()
        }

        if (result?.contextMenuAction?.text) {
          setInput(`${message}: ${result.contextMenuAction.text}`)

          const storageLocal = BrowserInstance?.storage?.local
          if (storageLocal && "remove" in storageLocal) {
            await storageLocal.remove(["contextMenuAction"])
          }

          if (type !== "aiDebate") {
            debateAgent && setDebateAgent(null)
            setAttempt("submit")
            setShouldSubmit(true)
          } else {
            if (selectedAgent === null) {
              setSelectedAgent(undefined)
            }
            if (!debateAgent) {
              setIsDebateAgentModalOpen(true)
              setAttempt("debate")
            } else {
              setAttempt("debate")
              setShouldSubmit(true)
            }
          }
        }
      } catch (error) {
        console.error("Error processing action:", error)
        captureException(error)
      } finally {
        isProcessing = false
      }
    }

    // Primary: Storage change listener (instant)
    const handleStorageChange = (changes: any, areaName?: string) => {
      if (areaName === "local" && changes.contextMenuAction?.newValue?.text) {
        processAction()
      }
    }

    // Fallback: Check on mount and occasional polling
    processAction()
    const interval = setInterval(processAction, 2000) // Reduced to 2s

    const storageAPI = BrowserInstance?.storage
    const hasOnChanged =
      storageAPI && "onChanged" in storageAPI && storageAPI.onChanged

    if (hasOnChanged) {
      storageAPI.onChanged.addListener(handleStorageChange)
    }

    return () => {
      clearInterval(interval)
      if (hasOnChanged) {
        storageAPI.onChanged.removeListener(handleStorageChange)
      }
    }
  }, [setInput])

  const [streamId, setStreamId] = useState<string | null>(null)
  const handleStopStreaming = async () => {
    addHapticFeedback()
    isPlayingSillyPopCluster.current = false

    apiFetch(`${API_URL}/ai`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        stopStreamId: streamId,
        messageId: message?.message.id,
        agentId: isDebating
          ? message?.message.debateAgentId
          : message?.message.selectedAgentId,
      }),
    })
      .then((response) => response.json())
      .then((result) => {
        const costs = !isDebating
          ? selectedAgent?.creditCost || 1
          : debateAgent
            ? debateAgent?.creditCost || 1
            : 0

        creditsLeft && setCreditsLeft(creditsLeft - costs)

        message &&
          onStreamingStop?.({
            ...message,
            message: {
              ...message.message,
            },
          })
        setIsStreaming(false)
        setIsLoading(false)
        shouldStopRef.current = true
        streamContentRef.current = ""
      })

    if (controller) {
      controller.abort()
      // Re-enable sending after a short delay
      setTimeout(() => {
        // This timeout allows the UI to update and prevents immediate re-sending
      }, 1000)
    }
  }

  const handleInputChange = (
    e:
      | React.ChangeEvent<HTMLTextAreaElement>
      | React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value
    setInput(value)

    // Handle typing notifications for collaborative threads
    if (onTyping && thread) {
      // Clear existing timeout

      // If input is empty, immediately stop typing
      if (value.length === 0) {
        onTyping(false)
      } else {
        onTyping(true)
      }
    }
  }

  function getUnlockTime() {
    if (user) {
      if (!user?.lastMessage?.createdOn) return null
      return new Date(
        new Date(user?.lastMessage?.createdOn).getTime() + 60 * 60 * 1000,
      )
    }
    if (guest) {
      if (!guest?.lastMessage?.createdOn) return null
      return new Date(
        new Date(guest?.lastMessage?.createdOn).getTime() + 60 * 60 * 1000,
      )
    }

    return null
  }

  const placeholderStages = [".", "..", "..."]
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [showPlaceholderGlow, setShowPlaceholderGlow] = useState(false)
  const previousPlaceholder = useRef(placeholder)

  const animationLoop = useRef<number>(0)

  // Trigger glow effect on initial load AND when placeholder changes
  useEffect(() => {
    if (placeholder) {
      // Trigger on load or change
      if (
        !previousPlaceholder.current ||
        placeholder !== previousPlaceholder.current
      ) {
        setShowPlaceholderGlow(true)
        previousPlaceholder.current = placeholder

        // Remove glow after animation completes
        const timer = setTimeout(() => {
          setShowPlaceholderGlow(false)
        }, 2000) // Match animation duration

        return () => clearTimeout(timer)
      }
    }
  }, [placeholder])

  useEffect(() => {
    let interval: any = null
    // Only animate if input is empty and not focused
    if (inputRef.current.length > 0) {
      interval && clearInterval(interval)
      return
    }
    interval = setInterval(() => {
      animationLoop.current = animationLoop.current + placeholderIndex + 1

      setPlaceholderIndex((i) => (i + 1) % placeholderStages.length)
      if (animationLoop.current >= placeholderStages.length + 2) {
        interval && clearInterval(interval)
      }
    }, 600) // adjust speed as desired
    return () => clearInterval(interval)
  }, [inputRef.current])

  // function formatUnlockTime(date: Date | null) {
  //   if (!date) return ""
  //   return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  // }

  const [isGame, setIsGameInternal] = useState(false)
  const setIsGame = (value: boolean) => {
    setIsGameInternal(value)
    track({
      name: "game-toggle",
      props: {
        isGame: value,
      },
    })
  }

  const shouldStopRef = useRef(false)

  const streamContentRef = useRef("")

  const isPlayingSillyPopCluster = useRef(false)

  // Memoize deps to prevent reconnection loop
  const webSocketDeps = useMemo(() => [isSpeechActive], [isSpeechActive])

  useWebSocket<{
    type: string
    data: {
      clientId?: string
      streamId?: string
      chunk?: string
      isImageGenerationEnabled?: boolean
      isWebSearchEnabled?: boolean
      message?: {
        message: message & { parentMessage?: message }
        user?: user
        guest?: guest
        aiAgent?: aiAgent
      }
      isFinal?: boolean
      deviceId?: string
    }
  }>({
    deps: webSocketDeps,
    onMessage: async ({ type, data }) => {
      const threadId = threadIdRef.current

      if (!token) return

      const clientId = data?.clientId

      if (type === "stream_update" && data.chunk && clientId) {
        if (isSpeechActive && os !== "ios") {
          return
        }

        if (threadId && data.message?.message?.threadId !== threadId) {
          return
        }
        if (!isPlayingSillyPopCluster.current) {
          playNotification()
          isPlayingSillyPopCluster.current = true
        }

        data.streamId && setStreamId(data.streamId)
        if (shouldStopRef.current) return // Early exit if stopped

        // Accumulate chunks
        if (!shouldStopRef.current) {
          streamContentRef.current += data.chunk
          const cleanContent = stripActionText(
            streamContentRef.current,
            data.chunk,
          )
          onStreamingUpdate?.({
            content: cleanContent,
            clientId,
            aiAgent: data.message?.aiAgent,
            isWebSearchEnabled,
            isImageGenerationEnabled,
          })
        }
      } else if (type === "stream_complete") {
        const threadId = data.message?.message?.threadId

        isPlayingSillyPopCluster.current = false
        setIsStreaming(false)

        if (!threadId) return
        if (threadId && data.message?.message?.threadId !== threadId) {
          return
        }
        if (!data.message?.aiAgent) {
          return
        }
        // Get final message
        // Reset stream state
        streamContentRef.current = ""

        // Play AI response with TTS if in voice conversation mode (skip on ios)
        if (isSpeechActive && data.message?.message?.content) {
          if (os === "ios") {
            setIsSpeechActive(false)
            setIsSpeaking(false)
            setIsSpeechActive(false)
          } else {
            data?.message?.message?.content !== undefined &&
              setVoiceMessages((prev) => [
                ...prev,
                { text: stripMarkdown(data?.message?.message?.content!) },
              ])
          }
        }

        // Notify completion
        onStreamingComplete?.(data.message)

        if (
          message?.message &&
          isOwner(data.message.message, {
            userId: user?.id,
            guestId: guest?.id,
          })
        ) {
          if (user) {
            setUser({
              ...user,
              lastMessage: data.message.message,
              messagesLastHour: (user.messagesLastHour || 0) + 1,
            })
          }

          if (guest) {
            setGuest({
              ...guest,
              lastMessage: data.message.message,
              messagesLastHour: (guest.messagesLastHour || 0) + 1,
            })
          }
        }

        if (
          data.message.message.debateAgentId &&
          !data.message.message.pauseDebate
        ) {
          isOwner(data.message.message, {
            userId: user?.id,
            guestId: guest?.id,
          }) && setIsDebating(true)

          onMessage?.({
            content: "",
            isUser: false,
            message: {
              ...data.message,
              message: {
                ...data.message?.message,
                id: data.message.message.clientId,
              },
              aiAgent: aiAgents?.find(
                (agent) => agent.id === data.message?.message.debateAgentId,
              ),
            },
            isStreaming: true,
            isImageGenerationEnabled: data?.isImageGenerationEnabled,
            isWebSearchEnabled: data?.isWebSearchEnabled,
          })
          const requestHeaders = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          }
          const requestBody = JSON.stringify({
            messageId: data.message.message.id,
            agentId: data.message.message.debateAgentId,
            debateAgentId: data.message.message.agentId,
            language,
            pauseDebate: true,
            isSpeechActive,
          })

          try {
            const agentResponse = await apiFetch(`${API_URL}/ai`, {
              method: "POST",
              headers: requestHeaders,
              body: requestBody,
              signal: controller.signal,
            })

            if (!agentResponse.ok) {
              toast.error("Error starting debate")
              return
            }

            const agentData = await agentResponse.json()

            if (agentData.error) {
              toast.error(agentData.error)
              return
            }
            setIsStreaming(true)
          } catch (error) {
            console.error("Error updating message:", error)
            captureException(error)
            toast.error("Error starting debate")
          }
        } else {
          if (
            isOwner(data.message.message, {
              userId: user?.id,
              guestId: guest?.id,
            })
          ) {
            setIsDebating(false)
          }
        }
      } else if (type === "message" && data.message) {
        if (!threadId || data.deviceId === deviceId) return
        if (threadId && data.message?.message.threadId !== threadId) {
          return
        }

        onMessage?.({
          content: data.message?.message.content || "",
          isUser: true,
          message: data.message,
          isImageGenerationEnabled: data?.isImageGenerationEnabled,
          isWebSearchEnabled: data?.isWebSearchEnabled,
        })

        data.message.message.selectedAgentId &&
          onMessage?.({
            content: "",
            isUser: false,
            message: {
              ...data.message,
              message: {
                ...data.message?.message,
                id: data.message.message.clientId,
              },
            },
            isStreaming: true,
            isImageGenerationEnabled: data?.isImageGenerationEnabled,
            isWebSearchEnabled: data?.isWebSearchEnabled,
          })
      }
    },
    token,
    deviceId,
  })

  const [isPrivacyApproved, setIsPrivacyApproved] = useLocalStorage(
    "isPrivacyApproved",
    !!user,
  )

  const [needsReview, setNeedsReviewInternal] = useState(false)
  const needsReviewRef = useRef(needsReview)

  const setNeedsReview = (value: boolean) => {
    setNeedsReviewInternal(value)
    needsReviewRef.current = value
  }

  useEffect(() => {
    threadId && scrollToBottom()
  }, [threadId])

  const handlePaste = (e: React.ClipboardEvent) => {
    addHapticFeedback()
    device === "desktop" && setShouldFocus(true)

    if (e.clipboardData.files.length > 0) {
      const imageFiles = Array.from(e.clipboardData.files).filter((file) =>
        file.type.startsWith("image/"),
      )

      if (imageFiles.length > 0) {
        e.preventDefault()

        // Check agent capabilities for images
        if (!selectedAgent?.capabilities.image) {
          setIsAgentModalOpenInternal(true)
          return
        }

        if (debateAgent && !debateAgent.capabilities.image) {
          setIsDebateAgentModalOpen(true)
          return
        }

        // Check file count limit
        const remainingSlots = MAX_FILES - files.length
        if (remainingSlots <= 0) {
          toast.error(t("Too many files"))
          return
        }

        // Add the images (respecting remaining slots)
        const filesToAdd = imageFiles.slice(0, remainingSlots)
        setFiles((prev) => [...prev, ...filesToAdd])
        return
      }
    }
    const text = e.clipboardData.getData("text/plain")

    if (text.length > 700) {
      e.preventDefault()
      if (!selectedAgent?.capabilities.pdf) {
        setIsAgentModalOpenInternal(true)
        return
      }

      if (debateAgent && !debateAgent?.capabilities.pdf) {
        setIsDebateAgentModalOpen(true)
        return
      }
      // Use agent-specific limit if available, otherwise default
      const maxSize = getMaxFileSize("text/plain")

      if (text.length > maxSize) {
        toast.error(t(`Paste limit exceeded (max ${maxSize} chars)`))
        return
      }

      const blob = new Blob([text], { type: "text/plain" })
      const file = new File([blob], "pasted.txt", {
        type: "text/plain",
        lastModified: Date.now(),
      })

      if (files.length >= MAX_FILES) {
        toast.error(t("Too many files"))
        return
      }

      if (file.size > maxSize) {
        const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1)
        toast.error(`${file.name}: File too large. Max size: ${maxSizeMB}MB`)
        return
      }

      setFiles([...files, file])
      e.preventDefault()
    }
  }

  useEffect(() => {
    onToggleGame?.(isGame)
  }, [isGame])

  useEffect(() => {
    onToggleGame?.(isGame)
  }, [isGame])

  const unlockDate = getUnlockTime()
  const remainingMs = useCountdown(hitHourlyLimit ? unlockDate : null)

  function formatTime(seconds: number) {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const [exceededInitial, setExceededInitial] = useState(false)
  const initialHeight = useRef<number | null>(null)

  useEffect(() => {
    if (chatInputRef.current) {
      const el = chatInputRef.current

      // Save initial height on first render
      if (initialHeight.current === null) {
        initialHeight.current = el.scrollHeight
      }

      // Only adjust height if there's actual input
      if (input) {
        // Reset height to auto, then expand
        el.style.height = "auto"
        const newHeight = el.scrollHeight

        // For extensions, cap the max height to prevent very tall initial height
        const maxHeight = newHeight
        el.style.height = Math.min(newHeight, maxHeight) + "px"

        // Check if exceeded (works for both input and placeholder)
        setExceededInitial(el.scrollHeight > (initialHeight.current + 30 || 0))
      } else {
        // Reset to initial height when input is empty
        if (initialHeight.current) {
          el.style.height = initialHeight.current + "px"
        }
        setExceededInitial(false)
      }
    }
  }, [input])

  const getIsSendDisabled = () =>
    (inputRef.current.trim() === "" && files.length === 0) ||
    isLoading ||
    hitHourlyLimit ||
    creditsLeft === 0 ||
    disabled

  const isVoiceDisabled =
    isLoading || hitHourlyLimit || creditsLeft === 0 || disabled

  const [speechSupported, setSpeechSupported] = useState(false)

  useEffect(() => {
    const hasRecognition =
      "SpeechRecognition" in window || "webkitSpeechRecognition" in window

    setSpeechSupported(hasRecognition)
  }, [])

  useEffect(() => {
    device === "desktop" && setShouldFocus(true)
  }, [device])

  useEffect(() => {
    hitHourlyLimit &&
      track({
        name: "hit-hourly-limit",
        props: {
          hourlyUsageLeft,
        },
      })
  }, [hitHourlyLimit])

  useEffect(() => {
    files.length > 0 &&
      track({
        name: "file-upload",
        props: {
          filesLength: files.length,
        },
      })
  }, [files])

  const [creditEstimate, setCreditEstimate] = useState<{
    multiplier: number
    taskType: string
    warning?: string
  } | null>(null)

  const needSearch = needsWebSearch(inputRef.current)

  // Scroll detection for auto-hide chat input
  useEffect(() => {
    if (empty) return
    const checkBottomOffset = () => {
      const scrollPosition = window.scrollY
      const documentHeight = document.documentElement.scrollHeight
      const viewportHeight = window.innerHeight
      const distanceFromBottom =
        documentHeight - (scrollPosition + viewportHeight)

      // Has bottom offset if not at the very bottom (more than 100px from bottom)
      setHasBottomOffset(distanceFromBottom > 100)
    }

    const handleScroll = () => {
      const scrollPosition = window.scrollY
      const documentHeight = document.documentElement.scrollHeight
      const currentWindowHeight = window.innerHeight
      const distanceFromBottom =
        documentHeight - (scrollPosition + currentWindowHeight)

      // Show chat input when within 150px of bottom
      setShowChatInput(distanceFromBottom <= 150)

      // Check for bottom offset
      checkBottomOffset()
    }

    const handleResize = () => {
      setWindowHeight(window.innerHeight)
      // Check for bottom offset after resize
      setTimeout(checkBottomOffset, 0) // Defer to next tick
    }

    const handleDOMChange = () => {
      // Only update window height if it actually changed
      const currentHeight = window.innerHeight
      setWindowHeight((prev) => (prev !== currentHeight ? currentHeight : prev))
      // Check for bottom offset when DOM changes
      setTimeout(checkBottomOffset, 0) // Defer to next tick
    }

    // Initial check for bottom offset
    setTimeout(checkBottomOffset, 0)

    // Add comprehensive event listeners
    window.addEventListener("scroll", handleScroll)
    window.addEventListener("resize", handleResize)
    window.addEventListener("orientationchange", handleResize)

    // Listen for DOM changes that could affect layout
    // Use throttling to prevent excessive calls
    let domChangeTimeout: ReturnType<typeof setTimeout> | null = null
    const throttledDOMChange = () => {
      if (domChangeTimeout) return
      domChangeTimeout = setTimeout(() => {
        handleDOMChange()
        domChangeTimeout = null
      }, 100) // Throttle to max once per 100ms
    }

    const observer = new MutationObserver(throttledDOMChange)
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class", "height"],
    })

    // Listen for image loads and other layout-affecting events
    window.addEventListener("load", handleDOMChange)
    window.addEventListener("DOMContentLoaded", handleDOMChange)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("orientationchange", handleResize)
      window.removeEventListener("load", handleDOMChange)
      window.removeEventListener("DOMContentLoaded", handleDOMChange)
      observer.disconnect()
      if (domChangeTimeout) {
        clearTimeout(domChangeTimeout)
      }
    }
  }, [empty])

  const scrollToBottom = (timeout = 500) => {
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })
    }, timeout)
  }
  // Function to show chat input and scroll to bottom
  const showInputAndScrollToBottom = () => {
    addHapticFeedback()
    scrollToBottom()
  }

  const [shouldSubmit, setShouldSubmit] = useState(false)

  useEffect(() => {
    if (
      shouldSubmit &&
      ((attempt === "debate" && debateAgent && selectedAgent) ||
        (attempt === "submit" && selectedAgent && !debateAgent))
    ) {
      setTimeout(handleSubmit, 500)
      setShouldSubmit(false)
      setAttempt(undefined)
    }
  }, [shouldSubmit, selectedAgent, attempt, debateAgent])

  useEffect(() => {
    if (showSuggestions) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        animateSuggestions()
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [showSuggestions])

  const renderSubmit = () => {
    return (
      <>
        {!isSelectingMood && (
          <>
            {streamId && isStreaming ? (
              <button
                data-testid="chat-stop-streaming-button"
                title={t("Stop streaming")}
                className={clsx("link", styles.sendButton)}
                type="button"
                disabled={!isStreaming}
                onClick={handleStopStreaming}
              >
                <CircleStop color="var(--accent-0)" size={26} />
              </button>
            ) : isLoading && !isStreaming ? (
              <Loading width={28} height={28} />
            ) : inputRef.current.trim() || files.length > 0 ? (
              <button
                data-testid="chat-send-button"
                title={
                  creditsLeft === 0
                    ? t("credits_left", { count: creditsLeft })
                    : needsReviewRef.current
                      ? t("Accept and send")
                      : t("Send")
                }
                className={clsx("link", styles.sendButton)}
                type="submit"
                disabled={getIsSendDisabled()}
                onClick={() => handleSubmit(needsReviewRef.current)}
              >
                {needsReviewRef.current ? (
                  <span data-testid="chat-accept-button">
                    <CircleCheck size={30} color="var(--accent-6)" />
                  </span>
                ) : (
                  <CircleArrowUp
                    color={
                      creditsLeft === 0
                        ? "var(--accent-0)"
                        : getIsSendDisabled()
                          ? "var(--shade-3)"
                          : "var(--accent-6)"
                    }
                    size={30}
                  />
                )}
              </button>
            ) : isLoading ? (
              <Loading width={26} height={26} />
            ) : (
              <button
                onClick={() => {
                  if (
                    guest &&
                    selectedAgent?.authorization &&
                    !["all", "guest"].includes(selectedAgent?.authorization)
                  ) {
                    addParams({
                      subscribe: "true",
                      plan: "member",
                    })

                    return
                  }
                  if (!isPrivacyApproved) {
                    if (needsReview) {
                      // Approve and start voice conversation
                      setIsPrivacyApproved(true)
                      setNeedsReview(false)

                      playNotification()
                      addHapticFeedback()

                      setPlayVideo(!playVideo)
                      setIsLoading(true)
                      startVoiceConversation()
                    } else {
                      setNeedsReview(true)
                    }
                    return
                  }

                  playNotification()
                  addHapticFeedback()

                  setPlayVideo(!playVideo)
                  setIsLoading(true)
                  startVoiceConversation()
                }}
                disabled={isVoiceDisabled || inConversationRef.current}
                className={clsx(
                  "link",
                  styles.voiceButton,
                  isListening ? styles.voiceButtonListening : "",
                )}
                type="button"
                title={
                  isListening ? t("Stop listening") : t("Start voice input")
                }
              >
                {needsReview ? (
                  <span data-testid="chat-accept-button">
                    <CircleCheck size={30} color="var(--accent-6)" />
                  </span>
                ) : (
                  <div
                    className={clsx(styles.videoContainer)}
                    title={t("Sound")}
                  >
                    {needsReview ? (
                      <span data-testid="chat-accept-button">
                        <CircleCheck size={30} color="var(--accent-6)" />
                      </span>
                    ) : (
                      <video
                        onLoadedData={() => setIsVideoLoading(false)}
                        ref={videoRef}
                        src={`${FRONTEND_URL}/video/blob.mp4`}
                        style={{}}
                        className={styles.video}
                        loop
                        autoPlay
                        muted
                        playsInline
                      ></video>
                    )}
                  </div>
                )}
              </button>
            )}
          </>
        )}
      </>
    )
  }

  return (
    <>
      {isAgentModalOpen && (
        <Modal
          dataTestId="agent-modal"
          hasCloseButton
          hideOnClickOutside={false}
          isModalOpen={isAgentModalOpen}
          title={
            <>
              <Sparkles
                fill="var(--accent-1)"
                strokeWidth={1}
                color="var(--accent-1)"
                size={22}
              />
              <span>
                {t(
                  isDebateAgentModalOpen
                    ? "Add debate agent"
                    : "Select an agent",
                )}
              </span>
            </>
          }
          onToggle={() => setIsAgentModalOpen(!isAgentModalOpen)}
        >
          <div className={styles.modalContent}>
            {aiAgents
              ?.filter((agent) =>
                isDebateAgentModalOpen
                  ? files.length
                    ? agent.capabilities.pdf
                    : agent.capabilities.text &&
                      agent.state === "active" &&
                      agent.id !== selectedAgent?.id &&
                      agent.id !== debateAgent?.id
                  : debateAgent
                    ? agent.id !== debateAgent.id
                    : true,
              )
              .sort((a, b) => {
                if (a.id === sushiAgent?.id) {
                  return -1
                }
                return a.order - b.order
              })
              ?.map((agent) => (
                <div className={styles.agentModal} key={agent.id}>
                  <div className={styles.buttonContainer}>
                    <div className={styles.agentButtonContainer}>
                      <button
                        translate="no"
                        data-agent-name={agent.name}
                        data-testid={`agent-modal-button-${agent.name}`}
                        className={clsx(
                          "medium",
                          styles.agentButtonModal,
                          (agent.authorization === "user" &&
                            !user &&
                            !guest?.subscription) ||
                            agent.id === sushiAgent?.id
                            ? "inverted"
                            : (user || guest)?.favouriteAgent === agent.name
                              ? styles.favorite
                              : agent.name === selectedAgent?.name
                                ? styles.current
                                : styles[agent.state],
                        )}
                        onClick={() => {
                          addHapticFeedback()
                          if (agent.state !== "active") {
                            return
                          }
                          if (
                            agent.authorization === "user" &&
                            !user &&
                            !guest?.subscription
                          ) {
                            const url = threadId
                              ? `/threads/${threadId}?subscribe=true&plan=member`
                              : "/?subscribe=true&plan=member"

                            if (checkIsExtension()) {
                              BrowserInstance?.runtime?.sendMessage?.({
                                action: "openInSameTab",
                                url: `${FRONTEND_URL}${url}`,
                              })

                              return
                            }

                            push(url)
                            return
                          }
                          isDebateAgentModalOpen
                            ? setDebateAgent(agent)
                            : setSelectedAgent(agent)
                          setIsAgentModalOpen(false)
                          setIsDebateAgentModalOpen(false)

                          if (attempt === "webSearch") {
                            setIsWebSearchEnabled(true)
                            setAttempt(undefined)
                          } else if (
                            attempt === "submit" ||
                            attempt === "debate"
                          ) {
                            setShouldSubmit(true)
                          }
                        }}
                      >
                        {agent.name === "deepSeek" ? (
                          <DeepSeek size={18} />
                        ) : agent.name === "chatGPT" ? (
                          <OpenAI size={18} />
                        ) : agent.name === "claude" ? (
                          <Claude size={18} />
                        ) : agent.name === "gemini" ? (
                          <Gemini size={18} />
                        ) : agent.name === "flux" ? (
                          <Flux size={18} />
                        ) : agent.name === "perplexity" ? (
                          <Perplexity size={18} />
                        ) : agent.name === "sushi" ? (
                          <Img icon="sushi" size={22} />
                        ) : null}{" "}
                        {agent.displayName}
                      </button>

                      {(user || guest)?.favouriteAgent === agent.name ? (
                        <span className={styles.stateLabel}>
                          <Star
                            color="var(--accent-1)"
                            fill="var(--accent-1)"
                            size={17}
                          />{" "}
                        </span>
                      ) : (
                        <button
                          title={t("Set as favorite")}
                          className={clsx(styles.favoriteButton, "link")}
                          onClick={async () => {
                            addHapticFeedback()
                            user &&
                              setUser({
                                ...user,
                                favouriteAgent: agent.name,
                              })
                            guest &&
                              setGuest({
                                ...guest,
                                favouriteAgent: agent.name,
                              })

                            try {
                              const response = await apiFetch(
                                `${API_URL}/${user ? "user" : "guest"}`,
                                {
                                  method: "PATCH",
                                  headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`,
                                  },
                                  body: JSON.stringify({
                                    favouriteAgent: agent.name,
                                  }),
                                },
                              )
                              const data = await response.json()

                              if (!response.ok || data.error) {
                                toast.error(
                                  data.error || t("Error updating username"),
                                )
                              }
                            } catch (error) {
                              toast.error(t("Error updating favorite agent"))
                            } finally {
                            }
                          }}
                        >
                          <Star
                            color="var(--accent-1)"
                            strokeWidth={1.5}
                            size={17}
                          />
                        </button>
                      )}
                    </div>

                    {agent.authorization === "user" &&
                    !user &&
                    !guest?.subscription &&
                    agent.state === "active" ? (
                      <span className={styles.stateLabel}>
                        <button
                          onClick={() => {
                            addHapticFeedback()
                            // setIsAgentModalOpen(false)
                            const url = threadId
                              ? `/threads/${threadId}?subscribe=true&plan=member`
                              : "/?subscribe=true&plan=member"

                            if (checkIsExtension()) {
                              BrowserInstance?.runtime?.sendMessage?.({
                                action: "openInSameTab",
                                url: `${FRONTEND_URL}${url}`,
                              })
                              return
                            }

                            push(url)
                          }}
                          className={clsx(styles.loginButton, "link")}
                        >
                          <LogIn color="var(--accent-6)" size={14} />{" "}
                          {t("Login")}
                        </button>
                      </span>
                    ) : (
                      <>
                        {agent.state === "active" && (
                          <span className={styles.stateLabelContainer}>
                            <span className={styles.creditCost}>
                              <Coins size={15} color="var(--accent-1)" />
                              {t("credits", {
                                count: agent.creditCost,
                              })}
                            </span>
                            <span className={styles.stateLabel}>
                              <CircleCheck
                                color={
                                  agent.name === selectedAgent?.name
                                    ? "var(--accent-4)"
                                    : "var(--accent-5)"
                                }
                                size={14}
                              />{" "}
                              {t(
                                agent.name === selectedAgent?.name
                                  ? "Current"
                                  : "Active",
                              )}
                            </span>
                          </span>
                        )}
                        {agent.state === "testing" && (
                          <span className={styles.stateLabel}>
                            <Info color="var(--accent-1)" size={14} />{" "}
                            {t("In testing")}
                          </span>
                        )}
                        {agent.state === "inactive" && (
                          <span className={styles.stateLabel}>
                            <Info size={14} /> {t("Soon")}
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {agent.description && (
                    <div className={styles.agentModalDescription}>
                      <span className={styles.capabilitiesLabel}>
                        {Object.entries(agent.capabilities).map(
                          ([key, value]) => {
                            return (
                              <span
                                title={`${value ? "✅" : "❌"} ${key === "pdf" ? "PDF" : t(capitalizeFirstLetter(key))}`}
                                key={key}
                                className={styles.stateLabel}
                              >
                                {(key === "text" && (
                                  <TextIcon
                                    color={
                                      value
                                        ? `var(--accent-6)`
                                        : `var(--shade-3)`
                                    }
                                    size={14}
                                  />
                                )) ||
                                  (key === "pdf" && (
                                    <FileText
                                      color={
                                        value
                                          ? `var(--accent-6)`
                                          : `var(--shade-3)`
                                      }
                                      size={14}
                                    />
                                  )) ||
                                  (key === "webSearch" && (
                                    <Globe
                                      color={
                                        value
                                          ? `var(--accent-6)`
                                          : `var(--shade-3)`
                                      }
                                      size={14}
                                    />
                                  )) ||
                                  (key === "image" && (
                                    <ImageIcon
                                      color={
                                        value
                                          ? `var(--accent-6)`
                                          : `var(--shade-3)`
                                      }
                                      size={14}
                                    />
                                  )) ||
                                  (key === "imageGeneration" && (
                                    <Palette
                                      color={
                                        value
                                          ? `var(--accent-6)`
                                          : `var(--shade-3)`
                                      }
                                      size={14}
                                    />
                                  )) ||
                                  (key === "audio" && (
                                    <AudioLines
                                      color={
                                        value
                                          ? `var(--accent-6)`
                                          : `var(--shade-3)`
                                      }
                                      size={14}
                                    />
                                  )) ||
                                  (key === "video" && (
                                    <VideoIcon
                                      color={
                                        value
                                          ? `var(--accent-6)`
                                          : `var(--shade-3)`
                                      }
                                      size={14}
                                    />
                                  ))}
                              </span>
                            )
                          },
                        )}
                      </span>
                      {t(agent.description)}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </Modal>
      )}
      {!thread && showSuggestions && !isGame && (
        <App
          onSave={(instruction) => {
            setInstructionsIndex(instructionsIndex + 1)
            setArtifacts(instruction.artifacts)
            setInstruction(instruction.content)
            // Start collaboration wizard after instructions are saved
            if (isShowingCollaborate) {
              setCollaborationStep(1)
            }
          }}
        />
      )}
      <div
        key={isChatFloating ? "floating" : "fixed"}
        className={clsx(
          styles.chatContainerWrapper,
          isDrawerOpen && styles.drawerOpen,
          className,
          os && styles[os],
          isStandalone && styles.standalone,
        )}
      >
        {isSpeechActive && (
          <Modal
            isModalOpen={isSpeechActive}
            hideOnClickOutside={false}
            onToggle={(open) => {
              if (!open) {
                stopSpeechConversation()
              }

              setIsSpeechActive(open)
            }}
            icon={
              <video
                className={styles.video}
                src={`${FRONTEND_URL}/video/blob.mp4`}
                autoPlay
                loop
                muted
                playsInline
              ></video>
            }
            title={
              <div className={styles.speechModalTitle}>
                <span>
                  {isListening ? (
                    <>{t("I'm listening...")}</>
                  ) : isSpeaking ? (
                    t("Speaking...")
                  ) : limitCheck.allowed ? (
                    t("Waiting...")
                  ) : !limitCheck.allowed ? (
                    t("Voice limit reached")
                  ) : null}
                </span>
                <button
                  onClick={stopSpeechConversation}
                  className={clsx("link", styles.speechModalTitleButton)}
                >
                  <CircleX size={24} />
                </button>
              </div>
            }
          >
            <div className={styles.speechConversation}>
              <div className={styles.conversation}>
                <div className={styles.usageStats}>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>{t("Today")}:</span>
                    <span className={styles.statValue}>
                      {(() => {
                        if (user?.subscription || guest?.subscription) {
                          return (
                            <>
                              {user?.speechRequestsToday || 0} /{" "}
                              {SPEECH_LIMITS.USER.REQUESTS_PER_DAY}
                            </>
                          )
                        }

                        if (user) {
                          return (
                            <>
                              {user?.speechRequestsToday || 0} /{" "}
                              {SPEECH_LIMITS.USER.REQUESTS_PER_DAY}
                            </>
                          )
                        }
                        if (guest) {
                          return (
                            <>
                              {guest?.speechRequestsToday || 0} /{" "}
                              {SPEECH_LIMITS.GUEST.REQUESTS_PER_DAY}
                            </>
                          )
                        }
                        return "5"
                      })()}{" "}
                      {t("requests")}
                    </span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>{t("This hour")}:</span>
                    <span className={styles.statValue}>
                      {(() => {
                        if (user?.subscription || guest?.subscription) {
                          return (
                            <>
                              {user?.speechRequestsThisHour || 0} /{" "}
                              {SPEECH_LIMITS.USER.REQUESTS_PER_HOUR}
                            </>
                          )
                        }
                        if (guest) {
                          return (
                            <>
                              {guest?.speechRequestsThisHour || 0} /{" "}
                              {SPEECH_LIMITS.GUEST.REQUESTS_PER_HOUR}
                            </>
                          )
                        }

                        if (user) {
                          return (
                            <>
                              {user?.speechRequestsThisHour || 0} /{" "}
                              {SPEECH_LIMITS.USER.REQUESTS_PER_HOUR}
                            </>
                          )
                        }
                        return "5"
                      })()}
                    </span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>
                      {t("Characters today")}:
                    </span>
                    <span className={styles.statValue}>
                      {(() => {
                        if (user?.subscription || guest?.subscription) {
                          return <>{user?.speechCharactersToday || 0} / ∞</>
                        }
                        if (guest) {
                          return (
                            <>
                              {guest?.speechRequestsThisHour || 0} /{" "}
                              {SPEECH_LIMITS.GUEST.CHARACTERS_PER_DAY}
                            </>
                          )
                        }

                        if (user) {
                          return (
                            <>
                              {user?.speechCharactersToday || 0} /{" "}
                              {SPEECH_LIMITS.USER.CHARACTERS_PER_DAY}
                            </>
                          )
                        }
                        return null
                      })()}
                    </span>
                  </div>
                </div>

                {/* Call to action for guests */}
              </div>

              <div className={styles.actions}>
                {guest && !user && (
                  <button
                    className="button transparent"
                    onClick={() => {
                      addHapticFeedback()
                      addParams({ signIn: "register" })
                    }}
                  >
                    <Logo isVivid size={19} /> {t("Sign up for 4x more usage")}
                  </button>
                )}

                {/* Call to action for members */}
                {user && !(user.subscription || guest?.subscription) && (
                  <button
                    className="button transparent"
                    onClick={() => {
                      {
                        addHapticFeedback()
                        setIsSpeechActive(false)
                        addParams({ subscribe: "true" })
                      }
                    }}
                  >
                    <Logo isVivid size={19} /> {t("Need more, subscribe!")}
                  </button>
                )}

                {!inConversationRef.current &&
                  !isListening &&
                  !isSpeaking &&
                  !isLoading && (
                    <button
                      onClick={() => {
                        addHapticFeedback()
                        startListening()
                      }}
                    >
                      <Megaphone size={18} /> {t("Speak")}
                    </button>
                  )}
              </div>
            </div>
          </Modal>
        )}
        <div
          ref={chatContainerRef}
          className={clsx(
            styles.chatContainer,
            isChatFloating && styles.chatFloating,
          )}
        >
          {/* Anchor element for chat input tooltip */}
          {files.length === 0 && (
            <div
              className={clsx(
                styles.top,
                isStandalone ? styles.standalone : undefined,
                isChatFloating && styles.chatFloating,
                collaborationStep === 3 && styles.collaborationStep3,
                os && styles[os],
              )}
            >
              {Top && <div className={styles.topInner}>{Top}</div>}
              {hasBottomOffset && (
                <button
                  className={clsx("link", styles.scrollDownButton)}
                  onClick={showInputAndScrollToBottom}
                  title={t("Scroll to bottom")}
                >
                  <CircleArrowDown size={25} />
                </button>
              )}
            </div>
          )}

          <>
            {collaborationStep === 2 ? (
              <div
                className={clsx(
                  styles.tooltipContainer,
                  styles.collaborationTooltip,
                )}
              >
                <div className={clsx(styles.tooltip)}>
                  <div
                    style={{
                      maxWidth: "300px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 7.5,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <strong>
                        {collaborationSteps[0]?.title ||
                          t("Start Your Conversation")}
                      </strong>
                      <button
                        style={{
                          cursor: "pointer",
                          position: "absolute",
                          right: 7.5,
                          top: 7.5,
                          zIndex: 10000,
                        }}
                        className="link"
                        onClick={closeCollaborationTooltip}
                      >
                        <CircleX size={22} />
                      </button>
                    </div>
                    <div style={{ fontSize: "13px", lineHeight: "1.4" }}>
                      {collaborationSteps[0]?.description ||
                        t(
                          "Type your message or question in the chat input below to begin collaborating with AI.",
                        )}
                    </div>
                  </div>
                </div>
              </div>
            ) : collaborationStep === 3 ? (
              <div
                className={clsx(styles.tooltipContainer, styles.shareTooltip)}
              >
                <div className={clsx(styles.tooltip)}>
                  <div
                    style={{
                      maxWidth: "300px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 7.5,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <strong>
                        {collaborationSteps[1]?.title || t("Share Your Thread")}
                      </strong>
                      <button
                        style={{
                          cursor: "pointer",
                          position: "absolute",
                          right: 7.5,
                          top: 7.5,
                          zIndex: 10000,
                        }}
                        className="link"
                        onClick={closeCollaborationTooltip}
                      >
                        <CircleX size={22} />
                      </button>
                    </div>
                    <div style={{ fontSize: "13px", lineHeight: "1.4" }}>
                      {collaborationSteps[1]?.description ||
                        t(
                          "Once you have a conversation going, click the share button to invite others to collaborate.",
                        )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              selectedAgent !== null && (
                <div className={styles.content}>
                  {hitHourlyLimit ||
                  isChatFloating ||
                  exceededInitial ? null : showGreeting &&
                    files.length === 0 ? (
                    <h2 className={styles.brandHelp}>
                      {isIncognito ? <HatGlasses size={24} /> : ""}
                      <span>
                        👋{" "}
                        {t(
                          language === "fr"
                            ? "What can I help with?"
                            : "What's on your mind?",
                        )}
                      </span>
                    </h2>
                  ) : null}
                </div>
              )
            )}

            <div
              className={clsx(
                styles.chat,
                os && styles[os],
                isStandalone ? styles.standalone : undefined,
                isChatFloating && styles.chatFloating,
                showPlaceholderGlow && styles.placeholderGlow,
              )}
            >
              {selectedAgent?.capabilities.imageGeneration && (
                <button
                  data-testid="image-generation-button"
                  className={clsx("link", styles.imageGenerationButton)}
                  title={
                    isImageGenerationEnabled
                      ? t("Image Generation Enabled")
                      : t("Enable Image Generation")
                  }
                  onClick={() => {
                    setIsImageGenerationEnabled(!isImageGenerationEnabled)

                    if (selectedAgent?.name === "flux") {
                      setSelectedAgent(undefined)
                    } else {
                      setSelectedAgent(sushiAgent)
                    }
                  }}
                >
                  <Palette
                    color={
                      isImageGenerationEnabled
                        ? "var(--accent-1)"
                        : "var(--shade-3)"
                    }
                    size={22}
                  />
                </button>
              )}
              {/* File Preview Area */}
              {files.length > 0 && (
                <div className={styles.filePreviewArea}>
                  {files.map((file, index) => {
                    const fileType = getFileType(file)
                    const isImage = fileType === "image"
                    const isText = fileType === "text" // Add text type detection

                    return (
                      <div key={index} className={styles.filePreview}>
                        {isImage ? (
                          <img
                            src={createImagePreview(file)}
                            alt={file.name}
                            className={styles.filePreviewImage}
                          />
                        ) : (
                          <div className={styles.filePreviewIcon}>
                            {fileType === "audio" ? (
                              <Music size={16} />
                            ) : fileType === "video" ? (
                              <VideoIcon size={16} />
                            ) : (
                              <FileIcon size={16} />
                            )}
                          </div>
                        )}

                        <div className={styles.filePreviewInfo}>
                          <div className={styles.filePreviewName}>
                            {file.name}
                          </div>
                          <div className={styles.filePreviewSize}>
                            {(file.size / 1024).toFixed(1)}KB
                          </div>
                        </div>

                        <button
                          data-testid="file-preview-clear"
                          type="button"
                          onClick={() => removeFile(index)}
                          className={clsx("link", styles.filePreviewClear)}
                          title="Remove file"
                        >
                          <CircleX size={18} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}

              <textarea
                suppressHydrationWarning
                onPaste={handlePaste}
                rows={isHydrated && isChatFloating ? 1 : undefined}
                data-testid="chat-textarea"
                className={styles.chatTextArea}
                value={input}
                onChange={handleInputChange}
                name="chat"
                id="chat"
                placeholder={
                  !isHydrated
                    ? ""
                    : placeholder ||
                      `${t("Ask anything")}${placeholderStages[placeholderIndex]}`
                }
                ref={chatInputRef}
                disabled={disabled}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit()
                  }
                }}
              />

              {/* Quota Info Display */}
              {showQuotaInfo && quotaInfo && (
                <div className={styles.quotaDisplay}>
                  <div className={styles.quotaHeader}>
                    <HardDrive size={16} color="var(--accent-6)" />
                    <span>{t("File Upload Limits")}</span>
                    <button
                      title={t("Close")}
                      onClick={() => setShowQuotaInfo(false)}
                      className="link"
                      style={{ marginLeft: "auto" }}
                    >
                      <CircleX size={18} color="var(--accent-1)" />
                    </button>
                  </div>
                  <div className={styles.quotaItems}>
                    <div className={styles.quotaItem}>
                      <Clock size={14} color="var(--shade-6)" />
                      <span>
                        {t("Hourly: {{used}}/{{limit}} files", {
                          used: quotaInfo.hourly.used,
                          limit: quotaInfo.hourly.limit,
                        })}
                      </span>
                      <span className={styles.quotaReset}>
                        {t("Resets in {{time}}", {
                          time: formatTimeUntilReset(
                            quotaInfo?.hourly?.resetTime,
                          ),
                        })}
                      </span>
                    </div>
                    <div className={styles.quotaItem}>
                      <Timer size={14} color="var(--shade-6)" />
                      <span>
                        {t("Daily: {{used}}/{{limit}} files", {
                          used: quotaInfo.daily.used,
                          limit: quotaInfo.daily.limit,
                        })}
                      </span>
                      <span className={styles.quotaReset}>
                        {t("Resets in {{time}}", {
                          time: formatTimeUntilReset(quotaInfo.daily.resetTime),
                        })}
                      </span>
                    </div>
                    <div className={styles.quotaItem}>
                      <HardDrive size={14} color="var(--shade-6)" />
                      <span>
                        {t("Size: {{used}}/{{limit}} MB", {
                          used: quotaInfo.dailySize.used,
                          limit: quotaInfo.dailySize.limit,
                        })}
                      </span>
                      <span className={styles.quotaReset}>
                        {t("Resets in {{time}}", {
                          time: formatTimeUntilReset(
                            quotaInfo.dailySize.resetTime,
                          ),
                        })}
                      </span>
                    </div>
                    {quotaInfo.images && (
                      <div className={styles.quotaItem}>
                        <Palette size={14} color="var(--shade-6)" />
                        <span>
                          {t("Images: {{used}}/{{limit}} daily", {
                            used: quotaInfo.images.used,
                            limit: quotaInfo.images.limit,
                          })}
                        </span>
                        <span className={styles.quotaReset}>
                          {t("Resets in {{time}}", {
                            time: formatTimeUntilReset(
                              quotaInfo.images.resetTime,
                            ),
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Credit Estimate Display */}

              <div className={styles.chatFooter}>
                {!isAttaching && selectedAgent ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-end",
                      gap: debateAgent ? 10 : 5,
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "flex-end",
                        gap: 9,
                      }}
                    >
                      <button
                        disabled={isChrry || !!app?.onlyAgent}
                        data-testid={
                          !debateAgent
                            ? selectedAgent?.name !== "flux"
                              ? "add-debate-agent-button"
                              : undefined
                            : "agent-select-button"
                        }
                        data-agent-name={selectedAgent.name}
                        title={t("Add debate agent")}
                        onClick={() => {
                          addHapticFeedback()
                          if (appStatus?.part) {
                            toast.error(t("Agent locked during app creation"))
                            return
                          }

                          if (debateAgent || selectedAgent?.name === "flux") {
                            setIsAgentModalOpen(true)
                          } else setIsDebateAgentModalOpen(true)
                        }}
                        className={clsx("link", styles.debateAgentButton)}
                      >
                        {selectedAgent.name === "deepSeek" ? (
                          <DeepSeek color="var(--accent-6)" size={24} />
                        ) : selectedAgent.name === "chatGPT" ? (
                          <OpenAI color="var(--accent-6)" size={22} />
                        ) : selectedAgent.name === "claude" ? (
                          <Claude color="var(--accent-6)" size={22} />
                        ) : selectedAgent.name === "gemini" ? (
                          <Gemini color="var(--accent-6)" size={22} />
                        ) : selectedAgent.name === "flux" ? (
                          <Flux color="var(--accent-6)" size={22} />
                        ) : selectedAgent.name === "perplexity" ? (
                          <Perplexity color="var(--accent-6)" size={22} />
                        ) : selectedAgent.name === "sushi" ? (
                          <Img icon="sushi" size={22} />
                        ) : null}
                        {isChrry ||
                        app?.onlyAgent ||
                        selectedAgent?.name === "flux" ||
                        debateAgent ? null : (
                          <Plus
                            strokeWidth={3}
                            className={styles.plusIcon}
                            size={10}
                            color="var(--accent-6)"
                          />
                        )}
                      </button>
                      {debateAgent && !app?.onlyAgent ? (
                        <button
                          data-testid="add-debate-agent-button"
                          data-agent-name={debateAgent.name}
                          onClick={() => {
                            if (appStatus?.part) {
                              toast.error(t("Agent locked during app creation"))
                              return
                            }
                            addHapticFeedback()
                            setIsDebateAgentModalOpen(true)
                          }}
                          className={clsx("link", styles.debateAgentButton)}
                        >
                          <span style={{ position: "relative", left: "-2px" }}>
                            |
                          </span>
                          {debateAgent.name === "deepSeek" ? (
                            <DeepSeek color="var(--accent-6)" size={24} />
                          ) : debateAgent.name === "chatGPT" ? (
                            <OpenAI color="var(--accent-6)" size={22} />
                          ) : debateAgent.name === "claude" ? (
                            <Claude color="var(--accent-6)" size={22} />
                          ) : debateAgent.name === "gemini" ? (
                            <Gemini color="var(--accent-6)" size={22} />
                          ) : debateAgent.name === "flux" ? (
                            <Flux color="var(--accent-6)" size={22} />
                          ) : debateAgent.name === "perplexity" ? (
                            <Perplexity color="var(--accent-6)" size={22} />
                          ) : null}
                        </button>
                      ) : (
                        <button
                          disabled={isChrry || !!app?.onlyAgent}
                          translate="no"
                          data-agent-name={selectedAgent.name}
                          data-testid="agent-select-button"
                          style={{
                            color:
                              isChrry || app?.onlyAgent
                                ? "var(--shade-6)"
                                : undefined,
                          }}
                          onClick={() => {
                            if (appStatus?.part) {
                              toast.error(t("Agent locked during app creation"))
                              return
                            }
                            addHapticFeedback()
                            setIsAgentModalOpen(true)
                          }}
                          className={clsx("link", styles.agentButton)}
                          type="submit"
                        >
                          <span className={styles.agentName}>
                            {selectedAgent?.displayName}
                          </span>
                          {!app?.onlyAgent && (
                            <ChevronDown color="var(--accent-6)" size={20} />
                          )}
                        </button>
                      )}
                    </span>
                    {!appStatus?.part && !isChrry && !app?.onlyAgent && (
                      <button
                        data-testid={
                          debateAgent
                            ? "debate-agent-delete-button"
                            : "agent-delete-button"
                        }
                        style={{
                          position: "relative",
                          top: "-2px",
                        }}
                        className="link"
                        onClick={() => {
                          addHapticFeedback()
                          debateAgent
                            ? setDebateAgent(null)
                            : setSelectedAgent(null)
                        }}
                      >
                        <CircleX color="var(--accent-1)" size={18} />
                      </button>
                    )}
                  </div>
                ) : (
                  !isAttaching && (
                    <button
                      className="link"
                      style={{
                        color: "var(--accent-1)",
                      }}
                      onClick={() => {
                        addHapticFeedback()
                        setIsAgentModalOpen(true)
                      }}
                    >
                      <Sparkles
                        color="var(--accent-1)"
                        fill="var(--accent-1)"
                        size={22}
                      />{" "}
                      {t("Select agent")}
                    </button>
                  )
                )}

                <div
                  className={clsx(
                    styles.chatFooterButtons,
                    isExtension && styles.extension,
                  )}
                >
                  {app?.features?.moodTracking && (
                    <MoodSelector
                      showEdit={false}
                      style={{
                        fontSize: "1.3rem",
                      }}
                      key={mood?.type}
                      mood={mood?.type}
                      onSelectingMood={(v) => {
                        setIsSelectingMood(v)
                      }}
                      onMoodChange={async (newMood) => {
                        if (mood?.type !== newMood) {
                          await updateMood({ type: newMood })
                          toast.success(emojiMap[newMood])
                        }
                      }}
                    />
                  )}
                  {!isSelectingMood && !needsReview && (
                    <>
                      <button
                        data-testid={
                          isWebSearchEnabled
                            ? "web-search-button-enabled"
                            : "web-search-button-disabled"
                        }
                        className="link"
                        title={
                          isWebSearchEnabled
                            ? t("Web Search Enabled")
                            : t("Enable Web Search")
                        }
                        onClick={() => {
                          // if (!selectedAgent?.capabilities?.webSearch) {
                          //   setAttempt("webSearch")
                          //   setIsAgentModalOpen(true)
                          //   return
                          // }
                          setIsWebSearchEnabled(!isWebSearchEnabled)
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            color:
                              isWebSearchEnabled || needSearch
                                ? "var(--accent-6)"
                                : "var(--shade-3)",
                          }}
                        >
                          {isExtension || t("Web")}
                        </span>

                        {selectedAgent?.capabilities?.webSearch ? (
                          <Globe
                            color={
                              isWebSearchEnabled
                                ? "var(--accent-6)"
                                : "var(--shade-3)"
                            }
                            size={22}
                          />
                        ) : (
                          <GlobeLock color="var(--shade-3)" size={22} />
                        )}
                      </button>
                    </>
                  )}
                  {isAttaching ? (
                    <span className={styles.attachButtons}>
                      <button
                        data-testid="attach-button-close"
                        className="link"
                        onClick={() => {
                          addHapticFeedback()
                          setIsAttaching(false)
                        }}
                      >
                        <CircleX color="var(--accent-1)" size={22} />
                      </button>
                      <button
                        data-testid="attach-button-video"
                        title={t("Video")}
                        onClick={() => {
                          if (
                            !selectedAgent ||
                            !selectedAgent.capabilities.video
                          ) {
                            setIsAgentModalOpen(true)
                            return
                          }
                          if (debateAgent && !debateAgent.capabilities.video) {
                            setIsDebateAgentModalOpen(true)
                            return
                          }
                          triggerFileInput("video/*")
                        }}
                        disabled={isAttachmentDisabled("video")}
                        className={clsx(
                          `link`,
                          hasFileType("video")
                            ? styles.attachButtonSelected
                            : isAttachmentDisabled("video")
                              ? styles.attachButtonDisabled
                              : undefined,
                        )}
                      >
                        <VideoIcon size={22} color={getButtonColor("video")} />
                      </button>
                      <button
                        data-testid="attach-button-pdf"
                        title={"PDF"}
                        onClick={() => {
                          if (
                            !selectedAgent ||
                            !selectedAgent.capabilities.pdf
                          ) {
                            setIsAgentModalOpen(true)
                            return
                          }
                          if (debateAgent && !debateAgent.capabilities.pdf) {
                            setIsDebateAgentModalOpen(true)
                            return
                          }

                          triggerFileInput("application/pdf")
                        }}
                        disabled={isAttachmentDisabled("audio")}
                        className={clsx(
                          `link`,
                          hasFileType("pdf")
                            ? styles.attachButtonSelected
                            : isAttachmentDisabled("audio")
                              ? styles.attachButtonDisabled
                              : undefined,
                        )}
                      >
                        <FileText size={22} color={getButtonColor("pdf")} />
                      </button>
                      <button
                        data-testid="attach-button-audio"
                        title={t("Audio")}
                        onClick={() => {
                          if (
                            !selectedAgent ||
                            !selectedAgent.capabilities.audio
                          ) {
                            setIsAgentModalOpen(true)
                            return
                          }
                          if (debateAgent && !debateAgent.capabilities.audio) {
                            setIsDebateAgentModalOpen(true)
                            return
                          }
                          triggerFileInput("audio/*")
                        }}
                        disabled={isAttachmentDisabled("audio")}
                        className={clsx(
                          `link`,
                          hasFileType("audio")
                            ? styles.attachButtonSelected
                            : isAttachmentDisabled("audio")
                              ? styles.attachButtonDisabled
                              : undefined,
                        )}
                      >
                        <AudioLines size={22} color={getButtonColor("audio")} />
                      </button>
                      <button
                        data-testid="attach-button-image"
                        title={t("Image")}
                        onClick={() => {
                          if (
                            !selectedAgent ||
                            !selectedAgent.capabilities.image
                          ) {
                            setIsAgentModalOpen(true)
                            return
                          }
                          if (debateAgent && !debateAgent.capabilities.image) {
                            setIsDebateAgentModalOpen(true)
                            return
                          }

                          triggerFileInput("image/*")
                        }}
                        disabled={isAttachmentDisabled("image")}
                        className={clsx(
                          `link`,
                          hasFileType("image")
                            ? styles.attachButtonSelected
                            : isAttachmentDisabled("image")
                              ? styles.attachButtonDisabled
                              : undefined,
                        )}
                      >
                        <ImageIcon size={22} color={getButtonColor("image")} />
                      </button>
                    </span>
                  ) : needsReview ? (
                    <a
                      target="_blank"
                      className="button small transparent"
                      onClick={(e) => {
                        if (e.metaKey || e.ctrlKey) {
                          return
                        }

                        addHapticFeedback()
                        if (checkIsExtension()) {
                          e.preventDefault()

                          BrowserInstance?.runtime?.sendMessage({
                            action: "openInSameTab",
                            url: `${FRONTEND_URL}/privacy`,
                          })

                          return
                        }

                        window.open(`${FRONTEND_URL}/privacy`, "_blank")
                      }}
                      href="/privacy"
                    >
                      <Link size={15} />
                      {t("Privacy")}
                    </a>
                  ) : (
                    !isSelectingMood && (
                      <button
                        data-testid="attach-button"
                        title={t("Attach")}
                        onClick={() => {
                          addHapticFeedback()

                          // Auto-switch to Sushi for file attachments
                          const sushiAgent = aiAgents.find(
                            (agent) => agent.name === "sushi",
                          )
                          if (sushiAgent && selectedAgent?.name !== "sushi") {
                            setSelectedAgent(sushiAgent)
                          }

                          // Open system file picker directly with all supported types
                          triggerFileInput(
                            "image/*,video/*,audio/*,.pdf,.txt,.md,.json,.csv,.xml,.html,.css,.js,.ts,.tsx,.jsx,.py,.java,.c,.cpp,.h,.hpp,.cs,.php,.rb,.go,.rs,.swift,.kt,.scala,.sh,.yaml,.yml,.toml,.ini,.conf,.log",
                          )
                        }}
                        className={clsx("link", styles.attachButton)}
                        type="submit"
                      >
                        <Paperclip color={"var(--accent-6)"} size={22} />
                      </button>
                    )
                  )}
                  {/* Quota info button */}
                  {user && !isSelectingMood && (
                    <button
                      onClick={async (e) => {
                        addHapticFeedback()
                        e.preventDefault()
                        if (!quotaInfo && !isFetchingQuotaInfo) {
                          await fetchQuotaInfo()
                        }
                        setShowQuotaInfo(!showQuotaInfo)
                      }}
                      className={clsx("link", styles.attachButton)}
                      type="button"
                      title={t("View file upload limits")}
                    >
                      <HardDrive color={"var(--shade-6)"} size={22} />
                    </button>
                  )}
                  {renderSubmit()}
                </div>
              </div>
            </div>
            {!isChatFloating && (
              <div
                className={clsx(
                  styles.creditInfo,
                  os && styles[os],
                  isStandalone ? styles.standalone : undefined,
                )}
              >
                <span className={styles.creditCost}>
                  {!hitHourlyLimit && (
                    <Coins color="var(--accent-1)" size={16} />
                  )}
                  {creditEstimate && creditEstimate.multiplier > 1 ? (
                    <span
                      title={t("task_detected_tooltip", {
                        taskType: t(`task_type_${creditEstimate.taskType}`),
                        multiplier: creditEstimate.multiplier,
                        warning: creditEstimate.warning || "",
                      })}
                      style={{ fontSize: "0.9em", opacity: 0.8 }}
                    >
                      ~
                      {t("credits", {
                        count: Math.ceil(
                          creditEstimate.multiplier *
                            (selectedAgent?.creditCost || 1),
                        ),
                      })}
                    </span>
                  ) : hitHourlyLimit && !threadId ? (
                    <span
                      data-testid="hourly-limit-info"
                      data-hourly-left={hourlyUsageLeft}
                      className={styles.hourlyLimit}
                    >
                      {!user?.subscription || !guest?.subscription ? (
                        <button
                          onClick={() => {
                            addHapticFeedback()
                            addParams({ subscribe: "true" })
                          }}
                          className="link"
                        >
                          <ClockPlus size={16} />
                        </button>
                      ) : (
                        <Clock color="var(--accent-1)" size={16} />
                      )}
                      <span style={{ fontSize: "1rem" }}>😅</span>
                      {user?.messagesLastHour || guest?.messagesLastHour || 0}/
                      {hourlyLimit}"
                    </span>
                  ) : selectedAgent ? (
                    <>
                      {t("credits", {
                        count:
                          (selectedAgent?.creditCost || 1) +
                          (debateAgent?.creditCost || 0),
                      })}
                    </>
                  ) : (
                    t("Doesn't cost credits")
                  )}
                </span>

                {selectedAgent && (
                  <>
                    {creditsLeft !== undefined ? (
                      <>
                        {remainingMs ? (
                          <span
                            data-testid="hourly-limit-info"
                            data-hourly-left={hourlyUsageLeft}
                            className={styles.hourlyLimit}
                          >
                            <Timer size={16} />{" "}
                            {formatTime(Math.floor(remainingMs / 1000))}
                          </span>
                        ) : (
                          <span
                            data-credits-left={creditsLeft}
                            data-testid="credits-info"
                            className={styles.creditInfoText}
                          >
                            <Info color="var(--accent-6)" size={16} />
                            <span
                              style={{
                                color:
                                  creditsLeft === 0
                                    ? "var(--accent-0)"
                                    : undefined,
                              }}
                            >
                              {creditsLeft > OWNER_CREDITS / 10
                                ? t("Unlimited credits")
                                : t("credits_left", {
                                    count: creditsLeft,
                                  })}
                            </span>
                          </span>
                        )}
                      </>
                    ) : null}
                  </>
                )}

                {user && !user?.subscription && (
                  <button
                    data-testid="subscribe-from-chat-button"
                    onClick={() => {
                      track({
                        name: "subscribe-from-chat-click",
                        props: {
                          threadId: threadId,
                        },
                      })
                      addParams({ subscribe: "true" })
                    }}
                    className={clsx("link", styles.subscribeButton)}
                  >
                    <UserRoundPlus size={16} /> {t("Subscribe")}
                  </button>
                )}
                {guest && (
                  <button
                    data-testid="login-from-chat-button"
                    onClick={() => {
                      addParams({ signIn: "login" })
                    }}
                    className={clsx("link", styles.loginButton)}
                  >
                    <LogIn size={16} /> {t("Login")}
                  </button>
                )}
              </div>
            )}
          </>
        </div>
      </div>
    </>
  )
}
