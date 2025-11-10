"use client"

import React, { useState } from "react"

import styles from "./Collaborate.module.scss"
import { Send, UsersRound } from "./icons"
import { useAppContext } from "./context/AppContext"
import Modal from "./Modal"
import clsx from "clsx"
import toast from "react-hot-toast"
import { user } from "./types"
import Loading from "./Loading"
import { checkIsExtension, BrowserInstance, apiFetch } from "./utils"
import { useAuth, useNavigationContext } from "./context/providers"
import { useTheme } from "./platform"

const Collaborate = ({ withUser }: { withUser: user }) => {
  const { addParams } = useNavigationContext()
  const { token, user, API_URL, FRONTEND_URL } = useAuth()
  const { t } = useAppContext()
  const { addHapticFeedback } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [content, setContent] = useState("")

  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className={styles.collaborate}>
      <button
        className={clsx("button xSmall", styles.collaborateButton)}
        onClick={() => {
          if (!user) {
            addHapticFeedback()

            if (checkIsExtension()) {
              BrowserInstance?.runtime?.sendMessage({
                action: "openInSameTab",
                url: `${FRONTEND_URL}/?signIn=register`,
              })

              return
            }
            addParams({ signIn: "register" })
            return
          }

          setIsOpen(true)
        }}
      >
        <UsersRound size={18} />
        {t("Collaborate")}
      </button>
      <Modal
        className={styles.modal}
        hasCloseButton
        hideOnClickOutside={false}
        isModalOpen={isOpen}
        title={
          <>
            <>
              <UsersRound color="var(--accent-6)" size={24} />
              <span>{t("Collaborate")}</span>
            </>
          </>
        }
        onToggle={(open) => {
          setIsOpen(open)
        }}
      >
        <textarea
          disabled={false}
          id="instructions"
          onChange={(e) => setContent(e.target.value)}
          value={content}
          className={styles.collaborateTextarea}
          placeholder={`✨ ${t(`Let's create something amazing together!`)}
      
${t(`Describe what you'd like to collaborate on:`)}
      
💡 ${t(`Brainstorm ideas for a new project`)}
📝 ${t(`Write and edit content together`)}
🔍 ${t(`Research and analyze topics`)}
🎯 ${t(`Solve problems as a team`)}
🚀 ${t(`Plan and strategize together`)}

${t(`Share your vision and invite others to join the conversation!`)}`}
        />
        <div className={styles.actions}>
          <button
            disabled={isLoading || !content}
            className={clsx("button inverted", styles.collaborateButton)}
            onClick={async () => {
              let postRequestHeaders: Record<string, string> = {
                Authorization: `Bearer ${token}`,
              }

              setIsLoading(true)

              try {
                const userResponse = await apiFetch(`${API_URL}/messages`, {
                  method: "POST",
                  headers: postRequestHeaders,
                  body: JSON.stringify({
                    content: content,
                    attachmentType: "file",
                  }),
                })

                if (!userResponse.ok) {
                  toast.error("Failed to send message")
                }

                const data = await userResponse.json()
                if (data.error) {
                  toast.error(data.error)
                  return
                }

                const message = data.message

                const collaborationResponse = await apiFetch(
                  `${API_URL}/collaborations`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      threadId: message?.thread?.id,
                      userId: withUser.id,
                      status: "pending",
                    }),
                  },
                )

                if (!collaborationResponse.ok) {
                  toast.error(t("Failed to add user"))
                  return
                }

                const collaborationData = await collaborationResponse.json()

                if (collaborationData.error) {
                  toast.error(collaborationData.error)
                  setIsLoading(false)

                  return
                }

                toast.success("Sent")
                setIsOpen(false)
                setContent("")
              } catch (error) {
                console.error("Error sending message:", error)
                toast.error("Failed to send message")
              } finally {
                setIsLoading(false)
              }
            }}
          >
            {isLoading ? (
              <Loading size={18} />
            ) : (
              <>
                <Send size={18} />
              </>
            )}
            {t("Send")}
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default Collaborate
