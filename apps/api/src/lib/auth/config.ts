import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { lastLoginMethod, organization } from "better-auth/plugins"

import { db } from "@workspace/db/client"
import * as schema from "@workspace/db/schema/auth"
import { ac, owner } from "@workspace/shared/auth/roles"
import type {
  SendOrganizationInvitationPayload,
  SendResetPasswordPayload,
} from "@workspace/shared/jobs/emails/types"
import { seedOrganizationRoles } from "@/lib/auth/organization-roles"
import { env } from "@/lib/env"
import { emailsQueue } from "@/lib/queues"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  user: {
    deleteUser: {
      enabled: true,
    },
  },
  emailAndPassword: {
    enabled: true,
    async sendResetPassword(data) {
      await emailsQueue.add("send-reset-password", {
        to: data.user.email,
        name: data.user.name,
        url: data.url,
      } satisfies SendResetPasswordPayload)
    },
  },
  plugins: [
    organization({
      ac,
      creatorRole: "owner",
      roles: {
        owner,
      },
      schema: {
        organizationRole: {
          additionalFields: {
            displayName: {
              type: "string",
              required: true,
            },
          },
        },
      },
      dynamicAccessControl: {
        enabled: true,
      },
      async sendInvitationEmail(data) {
        const inviteLink = `${env.FRONTEND_URL}/join-organization?invitationId=${data.id}&email=${encodeURIComponent(data.email)}`

        await emailsQueue.add("send-organization-invitation", {
          to: data.email,
          url: inviteLink,
          organizationName: data.organization.name,
        } satisfies SendOrganizationInvitationPayload)
      },
      organizationHooks: {
        async afterCreateOrganization({ organization: org }) {
          await seedOrganizationRoles(org.id)
        },
      },
    }),
    lastLoginMethod({
      storeInDatabase: true,
    }),
  ],
  telemetry: {
    enabled: false,
  },
  baseURL: env.API_URL,
  trustedOrigins: [env.FRONTEND_URL],
  secret: env.BETTER_AUTH_SECRET,
})
