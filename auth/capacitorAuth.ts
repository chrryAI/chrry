// Google Sign-In for Capacitor using @codetrix-studio/capacitor-google-auth
// This file is only imported when running on Capacitor (mobile)

import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth"

export interface AuthSignInResult {
  idToken: string
  user: {
    uid: string
    email: string | null
    displayName: string | null
    photoURL: string | null
  }
}

/**
 * Initialize Google Auth
 * Must be called before using any auth methods
 */
export async function initializeGoogleAuth() {
  try {
    await GoogleAuth.initialize()
  } catch (error) {
    console.error("Google Auth initialization error:", error)
    // Initialization errors are non-fatal, plugin will auto-initialize on first use
  }
}

/**
 * Sign in with Google
 * Returns Google ID token that should be exchanged with your backend
 */
export async function googleSignIn(): Promise<AuthSignInResult> {
  try {
    const result = await GoogleAuth.signIn()

    if (!result) {
      throw new Error("No result received from Google Sign-In")
    }

    if (!result.authentication?.idToken) {
      throw new Error("No ID token received from Google Sign-In")
    }

    return {
      idToken: result.authentication.idToken,
      user: {
        uid: result.id || "",
        email: result.email || null,
        displayName: result.name || null,
        photoURL: result.imageUrl || null,
      },
    }
  } catch (error) {
    console.error("Google Sign-In error:", error)
    throw new Error(
      error instanceof Error ? error.message : "Failed to sign in with Google",
    )
  }
}

/**
 * Sign in with Apple (placeholder - not implemented yet)
 */
export async function appleSignIn(): Promise<AuthSignInResult> {
  throw new Error("Apple Sign-In not yet implemented with new library")
}

/**
 * Sign out from Google
 */
export async function signOut(): Promise<void> {
  try {
    await GoogleAuth.signOut()
  } catch (error) {
    console.error("Sign-Out error:", error)
    throw new Error(
      error instanceof Error ? error.message : "Failed to sign out",
    )
  }
}
