// Dynamic import to avoid bundling in web builds
// This file is only imported when running on Capacitor (mobile)
let FirebaseAuthentication: any

async function getFirebaseAuth() {
  if (!FirebaseAuthentication) {
    const module = await import("@capacitor-firebase/authentication")
    FirebaseAuthentication = module.FirebaseAuthentication
  }
  return FirebaseAuthentication
}

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
 * Sign in with Google using Firebase Authentication
 * Returns Firebase ID token that should be exchanged with your backend
 */
export async function googleSignIn(): Promise<AuthSignInResult> {
  try {
    const auth = await getFirebaseAuth()
    const result = await auth.signInWithGoogle()

    if (!result.user) {
      throw new Error("No user data received from Google Sign-In")
    }

    // Get the Firebase ID token
    const idTokenResult = await auth.getIdToken()

    if (!idTokenResult.token) {
      throw new Error("Failed to get Firebase ID token")
    }

    return {
      idToken: idTokenResult.token,
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
 * Returns Firebase ID token that should be exchanged with your backend
 */
export async function appleSignIn(): Promise<AuthSignInResult> {
  try {
    const auth = await getFirebaseAuth()
    const result = await auth.signInWithApple()

    if (!result.user) {
      throw new Error("No user data received from Apple Sign-In")
    }

    // Get the Firebase ID token
    const idTokenResult = await auth.getIdToken()

    if (!idTokenResult.token) {
      throw new Error("Failed to get Firebase ID token")
    }

    return {
      idToken: idTokenResult.token,
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
 * Sign out from Firebase Authentication
 */
export async function signOut(): Promise<void> {
  try {
    const auth = await getFirebaseAuth()
    await auth.signOut()
  } catch (error) {
    console.error("Sign-Out error:", error)
    throw new Error(
      error instanceof Error ? error.message : "Failed to sign out",
    )
  }
}
