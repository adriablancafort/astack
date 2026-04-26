import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { organization } from "better-auth/plugins"
import { db } from "@workspace/db/client"
import * as schema from "@workspace/db/schema"
import { databaseHooks } from "@/lib/auth/database-hooks"
import { env } from "@/lib/env"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  databaseHooks,
  baseURL: env.API_URL,
  trustedOrigins: [env.FRONTEND_URL],
  plugins: [organization()],
})
