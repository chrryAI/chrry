"use client"
import clsx from "clsx"
import React, { useEffect, useRef, useState } from "react"
import { FaApple, FaGithub, FaGoogle } from "react-icons/fa"
import A from "./a/A"
import { LinkIcon, LogIn, LogInIcon, UserRoundPlus } from "./icons"

import styles from "./SignIn.module.scss"
import { apiFetch, isDevelopment } from "./utils"
export type DesktopAuthHandler = {
  openAuthWindow: (url: string) => Promise<void>
}

import toast from "react-hot-toast"
import Account from "./account/Account"
import { useAppContext } from "./context/AppContext"
import {
  useAuth,
  useChat,
  useData,
  useError,
  useNavigationContext,
} from "./context/providers"
import useCache from "./hooks/useCache"
import Modal from "./Modal"
import { Button, usePlatform } from "./platform"
import { BrowserInstance, getRedirectURL } from "./utils"
import { ANALYTICS_EVENTS } from "./utils/analyticsEvents"

export default function SignIn({
  className,
  showSignIn = true,
  signInButtonText,
  showRegister = true,
  registerButtonText,
  desktopAuthHandler,
  style,
  ...props
}: {
  className?: string
  showSignIn?: boolean
  signInButtonText?: string
  registerButtonText?: string
  showRegister?: boolean
  callbackUrl?: string
  style?: React.CSSProperties
  desktopAuthHandler?: DesktopAuthHandler
}) {
  const { isExtension, isCapacitor } = usePlatform()

  const { clear } = useCache()

  const {
    setToken,
    user,
    guest,
    isExtensionRedirect,
    fingerprint,
    signInContext: signInContextInternal,
    signInPart: part,
    setSignInPart: setPart,
    siteConfig,
    setDeviceId,
    refetchSession,
    plausible,
  } = useAuth()

  const isGithubSignInAvailable = user?.role === "admin"

  const signInContext = async (
    provider: "google" | "apple" | "github" | "credentials",
    options: {
      email?: string | undefined
      password?: string | undefined
      redirect?: boolean | undefined
      callbackUrl: string
      errorUrl: string
    },
  ) => {
    clear()
    return signInContextInternal?.(provider, options)
  }
  const { t, console } = useAppContext()

  const {
    FRONTEND_URL,
    isE2E,
    isCI,
    API_URL,
    TEST_GUEST_FINGERPRINTS,
    TEST_MEMBER_FINGERPRINTS,
  } = useData()

  const isAppleSignInAvailable = true

  const { threadId } = useChat()

  const { router, removeParams } = useNavigationContext()

  const { captureException } = useError()

  const innerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        innerRef.current &&
        !innerRef.current.contains(event.target as Node)
      ) {
        setPart(undefined)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPart(undefined)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [part])

  const E2E =
    isE2E ||
    (fingerprint &&
      (TEST_GUEST_FINGERPRINTS?.includes(fingerprint) ||
        TEST_MEMBER_FINGERPRINTS?.includes(fingerprint)))

  const handleSignIn = async (part: "login" | "register" | "credentials") => {
    if (E2E) {
      part = "credentials"
    }

    // toast.success(
    //   `Opening sidebar for ${isExtension ? "extension" : "web"} ...${FRONTEND_URL}?signIn=${part}`,
    // )

    if (isExtension) {
      BrowserInstance?.runtime?.sendMessage({
        action: "openInSameTab",
        url: `${FRONTEND_URL}?signIn=${part}&extension=true`,
      })
      return
    }

    setPart(part)
  }

  const getCallbacks = () => {
    const searchParams = new URLSearchParams(window.location.search)
    const callbackUrl =
      props?.callbackUrl || searchParams?.get("callbackUrl") || undefined

    let isCallbackUrlURI = false
    if (callbackUrl) {
      try {
        new URL(callbackUrl)
        isCallbackUrlURI = true
      } catch (_error) {
        isCallbackUrlURI = false
      }
    }

    // For OAuth (Google/Apple), always use chrry.ai as callback to avoid URL limit issues
    // We'll redirect back to the original subdomain after auth
    const baseUrl = isDevelopment ? FRONTEND_URL : siteConfig.url

    const errorUrl = new URL(`${baseUrl}/?signIn=login&error`)
    // Create URLs for both success and error cases
    const successUrl = new URL(
      callbackUrl
        ? isCallbackUrlURI
          ? callbackUrl
          : baseUrl + callbackUrl
        : baseUrl,
    )

    // Store original subdomain URL for post-OAuth redirect
    // This allows us to use a single OAuth callback URL (chrry.ai) for all subdomains
    // if (!isDevelopment) {
    // successUrl.searchParams.set("chrryUrl", encodeURIComponent(CHRRY_URL))
    // }

    isExtensionRedirect && successUrl.searchParams.set("extension", "true")

    // fingerprint && successUrl.searchParams.set("fp", fingerprint)

    return {
      successUrl,
      errorUrl,
    }
  }

  const [isSignInLoading, setIsSignInLoading] = useState(false)
  const [redirectUrl, _setRedirectUrl] = useState<string | null>(null)

  const handleLogin = async () => {
    setIsSignInLoading(true)
    const { successUrl, errorUrl } = getCallbacks()

    const signInResult = await signInContext?.("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: successUrl.toString(), // or wherever you want
      errorUrl: errorUrl.toString(),
    })

    if (signInResult?.error) {
      toast.error(signInResult.error)
      setIsSignInLoading(false)
      return
    } else {
      const redirectUrl = signInResult?.url || successUrl.toString()

      const separator = redirectUrl.includes("?") ? "&" : "?"
      window.location.href = `${redirectUrl}${separator}auth_token=${signInResult?.authCode}`
    }
  }

  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")

  const handleAppleSignIn = async () => {
    // Capacitor: Use Firebase Authentication
    if (isCapacitor) {
      try {
        const { appleSignIn } = await import("./auth/capacitorAuth")
        const result = await appleSignIn()

        // Exchange the Firebase ID token for our app token
        const response = await apiFetch(`${API_URL}/auth/native/apple`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken: result.idToken }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error("Apple Backend Error:", errorText)
          toast.error(`Failed: ${errorText}`)
          return
        }

        const { token, jwt } = await response.json()
        setToken(jwt || token) // Use JWT if available, fallback to token
        setPart(undefined)
        await refetchSession()
        toast.success("Signed in successfully!")
      } catch (error) {
        console.error("Apple auth error:", error)
        const msg = error instanceof Error ? error.message : "Failed to sign in"
        toast.error(msg)
      }
      return
    }

    // Extension: Not supported yet
    if (isExtension) {
      toast.success("Please complete Apple sign-in in the opened tab.")
      return
    }

    // Web/PWA: Use standard OAuth redirect
    const { successUrl, errorUrl } = getCallbacks()

    successUrl.searchParams.set("welcome", "true")
    isExtensionRedirect && successUrl.searchParams.set("extension", "true")

    try {
      const result = await signInContext?.("apple", {
        callbackUrl: successUrl.href,
        redirect: true,
        errorUrl: errorUrl.href,
      })

      if (result?.error) {
        captureException(result?.error)
        console.error("Apple sign in failed:", result?.error)
        toast.error("User not authorized")
      } else {
        localStorage.setItem("authChanged", Date.now().toString())
      }
    } catch (error) {
      captureException(error)
      console.error("Apple sign in error:", error)
      toast.error("An error occurred during sign in")
    }
  }

  // Add this useEffect in your main component or success page
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const isApp = urlParams.get("isApp") === "true"
    const welcome = urlParams.get("welcome") === "true"

    if (isApp && welcome) {
      // Try to open the desktop app using a custom protocol
      // This assumes you've registered a custom protocol for your Tauri app
      const appProtocol = "focusbutton://open" // Replace with your actual protocol

      // Create a temporary link and click it to trigger the protocol
      const link = document.createElement("a")
      link.href = appProtocol
      link.click()

      // Optional: Show a message to the user
      toast.success("Opening desktop app...")

      // Optional: Close the browser tab after a delay
      setTimeout(() => {
        window.close()
      }, 2000)
    }
  }, [])

  const handleGoogleAuth = async () => {
    // Capacitor: Use Firebase Authentication
    if (isCapacitor) {
      try {
        const { googleSignIn } = await import("./auth/capacitorAuth")
        const result = await googleSignIn()

        // Exchange the Firebase ID token for our app token
        const response = await apiFetch(`${API_URL}/auth/native/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken: result.idToken }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error("Google Backend Error:", errorText)
          toast.error(`Failed: ${errorText}`)
          return
        }

        const { token, jwt } = await response.json()
        setToken(jwt || token) // Use JWT if available, fallback to token
        setPart(undefined)
        await refetchSession()
        toast.success("Signed in successfully!")
      } catch (error) {
        console.error("Google auth error:", error)
        toast.error(
          error instanceof Error ? error.message : "Failed to sign in",
        )
      }
      return
    }

    // Web/PWA: Use standard OAuth redirect
    if (!isExtension) {
      const { successUrl, errorUrl } = getCallbacks()

      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get("isApp") === "true")
        successUrl.searchParams.set("isApp", "true")

      await signInContext?.("google", {
        redirect: true,
        errorUrl: errorUrl.href,
        callbackUrl: successUrl.toString(),
      })
      return
    }

    // Extension: Use chrome.identity API
    try {
      const query = new URLSearchParams()
      query.append("redirect_uri", getRedirectURL())
      query.append("extension", "true")
      const response = await apiFetch(`${API_URL}/auth/google/init?${query}`)

      if (!response.ok) {
        toast.error("Failed to get auth URL")
        return
      }

      const { authUrl } = await response.json()

      chrome.identity.launchWebAuthFlow(
        {
          url: authUrl,
          interactive: true,
        },
        async (responseUrl) => {
          if (!responseUrl) {
            toast.error("Failed to get auth code")
            return
          }

          const urlParams = new URLSearchParams(new URL(responseUrl).search)
          const authCode = urlParams.get("code")
          if (!authCode) {
            toast.error("Failed to get auth code")
            return
          }

          const searchParams = new URLSearchParams(window.location.search)
          searchParams.delete("signIn")
          const newUrl = searchParams.toString()
            ? `?${searchParams.toString()}`
            : window.location.pathname
          window.history.replaceState({}, "", newUrl)

          const redirectUri = getRedirectURL().replace(/\/$/, "")
          console.log("Using redirect URI:", redirectUri)
          const response = await apiFetch(`${API_URL}/signIn/google`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              code: authCode,
              redirect_uri: redirectUri,
            }),
          })
          const data = await response.json()
          if (data.token) {
            setToken(data.token)
            setPart(undefined)
          }
        },
      )
    } catch (error) {
      captureException(error)
      console.error("Google auth failed:", error)
    }
  }

  const handleGitHubAuth = async () => {
    // Capacitor: Use Firebase Authentication (if GitHub is configured in Firebase)
    if (isCapacitor) {
      try {
        // Note: GitHub auth via Firebase requires additional setup
        // For now, we'll use the web flow
        toast.error(
          "GitHub sign-in via mobile app is not yet supported. Please use the web version.",
        )
        return
      } catch (error) {
        console.error("GitHub auth error:", error)
        toast.error(
          error instanceof Error ? error.message : "Failed to sign in",
        )
      }
      return
    }

    // Web/PWA: Use standard OAuth redirect
    if (!isExtension) {
      const { successUrl, errorUrl } = getCallbacks()

      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get("isApp") === "true")
        successUrl.searchParams.set("isApp", "true")

      // Track GitHub sign-in attempt
      plausible?.({ name: ANALYTICS_EVENTS.GITHUB_SIGNIN })

      await signInContext?.("github", {
        redirect: true,
        errorUrl: errorUrl.href,
        callbackUrl: successUrl.toString(),
      })
      return
    }

    // Extension: Use chrome.identity API
    try {
      const query = new URLSearchParams()
      query.append("redirect_uri", getRedirectURL())
      query.append("extension", "true")
      const response = await apiFetch(`${API_URL}/auth/github/init?${query}`)

      if (!response.ok) {
        toast.error("Failed to get auth URL")
        return
      }

      const { authUrl } = await response.json()

      chrome.identity.launchWebAuthFlow(
        {
          url: authUrl,
          interactive: true,
        },
        async (responseUrl) => {
          if (!responseUrl) {
            toast.error("Failed to get auth code")
            return
          }

          const urlParams = new URLSearchParams(new URL(responseUrl).search)
          const authCode = urlParams.get("code")
          if (!authCode) {
            toast.error("Failed to get auth code")
            return
          }

          const searchParams = new URLSearchParams(window.location.search)
          searchParams.delete("signIn")
          const newUrl = searchParams.toString()
            ? `?${searchParams.toString()}`
            : window.location.pathname
          window.history.replaceState({}, "", newUrl)

          const redirectUri = getRedirectURL().replace(/\/$/, "")
          console.log("Using redirect URI:", redirectUri)
          const response = await apiFetch(`${API_URL}/signIn/github`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              code: authCode,
              redirect_uri: redirectUri,
            }),
          })
          const data = await response.json()
          if (data.token) {
            setToken(data.token)
            setPart(undefined)
          }
        },
      )
    } catch (error) {
      captureException(error)
      console.error("GitHub auth failed:", error)
    }
  }

  return (
    <>
      {!user ? (
        <>
          {showSignIn && (
            <Button
              data-testid="login-button"
              id="login-button"
              onClick={() => handleSignIn("login")}
              className={clsx("transparent small", styles.signInButton)}
            >
              <LogIn color="var(--accent-6)" size={16} />
              <span className={styles.signInButtonText}>
                {signInButtonText || t("Login")}
              </span>
            </Button>
          )}
          {showRegister && (
            <Button
              data-testid="register-button"
              onClick={() => {
                const plan = (user || guest)?.subscription?.plan || "member"
                if (isExtension) {
                  BrowserInstance?.runtime?.sendMessage({
                    action: "openInSameTab",
                    url: `${FRONTEND_URL}?subscribe=true&plan=${plan}`,
                  })
                  return
                }

                if (guest) {
                  threadId
                    ? router.push(
                        `/threads/${threadId}?subscribe=true&plan=${plan}`,
                      )
                    : router.push(`/?subscribe=true&plan=${plan}`)
                  return
                }

                threadId
                  ? router.push(
                      `/threads/${threadId}?subscribe=true&plan=${plan}`,
                    )
                  : router.push(`/?subscribe=true&plan=${plan}`)
              }}
              className={clsx("transparent small", styles.registerButton)}
            >
              <UserRoundPlus color="var(--accent-6)" size={16} />
              {registerButtonText || t("Register")}
            </Button>
          )}
        </>
      ) : (
        user && <Account />
      )}
      {part && (
        <Modal
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
          title={<>{t(part === "login" ? "Login" : "Register")}</>}
          dataTestId="sign-in-modal"
          hasCloseButton
          params={`?signIn=${part}`}
          isModalOpen={part === undefined ? undefined : true}
          onToggle={(open) => {
            setPart(open ? "login" : undefined)
          }}
        >
          {part !== "credentials" ? (
            <div className={styles.signInButtons}>
              <Button
                data-testid={
                  part === "login"
                    ? "sign-in-google-button"
                    : "register-google-button"
                }
                onClick={handleGoogleAuth}
                className={clsx("inverted", styles.googleButton)}
              >
                <FaGoogle size={16} />{" "}
                {t(`${part === "login" ? "Sign in" : "Register"} with Google`)}
              </Button>
              {isGithubSignInAvailable && (
                <Button
                  data-testid={
                    part === "login"
                      ? "sign-in-github-button"
                      : "register-github-button"
                  }
                  onClick={handleGitHubAuth}
                  className={clsx("inverted", styles.githubButton)}
                >
                  <FaGithub size={16} />{" "}
                  {t(
                    `${part === "login" ? "Sign in" : "Register"} with GitHub`,
                  )}
                </Button>
              )}
              {isAppleSignInAvailable && (
                <button
                  type="button"
                  className={clsx("inverted", styles.appleButton)}
                  onClick={handleAppleSignIn}
                  data-testid="signInAppleButton"
                >
                  <FaApple size={16} />
                  {t(`${part === "login" ? "Sign in" : "Register"} with Apple`)}
                </button>
              )}

              {part === "register" ? (
                <div
                  style={{
                    display: "flex",
                    gap: ".3rem",
                  }}
                >
                  {/* <LogInIcon color="var(--accent-6)" size={16} />{" "}
                  <span>{t("Login")}</span> */}
                  <A
                    openInNewTab
                    href={`${FRONTEND_URL}/privacy`}
                    className="button small transparent"
                    onClick={(e) => {
                      if (e.metaKey || e.ctrlKey) {
                        return
                      }
                      // setPart(undefined)

                      // window.open(`${FRONTEND_URL}/privacy`, "_blank")
                    }}
                    rel="noreferrer"
                  >
                    <LinkIcon size={16} /> {t("Privacy")}
                  </A>
                  <Button
                    className="button small"
                    onClick={() => {
                      setPart("login")
                    }}
                  >
                    <LogInIcon size={16} /> {t("Login")}
                  </Button>
                </div>
              ) : (
                <Button
                  className="button small"
                  onClick={() => {
                    setPart("register")
                  }}
                >
                  <UserRoundPlus size={16} /> {t("Register")}
                </Button>
              )}
            </div>
          ) : (
            <form
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
              onSubmit={(e) => {
                e.preventDefault()
                handleLogin()
              }}
            >
              <div>
                <input
                  style={{
                    width: "100%",
                  }}
                  className={styles.input}
                  data-testid="sign-in-email"
                  type="email"
                  placeholder="Email"
                  aria-label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <input
                  style={{
                    width: "100%",
                  }}
                  className={styles.input}
                  value={password}
                  data-testid="sign-in-password"
                  type="password"
                  placeholder="Password"
                  aria-label="Password"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button
                style={{
                  width: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                data-testid="login-submit"
                {...(redirectUrl && { "data-redirect-url": redirectUrl })}
                type="submit"
                disabled={isSignInLoading}
                aria-busy={isSignInLoading}
              >
                {isSignInLoading ? "Loading..." : "Login"}
              </button>
            </form>
          )}
        </Modal>
      )}
    </>
  )
}
