"use client"
import React, { useEffect, useState } from "react"
import styles from "./Account.module.scss"
import clsx from "clsx"
import {
  UserRound,
  LogOut,
  AtSign,
  Trash2,
  CircleUserRound,
  Pencil,
} from "./icons"
import { CircleX } from "./icons"

import { FaGoogle, FaApple } from "react-icons/fa"
import {
  apiFetch,
  // API_URL,
  BrowserInstance,
  checkIsExtension,
  isValidUsername,
} from "./utils"
import { validate } from "uuid"
import ConfirmButton from "./ConfirmButton"
import toast from "react-hot-toast"
import Loading from "./Loading"
import Modal from "./Modal"

import { useRouter, useSearchParams } from "./hooks/useWindowHistory"
import { useAppContext } from "./context/AppContext"
import {
  useAuth,
  useNavigationContext,
  useError,
  useData,
} from "./context/providers"
import { useTheme } from "./platform"
import { getUser, removeUser, uploadUserImage } from "./lib"
import Img from "./Img"
import CharacterProfiles from "./CharacterProfiles"
import Checkbox from "./Checkbox"
export default function Account({ className }: { className?: string }) {
  const { push } = useRouter()

  // Split contexts for better organization
  const { t } = useAppContext()

  // Auth context
  const {
    user,
    signOut,
    setUser,
    token,
    signInContext,
    signOutContext,
    isExtensionRedirect,
    FRONTEND_URL,
    API_URL,
  } = useAuth()

  // Navigation context
  const { isAccountVisible: isModalOpen, setIsAccountVisible: setIsModalOpen } =
    useNavigationContext()

  // Error context
  const { captureException } = useError()

  // Theme context
  const { addHapticFeedback } = useTheme()

  const { setEnv, env, actions } = useData()

  // Get searchParams from useSearchParams hook
  const searchParams = useSearchParams()
  const innerRef = React.useRef<HTMLDivElement>(null)
  const isExtension = checkIsExtension()
  const isAppleAvailable = false && isExtension
  const isOAuthAccountNotLinkedError =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("error") ===
      "OAuthAccountNotLinked"

  const [userName, setUserName] = React.useState<string>("")
  const [isDeleting, setIsDeleting] = useState(false)

  const [isUserNameNotSet, setIsUserNameNotSet] = React.useState<boolean>(false)

  useEffect(() => {
    if (user?.userName) {
      validate(user.userName)
        ? (() => {
            setIsModalOpen(true)
            setIsUserNameNotSet(false)
          })()
        : setUserName(user.userName)
    } else {
      setIsModalOpen(true)
      setIsUserNameNotSet(true)
    }
  }, [user])

  const isLoggingOut = searchParams.get("logout") === "true" || undefined
  const [isSaving, setIsSaving] = useState(false)

  const handleUsernameSubmit = async () => {
    addHapticFeedback()
    if (!user?.id) {
      toast.error("User not found")
      return
    }
    setIsSaving(true)

    const value = userName

    if (!value || !isValidUsername(value)) {
      if (value.length > 10) {
        toast.error(t("Oops, 20 characters max please") + " 😅")
      } else {
        toast.error(t("Need 3-20 letters and numbers only") + " 😅")
      }

      setIsSaving(false)
      return
    }

    try {
      const response = await apiFetch(`${API_URL}/user`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userName: value }),
      })
      const data = await response.json()

      if (!response.ok || data.error) {
        toast.error(data.error || t("Error updating username"))
      }

      if (response.ok) {
        setUser({
          ...user,
          userName: value,
        })

        setIsModalOpen(false)
        toast.success(t("You are all set"))
      }
    } catch (error) {
      console.error(new Error("Error updating username:"), error)
      captureException(error)
      toast.error(t("Error updating username"))
    } finally {
      setIsSaving(false)
    }
  }
  useEffect(() => {
    if (isLoggingOut) {
      setTimeout(() => {
        handleLogout()
      }, 2000)
    }
  }, [isLoggingOut])

  const handleLogout = async () => {
    addHapticFeedback()
    if (isExtension) {
      await signOut()
      BrowserInstance?.runtime?.sendMessage({
        action: "openInSameTab",
        url: `${FRONTEND_URL}?account=true&logout=true&extension=true`,
      })
    }

    await signOut()
    // setIsModalOpen(false)
    !isExtension &&
      signOutContext?.({
        callbackUrl: `${FRONTEND_URL}/?loggedOut=true${isExtensionRedirect ? "&extension=true" : ""}`,
      })

    const searchParams = new URLSearchParams(window.location.search)
    searchParams.delete("account")
    const newUrl = searchParams.toString()
      ? `?${searchParams.toString()}`
      : window.location.pathname

    push(newUrl)
  }

  const [isUploading, setIsUploading] = useState(false)

  const triggerFileInput = () => {
    addHapticFeedback()

    // Reset the input by changing its key (forces re-render)
    setInputKey((prev) => prev + 1)

    // Small delay to ensure the input is re-rendered before clicking
    setTimeout(() => {
      fileInputRef.current?.click()
    }, 10)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!token) return
    const target = e.target as HTMLInputElement
    if (!target.files || !target.files[0]) return

    const file = target.files[0]

    // Add validation
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast.error("Image must be less than 5MB")
      return
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, and WebP images are allowed")
      return
    }

    setIsUploading(true)

    try {
      const response = await uploadUserImage({
        token,
        file: target.files[0],
      })
      if (response.error) {
        toast.error(response.error)
      } else {
        const updatedUser = await actions.getUser()
        setUser(updatedUser)
      }
    } catch (error) {
      toast.error("Error uploading image")
    } finally {
      setIsUploading(false)
    }
  }

  const [inputKey, setInputKey] = React.useState(0) // Force re-render
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  return (
    <>
      <button
        data-testid="account-button"
        className={clsx(styles.accountButton, className)}
        onClick={() => {
          addHapticFeedback()
          setIsModalOpen(true)
        }}
      >
        <UserRound size={16} />
        {t("Account")}
      </button>
      <Modal
        params="?account=true"
        hideOnClickOutside={false}
        hasCloseButton
        icon={"🎉"}
        onToggle={(open) => setIsModalOpen(open)}
        title={
          <>
            {t("Welcome")} {user?.name?.split(" ")[0]}!
          </>
        }
        isModalOpen={isModalOpen}
      >
        <div className={styles.accountContainer}>
          <div>
            {!user ? (
              <Loading />
            ) : (
              <div>
                <div className={styles.email}>
                  <div className={styles.userImageContainer}>
                    <input
                      key={inputKey}
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleFileChange}
                    />
                    <button
                      disabled={isUploading}
                      title={t("Edit Image")}
                      aria-label={t("Edit Image")}
                      onClick={() => triggerFileInput()}
                      className={clsx("link", styles.userImageWrapper)}
                    >
                      {user?.image ? (
                        <Img
                          className={styles.userImage}
                          src={user.image}
                          width={50}
                          height={50}
                          alt={user.name || ""}
                        />
                      ) : (
                        <Img
                          showLoading={false}
                          src={`${FRONTEND_URL}/images/pacman/space-invader.png`}
                          alt="Space Invader"
                          width={40}
                          height={40}
                        />
                      )}

                      <span
                        className={clsx(
                          "button transparent",
                          styles.editImageButton,
                        )}
                      >
                        {isUploading ? (
                          <Loading width={12} height={12} />
                        ) : (
                          <Pencil size={12} />
                        )}
                      </span>
                    </button>

                    {user.image && (
                      <button
                        title={t("Remove Image")}
                        className="link"
                        onClick={async () => {
                          if (!token) return
                          try {
                            setIsUploading(true)
                            const response = await uploadUserImage({
                              token,
                              file: null,
                            })
                            if (response.error) {
                              toast.error(response.error)
                            } else {
                              const updatedUser = await actions.getUser()
                              setUser(updatedUser)
                            }
                          } catch (error) {
                            toast.error("Error removing image")
                          } finally {
                            setIsUploading(false)
                          }
                        }}
                      >
                        <CircleX size={16} />
                      </button>
                    )}
                  </div>
                  {user?.email} <CharacterProfiles />
                </div>
                <div className={styles.userNameContainer}>
                  <AtSign size={24} />
                  <input
                    onChange={(e) => setUserName(e.target.value)}
                    className={styles.userName}
                    value={userName}
                    placeholder={t("Let's set a username")}
                    type="text"
                  />
                  <button onClick={handleUsernameSubmit} disabled={isSaving}>
                    {isSaving ? <Loading width={20} height={20} /> : t("Save")}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div data-testid="account-email" className={styles.deleteAccount}>
            {!isExtension && (
              <ConfirmButton
                className={clsx(styles.deleteAccountButton, "transparent")}
                confirm={
                  <>
                    <Trash2 size={16} /> {t("Are you sure?")}
                  </>
                }
                onConfirm={async () => {
                  if (!token) return

                  setIsDeleting(true)
                  try {
                    // Finally delete the user account
                    await actions.removeUser()

                    setIsModalOpen(false)
                  } catch (error) {
                    captureException(error)
                    console.error("Error during account deletion:", error)
                    toast.error(t("Failed to delete account"))
                  } finally {
                    signOut()
                    setIsDeleting(false)
                  }
                }}
              >
                {isDeleting ? (
                  <Loading width={16} height={16} color={"var(--accent-0)"} />
                ) : (
                  <Trash2 size={16} color={"var(--accent-0)"} />
                )}{" "}
                {t("Delete account")}
              </ConfirmButton>
            )}
          </div>

          <div className={styles.accounts}>
            {user?.isLinkedToGoogle ? (
              <div className={styles.accountLinked}>
                <FaGoogle /> {t("Google account linked")}
              </div>
            ) : (
              <>
                {isOAuthAccountNotLinkedError && (
                  <div className={styles.accountLinkError}>
                    {t("Failed to link Google account, please try again")}
                  </div>
                )}
                <button
                  className={clsx(styles.linkAccount, "inverted")}
                  onClick={() => {
                    addHapticFeedback()
                    signInContext?.("google", {
                      callbackUrl: window.location.href,
                      errorUrl: `${window.location.origin}/account?googleLinkError=true`,
                    })
                  }}
                >
                  <FaGoogle /> {t("Link Google account")}
                </button>
              </>
            )}
            {isExtension ? null : user?.isLinkedToApple ? (
              <div className={styles.accountLinked}>
                <FaApple /> {t("Apple account linked")}
              </div>
            ) : isAppleAvailable ? (
              <>
                {isOAuthAccountNotLinkedError && (
                  <div className={styles.accountLinkError}>
                    {t("Failed to link Apple account, please try again")}
                  </div>
                )}
                <button
                  className={styles.linkAccount}
                  onClick={() =>
                    signInContext?.("apple", {
                      callbackUrl: window.location.href,
                      errorUrl: `${window.location.origin}/account?googleLinkError=true`,
                    })
                  }
                >
                  <FaApple style={{ position: "relative", bottom: 1 }} />{" "}
                  {t("Link Apple account")}
                </button>
              </>
            ) : null}
          </div>

          <div className={styles.actions}>
            {user?.role === "admin" && (
              <Checkbox
                checked={env === "production"}
                onChange={(e) => {
                  const newEnv = e.target.checked ? "production" : "development"
                  setEnv(newEnv)
                  toast.success(
                    `Switched to ${newEnv === "production" ? "Production" : "Development"} environment`,
                  )
                }}
              >
                {t("Prod")}
              </Checkbox>
            )}
            <button
              data-testid="account-logout-button"
              className={clsx(styles.logoutButton, "link")}
              onClick={handleLogout}
            >
              {isLoggingOut ? (
                <Loading width={18} height={18} />
              ) : (
                <>
                  <LogOut size={16} />
                </>
              )}
              {t("Logout")}
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
