import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "../db/client.js"
import * as schema from "../db/schema.js"

const backendUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000"
const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:5173"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  baseURL: backendUrl,
  trustedOrigins: [frontendUrl],
})
