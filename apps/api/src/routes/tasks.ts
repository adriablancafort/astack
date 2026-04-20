import { and, desc, eq } from "drizzle-orm"
import { Hono } from "hono"
import {
  createTaskInputSchema,
  deleteTaskResponseSchema,
  listTasksResponseSchema,
  taskParamsSchema,
  taskResponseSchema,
  updateTaskInputSchema,
} from "@workspace/shared/api/tasks"
import { db } from "@/db/client"
import { task } from "@/db/schema"
import { auth } from "@/lib/auth"

export const tasks = new Hono()

function toTaskResponse(row: typeof task.$inferSelect) {
  return taskResponseSchema.shape.task.parse({
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  })
}

function toNullableDescription(value: string | undefined) {
  if (value === undefined) {
    return undefined
  }

  return value.length > 0 ? value : null
}

async function getUserId(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  return session?.user.id ?? null
}

tasks.get("/", async (c) => {
  const userId = await getUserId(c.req.raw)

  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401)
  }

  const records = await db
    .select()
    .from(task)
    .where(eq(task.userId, userId))
    .orderBy(desc(task.createdAt))

  return c.json(
    listTasksResponseSchema.parse({
      tasks: records.map(toTaskResponse),
    })
  )
})

tasks.post("/", async (c) => {
  const userId = await getUserId(c.req.raw)

  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401)
  }

  const payload = await c.req.json().catch(() => null)
  const parsed = createTaskInputSchema.safeParse(payload)

  if (!parsed.success) {
    return c.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid task" },
      400
    )
  }

  const [createdTask] = await db
    .insert(task)
    .values({
      id: crypto.randomUUID(),
      title: parsed.data.title,
      description: toNullableDescription(parsed.data.description),
      status: parsed.data.status,
      userId,
    })
    .returning()

  return c.json(
    taskResponseSchema.parse({ task: toTaskResponse(createdTask) }),
    201
  )
})

tasks.patch("/:taskId", async (c) => {
  const userId = await getUserId(c.req.raw)

  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401)
  }

  const params = taskParamsSchema.safeParse(c.req.param())

  if (!params.success) {
    return c.json(
      { error: params.error.issues[0]?.message ?? "Invalid task id" },
      400
    )
  }

  const payload = await c.req.json().catch(() => null)
  const parsed = updateTaskInputSchema.safeParse(payload)

  if (!parsed.success) {
    return c.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid task" },
      400
    )
  }

  const updateValues: Partial<typeof task.$inferInsert> = {}

  if (parsed.data.title !== undefined) {
    updateValues.title = parsed.data.title
  }

  if (parsed.data.description !== undefined) {
    updateValues.description = toNullableDescription(parsed.data.description)
  }

  if (parsed.data.status !== undefined) {
    updateValues.status = parsed.data.status
  }

  const [updatedTask] = await db
    .update(task)
    .set(updateValues)
    .where(and(eq(task.id, params.data.taskId), eq(task.userId, userId)))
    .returning()

  if (!updatedTask) {
    return c.json({ error: "Task not found" }, 404)
  }

  return c.json(taskResponseSchema.parse({ task: toTaskResponse(updatedTask) }))
})

tasks.delete("/:taskId", async (c) => {
  const userId = await getUserId(c.req.raw)

  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401)
  }

  const params = taskParamsSchema.safeParse(c.req.param())

  if (!params.success) {
    return c.json(
      { error: params.error.issues[0]?.message ?? "Invalid task id" },
      400
    )
  }

  const [deletedTask] = await db
    .delete(task)
    .where(and(eq(task.id, params.data.taskId), eq(task.userId, userId)))
    .returning({ id: task.id })

  if (!deletedTask) {
    return c.json({ error: "Task not found" }, 404)
  }

  return c.json(deleteTaskResponseSchema.parse({ success: true }))
})
