// import { StyleSheet } from "react-native"

// // Helper to safely access the ID token from Google Sign-In response
// function getIdTokenFromResponse(response: any): string | null {
//   // Different ways the token might be available in the response
//   if (response && typeof response.idToken === "string") {
//     return response.idToken
//   }

//   // For iOS, the token might be in serverAuthCode
//   if (response && response.serverAuthCode) {
//     return response.serverAuthCode
//   }

//   // For some configurations, it might be in user.idToken
//   if (response && response.user && typeof response.user.idToken === "string") {
//     return response.user.idToken
//   }

//   return null
// }

// export default function SignIn() {
//   // const [error, setError] = useState("")
//   // const [googleLoading, setGoogleLoading] = useState(false)
//   // const [appleLoading, setAppleLoading] = useState(false)
//   // const [appleAvailable, setAppleAvailable] = useState(false)
//   // const [isRegistering, setIsRegistering] = useState(false)
//   // const { os } = usePlatform()

//   // const { user, token } = useAuth()
//   // const { colors, isDark } = useTheme()

//   // // Get environment variables from utils
//   // const API_URL = process.env.VITE_API_URL || ""
//   // const SIGN_IN_URL = `${API_URL}/signIn`
//   // const GOOGLE_WEB_CLIENT_ID =
//   //   process.env.VITE_GOOGLE_WEB_CLIENT_ID || ""
//   // const GOOGLE_IOS_CLIENT_ID =
//   //   process.env.VITE_GOOGLE_IOS_CLIENT_ID || ""

//   // // Configure Google Sign-In
//   // useEffect(() => {
//   //   console.log("Configuring Google Sign-In with:", {
//   //     webClientId: GOOGLE_WEB_CLIENT_ID,
//   //     iosClientId: os === "ios" ? GOOGLE_IOS_CLIENT_ID : undefined,
//   //     platform: os,
//   //   })

//   //    if (GoogleSignin) {
//   //     GoogleSignin.configure({
//   //       webClientId: GOOGLE_WEB_CLIENT_ID,
//   //       iosClientId: os === "ios" ? GOOGLE_IOS_CLIENT_ID : undefined,
//   //       scopes: ["profile", "email"],
//   //       offlineAccess: true,
//   //     })
//   //   } else {
//   //     console.warn("GoogleSignin is undefined")
//   //   }

//   //   // Check if Apple Authentication is available on this device
//   //   if (os === "ios") {
//   //     setAppleAvailable(appleAuth.isSupported)
//   //     console.log("Apple Authentication available:", appleAuth.isSupported)
//   //   }
//   // }, [])

//   // // Toggle between register and sign-in modes
//   // const toggleMode = () => {
//   //   setIsRegistering(!isRegistering)
//   //   setError("")
//   // }

//   // // Handle Google Sign-In
//   // const handleGoogleSignIn = async () => {
//   //   setError("")
//   //   setGoogleLoading(true)

//   //   try {
//   //     // Check if Google Play Services are available
//   //     await GoogleSignin.hasPlayServices()

//   //     // Sign in with Google
//   //     const userInfo = await GoogleSignin.signIn()

//   //     // Get ID token from the response
//   //     const idToken = getIdTokenFromResponse(userInfo)

//   //     // Check if we have a valid token
//   //     if (!idToken) {
//   //       // Try to get the token from current user as fallback
//   //       const currentUser = await GoogleSignin.getCurrentUser()

//   //       const fallbackToken = getIdTokenFromResponse(currentUser)
//   //       if (!fallbackToken) {
//   //         throw new Error("Failed to get ID token from Google")
//   //       }

//   //       handleGoogleSignInSuccess(fallbackToken)
//   //       return
//   //     }

//   //     handleGoogleSignInSuccess(idToken)
//   //   } catch (error: any) {
//   //     if (error.code === statusCodes.SIGN_IN_CANCELLED) {
//   //       console.log("User cancelled sign-in")
//   //     } else if (error.code === statusCodes.IN_PROGRESS) {
//   //       console.log("Sign-in already in progress")
//   //     } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
//   //       setError("Google Play Services not available or outdated")
//   //     } else {
//   //       console.error(new Error("Google Sign-In Error:"), error)
//   //       setError(
//   //         `Google sign-in failed: ${error.message || JSON.stringify(error)}`,
//   //       )
//   //     }

//   //     setGoogleLoading(false)
//   //   }
//   // }

//   // // Handle Apple Sign-In
//   // const handleAppleSignIn = async () => {
//   //   try {
//   //     setAppleLoading(true)
//   //     setError("")

//   //     console.log("Starting Apple Sign In process")

//   //     if (!appleAuth.isSupported) {
//   //       setError("Apple Sign In is not available on this device")
//   //       setAppleLoading(false)
//   //       return
//   //     }

//   //     // Perform the sign-in request
//   //     const appleAuthRequestResponse = await appleAuth.performRequest({
//   //       requestedOperation: appleAuth.Operation.LOGIN,
//   //       requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
//   //     })

//   //     // Get the credential state
//   //     const credentialState = await appleAuth.getCredentialStateForUser(
//   //       appleAuthRequestResponse.user,
//   //     )

//   //     // Check if the credential is authorized
//   //     if (credentialState === appleAuth.State.AUTHORIZED) {
//   //       console.log("Apple Sign In credential received")
//   //       await handleAppleSignInSuccess(appleAuthRequestResponse)
//   //     } else {
//   //       setError("Apple Sign In was not authorized")
//   //       setAppleLoading(false)
//   //     }
//   //   } catch (error: any) {
//   //     console.error(new Error("Apple Sign-In Error:"), error)

//   //     if (error.code === appleAuth.Error.CANCELED) {
//   //       console.log("User cancelled Apple sign-in")
//   //     } else {
//   //       setError(
//   //         `Apple sign-in failed: ${error.message || JSON.stringify(error)}`,
//   //       )
//   //     }

//   //     setAppleLoading(false)
//   //   }
//   // }

//   // // Process Apple credentials and authenticate with backend
//   // const handleAppleSignInSuccess = async (
//   //   credential: any, // AppleAuthRequestResponse from @invertase/react-native-apple-authentication
//   // ) => {
//   //   try {
//   //     let appleSub: string | undefined
//   //     if (credential.identityToken) {
//   //       try {
//   //         const decoded: any = jwtDecode(credential.identityToken)
//   //         appleSub = decoded.sub
//   //       } catch (e) {
//   //         console.error(new Error("Failed to decode Apple identityToken:"), e)
//   //       }
//   //     }

//   //     const response = await fetch(`${SIGN_IN_URL}/apple`, {
//   //       method: "POST",
//   //       headers: {
//   //         "Content-Type": "application/json",
//   //         Authorization: `Bearer ${token}`,
//   //       },
//   //       body: JSON.stringify({
//   //         identityToken: credential.identityToken,
//   //         user: {
//   //           name: credential.fullName
//   //             ? `${credential.fullName.givenName || ""} ${credential.fullName.familyName || ""}`.trim()
//   //             : undefined,
//   //           email: credential.email,
//   //         },
//   //         appleId: appleSub,
//   //       }),
//   //     })

//   //     if (!response.ok) {
//   //       const errorData = await response.json()
//   //       console.error(new Error("Apple sign-in API error:"), errorData)
//   //       setError(errorData.error || "Authentication failed")
//   //       setAppleLoading(false)
//   //       return
//   //     }

//   //     const data = await response.json()

//   //     if (!data.token) {
//   //       setError("Invalid authentication response")
//   //       setAppleLoading(false)
//   //       return
//   //     }

//   //     // TODO: Call your signIn function from AppContext
//   //     // await signIn(data.user, data.token)
//   //     setAppleLoading(false)
//   //   } catch (err) {
//   //     console.error(new Error("Apple auth backend error:"), err)
//   //     setError("Network error during authentication")
//   //     setAppleLoading(false)
//   //   }
//   // }

//   // // Process Google ID token and authenticate with backend
//   // const handleGoogleSignInSuccess = async (idToken: string) => {
//   //   try {
//   //     const response = await fetch(`${SIGN_IN_URL}/google`, {
//   //       method: "POST",
//   //       headers: {
//   //         "Content-Type": "application/json",
//   //         Authorization: `Bearer ${token}`,
//   //       },
//   //       body: JSON.stringify({
//   //         idToken: idToken,
//   //       }),
//   //     })

//   //     if (!response.ok) {
//   //       const errorData = await response.json()
//   //       setError(errorData.message || "Authentication failed")
//   //       setGoogleLoading(false)
//   //       return
//   //     }

//   //     const data = await response.json()
//   //     if (!data.token) {
//   //       setError("Invalid authentication")
//   //       setGoogleLoading(false)
//   //       return
//   //     }

//   //     // TODO: Call your signIn function from AppContext
//   //     // await signIn(data.user, data.token)
//   //     setGoogleLoading(false)
//   //   } catch (err) {
//   //     console.error(new Error("Google auth backend error:"), err)
//   //     setError("Network error during authentication")
//   //     setGoogleLoading(false)
//   //   }
//   // }

//   // // If user is already signed in, don't show the sign-in screen
//   // if (user) {
//   //   return null
//   // }

//   return null

//   // return (
//   //   <Div>
//   //     <Div>
//   //       <Div>Chrrr 🍒</Div>
//   //       <Div>
//   //         ⏳ The mindful productivity app combining focus timers with mood 🌱
//   //       </Div>

//   //       <Div>
//   //         <Button
//   //           data-testid={
//   //             isRegistering ? "register-google-button" : "sign-in-google-button"
//   //           }
//   //           onClick={handleGoogleSignIn}
//   //           disabled={googleLoading || appleLoading}
//   //         >
//   //           {isRegistering ? "Register with Google" : "Sign in with Google"}
//   //         </Button>

//   //         {os === "ios" && appleAvailable && (
//   //           <Button
//   //             data-testid={
//   //               isRegistering ? "register-apple-button" : "sign-in-apple-button"
//   //             }
//   //             // style={[
//   //             //   styles.button,
//   //             //   styles.appleButton,
//   //             //   (googleLoading || appleLoading) && styles.buttonDisabled,
//   //             // ]}
//   //             onClick={handleAppleSignIn}
//   //             disabled={googleLoading || appleLoading}
//   //           >
//   //             {isRegistering ? "Register with Apple" : "Sign in with Apple"}
//   //           </Button>
//   //         )}

//   //         <Button data-testid="sign-in-switch-mode" onClick={toggleMode}>
//   //           {isRegistering
//   //             ? "Already have an account? Sign In"
//   //             : "Don't have an account? Register"}
//   //         </Button>
//   //       </Div>

//   //       {error && <Span data-testid="error">{error}</Span>}
//   //     </Div>
//   //   </Div>
//   // )
// }

// const getStyles = (colors: any, isDarkMode: boolean) =>
//   StyleSheet.create({
//     container: {
//       flex: 1,
//       padding: 24,
//       backgroundColor: colors.background,
//     },
//     wrapper: {
//       flex: 1,
//       paddingTop: 100,
//     },
//     description: {
//       color: colors.foreground,
//       alignSelf: "center",
//       marginTop: 10,
//       textAlign: "center",
//       fontSize: 13,
//       maxWidth: "70%",
//       lineHeight: 16,
//     },
//     title: {
//       fontSize: 24,
//       display: "flex",
//       alignItems: "center",
//       flexDirection: "row",
//       alignSelf: "center",
//       gap: 7,
//     },
//     buttonsContainer: {
//       marginTop: 50,
//       gap: 15,
//       alignItems: "center",
//     },
//     button: {
//       paddingVertical: 12,
//       paddingHorizontal: 24,
//       borderRadius: 8,
//       minWidth: 250,
//       alignItems: "center",
//     },
//     buttonDisabled: {
//       opacity: 0.5,
//     },
//     googleButton: {
//       backgroundColor: isDarkMode ? "#fff" : colors.shade8,
//     },
//     googleButtonText: {
//       color: isDarkMode ? "#000" : "#fff",
//       fontSize: 16,
//       fontWeight: "500",
//     },
//     appleButton: {
//       backgroundColor: isDarkMode ? "#fff" : colors.shade8,
//     },
//     appleButtonText: {
//       color: isDarkMode ? "#000" : "#fff",
//       fontSize: 16,
//       fontWeight: "500",
//     },
//     switchModeButton: {
//       marginTop: 20,
//     },
//     switchModeText: {
//       color: colors.accent6,
//       fontSize: 14,
//       textAlign: "center",
//     },
//     error: {
//       color: colors.accent0,
//       marginVertical: 8,
//       textAlign: "center",
//       marginTop: 20,
//     },
//   })
