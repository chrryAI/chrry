import React, { useEffect, useState } from "react"
import { useAppContext } from "./context/AppContext"
import { thread, MAX_THREAD_TITLE_CHAR_COUNT } from "./types"
import styles from "./EditThread.module.scss"
import clsx from "clsx"
import { Pencil, Sparkles } from "./icons"
import Modal from "./Modal"
import Loading from "./Loading"
import { updateThread } from "./lib"
import toast from "react-hot-toast"
import DeleteThread from "./DeleteThread"
import { useAuth, useError, useNavigationContext } from "./context/providers"

export default function EditThread({
  className,
  onSave,
  isIcon,
  refetch,
  onDelete,
  thread,
  ...rest
}: {
  className?: string
  thread: thread
  isIcon?: boolean
  onDelete?: () => void
  onSave?: ({ title }: { title: string }) => void
  refetch?: () => Promise<void>
}) {
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
        className={styles.modal}
        icon={<Pencil size={20} color="var(--accent-6)" />}
        title={
          <>
            Edit Thread
            <div className={styles.right}>
              {charCount === 0 ? (
                <span className={clsx(styles.maxCharCount)}>
                  {maxCharCount}
                </span>
              ) : (
                <span
                  className={clsx(
                    styles.charLeft,
                    maxCharCount - charCount < 50 && styles.orange,
                    charCount > maxCharCount && styles.red,
                  )}
                >
                  {charCount}/{maxCharCount}
                </span>
              )}
            </div>
          </>
        }
        hasCloseButton
        onToggle={(open) => setIsModalOpen(open)}
        event={{
          name: "edit_thread",
        }}
      >
        <div className={styles.editThreadContainer}>
          <textarea
            data-testid="edit-thread-textarea"
            onChange={(e) => setTitle(e.target.value)}
            className={styles.editThreadInput}
            value={title}
          ></textarea>
        </div>
        <div className={styles.actions}>
          <button
            data-testid="edit-thread-generate-title-button"
            onClick={() => handleSave({ regenerateTitle: true })}
            className="inverted"
          >
            {isGeneratingTitle ? (
              <Loading width={14} height={14} />
            ) : (
              <>
                <Sparkles size={14} color="var(--accent-1)" />
                {t("Generate")}
              </>
            )}
          </button>

          <DeleteThread
            onDelete={async () => {
              refetch ? await refetch() : await refetchThreads()
              onDelete?.()
              //   setIsModalOpen(false)
            }}
            className={styles.deleteThread}
            id={thread.id}
          />
          <button onClick={() => setIsModalOpen(false)} className="inverted">
            {t("Close")}
          </button>

          {isAllowed && (
            <button
              data-testid="edit-thread-save-button"
              className=""
              onClick={() => handleSave()}
            >
              {isSaving ? (
                <Loading width={14} height={14} color="white" />
              ) : (
                t("Save")
              )}
            </button>
          )}
        </div>
      </Modal>
      <button
        data-testid="edit-thread-button"
        onClick={() => setIsModalOpen(true)}
        className={clsx(isIcon ? "link" : "transparent small", className)}
      >
        {isIcon ? (
          <Pencil size={12} color="var(--accent-1)" />
        ) : (
          <>
            <Pencil size={12} color="var(--accent-1)" />
            {t("Edit")}
          </>
        )}
      </button>
    </>
  )
}
