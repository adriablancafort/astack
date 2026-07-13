import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Controller, useForm } from "react-hook-form"

import { updateTaskRequestSchema } from "@workspace/shared/api/tasks/schemas"
import type {
  TaskListResponse,
  TaskResponse,
  UpdateTaskRequest,
} from "@workspace/shared/api/tasks/types"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { toast } from "@workspace/ui/components/sonner"
import { Spinner } from "@workspace/ui/components/spinner"
import { Textarea } from "@workspace/ui/components/textarea"
import { api } from "@/lib/api"
import { useCheckPermission } from "@/lib/auth/permissions"

const statusOptions = [
  { value: "todo", label: "To do" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
]

type EditTaskFormProps = {
  task: TaskListResponse[number]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditTaskForm({ task, open, onOpenChange }: EditTaskFormProps) {
  const queryClient = useQueryClient()
  const canUpdate = useCheckPermission({ todo: ["update"] })

  const form = useForm<UpdateTaskRequest>({
    resolver: zodResolver(updateTaskRequestSchema),
    defaultValues: {
      title: task.title,
      description: task.description ?? "",
      status: task.status,
    },
  })

  const saveMutation = useMutation({
    mutationFn: (values: UpdateTaskRequest) =>
      api.patch<TaskResponse>(`/api/tasks/${task.id}`, { body: values }),
    onSuccess: () => {
      onOpenChange(false)
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const isSaving = saveMutation.isPending
  const readOnly = !canUpdate || isSaving

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen)
        form.reset()
        saveMutation.reset()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit task</DialogTitle>
          <DialogDescription>Update the task details</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}
          noValidate
        >
          <FieldGroup>
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Title</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder="Task title"
                    autoComplete="off"
                    readOnly={readOnly}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                  <Textarea
                    id={field.name}
                    name={field.name}
                    ref={field.ref}
                    value={field.value ?? ""}
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                    aria-invalid={fieldState.invalid}
                    placeholder="Optional description"
                    autoComplete="off"
                    readOnly={readOnly}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="status"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Status</FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={readOnly}
                  >
                    <SelectTrigger id={field.name} className="w-full">
                      <SelectValue>
                        {statusOptions.find(
                          (option) => option.value === field.value
                        )?.label ?? "Select status"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <DialogFooter className="mt-8">
            <DialogClose>
              <Button variant="outline" disabled={isSaving}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={!canUpdate || isSaving}>
              {isSaving ? <Spinner className="mx-8" /> : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
