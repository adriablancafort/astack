import type { z } from "zod"

import {
  createTaskRequestSchema,
  taskIdParamsSchema,
  updateTaskRequestSchema,
} from "./schemas"

export type TaskStatus = "todo" | "in_progress" | "done"

export type Task = {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  organizationId: string
  createdAt: Date
  updatedAt: Date
}

export type TaskListResponse = Task[]

export type TaskResponse = Task

export type CreateTaskRequest = z.infer<typeof createTaskRequestSchema>
export type UpdateTaskRequest = z.infer<typeof updateTaskRequestSchema>
export type TaskIdParams = z.infer<typeof taskIdParamsSchema>
