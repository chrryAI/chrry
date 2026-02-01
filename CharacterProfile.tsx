"use client"

import React, { useEffect, useState, CSSProperties } from "react"
import { useAppContext } from "./context/AppContext"
import { useAuth, useChat, useData } from "./context/providers"
import { Unlock, CircleX, Share, Lock, Sparkles, PinOff, Pin } from "./icons"
import Loading from "./Loading"
import { characterProfile } from "./types"
import { updateThread } from "./lib"
import { useCharacterProfilesStyles } from "./CharacterProfiles.styles"
import { Button, Div } from "./platform"

export default function CharacterProfile({
  onCharacterProfileUpdate,
  style,
  ...props
}: {
  showActions?: boolean
  characterProfile: characterProfile
  onCharacterProfileUpdate?: () => void
  style?: CSSProperties
}) {
  const [characterProfile, setCharacterProfile] = useState(
    props.characterProfile,
  )

  const styles = useCharacterProfilesStyles()

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
    <Div
      data-testid="character-profile"
      data-cp={characterProfile.name}
      key={characterProfile.id}
      style={{ ...styles.characterProfilesActions.style, ...style }}
    >
      {characterProfile.pinned && showActions && (
        <Button
          title={t("Share")}
          onClick={() => setIsSharing(!isSharing)}
          className="small link"
        >
          {characterProfile.visibility === "public" && !isSharing ? (
            <Unlock size={16} color="var(--accent-6)" />
          ) : isSharing ? (
            <CircleX size={16} color="var(--accent-6)" />
          ) : (
            <Share size={16} color="var(--accent-6)" />
          )}
        </Button>
      )}
      {isSharing ? (
        <Button
          className={
            characterProfile.visibility === "public"
              ? "transparent"
              : "inverted"
          }
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
        </Button>
      ) : (
        <Button
          onClick={() => {
            if (props.showActions) {
              setShowCharacterProfiles(true)
              return
            }
            setShowActions(!showActions)
          }}
          className="inverted inverted"
        >
          <Sparkles size={16} color="var(--accent-1)" fill="var(--accent-1)" />
          {characterProfile.name}
        </Button>
      )}
      {showActions && (
        <Button
          disabled={isPinning}
          onClick={() => handlePin()}
          className="small link"
          title={characterProfile.pinned ? t("Unpin") : t("Pin")}
        >
          {isPinning ? (
            <Loading color="var(--accent-1)" width={14} height={14} />
          ) : characterProfile.pinned ? (
            <PinOff size={16} color="var(--accent-1)" fill="var(--accent-1)" />
          ) : (
            <Pin size={16} color="var(--accent-1)" fill="var(--accent-1)" />
          )}
        </Button>
      )}
    </Div>
  )
}
