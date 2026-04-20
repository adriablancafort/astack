import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "@/db/client"
import * as schema from "@/db/schema"
import { env } from "@/lib/env"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  baseURL: env.API_URL,
  trustedOrigins: [env.FRONTEND_URL],
})
