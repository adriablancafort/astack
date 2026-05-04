import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { organization } from "better-auth/plugins"
import { eq } from "drizzle-orm"
import { db } from "@workspace/db/client"
import * as schema from "@workspace/db/schema"
import { member } from "@workspace/db/schema"
import { env } from "@/lib/env"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    async sendResetPassword(data) {
      console.log("send-reset-password-email", {
        to: data.user.email,
        name: data.user.name,
        url: data.url,
      })
    },
  },
  user: {
    deleteUser: {
      enabled: true,
    },
  },
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const [organization] = await db
            .select({ id: member.organizationId })
            .from(member)
            .where(eq(member.userId, session.userId))
            .limit(1)

          return {
            data: {
              ...session,
              activeOrganizationId: organization?.id,
            },
          }
        },
      },
    },
  },
  telemetry: {
    enabled: false,
  },
  baseURL: env.API_URL,
  trustedOrigins: [env.FRONTEND_URL],
  plugins: [organization()],
})
