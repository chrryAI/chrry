import React, { useState } from "react"
import { FaGithub } from "react-icons/fa"
import { useAuth } from "./context/providers"
import toast from "react-hot-toast"
import clsx from "clsx"

interface GitHubConnectButtonProps {
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
  buttonText?: string
  className?: string
  size?: number
  variant?: "default" | "small" | "large"
}

/**
 * Reusable GitHub Connect Button
 * Can be used in Sushi, Focus, or any other app that needs GitHub OAuth
 */
export default function GitHubConnectButton({
  onSuccess,
  onError,
  buttonText = "Connect with GitHub",
  className,
  size = 20,
  variant = "default",
}: GitHubConnectButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { user, FRONTEND_URL } = useAuth()

  const handleConnect = async () => {
    setIsLoading(true)

    try {
      // Build callback URLs
      const successUrl = new URL(window.location.href)
      successUrl.searchParams.set("github_connected", "true")

      const errorUrl = new URL(window.location.href)
      errorUrl.searchParams.set("github_error", "true")

      // Redirect to GitHub OAuth
      const url = new URL(`${FRONTEND_URL}/api/auth/signin/github`)
      url.searchParams.set("callbackUrl", successUrl.toString())
      url.searchParams.set("errorUrl", errorUrl.toString())

      window.location.href = url.toString()
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to connect with GitHub"
      toast.error(errorMessage)
      onError?.(errorMessage)
      setIsLoading(false)
    }
  }

  // Check for connection success/error in URL params
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)

    if (urlParams.get("github_connected") === "true") {
      toast.success("Successfully connected with GitHub!")
      onSuccess?.({ connected: true })

      // Clean up URL
      urlParams.delete("github_connected")
      const newUrl = urlParams.toString()
        ? `${window.location.pathname}?${urlParams.toString()}`
        : window.location.pathname
      window.history.replaceState({}, "", newUrl)
    }

    if (urlParams.get("github_error") === "true") {
      toast.error("Failed to connect with GitHub")
      onError?.("GitHub connection failed")

      // Clean up URL
      urlParams.delete("github_error")
      const newUrl = urlParams.toString()
        ? `${window.location.pathname}?${urlParams.toString()}`
        : window.location.pathname
      window.history.replaceState({}, "", newUrl)
    }
  }, [])

  const buttonClasses = clsx(
    "button",
    {
      small: variant === "small",
      large: variant === "large",
    },
    className,
  )

  return (
    <button
      onClick={handleConnect}
      disabled={isLoading}
      className={buttonClasses}
      data-testid="github-connect-button"
    >
      <FaGithub size={size} />
      <span>{isLoading ? "Connecting..." : buttonText}</span>
    </button>
  )
}
