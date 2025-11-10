"use client"

import React, { useEffect, useState } from "react"
import styles from "./CharacterProfiles.module.scss"
import Modal from "./Modal"
import { useAppContext } from "./context/AppContext"
import {
  useAuth,
  useChat,
  useData,
  useNavigationContext,
} from "./context/providers"
import { FRONTEND_URL } from "./utils"
import clsx from "clsx"
import { Unlock, CircleX, Share, Lock, Sparkles, PinOff, Pin } from "./icons"
import Loading from "./Loading"
import { characterProfile } from "./types"
import { getGuest, getUser, updateThread } from "./lib"

export default function CharacterProfile({
  onCharacterProfileUpdate,
  ...props
}: {
  showActions?: boolean
  characterProfile: characterProfile
  onCharacterProfileUpdate?: () => void
}) {
  const [characterProfile, setCharacterProfile] = useState(
    props.characterProfile,
  )

  const { actions } = useData()

  useEffect(() => {
    setCharacterProfile(props.characterProfile)
  }, [props.characterProfile])

  // Split contexts for better organization
  const { t } = useAppContext()

  // Auth context
  const { token, user, guest, setUser, setGuest, setShowCharacterProfiles } =
    useAuth()

  // Chat context
  const { thread, refetchThread } = useChat()

  const [showActions, setShowActions] = useState(props.showActions)

  const [isPinning, setIsPinning] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [isChangingVisibility, setIsChangingVisibility] = useState(false)
  const handlePin = async () => {
    if (!token) return
    setIsPinning(true)
    try {
      const response = await updateThread({
        id: characterProfile.threadId,
        pinCharacterProfile: !characterProfile.pinned,
        token,
      })
      setCharacterProfile({
        ...characterProfile,
        pinned: response?.pinCharacterProfile,
      })

      if (user) {
        const updatedUser = await actions.getUser()
        setUser(updatedUser)
      }
      if (guest) {
        const updatedGuest = await actions.getGuest()
        setGuest(updatedGuest)
      }

      thread?.characterProfile?.id === characterProfile.id &&
        (await refetchThread())
    } catch (error) {
      console.error("Error pinning thread:", error)
    } finally {
      setIsPinning(false)
      onCharacterProfileUpdate?.()
    }
  }

  const handleShare = async () => {
    if (!token) return
    setIsChangingVisibility(true)
    try {
      const response = await updateThread({
        id: characterProfile?.threadId,
        characterProfileVisibility:
          characterProfile?.visibility === "public" ? "private" : "public",
        pinCharacterProfile: characterProfile?.pinned,
        token,
      })

      const newCharacterProfile = {
        ...characterProfile,
        visibility: response?.characterProfileVisibility,
        pinned: response?.pinCharacterProfile,
      }
      thread?.characterProfile?.id === characterProfile.id &&
        (await refetchThread())

      setCharacterProfile(newCharacterProfile)
    } catch (error) {
      console.error("Error pinning thread:", error)
    } finally {
      setIsChangingVisibility(false)
      onCharacterProfileUpdate?.()
    }
  }
  return (
    <div className={styles.characterProfileContainer}>
      <div
        key={characterProfile.id}
        className={styles.characterProfileContainer}
      >
        <div className={styles.characterProfileActions}>
          {characterProfile.pinned && showActions && (
            <button
              title={t("Share")}
              onClick={() => setIsSharing(!isSharing)}
              className={clsx("small link")}
            >
              {characterProfile.visibility === "public" && !isSharing ? (
                <Unlock size={16} color="var(--accent-6)" />
              ) : isSharing ? (
                <CircleX size={16} color="var(--accent-6)" />
              ) : (
                <Share size={16} color="var(--accent-6)" />
              )}
            </button>
          )}
          {isSharing ? (
            <button
              className={clsx(
                characterProfile.visibility === "public"
                  ? "transparent"
                  : "inverted",
              )}
              onClick={() => handleShare()}
              disabled={isChangingVisibility}
            >
              <>
                {isChangingVisibility ? (
                  <Loading color="var(--accent-1)" width={14} height={14} />
                ) : characterProfile.visibility === "public" ? (
                  <Lock size={16} />
                ) : (
                  <Unlock size={16} />
                )}
                {t(
                  characterProfile.visibility === "public"
                    ? "Make it private"
                    : "Make it public",
                )}
              </>
            </button>
          ) : (
            <button
              onClick={() => {
                if (props.showActions) {
                  setShowCharacterProfiles(true)
                  return
                }
                setShowActions(!showActions)
              }}
              className="inverted inverted"
            >
              <Sparkles
                size={16}
                color="var(--accent-1)"
                fill="var(--accent-1)"
              />
              {characterProfile.name}
            </button>
          )}
          {showActions && (
            <button
              disabled={isPinning}
              onClick={() => handlePin()}
              className="small link"
              title={characterProfile.pinned ? t("Unpin") : t("Pin")}
            >
              {isPinning ? (
                <Loading color="var(--accent-1)" width={14} height={14} />
              ) : characterProfile.pinned ? (
                <PinOff
                  size={16}
                  color="var(--accent-1)"
                  fill="var(--accent-1)"
                />
              ) : (
                <Pin size={16} color="var(--accent-1)" fill="var(--accent-1)" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
