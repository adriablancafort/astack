import { and, desc, eq } from "drizzle-orm"
import { Hono } from "hono"

import { db } from "@workspace/db/client"
import { task } from "@workspace/db/schema"
import {
  createTaskRequestSchema,
  taskIdParamRequestSchema,
  updateTaskRequestSchema,
} from "@workspace/shared/api/tasks/schemas"
import type {
  DeleteTaskResponse,
  ListTasksResponse,
  Task,
  TaskResponse,
} from "@workspace/shared/api/tasks/types"
import { requireOrganization } from "@/lib/organization"
import { validator } from "@/lib/validator"

export const tasks = new Hono()

function toTask(row: typeof task.$inferSelect): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

function toNullableDescription(value: string | undefined) {
  if (value === undefined) {
    return undefined
  }

  return value.length > 0 ? value : null
}

tasks.get("/", requireOrganization, async (c) => {
  const organizationId = c.get("organizationId")

  const records = await db
    .select()
    .from(task)
    .where(eq(task.organizationId, organizationId))
    .orderBy(desc(task.createdAt))

  return c.json({ tasks: records.map(toTask) } satisfies ListTasksResponse)
})

tasks.post(
  "/",
  requireOrganization,
  validator("json", createTaskRequestSchema),
  async (c) => {
    const organizationId = c.get("organizationId")
    const payload = c.req.valid("json")

    const [createdTask] = await db
      .insert(task)
      .values({
        id: crypto.randomUUID(),
        title: payload.title,
        description: toNullableDescription(payload.description),
        status: payload.status,
        organizationId,
      })
      .returning()

    return c.json({ task: toTask(createdTask) } satisfies TaskResponse, 201)
  }
)

tasks.patch(
  "/:taskId",
  requireOrganization,
  validator("param", taskIdParamRequestSchema),
  validator("json", updateTaskRequestSchema),
  async (c) => {
    const organizationId = c.get("organizationId")
    const params = c.req.valid("param")
    const payload = c.req.valid("json")

    const updateValues: Partial<typeof task.$inferInsert> = {}

    if (payload.title !== undefined) {
      updateValues.title = payload.title
    }

    if (payload.description !== undefined) {
      updateValues.description = toNullableDescription(payload.description)
    }

    if (payload.status !== undefined) {
      updateValues.status = payload.status
    }

    const [updatedTask] = await db
      .update(task)
      .set(updateValues)
      .where(
        and(eq(task.id, params.taskId), eq(task.organizationId, organizationId))
      )
      .returning()

    if (!updatedTask) {
      return c.json({ error: "Task not found" }, 404)
    }

    return c.json({ task: toTask(updatedTask) } satisfies TaskResponse)
  }
)

tasks.delete(
  "/:taskId",
  requireOrganization,
  validator("param", taskIdParamRequestSchema),
  async (c) => {
    const organizationId = c.get("organizationId")
    const params = c.req.valid("param")

    const [deletedTask] = await db
      .delete(task)
      .where(
        and(eq(task.id, params.taskId), eq(task.organizationId, organizationId))
      )
      .returning({ id: task.id })

    if (!deletedTask) {
      return c.json({ error: "Task not found" }, 404)
    }

    return c.json({ success: true } satisfies DeleteTaskResponse)
  }
)
