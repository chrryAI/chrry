import React, { useCallback, useEffect, useState } from "react"

import { usePlatform, useTheme } from "./platform"
import clsx from "clsx"
import styles from "./App.module.scss"
import EnableNotifications from "./EnableNotifications"
import Logo from "./Image"
import Img from "./Image"
import Instructions from "./Instructions"
import {
  ArrowRight,
  CircleCheck,
  CircleMinus,
  Grip,
  Info,
  Pencil,
  Settings2,
  Trash2,
} from "./icons"
import toast from "react-hot-toast"
import Loading from "./Loading"
import ConfirmButton from "./ConfirmButton"
import { useHasHydrated } from "./hooks"
import { DraggableAppList } from "./DraggableAppList"
import { DraggableAppItem } from "./DraggableAppItem"
import { useAppReorder } from "./hooks/useAppReorder"
import { Div, H1, Button, Label, Span, Input } from "./platform"
import A from "./A"
import { apiFetch, FRONTEND_URL, isFirefox } from "./utils"

import { useStyles } from "./context/StylesContext"
import {
  useApp,
  useAuth,
  useChat,
  useData,
  useNavigationContext,
} from "./context/providers"
import { useAppContext } from "./context/AppContext"
import { useTimerContext } from "./context/TimerContext"

interface App {
  id: string
  name: string
  slug: string
  [key: string]: unknown
}

// Focus button with live clock when timer is idle
function FocusButton({ time }: { time: number }) {
  const { isExtension, isFirefox, isWeb } = usePlatform()
  const { app, focus, getAppSlug, setShowFocus } = useAuth()

  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    // Only update clock when timer is idle (time === 0)
    if (time === 0) {
      const interval = setInterval(() => {
        setCurrentTime(new Date())
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [time])

  const formatTime = () => {
    if (time > 0) {
      // Show timer countdown
      return `${Math.floor(time / 60)}:${String(time % 60).padStart(2, "0")}`
    } else {
      // Show current time
      const hours = currentTime.getHours()
      const minutes = currentTime.getMinutes()
      return `${hours}:${String(minutes).padStart(2, "0")}`
    }
  }

  if (!focus) {
    return null
  }

  return (
    <A
      onClick={() => setShowFocus(true)}
      href={`${getAppSlug(focus)}`}
      openInNewTab={isExtension && isFirefox}
      className={clsx("link", styles.focus)}
    >
      <span className={styles.focusTime}>{formatTime()}</span>
      <Img
        className={clsx("link", styles.focus)}
        containerClass={clsx("link", styles.focus)}
        logo="focus"
        width={22}
        height={22}
      />
    </A>
  )
}

export default function App({
  className,
  onSave,
}: {
  className?: string
  onSave?: ({
    content,
    artifacts,
  }: {
    content: string
    artifacts: File[]
  }) => void
}) {
  // Split contexts for better organization
  const { t } = useAppContext()

  const { time } = useTimerContext()

  // App context
  const {
    slug,
    app,
    appForm,
    appFormWatcher,
    suggestSaveApp,
    saveApp,
    canEditApp,
    isManagingApp,
    isSavingApp,
    isRemovingApp,
    removeApp,
    owningApps,
    setApp,
    appStatus,
    setAppStatus,
    baseApp,
    isAppOwner,
    storeApp,
  } = useApp()

  // Auth context
  const {
    user,
    guest,
    getAppSlug,
    store,
    apps,
    guestBaseApp,
    userBaseApp,
    zarathustra,
    token,
  } = useAuth()

  const { FRONTEND_URL, API_URL } = useData()

  // Navigation context (router is the wrapper)
  const { router, setIsNewChat, getStoreSlug } = useNavigationContext()

  // Input context
  const { setInput, setIsWebSearchEnabled } = useChat()

  // Theme context
  const { addHapticFeedback } = useTheme()
  const currentStoreId = store?.id

  const focus = apps.find((app) => app.slug === "focus")

  const chrry = apps.find((app) => app.slug === "chrry")
  const popcorn = apps.find((app) => app.slug === "popcorn")
  const vex = apps.find((app) => app.slug === "vex")
  const atlas = apps.find((app) => app.slug === "atlas")

  const getApps = () => {
    return apps
      .filter((item) => item.id !== store?.appId && item.id !== chrry?.id)
      .filter((item) => item.id !== focus?.id)
      .filter((item) =>
        (app?.id === chrry?.id || app?.id === focus?.id) &&
        ["atlas", "popcorn", "zarathustra"].includes(item.slug)
          ? false
          : true,
      )
      .filter((item) => item.id !== focus?.id)
      .sort((a, b) => {
        const aIsStoreBase =
          a.id === a.store?.appId && a.store?.id === currentStoreId
        const bIsStoreBase =
          b.id === b.store?.appId && b.store?.id === currentStoreId
        const aIsChrry = a.id === chrry?.id
        const bIsChrry = b.id === chrry?.id

        // Store base app always first
        if (aIsStoreBase) return -1
        if (bIsStoreBase) return 1

        // Chrry always second
        if (aIsChrry) return -1
        if (bIsChrry) return 1

        // Keep original order for the rest
        return 0
      })
      .map((item) => {
        if (item.id === vex?.id && app?.id === chrry?.id) {
          return userBaseApp || guestBaseApp || item
        }
        return item
      })
  }

  // Use apps from context - sort: store base app first, Chrry second, rest keep original order
  const [appsState, setApps] = React.useState(getApps())

  useEffect(() => {
    setApps(getApps())
  }, [apps, store?.id, store?.appId, currentStoreId, baseApp, app])

  const [file, setFile] = React.useState<File | undefined>()

  const [image, setImageInternal] = React.useState<string | undefined>(
    app?.image || undefined,
  )
  const setImage = (image?: string) => {
    setImageInternal(image)
    setFile(undefined)
  }

  const hasHydrated = useHasHydrated()

  const reorder = useAppReorder({
    apps: appsState,
    setApps,
    autoInstall: false,
    storeId: store?.id,
  })

  const [imageDimensionWarning, setImageDimensionWarning] = React.useState<
    string | null
  >(null)

  useEffect(() => {
    if (app?.image) {
      setImage(app.image)
    } else if (app === null) {
      setImage(undefined)
      setFile(undefined)
      setImageDimensionWarning(null)
    }
  }, [app, app?.image])

  const { isExtension, isFirefox, isWeb } = usePlatform()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement
    if (!target.files || !target.files[0]) return

    const originalFile = target.files[0]

    // Load image to check dimensions
    const img = new Image()
    const objectUrl = URL.createObjectURL(originalFile)

    img.onload = async () => {
      URL.revokeObjectURL(objectUrl)

      const { width, height } = img
      const targetSize = 500

      // If image is smaller than 500x500, show warning
      if (width < targetSize || height < targetSize) {
        setImageDimensionWarning(
          t("Min 500x500px.", {
            width,
            height,
          }),
        )
      } else {
        setImageDimensionWarning(null)
      }

      // Create cropped preview (500x500, center crop with cover fit)
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        setFile(originalFile)
        // setImage(URL.createObjectURL(originalFile))
        return
      }

      // Set canvas to target size
      canvas.width = targetSize
      canvas.height = targetSize

      // Calculate crop dimensions (cover fit - fill the square, crop excess)
      const scale = Math.max(targetSize / width, targetSize / height)
      const scaledWidth = width * scale
      const scaledHeight = height * scale

      // Center the image
      const x = (targetSize - scaledWidth) / 2
      const y = (targetSize - scaledHeight) / 2

      // Draw cropped image
      ctx.drawImage(img, x, y, scaledWidth, scaledHeight)

      // Convert to blob for preview
      canvas.toBlob(async (blob) => {
        if (blob) {
          const croppedFile = new File([blob], originalFile.name, {
            type: originalFile.type,
            lastModified: Date.now(),
          })
          setFile(croppedFile)
          setImage(URL.createObjectURL(croppedFile))

          // Upload image immediately in background
          setIsUploading(true)
          try {
            const formData = new FormData()
            formData.append("file", croppedFile)

            // If we have a draft ID, include it
            const draftId = appFormWatcher?.id
            if (draftId) {
              formData.append("draftId", draftId)
            }

            const response = await apiFetch(`${API_URL}/image`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              method: "POST",
              body: formData,
            })

            if (!response.ok) {
              toast.error("Failed to upload image")
              return
            }

            const data = await response.json()
            console.log("✅ Image uploaded:", data.url)

            appForm?.setValue("image", data.url)
            app && setApp({ ...app, image: data.url })
            setImage(data.url)
          } catch (error) {
            console.error("❌ Failed to upload image:", error)
          } finally {
            setIsUploading(false)
          }
        }
      }, originalFile.type)
    }

    img.src = objectUrl
  }
  const [isUploading, setIsUploading] = useState(false)

  const hasErrors = Object.keys(appForm?.formState.errors || {}).length > 0

  const [inputKey, setInputKey] = React.useState(0) // Force re-render
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  useEffect(() => {
    ;(appStatus?.part === "highlights" || appStatus?.part === "title") &&
      !canAddName &&
      setAppStatus(undefined)
  }, [appStatus, appFormWatcher])

  const triggerFileInput = () => {
    addHapticFeedback()

    // Reset the input by changing its key (forces re-render)
    setInputKey((prev) => prev + 1)

    // Small delay to ensure the input is re-rendered before clicking
    setTimeout(() => {
      fileInputRef.current?.click()
    }, 10)
  }

  const StoreApp = useCallback(
    () =>
      storeApp && (
        <A
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
          }}
          href={getAppSlug(storeApp)}
          className={clsx("button transparent small")}
          onClick={(e) => {
            // if (isWeb) {
            //   setTimeout(() => {
            //     router.replace("/")
            //   }, 200)
            //   return
            // }

            e.preventDefault()

            setIsNewChat(true, getAppSlug(storeApp))
            addHapticFeedback()
            setAppStatus(undefined)
            if (e.metaKey || e.ctrlKey) {
              return
            }
          }}
        >
          <Img app={storeApp} showLoading={false} size={24} />
          <span>{storeApp?.name}</span>
        </A>
      ),
    [t, app, user, guest],
  )

  const canAddName = appFormWatcher?.canSubmit

  const canAddTitle = isManagingApp

  const { appStyles, utilities } = useStyles()

  if (!hasHydrated && (isManagingApp || appFormWatcher?.canSubmit)) {
    return <Loading fullScreen />
  }

  return (
    <Div>
      <H1 style={appStyles.title.style}>
        {!isManagingApp && !canEditApp && app ? (
          <Div
            style={appStyles.appTitle.style}
            className={appStyles.appTitle.className}
          >
            <Logo
              app={app}
              logo={app?.slug === "vex" ? "isVivid" : undefined}
              showLoading={false}
              size={35}
            />
            {t(app?.title || appFormWatcher?.title || ("" as string))}
          </Div>
        ) : (
          <Div
            style={
              isManagingApp
                ? appStyles.titleFormContainer.style
                : appStyles.titleFormTitle.style
            }
          >
            {appFormWatcher?.canSubmit && isManagingApp && (
              <Div style={utilities.row.style}>
                <ConfirmButton
                  className="small transparent"
                  confirm={
                    <>
                      {isRemovingApp ? (
                        <Loading size={18} />
                      ) : (
                        <Trash2 color="var(--accent-0)" size={18} />
                      )}
                      {t("Delete")}
                    </>
                  }
                  disabled={isSavingApp || isRemovingApp}
                  onConfirm={async () => {
                    await removeApp()
                  }}
                >
                  <Trash2 color="var(--accent-0)" size={18} />
                </ConfirmButton>
                <Button
                  onClick={async () => {
                    await saveApp()
                  }}
                  className="small inverted"
                  disabled={!appFormWatcher.canSubmit || isSavingApp}
                >
                  {isSavingApp ? (
                    <Loading size={18} />
                  ) : (
                    <CircleCheck color="var(--accent-4)" size={18} />
                  )}
                  {t("Save")}
                </Button>
              </Div>
            )}
            {isManagingApp && (
              <Div
                style={appStyles.validationFeedback}
                className={appStyles.validationFeedback.className}
              >
                {/* Show validation errors (except title) */}

                {/* Image dimension warning/recommendation */}
                <Div
                  style={{
                    ...appStyles.validationFeedback.style,
                    ...utilities.row.style,
                  }}
                >
                  {appForm?.formState.errors.description ? (
                    <Div>
                      ❌{" "}
                      {t(
                        appForm.formState.errors.description.message as string,
                      )}
                    </Div>
                  ) : null}
                  {appForm?.formState.errors.placeholder ? (
                    <Div>
                      ❌{" "}
                      {t(
                        appForm.formState.errors.placeholder.message as string,
                      )}
                    </Div>
                  ) : null}
                  {!hasErrors && imageDimensionWarning ? (
                    <>⚠️ {imageDimensionWarning}</>
                  ) : (
                    !hasErrors && <>💭 {t("500x500px .png recommended")}</>
                  )}
                </Div>
              </Div>
            )}
            {isManagingApp ? (
              <div className={styles.titleForm}>
                <div className={styles.appImageContainer}>
                  {image && (
                    <Button
                      onClick={() => {
                        setImage(undefined)
                        setFile(undefined)
                      }}
                      title={t("Remove")}
                      aria-label={t("Remove")}
                      style={{
                        ...utilities.link.style,
                        ...appStyles.removeImageButton.style,
                      }}
                      className={clsx(
                        utilities.link.className,
                        appStyles.removeImageButton.className,
                      )}
                    >
                      <CircleMinus color="var(--accent-1)" size={14} />
                    </Button>
                  )}
                  <Button
                    disabled={isUploading}
                    title={t("Edit")}
                    aria-label={t("Edit")}
                    onClick={() => triggerFileInput()}
                    style={{
                      ...appStyles.appImageWrapper.style,
                      ...utilities.link.style,
                    }}
                    className={clsx(
                      appStyles.appImageWrapper.className,
                      utilities.link.className,
                    )}
                  >
                    <Img
                      src={image}
                      showLoading={false}
                      icon="spaceInvader"
                      app={app}
                      alt="Space Invader"
                      title={t("Space Invader")}
                      className={styles.appImage}
                      size={50}
                      style={{
                        position: "relative",
                        bottom: "0.4rem",
                      }}
                    />
                    <Span
                      style={{
                        ...utilities.button.style,
                        ...utilities.transparent.style,
                        ...utilities.small.style,
                        ...appStyles.editImageButton.style,
                        padding: "0.25rem",
                      }}
                    >
                      {isUploading ? (
                        <Loading width={12} height={12} />
                      ) : (
                        <Pencil size={12} />
                      )}
                    </Span>
                  </Button>
                </div>
                <label htmlFor="title">
                  <div className={styles.nameWithTip}>
                    <input
                      {...appForm?.register("title")}
                      title={t("Title")}
                      id="title"
                      className={styles.titleInput}
                      type="text"
                      placeholder={t("Title")}
                    />
                  </div>
                </label>
                {isManagingApp &&
                  appStatus?.part !== "name" &&
                  appStatus?.part !== "highlights" && (
                    <button
                      disabled={!canAddTitle}
                      onClick={() => {
                        if (canAddTitle) {
                          setAppStatus({
                            step: canEditApp ? "update" : "add",
                            part: appFormWatcher.name ? "highlights" : "name",
                          })
                        }
                      }}
                      className={clsx(
                        "small",
                        styles.continueButton,
                        canAddTitle ? "" : "transparent",
                      )}
                      title={t("Continue")}
                    >
                      <ArrowRight />
                    </button>
                  )}
              </div>
            ) : appFormWatcher && appFormWatcher.canSubmit ? (
              <div className={styles.titleFormTitle}>
                <Logo app={app} showLoading={false} logo="isVivid" size={35} />
                {t(appFormWatcher?.title || "Your personal AI agent")}
              </div>
            ) : (
              <div className={styles.titleFormTitle}>
                <Logo
                  app={app}
                  logo="isMagenta"
                  showLoading={false}
                  size={35}
                />
                {t("Your personal AI agent")}
              </div>
            )}

            <input
              key={inputKey}
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </Div>
        )}
      </H1>

      <Div style={{ ...appStyles.container.style }}>
        <>
          <Div style={{ ...appStyles.section.style }}>
            <EnableNotifications
              onLocationClick={(location) => {
                setInput(`What's the weather in ${location}?`)
                setIsWebSearchEnabled(true)
              }}
            />
          </Div>
          <Div style={{ ...appStyles.section.style }}>
            {appStatus?.part ? null : (
              <Button
                style={{
                  ...utilities.link,
                  gap: "0.5rem",
                  fontSize: "0.7rem",
                  position: "relative",
                }}
                key={suggestSaveApp ? "highlights" : "settings"}
                onClick={() => {
                  if (user?.role !== "admin") {
                    if (user && owningApps.length >= 3) {
                      toast.error(
                        t("Users can have 3 agents, contact for more"),
                      )
                      return
                    }
                    if (guest && owningApps.length >= 2) {
                      toast.error(t("Guests can have 2 agent, login for more"))
                      return
                    }
                  }

                  setAppStatus({
                    part: "settings",
                    step: canEditApp ? "update" : "add",
                  })
                }}
                title={t(isManagingApp ? "Cancel" : "Add agent")}
              >
                <span
                  style={{
                    position: "absolute",
                    bottom: "0.15rem",
                    right: "-0.50rem",
                  }}
                >
                  🤯
                </span>
                <Img
                  showLoading={false}
                  alt="Plus"
                  width={24}
                  height={24}
                  icon="plus"
                />
              </Button>
            )}
            {appStatus?.part === "name" ? (
              <Div style={appStyles.agentNameForm.style}>
                <Div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginTop: appStatus?.part === "name" ? "1.25rem" : "0",
                  }}
                >
                  <Label
                    htmlFor="agentName"
                    style={{
                      ...appStyles.nameField.style,
                      paddingInline: "0.5rem",
                      ...(appForm?.formState.errors.name?.message
                        ? appStyles.error.style
                        : {}),
                    }}
                  >
                    <Img
                      style={{
                        marginLeft: "auto",
                      }}
                      showLoading={false}
                      icon="spaceInvader"
                      alt="Space Invader"
                      title={t("Space Invader")}
                      width={24}
                      height={24}
                    />
                    <Div style={{ position: "relative" }}>
                      <Div
                        style={{
                          ...appStyles.info.style,
                          ...(appForm?.formState.errors.name?.message &&
                            appStyles.error),
                          display: "inline",
                        }}
                      >
                        {appForm?.formState.errors.name?.message ? (
                          <Span style={appStyles.field.style}>
                            {t(appForm?.formState.errors.name.message)}
                          </Span>
                        ) : (
                          <Span style={appStyles.field.style}>
                            {t("Keep it short!")}
                          </Span>
                        )}
                      </Div>
                      <Input
                        {...appForm?.register("name")}
                        title={t("Name")}
                        id="agentName"
                        style={appStyles.nameInput.style}
                        type="text"
                        placeholder={t("Name")}
                      />
                    </Div>
                    <Span
                      title={t(
                        "This will the name your app, keep it short around 5-10 characters",
                      )}
                      style={appStyles.infoIcon.style}
                    >
                      <Info color="var(--background)" size={24} />
                    </Span>
                  </Label>

                  <Button
                    disabled={!canAddName}
                    onClick={() => {
                      if (canAddName) {
                        setAppStatus({
                          step: canEditApp ? "update" : "add",
                          part: "highlights",
                        })
                      }
                    }}
                    style={{
                      ...utilities.link,
                      ...utilities.small,
                      ...(canAddName ? {} : utilities.transparent),
                    }}
                    title={t("Continue")}
                  >
                    <ArrowRight />
                  </Button>
                </Div>
              </Div>
            ) : isManagingApp ? (
              <Div style={appStyles.nameImage.style}>
                <Button
                  title={t("Edit")}
                  onClick={() => {
                    setAppStatus({
                      step: canEditApp ? "update" : "add",
                      part: "name",
                    })
                  }}
                  style={utilities.link}
                  className={utilities.link.className}
                >
                  <Settings2 />
                </Button>
                <A
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                  }}
                  title={t("Your AI-Powered Life")}
                  href={`${FRONTEND_URL}/lifeOS`}
                  className={clsx("button inverted small slideUp")}
                  onClick={(e) => {
                    e.preventDefault()
                    setAppStatus({
                      step: canEditApp ? "update" : "add",
                      part: "name",
                    })
                  }}
                >
                  <Img
                    showLoading={false}
                    icon="spaceInvader"
                    app={app}
                    size={24}
                  />
                  <Span>{appFormWatcher.name}</Span>
                </A>
                {isManagingApp && (
                  <Button
                    onClick={() => {
                      setAppStatus(undefined)
                    }}
                    className="link"
                    title={t(isManagingApp ? "Cancel" : "Add agent")}
                  >
                    <CircleMinus color="var(--accent-1)" size={24} />
                  </Button>
                )}
              </Div>
            ) : (
              store && (
                <a
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                  }}
                  title={t(store?.title || "Your AI-Powered Life")}
                  href={getStoreSlug(store?.slug)}
                  className={clsx("button inverted small slideUp")}
                  onClick={(e) => {
                    addHapticFeedback()

                    if (e.metaKey || e.ctrlKey) {
                      return
                    }
                    e.preventDefault()

                    router.push(getStoreSlug(store?.slug))
                  }}
                >
                  <Img
                    showLoading={false}
                    logo={app?.id === chrry?.id ? "blossom" : "lifeOS"}
                    store={store}
                    size={24}
                  />
                  <span>{store?.name}</span>
                </a>
              )
            )}
            {!isManagingApp && (
              <A
                href={`${FRONTEND_URL}/calendar`}
                title={t("Organize your life")}
                openInNewTab={isExtension && isFirefox}
                className={clsx("button transparent slideUp")}
              >
                <Img
                  showLoading={false}
                  icon="calendar"
                  width={18}
                  height={18}
                />
              </A>
            )}
            {hasHydrated && isAppOwner && !isManagingApp ? (
              <Button
                className={clsx(styles.grip, "link")}
                title={t("Edit")}
                onClick={() => {
                  setAppStatus({
                    step: "restore",
                    part: "name",
                  })
                }}
              >
                <Settings2 size={24} color="var(--accent-1)" />
              </Button>
            ) : app?.id === chrry?.id && focus ? (
              <FocusButton time={time} />
            ) : (
              hasHydrated &&
              !canEditApp &&
              !isManagingApp && (
                <span
                  className={clsx(styles.grip)}
                  title={t("Drag and drop to reorder apps")}
                >
                  <Grip size={24} color="var(--accent-1)" />
                </span>
              )
            )}
          </Div>
          {!isManagingApp && (
            <Div
              style={{
                ...appStyles.section.style,
                ...appStyles.appsGrid.style,
              }}
            >
              <DraggableAppList className={clsx(styles.apps)}>
                {appsState
                  .filter((item) => item.id !== popcorn?.id)
                  .slice(0, 5)
                  ?.map((item, index) => {
                    const showAtlasHere = index === 1 && app?.id === chrry?.id
                    const showFocusHere = focus && !showAtlasHere && index === 1

                    // Calculate positions for Pacman and Space Invader
                    // Show after base app (index 0) and Chrry (index 1)
                    const showPacmanHere = index === 2
                    const showSpaceInvaderHere = index === 3
                    const showZarathustraHere =
                      index === 0 && store?.appId !== zarathustra?.id

                    return (
                      <DraggableAppItem
                        key={item.id}
                        id={item.id}
                        index={index}
                        onMove={reorder.moveApp}
                        onDragStart={reorder.handleDragStart}
                        onDragEnd={reorder.handleDragEnd}
                        onDrop={reorder.handleDrop}
                        className={clsx(styles.appItem)}
                      >
                        <>
                          {index === 0 &&
                            chrry &&
                            storeApp?.id !== chrry.id && (
                              <A
                                href={getAppSlug(chrry)}
                                onClick={(e) => {
                                  if (isManagingApp) {
                                    e.preventDefault()
                                    return
                                  }

                                  if (e.metaKey || e.ctrlKey) {
                                    return
                                  }
                                  e.preventDefault()

                                  setIsNewChat(true, getAppSlug(chrry))
                                }}
                                className={clsx("link", styles.chrry)}
                              >
                                <Img
                                  className={clsx("link", styles.chrry)}
                                  containerClass={clsx("link", styles.chrry)}
                                  logo="chrry"
                                  alt="Chrry"
                                  title={"Chrry"}
                                  width={28}
                                  height={28}
                                />
                              </A>
                            )}

                          {showZarathustraHere &&
                            zarathustra &&
                            store &&
                            store?.apps?.some(
                              (app) => app.id === zarathustra.id,
                            ) && (
                              <A
                                href={getAppSlug(zarathustra)}
                                onClick={(e) => {
                                  if (isManagingApp) {
                                    e.preventDefault()
                                    return
                                  }

                                  if (e.metaKey || e.ctrlKey) {
                                    return
                                  }
                                  e.preventDefault()

                                  setIsNewChat(true, getAppSlug(zarathustra))
                                }}
                                className={clsx("link", styles.zarathustra)}
                              >
                                <Img
                                  className={clsx("link", styles.zarathustra)}
                                  containerClass={clsx(
                                    "link",
                                    styles.zarathustra,
                                  )}
                                  app={zarathustra}
                                  width={80}
                                  height={80}
                                />
                              </A>
                            )}
                          {showPacmanHere ? (
                            popcorn &&
                            store &&
                            store?.appId !== popcorn?.id &&
                            store?.apps?.some(
                              (app) => app.id === popcorn.id,
                            ) ? (
                              <A
                                href={getAppSlug(popcorn)}
                                onClick={(e) => {
                                  if (isManagingApp) {
                                    e.preventDefault()
                                    return
                                  }

                                  if (e.metaKey || e.ctrlKey) {
                                    return
                                  }
                                  e.preventDefault()

                                  setIsNewChat(true, getAppSlug(popcorn))
                                }}
                                className={clsx("link", styles.chrry)}
                              >
                                <Img
                                  className={clsx("link", styles.chrry)}
                                  containerClass={clsx("link", styles.chrry)}
                                  app={popcorn}
                                  width={80}
                                  height={80}
                                />
                              </A>
                            ) : (
                              showPacmanHere && (
                                <button
                                  onClick={() =>
                                    setAppStatus({
                                      step: canEditApp ? "update" : "add",
                                      part: "highlights",
                                    })
                                  }
                                  className={clsx("link", styles.pacMan)}
                                >
                                  <Img
                                    className={clsx("link", styles.pacMan)}
                                    containerClass={clsx("link", styles.pacMan)}
                                    icon="pacman"
                                    alt="Pacman"
                                    title={"Pacman"}
                                    width={26}
                                    height={26}
                                  />
                                </button>
                              )
                            )
                          ) : null}

                          {slug &&
                          index ===
                            appsState.findIndex(
                              (a) => getAppSlug(a) === slug,
                            ) ? (
                            <>
                              <StoreApp key={"vex"} />
                            </>
                          ) : (
                            item.id !== app?.id && (
                              <A
                                key={item.slug}
                                title={t(item.title)}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "0.35rem",
                                  marginLeft: index === 0 ? "auto" : "",
                                }}
                                href={getAppSlug(item)}
                                className={clsx(
                                  "button  small",
                                  isManagingApp ? "transparent" : "inverted",
                                )}
                                onClick={(e) => {
                                  if (isManagingApp) {
                                    e.preventDefault()
                                    return
                                  }

                                  addHapticFeedback()

                                  if (e.metaKey || e.ctrlKey) {
                                    return
                                  }
                                  e.preventDefault()
                                }}
                              >
                                <Img
                                  showLoading={false}
                                  app={item}
                                  alt={item.title}
                                  size={24}
                                />
                                <span>{item.name}</span>
                              </A>
                            )
                          )}
                          {showAtlasHere && atlas && (
                            <A
                              href={getAppSlug(atlas)}
                              onClick={(e) => {
                                if (isManagingApp) {
                                  e.preventDefault()
                                  return
                                }

                                if (e.metaKey || e.ctrlKey) {
                                  return
                                }
                                e.preventDefault()

                                setIsNewChat(true, getAppSlug(atlas))
                              }}
                              className={clsx("link", styles.atlas)}
                            >
                              <Img
                                className={clsx("link", styles.atlas)}
                                containerClass={clsx("link", styles.atlas)}
                                app={atlas}
                                width={22}
                                height={22}
                              />
                            </A>
                          )}
                          {showFocusHere && <FocusButton time={time} />}
                          {showSpaceInvaderHere && (
                            <button
                              className={clsx("link", styles.spaceInvader)}
                              onClick={() =>
                                setAppStatus({
                                  step: canEditApp ? "update" : "add",
                                  part: "name",
                                })
                              }
                            >
                              <Img
                                className={clsx("link", styles.spaceInvader)}
                                containerClass={clsx(styles.spaceInvader)}
                                icon="spaceInvader"
                                alt="Space Invader"
                                title={t("Space Invader")}
                                width={26}
                                height={26}
                              />
                            </button>
                          )}
                        </>
                      </DraggableAppItem>
                    )
                  })}
              </DraggableAppList>
            </Div>
          )}
        </>
        <div className={styles.instructions}>
          {isManagingApp && (
            <Instructions
              showButton={true}
              dataTestId="instruction-builder"
              opacity={0}
              onSave={({ content, artifacts }) => {
                onSave?.({
                  content,
                  artifacts,
                })
                // !isAddingApp && setInstructionsIndex((prev) => prev + 1)
              }}
              showInstructions={false}
            />
          )}
          <Instructions
            showButton={false}
            dataTestId="instruction"
            isAgentBuilder={true}
            opacity={0}
            onSave={({ content, artifacts }) => {
              !isManagingApp &&
                onSave?.({
                  content,
                  artifacts,
                })
            }}
          />
        </div>
      </Div>
    </Div>
  )
}
