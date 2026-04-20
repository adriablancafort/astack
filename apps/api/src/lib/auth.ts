import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "../db/client.js"
import * as schema from "../db/schema.js"
import { env } from "../lib/env.js"

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
