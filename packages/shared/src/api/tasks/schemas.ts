import { z } from "zod"

import type { TaskStatus } from "./types"

export const taskStatusValues: [TaskStatus, ...TaskStatus[]] = [
  "todo",
  "in_progress",
  "done",
]

export const taskStatusSchema = z.enum(taskStatusValues)

const taskTitleSchema = z
  .string()
  .trim()
  .min(1, "Title is required")
  .max(120, "Title must be 120 characters or fewer")

const taskDescriptionSchema = z
  .string()
  .trim()
  .max(500, "Description must be 500 characters or fewer")

export const createTaskRequestSchema = z.object({
  title: taskTitleSchema,
  description: taskDescriptionSchema.default(""),
  status: taskStatusSchema.default("todo"),
})

export const updateTaskRequestSchema = z
  .object({
    title: taskTitleSchema.optional(),
    description: taskDescriptionSchema.optional(),
    status: taskStatusSchema.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Provide at least one field to update",
  })

export const taskIdParamsSchema = z.object({
  id: z.string().min(1, "Task id is required"),
})

export function nullableDescription(
  value: string | undefined
): string | null | undefined {
  if (value === undefined) {
    return undefined
  }

  return value || null
}
