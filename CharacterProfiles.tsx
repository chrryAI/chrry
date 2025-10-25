"use client"

import React, { useEffect, useState } from "react"
import styles from "./CharacterProfiles.module.scss"
import Modal from "./Modal"
import { useAppContext } from "./context/AppContext"
import { useAuth, useData } from "./context/providers"
import { useTheme } from "./platform"
import {
  BrowserInstance,
  checkIsExtension,
  FRONTEND_URL,
  isOwner,
} from "./utils"
import { CircleX, Link, Sparkles, Trash2 } from "./icons"
import CharacterProfile from "./CharacterProfile"
import ConfirmButton from "./ConfirmButton"
import { updateGuest, updateUser } from "./lib"
import Loading from "./Loading"
import clsx from "clsx"

export default function CharacterProfiles() {
  // Split contexts for better organization
  const { t } = useAppContext()

  // Auth context
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
  } = useAuth()

  // Theme context
  const { addHapticFeedback } = useTheme()

  const { actions } = useData()

  const [isUpdating, setIsUpdating] = useState(false)

  const [isModalOpen, setIsModalOpen] = useState(showCharacterProfiles)

  useEffect(() => {
    showCharacterProfiles && setIsModalOpen(showCharacterProfiles)
  }, [showCharacterProfiles])

  return (
    <div className={styles.characterProfileContainer}>
      <button
        title={t("Character Profile")}
        className={clsx("link", styles.characterProfileButton)}
        onClick={() => setIsModalOpen(true)}
      >
        <Sparkles size={20} color="var(--accent-1)" fill="var(--accent-1)" />
      </button>
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
        >
          <div className={styles.characterProfilesContainer}>
            {characterProfiles?.length && characterProfilesEnabled ? (
              characterProfiles?.map((characterProfile) => (
                <CharacterProfile
                  key={characterProfile.id}
                  characterProfile={characterProfile}
                />
              ))
            ) : !characterProfilesEnabled ? (
              <>
                <div>
                  {t(
                    "Enable character profiling in your conversations to start building your collection of AI-generated personality insights.",
                  )}
                </div>
                {!user && (
                  <div>
                    {t("By using this feature, you accept our privacy policy.")}
                  </div>
                )}
              </>
            ) : (
              t("Pin character profiles from conversations to see them here")
            )}
          </div>
          <div className={styles.characterProfilesActions}>
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
                <a
                  target="_blank"
                  className="button small"
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
                <button
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
                </button>
              </>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}
