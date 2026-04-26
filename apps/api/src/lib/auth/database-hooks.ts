import type { BetterAuthOptions } from "better-auth"
import { eq } from "drizzle-orm"
import { db } from "@workspace/db/client"
import { member } from "@workspace/db/schema"

export const databaseHooks: BetterAuthOptions["databaseHooks"] = {
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
}
