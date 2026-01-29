"use client"

/// <reference types="chrome" />

import React, { useCallback, useEffect, useState } from "react"
import { BellRing } from "./icons"

import { customPushSubscription } from "./types"
import registerServiceWorker, {
  subscribeToPushNotifications,
} from "./utils/registerServiceWorker"
import { useAppContext } from "./context/AppContext"
import {
  useApp,
  useAuth,
  useChat,
  useNavigationContext,
} from "./context/providers"
import { apiFetch } from "./utils"
import { Button, Div, Span, usePlatform } from "./platform"
import toast from "react-hot-toast"
import Weather from "./Weather"
import { isDevelopment, getEnv } from "./utils"
import { useEnableNotificationsStyles } from "./EnableNotifications.styles"
import { useStyles } from "./context/StylesContext"
import A from "./a/A"
import Img from "./Image"

export default function EnableNotifications({
  text = "Notifications",
  onLocationClick,
}: {
  text?: string
  onLocationClick?: (location: string) => void
}) {
  const [isMounted, setIsMounted] = useState(false)

  const styles = useEnableNotificationsStyles()

  // Split contexts for better organization
  const { t } = useAppContext()

  const { isManagingApp, setAppStatus } = useApp()

  const { isExtension } = usePlatform()

  // Auth context
  const {
    user,
    token,
    guest,
    API_URL,
    userBaseApp,
    guestBaseApp,
    getAppSlug,
    app,
  } = useAuth()

  // Platform context
  const { os, isStandalone, device } = usePlatform()

  const { setIsNewAppChat } = useChat()

  const { setShowAddToHomeScreen } = useNavigationContext()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const [swRegistration, setSwRegistration] =
    useState<ServiceWorkerRegistration | null>(null)

  const [isSubscribed, setIsSubscribed] = useState<boolean | undefined>(
    undefined,
  )

  async function addPushSubscription(
    subscription: PushSubscription,
    p256dh: ArrayBuffer,
    auth: ArrayBuffer,
  ) {
    const response = await apiFetch(`${API_URL}/pushSubscriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(
            String.fromCharCode.apply(null, Array.from(new Uint8Array(p256dh))),
          ),
          auth: btoa(
            String.fromCharCode.apply(null, Array.from(new Uint8Array(auth))),
          ),
        },
      }),
    })

    const result = await response.json()
    return result
  }

  const storeApp = userBaseApp || guestBaseApp

  const { utilities } = useStyles()

  const StoreApp = useCallback(
    ({ icon }: { icon?: boolean }) =>
      storeApp && (
        <A
          data-testid={`app-${storeApp.slug}`}
          className={`${icon ? "link" : "button transparent"}`}
          style={{
            ...(icon
              ? utilities.link.style
              : { ...utilities.button.style, ...utilities.transparent.style }),
            ...utilities.small.style,
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
          }}
          href={getAppSlug(storeApp)}
          onClick={(e) => {
            e.preventDefault()

            setIsNewAppChat(storeApp)
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

  const [pushSubscription, setPushSubscription] =
    useState<customPushSubscription | null>()

  useEffect(() => {
    if (!token) return

    // Handle extension notifications - just check permission status
    if (isExtension) {
      if (typeof chrome !== "undefined" && chrome.notifications) {
        chrome.notifications.getPermissionLevel((level) => {
          setIsSubscribed(level === "granted")
        })
      } else {
        setIsSubscribed(false)
      }
      return
    }

    const isTauri =
      typeof window !== "undefined" &&
      ("__TAURI__" in window ||
        "__TAURI_INTERNALS__" in window ||
        "TAURI_EVENT_PLUGIN_INTERNALS" in window)
    const initializeServiceWorker = async () => {
      // Skip Service Worker registration in Electron/desktop environments
      // Service Workers are not needed and will fail due to origin mismatch
      if (
        typeof window !== "undefined" &&
        (isTauri || window.location.protocol === "file:")
      ) {
        console.log(
          "Skipping Service Worker registration in desktop environment",
        )
        return
      }

      // First check if notification permission is already granted
      if ("Notification" in window) {
        const permission = Notification.permission

        if (permission === "granted") {
          // If already granted, check for subscription
          const registration = await registerServiceWorker()
          if (registration) {
            setSwRegistration(registration)
            const subscription =
              await registration.pushManager.getSubscription()

            if (subscription) {
              const result = await apiFetch(`${API_URL}/pushSubscription`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ endpoint: subscription.endpoint }),
              })

              const data = await result.json()

              if (data.subscription) {
                setPushSubscription(data.subscription)
                setIsSubscribed(true)
                return
              } else {
                const p256dh = subscription.getKey("p256dh")
                const auth = subscription.getKey("auth")

                if ((user || guest) && p256dh && auth) {
                  const result = await addPushSubscription(
                    subscription,
                    p256dh,
                    auth,
                  )

                  if (!result.error && result.subscription) {
                    setPushSubscription(result.subscription)
                    setIsSubscribed(true)
                  } else {
                    toast.error(result.error)
                  }
                }

                return
              }
            }
          }
        }
      }

      // If we get here, either permission isn't granted or no subscription exists
      const registration = await registerServiceWorker()
      if (registration) {
        setSwRegistration(registration)
        setIsSubscribed(false)
      }
    }

    initializeServiceWorker()
  }, [token])

  const handleSubscribe = async () => {
    // Handle extension notifications - just request permission, no database storage
    if (isExtension) {
      if (typeof chrome !== "undefined" && chrome.notifications) {
        chrome.notifications.getPermissionLevel((level) => {
          if (level === "granted") {
            setIsSubscribed(true)
          } else {
            chrome.permissions.request(
              { permissions: ["notifications"] },
              (granted) => {
                setIsSubscribed(granted)
              },
            )
          }
        })
      }
      return
    }

    if (!isStandalone && (os === "ios" || os === "android")) {
      setShowAddToHomeScreen(true)
      return
    }
    if (swRegistration && !pushSubscription) {
      const publicVapidKey = getEnv().VITE_VAPID_PUBLIC_KEY!

      const subscription = await subscribeToPushNotifications(
        swRegistration,
        publicVapidKey,
      )
      if (subscription) {
        setIsSubscribed(true)

        const p256dh = subscription.getKey("p256dh")
        const auth = subscription.getKey("auth")

        if (user && p256dh && auth) {
          addPushSubscription(subscription, p256dh, auth)
        }
      }
    }
  }

  if (!isMounted || isManagingApp) return null

  // Show notification button for extensions if permission not granted, for web if service worker ready
  const shouldShow =
    (storeApp && storeApp?.id !== app?.id) ||
    (!isExtension &&
      (isDevelopment || (user || guest)?.lastMessage) &&
      isSubscribed === false &&
      swRegistration)

  return (
    <Div style={styles.enableNotificationsContainer.style}>
      <Weather onLocationClick={onLocationClick} showLocation={!shouldShow} />
      {storeApp && storeApp?.id !== app?.id ? (
        <StoreApp />
      ) : (
        isMounted &&
        shouldShow && (
          <Div style={styles.enableNotifications.style}>
            <Button
              data-testid="enableNotificationsButton"
              onClick={handleSubscribe}
              className={"small"}
              style={styles.enableNotificationsButton.style}
              disabled={!swRegistration}
            >
              <BellRing size={16} /> {t(text)}
            </Button>
          </Div>
        )
      )}
    </Div>
  )
}
