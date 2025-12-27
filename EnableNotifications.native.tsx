"use client"

import React, { useEffect, useState } from "react"
import { BellRing } from "./icons"
import { useAppContext } from "./context/AppContext"
import { useAuth, useNavigationContext } from "./context/providers"
import { usePlatform, Div, Button } from "./platform"
import toast from "react-hot-toast"
import { useEnableNotificationsStyles } from "./EnableNotifications.styles"
import { useStyles } from "./context/StylesContext"
import Weather from "./Weather"

// TODO: Install Firebase for React Native
// npm install @react-native-firebase/app @react-native-firebase/messaging
// import messaging from '@react-native-firebase/messaging'

export default function EnableNotifications({
  className,
  text = "Notifications",
  onLocationClick,
}: {
  text?: string
  className?: string
  onLocationClick?: (location: string) => void
}) {
  const [isMounted, setIsMounted] = useState(false)
  const { t } = useAppContext()
  const { user, guest, token, API_URL } = useAuth()
  const { os, isStandalone, device } = usePlatform()
  const { setShowAddToHomeScreen } = useNavigationContext()
  const styles = useEnableNotificationsStyles()
  const { utilities } = useStyles()

  const [isSubscribed, setIsSubscribed] = useState<boolean | undefined>(
    undefined,
  )
  const [isRequesting, setIsRequesting] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    checkNotificationPermission()
  }, [])

  const checkNotificationPermission = async () => {
    // TODO: Implement Firebase permission check
    // const authStatus = await messaging().hasPermission()
    // const enabled =
    //   authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    //   authStatus === messaging.AuthorizationStatus.PROVISIONAL
    // setIsSubscribed(enabled)

    // Placeholder for now
    setIsSubscribed(false)
  }

  const handleSubscribe = async () => {
    if (isRequesting) return
    setIsRequesting(true)

    try {
      // TODO: Implement Firebase notification registration
      // 1. Request permission
      // const authStatus = await messaging().requestPermission()
      // const enabled =
      //   authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      //   authStatus === messaging.AuthorizationStatus.PROVISIONAL

      // if (!enabled) {
      //   toast.error(t("Notification permission denied"))
      //   return
      // }

      // 2. Get FCM token
      // const fcmToken = await messaging().getToken()

      // 3. Send token to your backend
      // if (token && fcmToken) {
      //   await fetch(`${API_URL}/pushSubscriptions`, {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //       Authorization: `Bearer ${token}`,
      //     },
      //     body: JSON.stringify({
      //       token: fcmToken,
      //       platform: "firebase",
      //       device: os,
      //     }),
      //   })
      //   setIsSubscribed(true)
      //   toast.success(t("Notifications enabled!"))
      // }

      // Placeholder for now
      toast.error(t("Firebase notifications not yet implemented"))
    } catch (error) {
      console.error("Failed to enable notifications:", error)
      toast.error(t("Failed to enable notifications"))
    } finally {
      setIsRequesting(false)
    }
  }

  // Show notification button if user has messages and notifications not enabled
  const shouldShow =
    (device === "desktop" || isStandalone) &&
    (user || guest)?.lastMessage &&
    isSubscribed === false

  return (
    <Div
      style={styles.enableNotificationsContainer.style}
      className={className}
    >
      <Weather
        onLocationClick={onLocationClick}
        showLocation={!shouldShow}
        // style={{
        //   ...styles.weather.style,
        //   ...(!shouldShow && styles.withoutNotifications.style),
        // }}
      />

      {isMounted && shouldShow && (
        <Div
          style={{
            ...styles.enableNotifications.style,
            // ...(os && styles[os]?.style),
          }}
        >
          <Button
            data-testid="enableNotificationsButton"
            onClick={handleSubscribe}
            disabled={isRequesting}
            className="small"
            style={styles.enableNotificationsButton.style}
          >
            <BellRing size={16} /> {t(text)}
          </Button>
        </Div>
      )}
    </Div>
  )
}
