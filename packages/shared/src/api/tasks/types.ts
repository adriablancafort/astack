import type { z } from "zod"

import {
  createTaskRequestSchema,
  taskIdParamRequestSchema,
  updateTaskRequestSchema,
} from "./schemas"

export const taskStatusValues = ["todo", "in_progress", "done"] as const

export type TaskStatus = (typeof taskStatusValues)[number]

export type Task = {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  createdAt: string
  updatedAt: string
}

export type ListTasksResponse = {
  tasks: Task[]
}

export type TaskResponse = {
  task: Task
}

export type DeleteTaskResponse = {
  success: true
}

export type CreateTaskRequest = z.infer<typeof createTaskRequestSchema>
export type UpdateTaskRequest = z.infer<typeof updateTaskRequestSchema>
export type TaskIdParamRequest = z.infer<typeof taskIdParamRequestSchema>
