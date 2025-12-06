"use client"

import React, { useCallback, useEffect, useState } from "react"

import { clsx, FilePicker, usePlatform, useTheme } from "./platform"
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
  RefreshCw,
  Settings2,
  Trash2,
} from "./icons"
import toast from "react-hot-toast"
import Loading from "./Loading"
import ConfirmButton from "./ConfirmButton"
import { useHasHydrated } from "./hooks"
import { Div, H1, Button, Label, Span, Input } from "./platform"
import A from "./a/A"
import { apiFetch } from "./utils"
import { useStyles } from "./context/StylesContext"
import {
  useApp,
  useAuth,
  useChat,
  useData,
  useNavigationContext,
} from "./context/providers"
import { COLORS, useAppContext } from "./context/AppContext"
import { useTimerContext } from "./context/TimerContext"

function FocusButton({ time }: { time: number }) {
  const { appStyles } = useStyles()
  const { isExtension, isFirefox, isWeb } = usePlatform()
  const { focus, getAppSlug, setShowFocus } = useAuth()

  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    if (time === 0) {
      const interval = setInterval(() => {
        setCurrentTime(new Date())
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [time])

  const formatTime = () => {
    if (time > 0) {
      return `${Math.floor(time / 60)}:${String(time % 60).padStart(2, "0")}`
    } else {
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
      style={{
        ...appStyles.focus.style,
      }}
    >
      <Span style={appStyles.focusTime.style}>{formatTime()}</Span>
      <Img style={appStyles.focus.style} logo="focus" width={22} height={22} />
    </A>
  )
}

export default function App({
  onSave,
}: {
  onSave?: ({
    content,
    artifacts,
  }: {
    content: string
    artifacts: File[]
  }) => void
}) {
  const { t } = useAppContext()
  const { time } = useTimerContext()

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
    hasCustomInstructions,
    showingCustom,
    toggleInstructions,
  } = useApp()

  const {
    user,
    guest,
    getAppSlug,
    store,
    apps,
    guestBaseApp,
    userBaseApp,
    token,
    loadingApp,
    storeApp,
  } = useAuth()

  const { FRONTEND_URL, API_URL } = useData()

  const { router, getStoreSlug } = useNavigationContext()

  const { setInput, setIsWebSearchEnabled, setIsNewAppChat } = useChat()

  const { addHapticFeedback } = useTheme()
  const currentStoreId = store?.id

  const focus = apps.find((app) => app.slug === "focus")

  const chrry = apps.find((app) => app.slug === "chrry")
  const popcorn = apps.find((app) => app.slug === "popcorn")
  const vex = apps.find((app) => app.slug === "vex")
  const atlas = apps.find((app) => app.slug === "atlas")
  const grape = apps.find((app) => app.slug === "grape")
  const zarathustra = apps.find((app) => app.slug === "zarathustra")

  const isBlossom = app?.store?.id === chrry?.store?.id

  const getApps = () => {
    return apps
      .filter(
        (item) =>
          item.id !== store?.appId &&
          item.id !== chrry?.id &&
          item.id !== grape?.id &&
          (isBlossom
            ? item.id !== atlas?.id &&
              item.id !== zarathustra?.id &&
              item.id !== popcorn?.id
            : true),
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
          className="button transparent"
          style={{
            ...utilities.button.style,
            ...utilities.transparent.style,
            ...utilities.small.style,
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
          }}
          href={getAppSlug(storeApp)}
          onClick={(e) => {
            e.preventDefault()

            setIsNewAppChat(storeApp)
            addHapticFeedback()
            setAppStatus(undefined)
            if (e.metaKey || e.ctrlKey) {
              return
            }
          }}
        >
          <Img app={storeApp} showLoading={false} size={24} />
          <Span>{storeApp?.name}</Span>
        </A>
      ),
    [storeApp],
  )

  const canAddName = appFormWatcher?.canSubmit

  const canAddTitle = isManagingApp

  const { appStyles: styles, utilities } = useStyles()

  if (!hasHydrated && (isManagingApp || appFormWatcher?.canSubmit)) {
    return <Loading fullScreen />
  }

  return (
    <Div>
      <H1 style={styles.title.style}>
        {!isManagingApp && !canEditApp && app ? (
          <Div style={styles.appTitle.style}>
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
                ? styles.titleFormContainer.style
                : styles.titleFormTitle.style
            }
          >
            {appFormWatcher?.canSubmit && isManagingApp && (
              <Div style={utilities.row.style}>
                <ConfirmButton
                  className="transparent"
                  style={{
                    ...utilities.transparent.style,
                    ...utilities.small.style,
                  }}
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
                  className="inverted"
                  onClick={async () => {
                    await saveApp()
                  }}
                  style={{
                    ...utilities.inverted.style,
                    ...utilities.small.style,
                  }}
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
              <Div style={styles.validationFeedback.style}>
                {/* Show validation errors (except title) */}

                {/* Image dimension warning/recommendation */}
                <Div
                  style={{
                    ...styles.validationFeedback.style,
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
              <Div style={styles.form.style}>
                <Div
                  style={{
                    ...styles.appImageContainer.style,
                    ...styles.formDiv.style,
                  }}
                >
                  {image && (
                    <Button
                      className="link"
                      onClick={() => {
                        setImage(undefined)
                        setFile(undefined)
                      }}
                      title={t("Remove")}
                      aria-label={t("Remove")}
                      style={{
                        ...utilities.link.style,
                        ...styles.removeImageButton.style,
                      }}
                    >
                      <CircleMinus color="var(--accent-1)" size={14} />
                    </Button>
                  )}
                  <Button
                    disabled={isUploading}
                    className="link"
                    title={t("Edit")}
                    aria-label={t("Edit")}
                    onClick={() => triggerFileInput()}
                    style={{
                      ...styles.appImageWrapper.style,
                      ...utilities.link.style,
                    }}
                  >
                    <Img
                      src={image}
                      showLoading={false}
                      icon="spaceInvader"
                      app={app}
                      alt="Space Invader"
                      title={t("Space Invader")}
                      size={45}
                      style={{
                        ...styles.appImage.style,
                        position: "relative",
                        bottom: "0.4rem",
                      }}
                    />
                    <Span
                      className="button tranparent"
                      style={{
                        ...utilities.button.style,
                        ...utilities.transparent.style,
                        ...utilities.small.style,
                        ...styles.editImageButton.style,
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
                </Div>
                <Label htmlFor="title">
                  <Div>
                    <Input
                      {...appForm?.register("title")}
                      title={t("Title")}
                      id="title"
                      style={styles.titleInput.style}
                      type="text"
                      placeholder={t("Title")}
                    />
                  </Div>
                </Label>
                {isManagingApp &&
                  appStatus?.part !== "name" &&
                  appStatus?.part !== "highlights" && (
                    <Button
                      disabled={!canAddTitle}
                      onClick={() => {
                        if (canAddTitle) {
                          setAppStatus({
                            step: canEditApp ? "update" : "add",
                            part: appFormWatcher.name ? "highlights" : "name",
                          })
                        }
                      }}
                      style={{
                        ...utilities.small.style,
                        ...(canAddTitle ? {} : utilities.transparent.style),
                      }}
                      title={t("Continue")}
                    >
                      <ArrowRight />
                    </Button>
                  )}
              </Div>
            ) : appFormWatcher && appFormWatcher.canSubmit ? (
              <Div style={styles.titleFormTitle.style}>
                <Logo app={app} showLoading={false} logo="isVivid" size={35} />
                {t(appFormWatcher?.title || "Your personal AI agent")}
              </Div>
            ) : (
              <Div style={styles.titleFormTitle.style}>
                <Logo
                  app={app}
                  logo="isMagenta"
                  showLoading={false}
                  size={35}
                />
                {t("Your personal AI agent")}
              </Div>
            )}
            <FilePicker
              key={inputKey}
              ref={fileInputRef}
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </Div>
        )}
      </H1>
      <Div style={{ ...styles.container.style }}>
        <>
          <Div style={{ ...styles.section.style }}>
            <EnableNotifications
              onLocationClick={(location) => {
                setInput(`What's the weather in ${location}?`)
                setIsWebSearchEnabled(true)
              }}
            />
          </Div>
          <Div style={{ ...styles.section.style }}>
            {appStatus?.part ? null : (
              <Button
                className="link"
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
                <Span
                  style={{
                    position: "absolute",
                    bottom: "0.15rem",
                    right: "-0.50rem",
                  }}
                >
                  🤯
                </Span>
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
              <Div style={styles.agentNameForm.style}>
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
                      ...styles.nameField.style,
                      paddingInline: "0.5rem",
                      ...(appForm?.formState.errors.name?.message
                        ? styles.formInfoError.style
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
                          ...styles.formInfo.style,
                          ...(appForm?.formState.errors.name?.message &&
                            styles.formInfoError.style),
                          display: "inline",
                        }}
                      >
                        {appForm?.formState.errors.name?.message ? (
                          <Span style={styles.field.style}>
                            {t(appForm?.formState.errors.name.message)}
                          </Span>
                        ) : (
                          <Span style={styles.field.style}>
                            {t("Keep it short!")}
                          </Span>
                        )}
                      </Div>
                      <Input
                        {...appForm?.register("name")}
                        title={t("Name")}
                        id="agentName"
                        style={styles.nameInput.style}
                        type="text"
                        placeholder={t("Name")}
                      />
                    </Div>
                    <Span
                      title={t(
                        "This will the name your app, keep it short around 5-10 characters",
                      )}
                      style={styles.infoIcon.style}
                    >
                      <Info color="var(--background)" size={24} />
                    </Span>
                  </Label>

                  <Button
                    className="link"
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
              <Div style={styles.nameImage.style}>
                <Button
                  className="link"
                  title={t("Edit")}
                  onClick={() => {
                    setAppStatus({
                      step: canEditApp ? "update" : "add",
                      part: "name",
                    })
                  }}
                  style={utilities.link.style}
                >
                  <Settings2 />
                </Button>
                <Button
                  className="inverted"
                  title={t("Your AI-Powered Life")}
                  style={{
                    ...utilities.small.style,
                    ...utilities.inverted.style,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                  }}
                  onClick={() => {
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
                </Button>
                {isManagingApp && (
                  <Button
                    className="link"
                    onClick={() => {
                      setAppStatus(undefined)
                    }}
                    style={utilities.link.style}
                    title={t(isManagingApp ? "Cancel" : "Add agent")}
                  >
                    <CircleMinus color="var(--accent-1)" size={24} />
                  </Button>
                )}
              </Div>
            ) : (
              store && (
                <A
                  title={t(store?.title || "Your AI-Powered Life")}
                  href={getStoreSlug(store?.slug)}
                  className="button inverted"
                  style={{
                    ...utilities.button.style,
                    ...utilities.small.style,
                    ...utilities.inverted.style,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                  }}
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
                  <Span>{store?.name}</Span>
                </A>
              )
            )}
            {!isManagingApp && (
              <A
                href={`${FRONTEND_URL}/calendar`}
                title={t("Organize your life")}
                openInNewTab={isExtension && isFirefox}
                className="button transparent"
                style={{
                  ...utilities.button.style,
                  ...utilities.transparent.style,
                }}
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
                className="link"
                style={{ ...utilities.link.style, ...styles.grip.style }}
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
                <Span
                  style={{ ...styles.grip.style }}
                  // title={t("Drag and drop to reorder apps")}
                >
                  <Grip size={24} color="var(--accent-1)" />
                </Span>
              )
            )}
          </Div>
          {!isManagingApp && (
            <Div
              style={{
                ...styles.section.style,
                ...styles.appsGrid.style,
              }}
            >
              <Div style={{ ...styles.apps.style }}>
                {appsState.slice(0, 5)?.map((item, index) => {
                  const showAtlasHere = index === 1 && app?.id === chrry?.id
                  const showFocusHere = focus && !showAtlasHere && index === 1

                  const showPacmanHere =
                    app?.store?.id !== popcorn?.store?.id && index === 2
                  const showSpaceInvaderHere = index === 3

                  const showChrryHere =
                    index === 0 && chrry && app?.id !== chrry.id
                  const showZarathustraHere =
                    !showChrryHere &&
                    index === 0 &&
                    store?.appId !== zarathustra?.id

                  return (
                    <Div
                      key={item.id}
                      id={item.id}
                      style={{
                        ...styles.appItem.style,
                        marginLeft: index === 2 ? "auto" : undefined,
                      }}
                    >
                      <>
                        {showChrryHere && (
                          <A
                            preventDefault
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

                              setIsNewAppChat(chrry)
                            }}
                            style={{
                              ...styles.chrry.style,
                            }}
                          >
                            {loadingApp?.id !== chrry?.id ? (
                              <Img
                                logo="chrry"
                                alt="Chrry"
                                title={"Chrry"}
                                width={28}
                                height={28}
                              />
                            ) : (
                              <Loading size={28} />
                            )}
                          </A>
                        )}

                        {showZarathustraHere &&
                          zarathustra &&
                          store &&
                          store?.apps?.some(
                            (app) => app.id === zarathustra.id,
                          ) && (
                            <A
                              preventDefault
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

                                setIsNewAppChat(zarathustra)
                              }}
                              style={{
                                ...styles.zarathustra.style,
                              }}
                            >
                              {loadingApp?.id !== zarathustra?.id ? (
                                <Img
                                  style={{
                                    ...styles.zarathustra.style,
                                  }}
                                  app={zarathustra}
                                  size={24}
                                />
                              ) : (
                                <Loading size={24} />
                              )}
                            </A>
                          )}
                        {showPacmanHere ? (
                          popcorn &&
                          store &&
                          store?.appId !== popcorn?.id &&
                          store?.apps?.some((app) => app.id === popcorn.id) ? (
                            <A
                              preventDefault
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

                                setIsNewAppChat(popcorn)
                              }}
                              style={{
                                ...styles.popcorn.style,
                              }}
                            >
                              {loadingApp?.id !== popcorn?.id ? (
                                <Img app={popcorn} size={24} />
                              ) : (
                                <Loading size={24} />
                              )}
                            </A>
                          ) : (
                            showPacmanHere && (
                              <Button
                                className="link slideInFromLeft"
                                onClick={() =>
                                  setAppStatus({
                                    step: canEditApp ? "update" : "add",
                                    part: "highlights",
                                  })
                                }
                                style={{
                                  ...styles.pacMan.style,
                                }}
                              >
                                <Img
                                  icon="pacman"
                                  alt="Pacman"
                                  title={"Pacman"}
                                  width={26}
                                  height={26}
                                />
                              </Button>
                            )
                          )
                        ) : null}
                        {slug && getAppSlug(item) === slug ? (
                          <>
                            <StoreApp key={"vex"} />
                          </>
                        ) : (
                          item.id !== app?.id && (
                            <Div
                              style={{
                                marginLeft: index === 0 ? "auto" : "",
                                "--glow-color":
                                  COLORS[
                                    item.themeColor as keyof typeof COLORS
                                  ],
                              }}
                            >
                              <A
                                preventDefault
                                key={item.slug}
                                title={t(item.title)}
                                className={clsx(`button`, {
                                  ["transparent"]: isManagingApp,
                                  ["inverted"]: !isManagingApp,
                                  glow: loadingApp?.id === item.id,
                                })}
                                style={{
                                  ...utilities.button.style,
                                  ...utilities.small.style,
                                  ...(isManagingApp
                                    ? utilities.transparent.style
                                    : utilities.inverted.style),
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "0.35rem",
                                }}
                                href={getAppSlug(item)}
                                onClick={(e) => {
                                  if (isManagingApp) {
                                    return
                                  }
                                  if (e.metaKey || e.ctrlKey) {
                                    return
                                  }

                                  setIsNewAppChat(item)

                                  e.preventDefault()
                                }}
                              >
                                {loadingApp?.id === item.id ? (
                                  <Loading
                                    color={
                                      COLORS[
                                        item.themeColor as keyof typeof COLORS
                                      ]
                                    }
                                    size={24}
                                  />
                                ) : (
                                  <>
                                    <Img
                                      showLoading={false}
                                      app={item}
                                      alt={item.title}
                                      size={24}
                                    />
                                  </>
                                )}
                                <Span>{item.name}</Span>
                              </A>
                            </Div>
                          )
                        )}
                        {showAtlasHere && atlas && (
                          <A
                            href={getAppSlug(atlas)}
                            preventDefault
                            onClick={(e) => {
                              if (isManagingApp) {
                                e.preventDefault()
                                return
                              }

                              if (e.metaKey || e.ctrlKey) {
                                return
                              }
                              e.preventDefault()

                              setIsNewAppChat(atlas)
                            }}
                            style={{
                              ...styles.atlas.style,
                            }}
                          >
                            {loadingApp?.id === atlas?.id ? (
                              <Loading size={22} />
                            ) : (
                              <Img app={atlas} width={22} height={22} />
                            )}
                          </A>
                        )}
                        {showFocusHere && <FocusButton time={time} />}
                        {showSpaceInvaderHere && (
                          <Button
                            className="link float"
                            key={
                              showingCustom
                                ? "customInstructions"
                                : "appInstructions"
                            }
                            style={{
                              ...styles.spaceInvader.style,
                            }}
                            onClick={() => {
                              toggleInstructions()
                            }}
                          >
                            <Img
                              icon="spaceInvader"
                              alt="Space Invader"
                              title={t("Space Invader")}
                              width={26}
                              height={26}
                            />
                            {hasCustomInstructions && (
                              <RefreshCw
                                size={10}
                                strokeWidth={3}
                                style={{
                                  position: "absolute",
                                  bottom: 1,
                                  right: -5,
                                  color: "#f87171",
                                }}
                              />
                            )}
                          </Button>
                        )}
                      </>
                    </Div>
                  )
                })}
              </Div>
            </Div>
          )}
        </>
        <Div style={{ ...styles.instructions.style }}>
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
        </Div>
      </Div>
    </Div>
  )
}
