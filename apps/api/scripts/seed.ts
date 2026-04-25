import { eq } from "drizzle-orm"
import { db } from "@/db/client"
import { task, user } from "@/db/schema"

const DEMO_USER = {
  id: "demo-user",
  name: "Demo User",
  email: "demo@example.com",
  image: "",
  emailVerified: true,
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

    await tx.delete(task).where(eq(task.userId, DEMO_USER.id))

    await tx.insert(task).values(
      DEMO_TASKS.map((demoTask) => ({
        id: crypto.randomUUID(),
        title: demoTask.title,
        description: demoTask.description,
        status: demoTask.status,
        userId: DEMO_USER.id,
      }))
    )
  })

  console.log(
    `Seed complete: created demo user (${DEMO_USER.email}) and ${DEMO_TASKS.length} tasks.`
  )
}

seed().catch((error) => {
  console.error("Seed failed")
  console.error(error)
  process.exit(1)
})
