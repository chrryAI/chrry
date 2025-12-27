import React, { useEffect, useState } from "react"
import { useAppContext } from "./context/AppContext"
import { thread, MAX_THREAD_TITLE_CHAR_COUNT } from "./types"
import { Pencil, Sparkles } from "./icons"
import Modal from "./Modal"
import Loading from "./Loading"
import { updateThread } from "./lib"
import toast from "react-hot-toast"
import DeleteThread from "./DeleteThread"
import { useAuth, useError, useNavigationContext } from "./context/providers"
import { useEditThreadStyles } from "./EditThread.styles"
import { Button, Div, Span, TextArea } from "./platform"
import { useStyles } from "./context/StylesContext"

export default function EditThread({
  onSave,
  isIcon,
  refetch,
  onDelete,
  thread,
  style,
  ...rest
}: {
  style?: React.CSSProperties
  thread: thread
  isIcon?: boolean
  onDelete?: () => void
  onSave?: ({ title }: { title: string }) => void
  refetch?: () => Promise<void>
}) {
  const styles = useEditThreadStyles()
  const { utilities } = useStyles()
  const { refetchThreads } = useNavigationContext()

  const { t } = useAppContext()

  const { token, language } = useAuth()

  const { captureException } = useError()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [title, setTitle] = useState("")

  useEffect(() => {
    setTitle(thread.title)
  }, [])

  const maxCharCount = MAX_THREAD_TITLE_CHAR_COUNT

  const charCount = title?.length || 0
  const isAllowed = charCount < maxCharCount

  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false)

  const handleSave = async ({
    regenerateTitle,
  }: { regenerateTitle?: boolean; cancel?: boolean } = {}) => {
    if (!isAllowed) return
    if (!token) return
    regenerateTitle ? setIsGeneratingTitle(true) : setIsSaving(true)
    try {
      const response = await updateThread({
        id: thread.id,
        token,
        title,
        regenerateTitle,
        language,
      })

      if (response.error) {
        toast.error(response.error)
      }

      toast.success(t("Updated"))

      refetch ? await refetch() : await refetchThreads()

      setTitle(response.thread.title)

      if (regenerateTitle) return

      setIsModalOpen(false)
      onSave?.({ title })
    } catch (error) {
      console.error("Error updating thread:", error)
      toast.error(t("Error updating thread"))
      captureException(error)
    } finally {
      setIsSaving(false)
      setIsGeneratingTitle(false)
    }
  }
  return (
    <>
      <Modal
        borderHeader={false}
        isModalOpen={isModalOpen}
        style={styles.modal.style}
        icon={<Pencil size={20} color="var(--accent-6)" />}
        title={
          <>
            Edit Thread
            <Div style={utilities.right.style}>
              {charCount === 0 ? (
                <Span style={styles.maxCharCount.style}>{maxCharCount}</Span>
              ) : (
                <Span
                  style={{
                    ...styles.charLeft.style,
                    ...(maxCharCount - charCount < 50 &&
                      styles.maxCharCountOrange),
                    ...(charCount > maxCharCount && styles.maxCharCountRed),
                  }}
                >
                  {charCount}/{maxCharCount}
                </Span>
              )}
            </Div>
          </>
        }
        hasCloseButton
        onToggle={(open) => setIsModalOpen(open)}
        event={{
          name: "edit_thread",
        }}
      >
        <Div style={styles.editThreadContainer.style}>
          <TextArea
            data-testid="edit-thread-textarea"
            onChange={(e) => setTitle(e.target.value)}
            style={styles.editThreadInput.style}
            value={title}
          />
        </Div>
        <Div style={styles.actions.style}>
          <Button
            data-testid="edit-thread-generate-title-button"
            onClick={() => handleSave({ regenerateTitle: true })}
          >
            {isGeneratingTitle ? (
              <Loading width={14} height={14} />
            ) : (
              <>
                <Sparkles size={14} color="var(--accent-1)" />
                {t("Generate")}
              </>
            )}
          </Button>

          <DeleteThread
            onDelete={async () => {
              refetch ? await refetch() : await refetchThreads()
              onDelete?.()
              //   setIsModalOpen(false)
            }}
            style={styles.deleteThread.style}
            id={thread.id}
          />
          <Button
            onClick={() => setIsModalOpen(false)}
            style={utilities.inverted.style}
          >
            {t("Close")}
          </Button>

          {isAllowed && (
            <Button
              data-testid="edit-thread-save-button"
              className=""
              onClick={() => handleSave()}
            >
              {isSaving ? (
                <Loading width={14} height={14} color="white" />
              ) : (
                t("Save")
              )}
            </Button>
          )}
        </Div>
      </Modal>
      <Button
        className={isIcon ? "link" : "transparent"}
        data-testid="edit-thread-button"
        onClick={() => setIsModalOpen(true)}
        style={{
          ...(isIcon ? utilities.link.style : utilities.transparent.style),
          ...style,
        }}
      >
        {isIcon ? (
          <Pencil size={12} color="var(--accent-1)" />
        ) : (
          <>
            <Pencil size={14} color="var(--accent-1)" />
          </>
        )}
      </Button>
    </>
  )
}
