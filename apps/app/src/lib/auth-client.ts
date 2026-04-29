import { organizationClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"
import { env } from "@/lib/env"

export const authClient = createAuthClient({
  baseURL: env.API_URL,
  plugins: [organizationClient()],
})

export const {
  changeEmail,
  changePassword,
  deleteUser,
  listAccounts,
  unlinkAccount,
  signIn,
  signOut,
  signUp,
  resetPassword,
  requestPasswordReset,
  updateUser,
  useSession,
  organization,
  useActiveOrganization,
  useListOrganizations,
} = authClient
