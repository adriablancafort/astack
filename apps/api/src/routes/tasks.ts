import { and, desc, eq } from "drizzle-orm"
import { Hono } from "hono"

import { db } from "@workspace/db/client"
import { task } from "@workspace/db/schema/tasks"
import {
  createTaskRequestSchema,
  nullableDescription,
  taskIdParamsSchema,
  updateTaskRequestSchema,
} from "@workspace/shared/api/tasks/schemas"
import type {
  TaskListResponse,
  TaskResponse,
} from "@workspace/shared/api/tasks/types"
import { requireOrganization } from "@/lib/auth/organization"
import { requirePermission } from "@/lib/auth/permissions"
import { validator } from "@/lib/validator"

export const taskRoutes = new Hono()

taskRoutes.get("/", requireOrganization, async (c) => {
  const organizationId = c.get("organizationId")

  try {
    const tasks = await db
      .select()
      .from(task)
      .where(eq(task.organizationId, organizationId))
      .orderBy(desc(task.createdAt))

    return c.json(tasks satisfies TaskListResponse)
  } catch {
    return c.json({ error: "Failed to load tasks" }, 500)
  }
})

taskRoutes.post(
  "/",
  requireOrganization,
  requirePermission({ todo: ["create"] }),
  validator("json", createTaskRequestSchema),
  async (c) => {
    const organizationId = c.get("organizationId")

    try {
      const payload = c.req.valid("json")

      const [createdTask] = await db
        .insert(task)
        .values({
          id: crypto.randomUUID(),
          organizationId,
          title: payload.title,
          description: nullableDescription(payload.description),
          status: payload.status,
        })
        .returning()

      return c.json(createdTask satisfies TaskResponse, 201)
    } catch {
      return c.json({ error: "Failed to create task" }, 500)
    }
  }
)

taskRoutes.patch(
  "/:id",
  requireOrganization,
  requirePermission({ todo: ["update"] }),
  validator("param", taskIdParamsSchema),
  validator("json", updateTaskRequestSchema),
  async (c) => {
    const organizationId = c.get("organizationId")
    const { id } = c.req.valid("param")

    try {
      const { description, ...rest } = c.req.valid("json")

      const [updatedTask] = await db
        .update(task)
        .set({
          ...rest,
          ...(description !== undefined && {
            description: nullableDescription(description),
          }),
          updatedAt: new Date(),
        })
        .where(and(eq(task.id, id), eq(task.organizationId, organizationId)))
        .returning()

      if (!updatedTask) {
        return c.json({ error: "Task not found" }, 404)
      }

      return c.json(updatedTask satisfies TaskResponse)
    } catch {
      return c.json({ error: "Failed to update task" }, 500)
    }
  }
)

taskRoutes.delete(
  "/:id",
  requireOrganization,
  requirePermission({ todo: ["delete"] }),
  validator("param", taskIdParamsSchema),
  async (c) => {
    const organizationId = c.get("organizationId")
    const { id } = c.req.valid("param")

    try {
      const [deletedTask] = await db
        .delete(task)
        .where(and(eq(task.id, id), eq(task.organizationId, organizationId)))
        .returning()

      if (!deletedTask) {
        return c.json({ error: "Task not found" }, 404)
      }

      return c.json(deletedTask satisfies TaskResponse)
    } catch {
      return c.json({ error: "Failed to delete task" }, 500)
    }
  }
)
