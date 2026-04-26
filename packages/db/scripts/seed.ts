import { eq } from "drizzle-orm"
import { db } from "@workspace/db/client"
import {
  account,
  invitation,
  member,
  organization,
  session,
  task,
  user,
  verification,
} from "@workspace/db/schema"

const DEMO_USER = {
  id: "demo-user",
  name: "Demo User",
  email: "demo@example.com",
  image: "",
  emailVerified: true,
} as const

const DEMO_ORGANIZATION = {
  id: "demo-org",
  name: "Demo Workspace",
  slug: "demo-workspace",
} as const

const DEMO_TASKS = [
  {
    title: "Set up project board",
    description: "Create columns for backlog, in progress, and done.",
    status: "in_progress",
  },
  {
    title: "Write onboarding doc",
    description: "Explain local setup, scripts, and contribution flow.",
    status: "todo",
  },
  {
    title: "Implement auth guard",
    description: "Restrict protected routes to signed-in users only.",
    status: "done",
  },
  {
    title: "Polish task filters",
    description: "Allow filtering tasks by status and keyword.",
    status: "todo",
  },
] as const

async function seed() {
  console.log("Seeding database...")

  await db.transaction(async (tx) => {
    await tx.delete(task)
    await tx.delete(invitation)
    await tx.delete(member)
    await tx.delete(session)
    await tx.delete(account)
    await tx.delete(verification)
    await tx.delete(organization)
    await tx.delete(user)

    await tx
      .insert(user)
      .values(DEMO_USER)
      .onConflictDoUpdate({
        target: user.id,
        set: {
          name: DEMO_USER.name,
          email: DEMO_USER.email,
          image: DEMO_USER.image,
          emailVerified: DEMO_USER.emailVerified,
          updatedAt: new Date(),
        },
      })

    await tx.insert(organization).values({
      id: DEMO_ORGANIZATION.id,
      name: DEMO_ORGANIZATION.name,
      slug: DEMO_ORGANIZATION.slug,
      logo: null,
      createdAt: new Date(),
      metadata: null,
    })

    await tx.insert(member).values({
      id: crypto.randomUUID(),
      organizationId: DEMO_ORGANIZATION.id,
      userId: DEMO_USER.id,
      role: "owner",
      createdAt: new Date(),
    })

    await tx.insert(task).values(
      DEMO_TASKS.map((demoTask) => ({
        id: crypto.randomUUID(),
        title: demoTask.title,
        description: demoTask.description,
        status: demoTask.status,
        organizationId: DEMO_ORGANIZATION.id,
      }))
    )

    await tx
      .update(session)
      .set({
        activeOrganizationId: DEMO_ORGANIZATION.id,
      })
      .where(eq(session.userId, DEMO_USER.id))
  })

  console.log(
    `Seed complete: created demo user (${DEMO_USER.email}), organization (${DEMO_ORGANIZATION.slug}), and ${DEMO_TASKS.length} tasks.`
  )
}

seed().catch((error) => {
  console.error("Seed failed")
  console.error(error)
  process.exit(1)
})
