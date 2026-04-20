import { createAuthClient } from "better-auth/react"
import { env } from "@/lib/env"

export const authClient = createAuthClient({
  baseURL: env.API_URL,
})

export const {
  signIn,
  signOut,
  signUp,
  resetPassword,
  requestPasswordReset,
  useSession,
} = authClient
