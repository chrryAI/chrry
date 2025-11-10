"use client"

import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react"
import styles from "./Instructions.module.scss"
import clsx from "clsx"
import {
  ArrowLeft,
  Brain,
  BrainCircuit,
  CircleX,
  FileIcon,
  MousePointerClick,
  Plus,
  Sparkles,
  TestTubeDiagonal,
  Trash2,
  Copy,
  FileUp,
  Circle,
  ArrowRight,
  CircleCheck,
} from "./icons"
import Modal from "./Modal"
import { apiFetch } from "./utils"
import { useAppContext } from "./context/AppContext"
import {
  useAuth,
  useChat,
  useNavigationContext,
  useApp,
  useError,
  useData,
} from "./context/providers"
import { useTheme as usePlatformTheme, usePlatform } from "./platform"
import { thread, instruction } from "./types"
import { updateThread } from "./lib"
import { useHasHydrated } from "./hooks"

import {
  getInstructionConfig,
  isFirefox,
  MAX_FILE_SIZES,
  PROMPT_LIMITS,
  instructionBase,
  isOwner,
  isDeepEqual,
} from "./utils"
import toast from "react-hot-toast"
import Loading from "./Loading"
import ConfirmButton from "./ConfirmButton"
import AddToHomeScreen from "./AddToHomeScreen"
import { FaApple, FaAndroid, FaChrome, FaFirefox } from "react-icons/fa"
import EmojiPicker, {
  EmojiClickData,
  Theme,
  SuggestionMode,
} from "emoji-picker-react"
import Agent from "./Agent"
import { useLocalStorage } from "./hooks"

export default function Instructions({
  className,
  thread,
  onSave,
  icon,
  showInstructions = true,
  dataTestId = "instruction",
  showButton = true,
  opacity = 1,
  isAgentBuilder = false,
  onClose,
  ...rest
}: {
  className?: string
  icon?: boolean
  thread?: thread
  showInstructions?: boolean
  opacity?: number
  dataTestId?: string
  placeholder?: string
  isArtifactsOpen?: boolean
  showButton?: boolean
  onClose?: () => void
  isAgentBuilder?: boolean
  onSave?: ({
    content,
    artifacts,
  }: {
    content: string
    artifacts: File[]
  }) => void
}) {
  // Split contexts for better organization
  const { t } = useAppContext()
  const { isExtension } = usePlatform()
  const { FRONTEND_URL, API_URL } = useData()

  const { defaultInstructions, instructions: contextInstructions } = useApp()

  // Auth context
  const { token, language, user, guest } = useAuth()

  // Chat context
  const {
    selectedAgent,
    setSelectedAgent,
    perplexityAgent,
    deepSeekAgent,
    claudeAgent,
    favouriteAgent,
    refetchThread,
  } = useChat()

  // Navigation context (router is the wrapper)
  const {
    router,
    collaborationStep,
    setCollaborationStep,
    isMemoryConsentManageVisible,
    setShowAddToHomeScreen,
  } = useNavigationContext()

  // App context
  const {
    isManagingApp,
    appFormWatcher,
    instructions,
    setInstructions,
    appStatus,
    appForm,
  } = useApp()

  // Error context
  const { captureException } = useError()

  // Data context
  const { weather } = useData()

  // Platform context
  const { os, isStandalone, viewPortHeight } = usePlatform()

  // Calculate how many instruction items to show based on viewport height
  const getVisibleInstructionCount = () => {
    const height = (viewPortHeight || 0) + (isStandalone ? 250 : 0)

    if (height >= 500 && height < 600) return 1
    if (height >= 550 && height < 625) return 2
    // Show first 3 items at 550px+
    if (height >= 550 && height < 650) return 3

    // Show 4 items at 650px+
    if (height >= 650 && height < 750) return 4

    // Show all items at 750px+ (for standalone) or 800px+ (tablet)
    if (height >= 750 || height >= 800) return Infinity

    // Below 550px, show none
    return 0
  }

  const [visibleInstructionCount, setVisibleInstructionCount] = useState(
    getVisibleInstructionCount(),
  )

  useEffect(() => {
    setTimeout(() => {
      setVisibleInstructionCount(getVisibleInstructionCount())
    }, 50)
  }, [viewPortHeight, isStandalone])

  // Theme context
  const { addHapticFeedback, isDark, isMobileDevice } = usePlatformTheme()

  const isManaging = isManagingApp

  const [placeHolder, setPlaceHolder] = useState<string | undefined>(
    rest.placeholder,
  )

  const [isAppDescriptionOpen, setIsAppDescriptionOpen] = useState(false)

  useEffect(() => {
    setPlaceHolder(rest.placeholder)
  }, [rest.placeholder])

  const city = user?.city || guest?.city
  const country = user?.country || guest?.country

  const productionExtensions = ["chrome", "firefox"]
  const MAX_FILES = 5
  const [selectedInstruction, setSelectedInstructionInternal] =
    useState<instructionBase | null>(null)

  const setSelectedInstruction = (instruction: instructionBase | null) => {
    setSelectedInstructionInternal(instruction)
    instruction && setIsOpen(true)
  }
  const getMaxFileSize = (fileType: string) => {
    // Conservative limits based on agent capabilities and token limits
    const limits = MAX_FILE_SIZES

    const agentLimits = user ? limits.chatGPT : limits.deepSeek

    if (fileType.startsWith("text/")) return agentLimits.text
    if (fileType.startsWith("application/pdf")) return agentLimits.pdf

    return 0
  }

  const [files, setFilesInternal] = useState<File[]>([])
  useEffect(() => {
    if (files.length > 0 && !selectedAgent?.capabilities.pdf) {
      favouriteAgent?.capabilities.pdf
        ? setSelectedAgent(favouriteAgent)
        : setSelectedAgent(user ? claudeAgent : deepSeekAgent)
    }
  }, [files, selectedAgent, user])

  const [threadArtifacts, setThreadArtifacts] = useState<
    {
      type: string
      url?: string
      name: string
      size: number
      data?: string
      id: string
    }[]
  >(thread?.artifacts || [])

  useEffect(() => {
    if (thread?.artifacts) {
      setThreadArtifacts(thread.artifacts)
    }
  }, [thread?.artifacts])

  const setFiles: Dispatch<SetStateAction<File[]>> = (data) => {
    const f = typeof data === "function" ? data(files) : data

    // Check total file count limit
    if (f.length + threadArtifacts.length > MAX_FILES) {
      toast.error(t("Maximum {{MAX_FILES}} files allowed", { MAX_FILES }))
      return
    }

    if (!selectedAgent) {
      toast.error("Please select an AI agent")
      return
    }

    // Get agent-specific limits
    const agentLimits =
      MAX_FILE_SIZES[selectedAgent.name as keyof typeof MAX_FILE_SIZES] ||
      MAX_FILE_SIZES.deepSeek

    // Calculate maximum total size from agent's individual file limits
    const MAX_TOTAL_FILE_SIZE =
      Math.max(agentLimits.pdf, agentLimits.text) * MAX_FILES // Multiply by max number of files allowed

    // Calculate individual file size limits for ALL files
    const maxIndividualFileSizes = f.reduce(
      (acc, file) => acc + getMaxFileSize(file.type),
      0,
    )

    // Calculate total file size for ALL files
    const totalFileSize = f.reduce((acc, file) => acc + file.size, 0)

    // Check individual file size limits
    if (totalFileSize > maxIndividualFileSizes) {
      const maxIndividualSizeMB = (
        maxIndividualFileSizes /
        (1024 * 1024)
      ).toFixed(1)
      toast.error(
        `Total file size exceeds individual limits: ${maxIndividualSizeMB}MB`,
      )
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

      if (
        fileType.startsWith("application/pdf") &&
        selectedAgent?.capabilities.pdf
      ) {
        isSupported = true
        maxSize = getMaxFileSize(fileType)
      }

      if (
        fileType.startsWith("text/plain") &&
        selectedAgent?.capabilities.text
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

      validFiles.push(file)

      if (file.size > maxSize) {
        const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1)
        toast.error(`${file.name}: File too large. Max size: ${maxSizeMB}MB`)
        continue
      }

      // Compress images to reduce token usage
    }

    setFiles((prev) => [...prev, ...validFiles].slice(0, 5))

    if (validFiles.length > 0) {
      toast.success(`${validFiles.length} file(s) selected`)
    }
  }

  const triggerFileInput = (accept: string) => {
    addHapticFeedback()
    const input = document.createElement("input")
    input.type = "file"
    input.accept = accept
    input.multiple = true
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement
      if (!target.files) return

      if (target.files.length + files.length > MAX_FILES) {
        toast.error(t("Maximum {{MAX_FILES}} files allowed", { MAX_FILES }))
      }

      const dataTransfer = new DataTransfer()
      Array.from(target.files)
        .slice(0, MAX_FILES - files.length)
        .forEach((file) => dataTransfer.items.add(file))

      handleFileSelect(dataTransfer.files)
    }
    input.click()
  }

  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [selectedEmoji, setSelectedEmoji] = useState<string>("🌸")
  const [editedTitle, setEditedTitle] = useState<string>("")

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setSelectedEmoji(emojiData.emoji)
    setShowEmojiPicker(false)

    // Update the instruction emoji immediately in the list
    if (selectedInstruction && isManaging) {
      setInstructions((prev) =>
        prev.map((i) =>
          i.id === selectedInstruction.id
            ? { ...i, emoji: emojiData.emoji }
            : i,
        ),
      )
    }

    toast.success(`Selected: ${emojiData.emoji}`)
  }

  useEffect(() => {
    if (selectedInstruction && isManaging) {
      const currentHighlights = appForm?.getValues("highlights") || []
      const existingHighlight = currentHighlights.find(
        (h) => h.id === selectedInstruction.id,
      )

      // Use existing highlight from form if it exists and has real content
      if (
        existingHighlight &&
        existingHighlight.content &&
        !existingHighlight.content.startsWith("atlas.instruction")
      ) {
        setEditedTitle(existingHighlight.title || selectedInstruction.title)
        setContent(existingHighlight.content)
        setSelectedEmoji(
          existingHighlight.emoji || selectedInstruction.emoji || "🌸",
        )
      } else {
        // Otherwise use the selected instruction (which should be from atlasInstructions with translations)
        setEditedTitle(selectedInstruction.title)
        setContent(selectedInstruction.content || "")
        setSelectedEmoji(selectedInstruction.emoji || "🌸")
      }
    }
  }, [selectedInstruction, isManaging])

  const hasHydrated = useHasHydrated()

  const [instructionConfig, setInstructionConfig] = useState(
    getInstructionConfig({
      city,
      country,
      weather,
    }),
  )

  useEffect(() => {
    setInstructionConfig(
      getInstructionConfig({
        city,
        country,
        weather,
      }),
    )
  }, [city, country, weather])

  const instructionsListRef = useRef<HTMLDivElement>(null)

  // useEffect(() => {
  //   if (!isMemoryConsentManageVisible) {
  //     animateInstructions()
  //   }
  // }, [isMemoryConsentManageVisible])

  const [hasAnimatedInstructions, setHasAnimatedInstructions] = useLocalStorage(
    "hasAnimatedInstructions",
    false,
  )

  useEffect(() => {
    setTimeout(() => {
      hasAnimatedInstructions && setHasAnimatedInstructions(false)
    }, 100)
  }, [hasAnimatedInstructions])

  const [isOpen, setIsOpenInternal] = useState(false)

  const setIsOpen = (open: boolean) => {
    setIsOpenInternal(open)
    if (!open) {
      setCollaborationStep(0)
    }
  }
  useEffect(() => {
    if (collaborationStep === 1) {
      setIsOpen(true)
      setContent("")
    }
  }, [collaborationStep])

  useEffect(() => {
    if (!isOpen && collaborationStep === 1) {
      // setCollaborationStep(0)
    }
  }, [isOpen, collaborationStep])

  const [content, setContent] = useState(thread?.instructions || "")

  useEffect(() => {
    if (selectedInstruction) {
      !thread &&
        selectedInstruction?.content &&
        setContent(t(selectedInstruction?.content))
      setIsOpen(true)
    }
  }, [selectedInstruction])

  const [isSaving, setIsSaving] = useState(false)

  const maxCharCount = PROMPT_LIMITS.INSTRUCTIONS

  const charCount = content?.length || 0
  const isAllowed = charCount < maxCharCount
  const [isGeneratingInstructions, setIsGeneratingInstructions] =
    useState(false)

  const [isArtifactsOpen, setIsArtifactsOpen] = useState(rest.isArtifactsOpen)

  const canUpdate = thread
    ? isOwner(thread, {
        userId: user?.id,
        guestId: guest?.id,
      })
    : true
  const handleSave = async ({
    deleteInstruction = false,
    regenerateInstructions = false,
    instruction,
  }: {
    deleteInstruction?: boolean
    regenerateInstructions?: boolean
    instruction?: instructionBase
  } = {}) => {
    addHapticFeedback()
    if (!token) {
      return
    }

    if (isManaging && instruction) {
      const step = getCurrentSuggestionStep(instruction)
      const currentHighlights = appForm?.getValues("highlights") || []

      if (deleteInstruction) {
        // Delete: Remove the highlight with matching instruction ID
        const updatedHighlights = currentHighlights.filter(
          (h) => h.id !== instruction.id,
        )
        appForm?.setValue("highlights", updatedHighlights)

        // Update instructions list to reset the instruction
        setInstructions((prev) =>
          prev.map((i) =>
            i.id === instruction.id
              ? ({
                  ...i,
                  title: instruction.title,
                  emoji: instruction.emoji,
                } as instruction)
              : i,
          ),
        )

        toast.success(t("Deleted"))
        setContent("")
        setSelectedInstruction(null)
        setIsOpen(false)
        return
      }

      if (step === "not_started") {
        // Check if highlight with this ID already exists
        const existingIndex = currentHighlights.findIndex(
          (h) => h.id === instruction.id,
        )

        const newHighlight: instructionBase = {
          id: instruction.id,
          title: editedTitle || instruction.title,
          content: content,
          emoji: selectedEmoji,
          requiresWebSearch: instruction.requiresWebSearch,
          appName: instruction.appName,
        }

        if (existingIndex !== -1) {
          // Update existing highlight
          const updatedHighlights = [...currentHighlights]
          updatedHighlights[existingIndex] = newHighlight
          appForm?.setValue("highlights", updatedHighlights)
        } else {
          // Add new highlight
          appForm?.setValue("highlights", [...currentHighlights, newHighlight])
        }

        // Update instructions list with new title and emoji
        setInstructions((prev) =>
          prev.map((i) =>
            i.id === instruction.id
              ? { ...i, title: editedTitle || i.title, emoji: selectedEmoji }
              : i,
          ),
        )

        toast.success(t(existingIndex !== -1 ? "Updated" : "Added"))
        setContent("")
        setEditedTitle("")
        setSelectedInstruction(null)
        setIsOpen(false)
        return
      }

      if (step === "in_progress") {
        // Update: Find and update existing highlight
        const updatedHighlights = currentHighlights.map((h) =>
          h.id === instruction.id
            ? {
                ...h,
                title: editedTitle || instruction.title,
                content: content,
                emoji: selectedEmoji,
              }
            : h,
        )
        appForm?.setValue("highlights", updatedHighlights)

        // Update instructions list with edited title and emoji
        setInstructions((prev) =>
          prev.map((i) =>
            i.id === instruction.id
              ? { ...i, title: editedTitle || i.title, emoji: selectedEmoji }
              : i,
          ),
        )

        toast.success(t("Updated"))
        setContent("")
        setEditedTitle("")
        setIsOpen(false)

        setSelectedInstruction(null)
        return
      }

      console.log(`🚀 tep:`, step)

      if (step === "success") {
        // Update: Find and update existing completed highlight
        const updatedHighlights = currentHighlights.map((h) =>
          h.id === instruction.id
            ? {
                ...h,
                title: editedTitle || instruction.title,
                content: content,
                emoji: selectedEmoji,
              }
            : h,
        )

        appForm?.setValue("highlights", updatedHighlights)

        // Update instructions list with edited title and emoji
        setInstructions((prev) =>
          prev.map((i) =>
            i.id === instruction.id
              ? {
                  ...i,
                  title: editedTitle || i.title,
                  emoji: selectedEmoji,
                  content: content,
                }
              : i,
          ),
        )

        toast.success(t("Updated"))
        setContent("")
        setEditedTitle("")
        setIsOpen(false)

        setSelectedInstruction(null)
        return
      }
    }

    setIsSaving(true)
    if (!isAllowed) return
    regenerateInstructions
      ? setIsGeneratingInstructions(true)
      : setIsSaving(true)
    const newInstruction = deleteInstruction ? "" : content

    if (selectedAgent?.name === "flux") setSelectedAgent(undefined)

    if (thread) {
      try {
        const response = await updateThread({
          id: thread.id,
          token,
          regenerateInstructions,
          language,
          instructions: newInstruction,
          files: files,
        })

        await refetchThread()
        setFilesInternal([])

        if (response.error) {
          toast.error(response.error)
        }

        regenerateInstructions && setContent(response.thread.instructions)

        toast.success(deleteInstruction ? t("Deleted") : t("Updated"))
        if (regenerateInstructions) {
          return
        }

        setIsOpen(false)

        onSave?.({ content: newInstruction, artifacts: files })
      } catch (error) {
        console.error("Error updating thread:", error)
        captureException(error)
        toast.error(
          deleteInstruction
            ? t("Error deleting instruction")
            : t("Error updating thread"),
        )
      } finally {
        setIsSaving(false)
        setIsGeneratingInstructions(false)
      }
    } else {
      onSave?.({ content: newInstruction, artifacts: files })
      setIsSaving(false)
      setIsOpen(false)
      setIsArtifactsOpen(false)
      toast.success(t("Updated"))
    }

    if (collaborationStep === 1) {
      setCollaborationStep(2)
    }
  }

  const getCurrentSuggestionStep = (
    instruction: instructionBase,
  ): "not_started" | "in_progress" | "success" => {
    if (!appFormWatcher) return "not_started"

    const highlights = appFormWatcher.highlights || []

    // Check if THIS specific instruction has a highlight
    const thisHighlight = highlights.find((h) => h.id === instruction.id)

    if (!thisHighlight) return "not_started"

    const defaultInstruction = defaultInstructions.find((h) =>
      isDeepEqual(
        {
          title: t(h.title),
          content: t(h.content || ""),
          emoji: h.emoji,
        },
        {
          title: t(instruction.title),
          content: t(instruction.content || ""),
          emoji: instruction.emoji,
        },
      ),
    )

    // Check if the highlight is deeply equal to the default instruction
    if (defaultInstruction) {
      return "not_started"
    }

    // Check if the highlight is complete (has content)
    if (thisHighlight.content && thisHighlight.content.trim().length > 0) {
      return "success"
    }

    // Has highlight but no content = in progress
    return "in_progress"
  }

  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      // Only handle paste when Instructions modal is open
      if (!isOpen && !isArtifactsOpen) return

      try {
        const text = await navigator.clipboard.readText()
        if (text.trim().length > 500) {
          e.preventDefault()

          // Auto-open Instructions tab if in artifacts view
          if (isArtifactsOpen) {
            setIsArtifactsOpen(false)
            setIsOpen(true)
          }

          // Set content and show preview
          // setContent(text)

          // Also create a file preview
          const blob = new Blob([text], { type: "text/plain" })
          const file = new File([blob], "pasted-content.txt", {
            type: "text/plain",
            lastModified: Date.now(),
          })
          setFiles((prev) => [...prev, file])

          setIsArtifactsOpen(true)
        }
      } catch (error) {
        console.error("Failed to read clipboard:", error)
        captureException(error)
        toast.error("Failed to access clipboard. Please check permissions.")
      }
    }

    document.addEventListener("paste", handlePaste)
    return () => document.removeEventListener("paste", handlePaste)
  }, [isOpen, isArtifactsOpen])

  const removeFile = (index: number) => {
    addHapticFeedback()
    setFilesInternal((prev) => prev.filter((_, i) => i !== index))
  }

  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDeleteFile = async (id: string) => {
    addHapticFeedback()
    if (!thread) return
    setDeletingId(id)

    try {
      await apiFetch(`${API_URL}/threads/${thread.id}/artifacts/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      setThreadArtifacts((prev) => prev.filter((a) => a.id !== id))
    } catch (error) {
      toast.error(t("Error deleting file"))
    } finally {
      setDeletingId(null)
    }
  }

  if (!hasHydrated && (isManagingApp || appFormWatcher?.canSubmit)) {
    return <Loading fullScreen />
  }

  return (
    <div data-testid={`${dataTestId}`}>
      {isAppDescriptionOpen && (
        <Modal
          className={styles.modal}
          isModalOpen={true}
          hideOnClickOutside={false}
          hasCloseButton={true}
          onToggle={(open) => {
            setIsAppDescriptionOpen(open)
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
            <div className={styles.updateModalTitle}>{t("Thinking")}...</div>
          }
        >
          <div className={styles.updateModalDescription}>
            <textarea
              id="description"
              {...appForm?.register("description")}
              className={styles.instructionsTextarea}
              placeholder={t(
                "Your intelligent {{agent}} that learns your preferences and provides personalized recommendations.",
                { agent: appForm?.watch("name") || "assistant" },
              )}
            />
            <div className={styles.updateModalButtons}>
              <button
                onClick={() => {
                  toast.success(t("Saved"))
                  setIsAppDescriptionOpen(false)
                }}
                className={clsx("inverted")}
                disabled={appForm?.watch("description") === ""}
              >
                {t("Save")}
              </button>
            </div>
          </div>
        </Modal>
      )}
      <Modal
        dataTestId={`${dataTestId}-modal`}
        borderHeader={isArtifactsOpen ? true : true}
        className={styles.modal}
        hasCloseButton
        hideOnClickOutside={false}
        isModalOpen={isOpen || isArtifactsOpen}
        title={
          <>
            {isArtifactsOpen ? (
              <>
                <TestTubeDiagonal color="var(--accent-4)" size={24} />
                <span>{t("Artifacts")}</span>
              </>
            ) : (
              <>
                <Brain color="var(--accent-6)" size={24} />
                <span>{t("Instructions")}</span>
              </>
            )}

            {canUpdate && !isArtifactsOpen && (
              <div className={styles.right}>
                {charCount === 0 ? (
                  <span
                    data-testid={`${dataTestId}-modal-max-char-count`}
                    className={clsx(styles.maxCharCount)}
                  >
                    {maxCharCount}
                  </span>
                ) : (
                  <span
                    data-testid={`${dataTestId}-modal-char-left`}
                    className={clsx(
                      styles.charLeft,
                      maxCharCount - charCount < 50 && styles.orange,
                      charCount > maxCharCount && styles.red,
                    )}
                  >
                    {charCount}/{maxCharCount}
                  </span>
                )}
                {thread?.instructions || (isManaging && content.length) ? (
                  <ConfirmButton
                    data-testid={`${dataTestId}-modal-delete-button`}
                    confirm={
                      <>
                        <Trash2 color="var(--accent-0)" size={16} />{" "}
                        {t("Are you sure?")}
                      </>
                    }
                    onConfirm={() => {
                      handleSave({
                        deleteInstruction: true,
                        instruction: selectedInstruction || undefined,
                      })
                    }}
                    className="link"
                  >
                    <Trash2 color="var(--accent-1)" size={16} />
                  </ConfirmButton>
                ) : null}
              </div>
            )}
          </>
        }
        onToggle={(open) => {
          open !== undefined && setIsOpen(open)
          !isManaging && !open && onClose?.()
          setIsArtifactsOpen(false)
        }}
      >
        {isArtifactsOpen ? (
          <div className={styles.artifactsContent}>
            <div className={styles.artifactsDescription}>
              {t(
                "Upload PDF or text content here for the AI to remember and reference in future conversations. These artifacts become part of the thread's memory.",
              )}
            </div>
            {(files.length || threadArtifacts.length) > 0 && (
              <div className={styles.filePreviewArea}>
                {threadArtifacts.map((file, index) => {
                  return (
                    <div key={index} className={styles.filePreview}>
                      <div className={styles.filePreviewIcon}>
                        <FileIcon size={16} />
                      </div>

                      <div className={styles.filePreviewInfo}>
                        <a
                          href={file.url}
                          className={clsx(styles.filePreviewName, "link")}
                          target="_blank"
                        >
                          {file.name}
                        </a>
                        <div className={styles.filePreviewSize}>
                          {(file.size / 1024).toFixed(1)}KB
                        </div>
                      </div>

                      {deletingId === file.id ? (
                        <Loading width={18} height={18} />
                      ) : (
                        <button
                          data-testid={`${dataTestId}-file-preview-clear`}
                          type="button"
                          onClick={() => handleDeleteFile(file.id)}
                          className={clsx("link", styles.filePreviewClear)}
                          title="Remove file"
                        >
                          <CircleX size={18} />
                        </button>
                      )}
                    </div>
                  )
                })}
                {files.map((file, index) => {
                  return (
                    <div key={index} className={styles.filePreview}>
                      <div className={styles.filePreviewIcon}>
                        <FileIcon size={16} />
                      </div>

                      <div className={styles.filePreviewInfo}>
                        <div className={styles.filePreviewName}>
                          {file.name}
                        </div>
                        <div className={styles.filePreviewSize}>
                          {(file.size / 1024).toFixed(1)}KB
                        </div>
                      </div>

                      <button
                        data-testid={`${dataTestId}-file-preview-clear`}
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

            <div className={styles.actions}>
              <div className={styles.fileUploader}>
                <>
                  <button
                    data-testid={`${dataTestId}-artifacts-back-button`}
                    onClick={() => {
                      addHapticFeedback()
                      setIsArtifactsOpen(false)
                      setIsOpen(true)
                    }}
                    className={clsx("transparent", styles.uploadButton)}
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <button
                    data-testid={`${dataTestId}-artifacts-paste-button`}
                    onClick={async () => {
                      addHapticFeedback()
                      try {
                        const text = await navigator.clipboard.readText()
                        if (text.trim()) {
                          const blob = new Blob([text], {
                            type: "text/plain",
                          })
                          const file = new File([blob], "pasted-content.txt", {
                            type: "text/plain",
                            lastModified: Date.now(),
                          })
                          setFiles((prev) => [...prev, file])
                          toast.success("Clipboard content added as file")
                        } else {
                          toast.error("Clipboard is empty")
                        }
                      } catch (error) {
                        console.error("Failed to read clipboard:", error)
                        captureException(error)
                        toast.error(
                          "Failed to access clipboard. Please check permissions.",
                        )
                      }
                    }}
                    className={clsx("inverted", styles.uploadButton)}
                  >
                    <Copy size={16} />
                    {t("Paste")}
                  </button>
                  <button
                    data-testid={`${dataTestId}-artifacts-upload-button`}
                    onClick={() =>
                      triggerFileInput("application/pdf, .txt, .md")
                    }
                    className={clsx("inverted", styles.uploadButton)}
                  >
                    <FileUp size={16} />
                    {t("Upload")}
                  </button>
                  {isAllowed && (
                    <button
                      disabled={(!content && isManaging) || isSaving}
                      className={clsx(
                        (!content && isManaging) || isSaving
                          ? "transparent"
                          : "",
                      )}
                      data-testid={`${dataTestId}-modal-save-button`}
                      onClick={() =>
                        selectedInstruction
                          ? handleSave({ instruction: selectedInstruction })
                          : handleSave()
                      }
                    >
                      {isSaving ? (
                        <Loading width={14} height={14} color="white" />
                      ) : (
                        t("Save")
                      )}
                    </button>
                  )}
                </>
              </div>
            </div>
          </div>
        ) : (
          <>
            {isManaging && selectedInstruction && (
              <div className={styles.titleField}>
                <span style={{ fontSize: "1.5rem" }}>{selectedEmoji}</span>
                <input
                  title={t("Feature title")}
                  id="featureTitle"
                  value={t(editedTitle)}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  type="text"
                  placeholder={t("Feature title")}
                />
              </div>
            )}
            <textarea
              disabled={!canUpdate}
              data-testid={`${dataTestId}-modal-textarea`}
              id="instructions"
              onChange={(e) => setContent(e.target.value)}
              value={t(content, isManaging ? undefined : instructionConfig)}
              className={styles.instructionsTextarea}
              placeholder={
                placeHolder ||
                (collaborationStep === 1
                  ? `✨ ${t(`Let's create something amazing together!`)}

${t(`Describe what you'd like to collaborate on:`)}

💡 ${t(`Brainstorm ideas for a new project`)}
📝 ${t(`Write and edit content together`)}
🔍 ${t(`Research and analyze topics`)}
🎯 ${t(`Solve problems as a team`)}
🚀 ${t(`Plan and strategize together`)}

${t(`Share your vision and invite others to join the conversation!`)}`
                  : `${t(`Tell AI how to behave in this chat. For example`)}

${t(`Always ask for context before giving advice`)}
${t(`Focus on practical, actionable solutions`)}
${t(`Explain complex topics in simple terms`)}
${t(`Remember my preferences and past conversations`)}

${t(`The more specific you are, the better AI can assist you!`)}`)
              }
            />
          </>
        )}
        {!isArtifactsOpen && (
          <span className={styles.tip}>
            <BrainCircuit size={16} color="var(--accent-6)" />
            <span>
              {canUpdate
                ? t(`Give Vex something to remember`)
                : t(`Only owner can update instructions`)}
            </span>
          </span>
        )}
        {canUpdate && !isArtifactsOpen && (
          <div className={styles.footer}>
            {thread && (
              <button
                data-testid={`${dataTestId}-modal-regenerate-button`}
                onClick={() => handleSave({ regenerateInstructions: true })}
                className="inverted"
              >
                {isGeneratingInstructions ? (
                  <Loading width={14} height={14} />
                ) : (
                  <>
                    <Sparkles size={14} color="var(--accent-1)" />
                    {t("Generate")}
                  </>
                )}
              </button>
            )}
            <div className={styles.actions}>
              <button
                data-testid={`${dataTestId}-modal-artifacts-button`}
                onClick={() => {
                  setIsArtifactsOpen(true)
                }}
                className="inverted"
              >
                <TestTubeDiagonal size={14} color="var(--accent-4)" />
                {isMobileDevice ? null : t("Artifacts")}
              </button>

              {isManaging && (
                <div
                  style={{
                    position: "relative",
                  }}
                >
                  {showEmojiPicker && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: "100%",
                        right: 0,
                        marginBottom: "0.5rem",
                        zIndex: 1000,
                      }}
                    >
                      <EmojiPicker
                        onEmojiClick={handleEmojiClick}
                        theme={
                          (isDark ? Theme.DARK : Theme.LIGHT) as
                            | Theme
                            | undefined
                        }
                        searchPlaceHolder={t("Search emoji...")}
                        width={300}
                        height={400}
                        previewConfig={{
                          showPreview: false,
                        }}
                        skinTonesDisabled
                        lazyLoadEmojis={true}
                        suggestedEmojisMode={SuggestionMode.RECENT}
                      />
                    </div>
                  )}
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="inverted"
                  >
                    {selectedEmoji} {isMobileDevice ? null : t("Emoji")}
                  </button>
                </div>
              )}

              {isAllowed && (
                <button
                  data-testid={`${dataTestId}-modal-save-button`}
                  disabled={(!content && isManaging) || isSaving}
                  className={clsx(
                    (!content && isManaging) || isSaving ? "transparent" : "",
                  )}
                  onClick={() =>
                    handleSave({
                      instruction: selectedInstruction || undefined,
                    })
                  }
                >
                  {isSaving ? (
                    <Loading width={14} height={14} color="white" />
                  ) : (
                    t("Save")
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
      <div className={styles.instructionsContainer}>
        {showButton && (
          <div
            style={{
              marginBottom: !thread && !icon ? "0.8rem" : undefined,
            }}
            className={styles.instructionsButtonContainer}
          >
            <button
              data-testid={`${dataTestId}-button`}
              onClick={() => {
                // Clear content if it matches the currently selected instruction
                if (
                  !thread &&
                  selectedInstruction &&
                  t(selectedInstruction.content || "") === content
                ) {
                  setContent("")
                }
                setSelectedInstruction(null)
                setIsOpen(true)
              }}
              className={clsx(
                icon ? "link" : "inverted",
                "instructionsButton",
                styles.instructionsButton,
                className,
                icon && styles.icon,
              )}
            >
              <Brain color="var(--accent-6)" size={16} />
              {!icon ? (
                <>
                  {t("Instructions")} <Plus size={16} />
                </>
              ) : (
                <Plus size={12} />
              )}
            </button>
            <button
              title={t("Artifacts")}
              data-testid={`${dataTestId}-artifacts-button`}
              onClick={() => {
                addHapticFeedback()
                setIsArtifactsOpen(true)
              }}
              className={clsx(
                icon ? "link" : "transparent",
                styles.artifactsButton,
                className,
                icon && styles.icon,
              )}
            >
              <TestTubeDiagonal size={15} color="var(--accent-4)" />
            </button>
          </div>
        )}
        {!thread && showInstructions && (
          <div
            data-testid={`${dataTestId}-list`}
            ref={instructionsListRef}
            className={clsx(styles.instructions, "instructionsList")}
          >
            {instructions
              .slice(
                0,
                isMemoryConsentManageVisible ? 3 : visibleInstructionCount,
              )
              .map((instruction) => {
                return (
                  <button
                    key={instruction.id}
                    data-testid={`${dataTestId}-item`}
                    className={clsx(
                      "link",
                      "instructionItem",
                      styles.instruction,
                      isStandalone ? styles.standalone : undefined,
                      selectedInstruction?.id === instruction.id &&
                        styles.selected,
                    )}
                    onClick={() => {
                      setSelectedInstruction(instruction)
                      if (instruction.requiresWebSearch) {
                        setSelectedAgent(perplexityAgent)
                      }
                    }}
                  >
                    <span className={styles.instructionEmoji}>
                      {instruction.emoji}
                    </span>
                    <span className={styles.instructionTitle}>
                      {t(
                        instruction.title,
                        isManaging ? undefined : instructionConfig,
                      )}
                    </span>
                    {isManaging && (
                      <>
                        {getCurrentSuggestionStep(instruction) ===
                        "not_started" ? (
                          <ArrowRight size={14} color="var(--accent-1)" />
                        ) : getCurrentSuggestionStep(instruction) ===
                          "in_progress" ? (
                          <Circle size={14} color="var(--accent-1)" />
                        ) : getCurrentSuggestionStep(instruction) ===
                          "success" ? (
                          <CircleCheck size={14} color="var(--accent-4)" />
                        ) : null}
                      </>
                    )}
                  </button>
                )
              })}
          </div>
        )}
        {!thread && !icon && showInstructions && (
          <div data-testid={`${dataTestId}-about`} className={styles.bottom}>
            <a
              onClick={(e) => {
                if (appStatus?.part) {
                  e.preventDefault()
                  setIsAppDescriptionOpen(true)
                  return
                }
                addHapticFeedback()
                if (e.metaKey || e.ctrlKey) {
                  return
                }
                e.preventDefault()
                router.push("/about")
              }}
              href={isStandalone ? undefined : `${FRONTEND_URL}/about`}
            >
              <MousePointerClick color="var(--accent-1)" size={26} />

              {t(appStatus?.part ? "Description" : "About")}
            </a>
            {appStatus?.part ? (
              <Agent />
            ) : isExtension ? null : (
              <>
                {os && ["ios", "android"].includes(os) ? (
                  <button
                    className={clsx(
                      "small",
                      styles.installAppButton,
                      isStandalone ? styles.standalone : undefined,
                    )}
                    onClick={(e) => {
                      addHapticFeedback()
                      setShowAddToHomeScreen(true)
                    }}
                  >
                    {os === "ios" ? (
                      <FaApple
                        style={{
                          position: "relative",
                          bottom: 1,
                        }}
                        size={18}
                      />
                    ) : (
                      <FaAndroid size={18} />
                    )}{" "}
                    {t("Install")}
                  </button>
                ) : !isFirefox && productionExtensions.includes("chrome") ? (
                  <a
                    target="_blank"
                    href="https://chromewebstore.google.com/detail/vex/odgdgbbddopmblglebfngmaebmnhegfc"
                    className={clsx("button small", styles.installButton)}
                  >
                    <FaChrome size={18} />
                    {t("Extension")}
                  </a>
                ) : isFirefox && productionExtensions.includes("firefox") ? (
                  <a
                    target="_blank"
                    href="https://addons.mozilla.org/en-US/firefox/addon/vex"
                    className={clsx("button small", styles.installButton)}
                  >
                    <FaFirefox size={18} />
                    {t("Add-on")}
                  </a>
                ) : null}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
