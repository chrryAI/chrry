/**
 * Better Auth Client Wrapper
 *
 * Provides a signInContext interface that matches your existing NextAuth setup
 * but uses Better Auth under the hood
 */

export const createBetterAuthClient = (API_URL: string) => {
  /**
   * Sign in with OAuth or credentials
   * Matches your existing signInContext interface
   */
  const signIn = async (
    provider: "google" | "apple" | "credentials",
    options: {
      email?: string
      password?: string
      redirect?: boolean
      callbackUrl: string
      errorUrl?: string
      blankTarget?: boolean
    },
  ) => {
    try {
      if (provider === "credentials") {
        // Email/password sign in
        const response = await fetch(`${API_URL}/auth/sign-in/email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: options.email,
            password: options.password,
          }),
          credentials: "include", // Important for cookies
        })

        if (!response.ok) {
          throw new Error("Sign in failed")
        }

        const data = await response.json()

        // Redirect if requested
        if (options.redirect !== false) {
          window.location.href = options.callbackUrl
        }

        return data
      } else {
        // OAuth sign in (Google, Apple)
        const params = new URLSearchParams({
          callbackURL: options.callbackUrl,
        })

        if (options.errorUrl) {
          params.set("errorCallbackURL", options.errorUrl)
        }

        // Redirect to OAuth provider
        const authUrl = `${API_URL}/auth/sign-in/${provider}?${params.toString()}`

        if (options.blankTarget) {
          window.open(authUrl, "_blank")
        } else {
          window.location.href = authUrl
        }
      }
    } catch (error) {
      console.error("Sign in error:", error)
      if (options.redirect !== false && options.errorUrl) {
        window.location.href = options.errorUrl
      }
      throw error
    }
  }

  /**
   * Sign out
   */
  const signOut = async (options: {
    callbackUrl: string
    errorUrl?: string
  }) => {
    try {
      const response = await fetch(`${API_URL}/auth/sign-out`, {
        method: "POST",
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Sign out failed")
      }

      // Redirect to callback URL
      window.location.href = options.callbackUrl
    } catch (error) {
      console.error("Sign out error:", error)
      if (options.errorUrl) {
        window.location.href = options.errorUrl
      }
      throw error
    }
  }

  /**
   * Get current session
   */
  const getSession = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/session`, {
        credentials: "include",
      })

      if (!response.ok) {
        return null
      }

      return await response.json()
    } catch (error) {
      console.error("Get session error:", error)
      return null
    }
  }

  return {
    signIn,
    signOut,
    getSession,
  }
}

// Export type for the client
export type BetterAuthClient = ReturnType<typeof createBetterAuthClient>
