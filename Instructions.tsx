"use client"

import {
  type CSSProperties,
  type Dispatch,
  lazy,
  type SetStateAction,
  Suspense,
  useEffect,
  useRef,
  useState,
} from "react"
import toast from "react-hot-toast"
import { FaAndroid, FaApple, FaChrome } from "react-icons/fa"
import { SiMacos } from "react-icons/si"
import A from "./a/A"
import ConfirmButton from "./ConfirmButton"
import { useAppContext } from "./context/AppContext"
import {
  useApp,
  useAuth,
  useChat,
  useData,
  useError,
  useNavigationContext,
} from "./context/providers"
import { useStyles } from "./context/StylesContext"
import { useHasHydrated } from "./hooks"
import { useResponsiveCount } from "./hooks/useResponsiveCount"
import { useInstructionsStyles } from "./Instructions.styles"
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  BrainCircuit,
  Circle,
  CircleCheck,
  CircleX,
  Copy,
  FileIcon,
  FileText,
  FileUp,
  MousePointerClick,
  Music,
  Plus,
  Sparkles,
  TestTubeDiagonal,
  Trash2,
  VideoIcon,
} from "./icons"
import Loading from "./Loading"
import { updateThread } from "./lib"
import Modal from "./Modal"
import {
  Button,
  Div,
  Input,
  Span,
  TextArea,
  toRem,
  usePlatform,
  useTheme as usePlatformTheme,
} from "./platform"
import { MotiView } from "./platform/MotiView"
import type { instruction, thread } from "./types"
import {
  apiFetch,
  decodeHtmlEntities,
  getInstructionConfig,
  getMaxFiles,
  type instructionBase,
  isDeepEqual,
  isOwner,
  PROMPT_LIMITS,
} from "./utils"
import { formatFileSize } from "./utils/fileValidation"

const Agent = lazy(() => import("./agent"))
const EmojiPicker = lazy(() => import("./EmojiPicker"))

export default function Instructions({
  className,
  thread,
  onSave,
  icon,
  showInstructions = true,
  showDownloads = true,
  dataTestId = "instruction",
  showButton = true,
  showInstallers = true,
  opacity = 1,
  isAgentBuilder = false,
  onClose,
  style,
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
  showDownloads?: boolean
  showInstallers?: boolean
  onClose?: () => void
  isAgentBuilder?: boolean
  onSave?: ({
    content,
    artifacts,
  }: {
    content: string
    artifacts: File[]
  }) => void
  style?: CSSProperties
}) {
  const { t, console } = useAppContext()

  const { API_URL } = useData()

  const styles = useInstructionsStyles()

  const { utilities } = useStyles()

  const { defaultInstructions, isAppInstructions, isAgentModalOpen } = useApp()

  const {
    token,
    language,
    user,
    guest,
    app,
    storeApp,
    burnApp,
    downloadUrl,
    chromeWebStoreUrl,
    isRetro,
    dailyQuestionData,
    ...auth
  } = useAuth()

  const burn = (burnApp && burnApp?.id === app?.id) || auth.burn

  const [showGrapeInternal, setShowGrape] = useState(false)

  const canGrape = !burn

  const showGrape = canGrape && showGrapeInternal

  // Replace instructions with Zarathustra philosophy when burn is active

  const {
    selectedAgent,
    setSelectedAgent,
    deepSeekAgent,
    claudeAgent,
    favouriteAgent,
    refetchThread,
  } = useChat()

  const {
    router,
    collaborationStep,
    setCollaborationStep,
    isMemoryConsentManageVisible,
    setShowAddToHomeScreen,
  } = useNavigationContext()

  const {
    isManagingApp,
    appFormWatcher,
    instructions,
    setInstructions,
    appStatus,
    appForm,
  } = useApp()

  const { captureException } = useError()
  const { weather } = useData()

  const { os, isStandalone, isTauri, isCapacitor, isExtension } = usePlatform()

  const offset = isStandalone || isExtension || isCapacitor ? -80 : 0

  const count = useResponsiveCount(
    [
      { height: 550, count: 0 }, // Small phones: show none (was 1)
      { height: 700, count: 1 }, // Medium phones: show 1 (was 2)
      { height: 750, count: 2 }, // Larger phones: show 2 (was 3)
      { height: 800, count: 3 }, // Small tablets/large phones: show 3 (was 4)
      { height: 850, count: 5 }, // Tablets: show 4 (was 5)
      { height: 900, count: 6 }, // Tablets: show 4 (was 5)
      { height: 950, count: 7 }, // Large tablets: show 5 (was 6)
      { height: Infinity, count: 7 }, // Desktop: show 6 (was 7)
    ],
    offset, // -250 for PWA (standalone mode)
  )

  // Theme context
  const { addHapticFeedback, isDark, isMobileDevice, reduceMotion } =
    usePlatformTheme()

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

  const productionExtensions = ["chrome"]
  const MAX_FILES = getMaxFiles({ user, guest })
  const [selectedInstruction, setSelectedInstructionInternal] =
    useState<instructionBase | null>(null)

  const setSelectedInstruction = (instruction: instructionBase | null) => {
    setSelectedInstructionInternal(instruction)
    instruction && setIsOpen(true)
  }

  const grapeButtonRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        grapeButtonRef.current &&
        !grapeButtonRef.current.contains(event.target as Node)
      ) {
        setShowGrape(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

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

    // For artifacts/RAG content, use generous limits since any agent can access them later
    const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB per file
    const MAX_TOTAL_SIZE = 500 * 1024 * 1024 // 500MB total

    // Check individual file sizes
    const oversizedFile = f.find((file) => file.size > MAX_FILE_SIZE)
    if (oversizedFile) {
      toast.error(
        `${oversizedFile.name}: File too large. Max size: ${formatFileSize(MAX_FILE_SIZE)}`,
      )
      return
    }

    // Check total file size
    const totalFileSize = f.reduce((acc, file) => acc + file.size, 0)
    if (totalFileSize > MAX_TOTAL_SIZE) {
      toast.error(
        `Total file size (${formatFileSize(totalFileSize)}) exceeds maximum limit of ${formatFileSize(MAX_TOTAL_SIZE)}`,
      )
      return
    }

    setFilesInternal(f)
  }
  const handleFileSelect = async (selectedFiles: FileList | null) => {
    if (!selectedFiles) return

    const newFiles = Array.from(selectedFiles)
    const validFiles: File[] = []
    const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB per file

    for (const file of newFiles) {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        toast.error(
          `${file.name}: File too large. Max size: ${formatFileSize(MAX_FILE_SIZE)}`,
        )
        continue
      }

      validFiles.push(file)
    }

    setFiles((prev) => [...prev, ...validFiles].slice(0, MAX_FILES))

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

  const handleEmojiClick = (emojiData: { emoji: string }) => {
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
        existingHighlight?.content &&
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
  }, [collaborationStep, setIsOpen])

  useEffect(() => {
    if (!isOpen && collaborationStep === 1) {
      // setCollaborationStep(0)
    }
  }, [isOpen, collaborationStep])

  const [content, setContent] = useState(thread?.instructions || "")

  useEffect(() => {
    if (selectedInstruction && !thread) {
      if (selectedInstruction?.content) {
        setContent(t(selectedInstruction?.content))
      }
      // setIsOpen(true)
    }
  }, [selectedInstruction, t, setIsOpen, thread])

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
    } catch (_error) {
      toast.error(t("Error deleting file"))
    } finally {
      setDeletingId(null)
    }
  }

  if (!hasHydrated && (isManagingApp || appFormWatcher?.canSubmit)) {
    return <Loading fullScreen />
  }

  return (
    <Div data-testid={`${dataTestId}`}>
      {isAppDescriptionOpen && (
        <Modal
          style={{
            ...styles.modal.style,
          }}
          isModalOpen={true}
          hideOnClickOutside={false}
          hasCloseButton={true}
          onToggle={(open) => {
            setIsAppDescriptionOpen(open)
          }}
          icon={"blob"}
          title={<Div>{t("Thinking")}...</Div>}
        >
          <Div style={styles.updateModalDescription.style}>
            <TextArea
              id="description"
              {...appForm?.register("description")}
              style={styles.instructionsTextarea.style}
              placeholder={t(
                "Your intelligent {{agent}} that learns your preferences and provides personalized recommendations.",
                { agent: appForm?.watch("name") || "assistant" },
              )}
            />
            <Div style={styles.updateModalButtons.style}>
              <Button
                onClick={() => {
                  toast.success(t("Saved"))
                  setIsAppDescriptionOpen(false)
                }}
                disabled={appForm?.watch("description") === ""}
              >
                {t("Save")}
              </Button>
            </Div>
          </Div>
        </Modal>
      )}
      <Modal
        dataTestId={`${dataTestId}-modal`}
        borderHeader={true}
        style={styles.modal.style}
        hasCloseButton
        hideOnClickOutside={false}
        isModalOpen={isOpen || isArtifactsOpen}
        title={
          <>
            {isArtifactsOpen ? (
              <>
                <TestTubeDiagonal color="var(--accent-4)" size={24} />
                <Span>{t("Artifacts")}</Span>
              </>
            ) : (
              <>
                <Brain color="var(--accent-6)" size={24} />
                <Span>{t("Instructions")}</Span>
              </>
            )}

            {canUpdate && !isArtifactsOpen && (
              <Div style={styles.right.style}>
                {charCount === 0 ? (
                  <Span
                    data-testid={`${dataTestId}-modal-max-char-count`}
                    style={styles.maxCharCount.style}
                  >
                    {maxCharCount}
                  </Span>
                ) : (
                  <Span
                    data-testid={`${dataTestId}-modal-char-left`}
                    style={{
                      ...styles.charLeft.style,
                      ...(maxCharCount - charCount < 50 &&
                        styles.maxCharCountOrange.style),
                      ...(charCount > maxCharCount &&
                        styles.maxCharCountRed.style),
                    }}
                  >
                    {charCount}/{maxCharCount}
                  </Span>
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
              </Div>
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
          <Div>
            <Div>
              {thread?.isMainThread && canUpdate ? (
                <>
                  <Div>
                    {t(
                      "⚠️ This is the DNA Thread. Files uploaded here become public RAG content accessible to all users of this app.",
                    )}
                  </Div>
                  <Div style={{ marginTop: "0.5rem" }}>
                    {t("For private data, use a regular thread instead.")}
                  </Div>
                </>
              ) : (
                <Div>
                  {t(
                    "Upload files here for the AI to remember and reference in future conversations. These artifacts remain private to this thread.",
                  )}
                </Div>
              )}
            </Div>
            {(files.length || threadArtifacts.length) > 0 && (
              <Div style={styles.filePreviewArea.style}>
                {threadArtifacts.map((file, index) => {
                  return (
                    <Div key={index} style={styles.filePreview.style}>
                      <Div style={styles.filePreviewIcon.style}>
                        <FileIcon size={16} />
                      </Div>

                      <Div style={styles.filePreviewInfo.style}>
                        <A
                          className="link"
                          href={file.url}
                          style={{
                            ...utilities.link.style,
                            ...styles.filePreviewName.style,
                          }}
                          target="_blank"
                        >
                          {file.name}
                        </A>
                        <Div style={styles.filePreviewSize.style}>
                          {(file.size / 1024).toFixed(1)}KB
                        </Div>
                      </Div>

                      {deletingId === file.id ? (
                        <Loading width={18} height={18} />
                      ) : (
                        <Button
                          data-testid={`${dataTestId}-file-preview-clear`}
                          type="button"
                          className="link"
                          onClick={() => handleDeleteFile(file.id)}
                          style={{
                            ...utilities.link.style,
                            ...styles.filePreviewClear.style,
                          }}
                          title="Remove file"
                        >
                          <CircleX size={18} />
                        </Button>
                      )}
                    </Div>
                  )
                })}
                {files.map((file, index) => {
                  const fileType = file.type.toLowerCase()
                  const isImage = fileType.startsWith("image/")
                  const isVideo = fileType.startsWith("video/")
                  const isAudio = fileType.startsWith("audio/")
                  const isPDF = fileType === "application/pdf"
                  const isText =
                    fileType.startsWith("text/") ||
                    file.name.match(
                      /\.(txt|md|json|csv|xml|html|css|js|ts|tsx|jsx|py|java|c|cpp|h|hpp|cs|php|rb|go|rs|swift|kt|scala|sh|yaml|yml|toml|ini|conf|log)$/i,
                    )

                  return (
                    <Div key={index} style={styles.filePreview.style}>
                      <Div style={styles.filePreviewIcon.style}>
                        {isImage ? (
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            style={{
                              width: "32px",
                              height: "32px",
                              objectFit: "cover",
                              borderRadius: "4px",
                            }}
                          />
                        ) : isVideo ? (
                          <VideoIcon size={16} />
                        ) : isAudio ? (
                          <Music size={16} />
                        ) : isPDF || isText ? (
                          <FileText size={16} />
                        ) : (
                          <FileIcon size={16} />
                        )}
                      </Div>

                      <Div style={styles.filePreviewInfo.style}>
                        <Div style={styles.filePreviewName.style}>
                          {file.name}
                        </Div>
                        <Div style={styles.filePreviewSize.style}>
                          {formatFileSize(file.size)}
                        </Div>
                      </Div>

                      <Button
                        data-testid={`${dataTestId}-file-preview-clear`}
                        type="button"
                        onClick={() => removeFile(index)}
                        className="link"
                        style={{
                          ...utilities.link.style,
                          ...styles.filePreviewClear.style,
                        }}
                        title="Remove file"
                      >
                        <CircleX size={18} />
                      </Button>
                    </Div>
                  )
                })}
              </Div>
            )}

            <Div style={styles.actions.style}>
              <Div style={styles.fileUploader.style}>
                <>
                  <Button
                    className="transparent"
                    data-testid={`${dataTestId}-artifacts-back-button`}
                    onClick={() => {
                      addHapticFeedback()
                      setIsArtifactsOpen(false)
                      setIsOpen(true)
                    }}
                    style={{ ...utilities.transparent.style }}
                  >
                    <ArrowLeft size={16} />
                  </Button>
                  <Button
                    className="transparent"
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
                    style={{ ...utilities.transparent.style }}
                  >
                    <Copy size={16} />
                    {t("Paste")}
                  </Button>
                  <Button
                    className="transparent"
                    data-testid={`${dataTestId}-artifacts-upload-button`}
                    onClick={() =>
                      triggerFileInput(
                        "image/*,video/*,audio/*,.pdf,.txt,.md,.json,.csv,.xml,.html,.css,.js,.ts,.tsx,.jsx,.py,.java,.c,.cpp,.h,.hpp,.cs,.php,.rb,.go,.rs,.swift,.kt,.scala,.sh,.yaml,.yml,.toml,.ini,.conf,.log",
                      )
                    }
                    style={{ ...utilities.transparent.style }}
                  >
                    <FileUp size={16} />
                    {t("Upload")}
                  </Button>
                  {isAllowed && (
                    <Button
                      disabled={(!content && isManaging) || isSaving}
                      style={{
                        ...((!content && isManaging) || isSaving
                          ? utilities.transparent.style
                          : {}),
                      }}
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
                    </Button>
                  )}
                </>
              </Div>
            </Div>
          </Div>
        ) : (
          <>
            {isManaging && selectedInstruction && (
              <Div style={styles.titleField.style}>
                <Span style={{ fontSize: "1.5rem" }}>{selectedEmoji}</Span>
                <Input
                  title={t("Feature title")}
                  id="featureTitle"
                  value={t(editedTitle)}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  type="text"
                  placeholder={t("Feature title")}
                  style={{ flex: 1 }}
                />
              </Div>
            )}
            <TextArea
              disabled={!canUpdate}
              data-testid={`${dataTestId}-modal-textarea`}
              id="instructions"
              onChange={(e) => setContent(e.target.value)}
              value={t(content, isManaging ? undefined : instructionConfig)}
              style={styles.instructionsTextarea.style}
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
          <Span style={styles.tip.style}>
            <BrainCircuit size={16} color="var(--accent-6)" />
            <Span>
              {canUpdate
                ? t(`Give Vex something to remember`)
                : t(`Only owner can update instructions`)}
            </Span>
          </Span>
        )}
        {canUpdate && !isArtifactsOpen && (
          <Div style={styles.footer.style}>
            {thread && (
              <Button
                className="inverted"
                data-testid={`${dataTestId}-modal-regenerate-button`}
                onClick={() => handleSave({ regenerateInstructions: true })}
                style={{ ...utilities.inverted.style }}
              >
                {isGeneratingInstructions ? (
                  <Loading width={14} height={14} />
                ) : (
                  <>
                    <Sparkles size={14} color="var(--accent-1)" />
                    {t("Generate")}
                  </>
                )}
              </Button>
            )}
            <Div style={styles.actions.style}>
              <Button
                className="inverted"
                data-testid={`${dataTestId}-modal-artifacts-button`}
                onClick={() => {
                  setIsArtifactsOpen(true)
                }}
                style={{ ...utilities.inverted.style }}
              >
                <TestTubeDiagonal size={14} color="var(--accent-4)" />
                {isMobileDevice ? null : t("Artifacts")}
              </Button>

              {isManaging && (
                <Div
                  style={{
                    position: "relative",
                  }}
                >
                  {showEmojiPicker && (
                    <Suspense>
                      <Div
                        style={{
                          position: "absolute",
                          bottom: "100%",
                          right: 0,
                          marginBottom: "0.5rem",
                          zIndex: 1000,
                        }}
                      >
                        <EmojiPicker
                          open={showEmojiPicker}
                          onClose={() => setShowEmojiPicker(false)}
                          onEmojiClick={handleEmojiClick}
                          width={300}
                          height={400}
                          previewConfig={{
                            showPreview: false,
                          }}
                          skinTonesDisabled
                          lazyLoadEmojis={true}
                          isDark={isDark}
                        />
                      </Div>
                    </Suspense>
                  )}
                  <Button
                    className="inverted"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    style={{ ...utilities.inverted.style }}
                  >
                    {selectedEmoji} {isMobileDevice ? null : t("Emoji")}
                  </Button>
                </Div>
              )}

              {isAllowed && (
                <Button
                  data-testid={`${dataTestId}-modal-save-button`}
                  disabled={(!content && isManaging) || isSaving}
                  style={{
                    ...((!content && isManaging) || isSaving
                      ? utilities.transparent.style
                      : {}),
                  }}
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
                </Button>
              )}
            </Div>
          </Div>
        )}
      </Modal>
      <Div style={styles.instructionsContainer.style}>
        {showButton && (
          <Div
            style={{
              ...styles.instructionsButtonContainer.style,
              marginBottom: !thread && !icon ? "0.8rem" : undefined,
            }}
          >
            <Button
              className={icon ? "link" : "inverted small"}
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
              style={{
                ...(icon
                  ? {
                      ...utilities.link.style,
                    }
                  : utilities.inverted.style),
              }}
            >
              <Brain color="var(--accent-6)" size={16} />
              {!icon ? <>{t("Instructions")}</> : <Plus size={12} />}
            </Button>
            {!isMobileDevice && (
              <Button
                title={t("Artifacts")}
                data-testid={`${dataTestId}-artifacts-button`}
                onClick={() => {
                  addHapticFeedback()
                  setIsArtifactsOpen(true)
                }}
                className={icon ? "link" : "transparent"}
                style={{
                  ...(icon
                    ? utilities.link.style
                    : utilities.transparent.style),
                }}
              >
                <TestTubeDiagonal size={15} color="var(--accent-4)" />
              </Button>
            )}
          </Div>
        )}
        {!thread && showInstructions && (
          <Div
            className="suggestionsList"
            data-testid={`${dataTestId}-list`}
            ref={instructionsListRef}
            style={{
              ...styles.instructionsContainer.style,
              gap: isMobileDevice ? toRem(5) : toRem(7.5),
            }}
          >
            {instructions.slice(0, count).map((instruction, index) => {
              return (
                <MotiView
                  key={`instruction-${instruction.id}-isAppInstructions-${isAppInstructions ? "true" : "false"}`}
                  from={{ opacity: 0, translateY: -10 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{
                    duration: reduceMotion ? 0 : 100,
                    delay: reduceMotion ? 0 : index * 15,
                  }}
                >
                  <Button
                    data-testid={`${dataTestId}-item`}
                    className="link"
                    style={{
                      ...utilities.link.style,
                      ...styles.instruction.style,
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      maxWidth: "300px",
                      ...(selectedInstruction?.id === instruction.id
                        ? styles.instructionSelected.style
                        : {}),
                      fontSize: isMobileDevice ? 14 : 15,
                    }}
                    onClick={() => {
                      setSelectedInstruction(instruction)
                    }}
                  >
                    <Span style={styles.instructionEmoji.style}>
                      {instruction.emoji}
                    </Span>
                    <Span style={styles.instructionTitle.style}>
                      {decodeHtmlEntities(
                        t(
                          instruction.title,
                          isManaging ? undefined : instructionConfig,
                        ),
                      )}
                    </Span>
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
                  </Button>
                </MotiView>
              )
            })}
          </Div>
        )}
        {!thread &&
          !icon &&
          ((showInstructions && showDownloads) || !showInstallers) && (
            <Div
              data-testid={`${dataTestId}-about`}
              style={{
                ...styles.bottom.style,
                marginBottom: showDownloads ? 0 : 30,
                marginTop: showInstallers ? 10 : style?.marginTop,
                zIndex: 10,
              }}
            >
              {!showGrape && showInstallers && (
                <A style={{ lineHeight: 1.5 }} href={"/about"}>
                  <MousePointerClick color="var(--accent-1)" size={26} />

                  {t(appStatus?.part ? "Description" : "About")}
                </A>
              )}
              {appStatus?.part ? (
                <Suspense>
                  <Agent />
                </Suspense>
              ) : (
                <Div
                  style={{
                    display: "flex",
                    gap: toRem(5),
                  }}
                >
                  {!isCapacitor && (
                    <Button
                      className="transparent"
                      style={{
                        ...utilities.small.style,
                        ...styles.installAppButton.style,
                      }}
                      onClick={() => {
                        addHapticFeedback()
                        setShowAddToHomeScreen(true)
                      }}
                    >
                      {os === "ios" || os === "macos" ? (
                        <FaApple
                          style={{
                            position: "relative",
                            bottom: 1,
                          }}
                          size={18}
                        />
                      ) : (
                        <FaAndroid size={18} />
                      )}
                      {/* {t("Install")} */}
                    </Button>
                  )}

                  {os !== "android" &&
                  os !== "ios" &&
                  !isTauri &&
                  downloadUrl ? (
                    <Button
                      className="inverted"
                      style={{
                        ...utilities.small.style,

                        ...styles.installAppButton.style,
                        paddingTop: "0",
                        paddingBottom: "0",
                      }}
                      onClick={() => {
                        const a = document.createElement("a")
                        a.href = downloadUrl
                        a.download = ""
                        document.body.appendChild(a)
                        a.click()
                        document.body.removeChild(a)
                      }}
                    >
                      <SiMacos
                        style={{
                          position: "relative",
                          bottom: 1,
                        }}
                        size={32}
                      />
                      {/* {t("Install")} */}
                    </Button>
                  ) : null}
                  {productionExtensions.includes("chrome")
                    ? !showGrape && (
                        <A
                          openInNewTab
                          href={chromeWebStoreUrl}
                          className="button"
                          style={{
                            ...utilities.button.style,
                            ...utilities.small.style,
                            ...styles.installButton.style,
                          }}
                        >
                          <FaChrome size={18} />
                          {/* {t("Extension")} */}
                        </A>
                      )
                    : null}
                  {canGrape && (
                    <A
                      ref={grapeButtonRef}
                      href="mailto:iliyan@chrry.ai"
                      className="link"
                      style={{
                        ...utilities.link.style,
                        marginLeft: showGrape ? 0 : 5,
                        fontSize: "0.9rem",
                        fontWeight: "normal",
                        padding: "6.25px 0",
                      }}
                      onClick={(e) => {
                        setShowGrape(!showGrape)
                        if (!showGrape) {
                          e.preventDefault()
                          // Open email client for advertising inquiries
                        }
                      }}
                    >
                      {showGrape ? t("Get your brand here") : ""}{" "}
                      <Span
                        style={{
                          marginLeft: 3,
                          lineHeight: 0.7,
                        }}
                      >
                        🍇
                      </Span>
                    </A>
                  )}
                </Div>
              )}
            </Div>
          )}
      </Div>
    </Div>
  )
}
