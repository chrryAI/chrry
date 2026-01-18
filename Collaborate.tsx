"use client"

import React, { useState } from "react"

import { Send, UsersRound } from "./icons"
import { useAppContext } from "./context/AppContext"
import Modal from "./Modal"
import toast from "react-hot-toast"
import { user } from "./types"
import Loading from "./Loading"
import { checkIsExtension, BrowserInstance, apiFetch } from "./utils"
import { useAuth, useNavigationContext } from "./context/providers"
import { Button, Div, useTheme, TextArea, Span } from "./platform"
import { useCollaborateStyles } from "./Collaborate.styles"

const Collaborate = ({ withUser }: { withUser: user }) => {
  const { addParams } = useNavigationContext()
  const { token, user, API_URL, FRONTEND_URL } = useAuth()
  const { t } = useAppContext()
  const { addHapticFeedback } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [content, setContent] = useState("")
  const styles = useCollaborateStyles()

  const [isLoading, setIsLoading] = useState(false)

  return (
    <Div>
      <Button
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
      </Button>
      <Modal
        style={styles.modal.style}
        hasCloseButton
        hideOnClickOutside={false}
        isModalOpen={isOpen}
        title={
          <>
            <>
              <UsersRound color="var(--accent-6)" size={24} />
              <Span>{t("Collaborate")}</Span>
            </>
          </>
        }
        onToggle={(open) => {
          setIsOpen(open)
        }}
      >
        <TextArea
          disabled={false}
          id="instructions"
          onChange={(e) => setContent(e.target.value)}
          value={content}
          style={styles.collaborateTextarea.style}
          placeholder={`✨ ${t(`Let's create something amazing together!`)}
      
${t(`Describe what you'd like to collaborate on:`)}
      
💡 ${t(`Brainstorm ideas for a new project`)}
📝 ${t(`Write and edit content together`)}
🔍 ${t(`Research and analyze topics`)}
🎯 ${t(`Solve problems as a team`)}
🚀 ${t(`Plan and strategize together`)}

${t(`Share your vision and invite others to join the conversation!`)}`}
        />
        <Div style={styles.actions.style}>
          <Button
            disabled={isLoading || !content}
            className={"button inverted"}
            onClick={async () => {
              const postRequestHeaders: Record<string, string> = {
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
          </Button>
        </Div>
      </Modal>
    </Div>
  )
}

export default Collaborate
