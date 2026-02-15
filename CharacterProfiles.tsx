"use client"

import React, { useEffect, useState } from "react"
import Modal from "./Modal"
import { useAppContext } from "./context/AppContext"
import { useAuth, useData } from "./context/providers"
import { Button, Div } from "./platform"
import { CircleX, Link, Sparkles, Trash2 } from "./icons"
import CharacterProfile from "./CharacterProfile"
import ConfirmButton from "./ConfirmButton"
import { updateUser } from "./lib"
import Loading from "./Loading"
import { useCharacterProfilesStyles } from "./CharacterProfiles.styles"
import A from "./a/A"

export default function CharacterProfiles({
  style,
}: {
  style?: React.CSSProperties
}) {
  const { t } = useAppContext()

  const {
    user,
    guest,
    showCharacterProfiles,
    token,
    setShowCharacterProfiles,
    characterProfilesEnabled,
    characterProfiles,
    setGuest,
    setUser,
    burn,
  } = useAuth()

  const { actions } = useData()

  const [isUpdating, setIsUpdating] = useState(false)

  const [isModalOpen, setIsModalOpen] = useState(showCharacterProfiles)

  useEffect(() => {
    showCharacterProfiles && setIsModalOpen(showCharacterProfiles)
  }, [showCharacterProfiles])

  const styles = useCharacterProfilesStyles()

  if (burn) return null

  return (
    <Div style={style}>
      <Button
        title={t("Character Profile")}
        className={"link pulse"}
        onClick={() => setIsModalOpen(true)}
        style={styles.characterProfileButton.style}
      >
        <Sparkles size={20} color="var(--accent-1)" fill="var(--accent-1)" />
      </Button>
      {isModalOpen && (
        <Modal
          hideOnClickOutside={false}
          isModalOpen={isModalOpen}
          onToggle={(open) => {
            setIsModalOpen(open)
            !open && setShowCharacterProfiles(false)
          }}
          title={t("Character Profile")}
          hasCloseButton={true}
          icon={"blob"}
        >
          <Div style={styles.characterProfilesContainer.style}>
            {characterProfiles?.length && characterProfilesEnabled ? (
              characterProfiles?.map((characterProfile) => (
                <CharacterProfile
                  key={characterProfile.id}
                  characterProfile={characterProfile}
                  style={styles.characterProfile.style}
                />
              ))
            ) : !characterProfilesEnabled ? (
              <>
                <Div>
                  {t(
                    "Enable character profiling in your conversations to start building your collection of AI-generated personality insights.",
                  )}
                </Div>
                {!user && (
                  <Div>
                    {t("By using this feature, you accept our privacy policy.")}
                  </Div>
                )}
              </>
            ) : (
              t("Pin character profiles from conversations to see them here")
            )}
          </Div>
          <Div style={styles.characterProfilesActions.style}>
            {characterProfilesEnabled ? (
              <ConfirmButton
                confirm={
                  <>
                    {isUpdating ? (
                      <Loading width={18} height={18} />
                    ) : (
                      <Trash2 size={16} color="var(--accent-0)" />
                    )}
                    {t("Are you sure?")}
                  </>
                }
                disabled={isUpdating}
                title={t("Disable")}
                className="small transparent"
                onConfirm={async () => {
                  if (!token) return
                  setIsUpdating(true)
                  try {
                    if (user) {
                      const updatedUser = await updateUser({
                        token,
                        characterProfilesEnabled: !characterProfilesEnabled,
                      })

                      setUser(updatedUser)
                    }

                    if (guest) {
                      const updatedGuest = await actions.updateGuest({
                        characterProfilesEnabled: !characterProfilesEnabled,
                      })

                      setGuest(updatedGuest)
                    }
                  } catch (error) {
                    console.error("Error updating guest:", error)
                  } finally {
                    setIsUpdating(false)
                  }
                }}
              >
                <CircleX size={18} color="var(--accent-0)" />
                {t("Disable")}
              </ConfirmButton>
            ) : (
              <>
                <A
                  target="_blank"
                  className="button small"
                  openInNewTab
                  href="/privacy"
                >
                  <Link size={15} />
                  {t("Privacy")}
                </A>
                <Button
                  data-testid={"enable-character-profiles"}
                  className="small transparent"
                  disabled={isUpdating}
                  onClick={async () => {
                    if (!token) return
                    try {
                      setIsUpdating(true)

                      if (user) {
                        const updatedUser = await updateUser({
                          token,
                          characterProfilesEnabled: true,
                        })

                        setUser(updatedUser)
                      }

                      if (guest) {
                        const updatedGuest = await actions.updateGuest({
                          characterProfilesEnabled: true,
                        })

                        setGuest(updatedGuest)
                      }

                      setIsModalOpen(false)
                      setShowCharacterProfiles(false)
                    } catch (error) {
                      console.error("Error updating guest:", error)
                    } finally {
                      setIsUpdating(false)
                    }
                  }}
                >
                  {isUpdating ? (
                    <Loading width={18} height={18} />
                  ) : (
                    <Sparkles
                      size={18}
                      color="var(--accent-1)"
                      fill="var(--accent-1)"
                    />
                  )}
                  {t("Enable")}
                </Button>
              </>
            )}
          </Div>
        </Modal>
      )}
    </Div>
  )
}
