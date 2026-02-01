// Framework-agnostic auth types (compatible with next-auth and better-auth)
export interface SignInResponse {
  error?: string | null
  status?: number
  ok?: boolean
  url?: string | null
}
