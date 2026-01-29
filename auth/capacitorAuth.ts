// Firebase Authentication for Capacitor
// This file is only imported when running on Capacitor (mobile)

import { FirebaseAuthentication } from "@capacitor-firebase/authentication"

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
 * Initialize Firebase Auth
 * Must be called before using any auth methods
 */
export async function initializeGoogleAuth() {
  // Firebase Auth auto-initializes via native config
  console.log("Firebase Auth initialized")
  try {
    await FirebaseAuthentication.setLanguageCode({ languageCode: "en-US" })
  } catch (e) {
    console.error("Failed to set language code", e)
  }
}

/**
 * Sign in with Google using Firebase Authentication
 * Returns Firebase ID token that should be exchanged with your backend
 */
export async function googleSignIn(): Promise<AuthSignInResult> {
  try {
    const result = await FirebaseAuthentication.signInWithGoogle()

    if (!result.user) {
      throw new Error("No user received from Google Sign-In")
    }

    // Get ID token
    const tokenResult = await FirebaseAuthentication.getIdToken()

    if (!tokenResult.token) {
      throw new Error("No ID token received from Firebase")
    }

    return {
      idToken: tokenResult.token,
      user: {
        uid: result.user.uid,
        email: result.user.email || null,
        displayName: result.user.displayName || null,
        photoURL: result.user.photoUrl || null,
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
 * Sign in with Apple using Firebase Authentication
 */
export async function appleSignIn(): Promise<AuthSignInResult> {
  try {
    const result = await FirebaseAuthentication.signInWithApple()

    if (!result.user) {
      throw new Error("No user received from Apple Sign-In")
    }

    // Get ID token
    const tokenResult = await FirebaseAuthentication.getIdToken()

    if (!tokenResult.token) {
      throw new Error("No ID token received from Firebase")
    }

    return {
      idToken: tokenResult.token,
      user: {
        uid: result.user.uid,
        email: result.user.email || null,
        displayName: result.user.displayName || null,
        photoURL: result.user.photoUrl || null,
      },
    }
  } catch (error) {
    console.error("Apple Sign-In error:", error)
    throw new Error(
      error instanceof Error ? error.message : "Failed to sign in with Apple",
    )
  }
}

/**
 * Sign out from Firebase
 */
export async function signOut(): Promise<void> {
  try {
    await FirebaseAuthentication.signOut()
  } catch (error) {
    console.error("Sign-Out error:", error)
    throw new Error(
      error instanceof Error ? error.message : "Failed to sign out",
    )
  }
}
