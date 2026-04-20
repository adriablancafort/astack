import { z } from "zod"

export const taskStatusValues = ["todo", "in_progress", "done"] as const

export const taskStatusSchema = z.enum(taskStatusValues)

const taskTitleSchema = z
  .string()
  .trim()
  .min(1, "Title is required")
  .max(120, "Title must be 120 characters or fewer")

const taskDescriptionInputSchema = z
  .string()
  .trim()
  .max(500, "Description must be 500 characters or fewer")

export const taskSchema = z.object({
  id: z.string().min(1),
  title: taskTitleSchema,
  description: z.string().nullable(),
  status: taskStatusSchema,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export const createTaskInputSchema = z.object({
  title: taskTitleSchema,
  description: taskDescriptionInputSchema.default(""),
  status: taskStatusSchema.default("todo"),
})

export const updateTaskInputSchema = z
  .object({
    title: taskTitleSchema.optional(),
    description: taskDescriptionInputSchema.optional(),
    status: taskStatusSchema.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Provide at least one field to update",
  })

export const taskParamsSchema = z.object({
  taskId: z.string().min(1, "Task id is required"),
})

export const listTasksResponseSchema = z.object({
  tasks: z.array(taskSchema),
})

export const taskResponseSchema = z.object({
  task: taskSchema,
})

export const deleteTaskResponseSchema = z.object({
  success: z.literal(true),
})

export type TaskStatus = z.infer<typeof taskStatusSchema>
export type Task = z.infer<typeof taskSchema>
export type CreateTaskInput = z.infer<typeof createTaskInputSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskInputSchema>
export type TaskParams = z.infer<typeof taskParamsSchema>
export type ListTasksResponse = z.infer<typeof listTasksResponseSchema>
export type TaskResponse = z.infer<typeof taskResponseSchema>
export type DeleteTaskResponse = z.infer<typeof deleteTaskResponseSchema>
