import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Loader2Icon, PlusIcon } from "lucide-react"
import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  type CreateTaskInput,
  createTaskInputSchema,
  type DeleteTaskResponse,
  type ListTasksResponse,
  type Task,
  type TaskResponse,
  type UpdateTaskInput,
  updateTaskInputSchema,
} from "@workspace/shared/api/tasks"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@workspace/ui/components/breadcrumb"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import { Field, FieldError, FieldGroup } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Separator } from "@workspace/ui/components/separator"
import { SidebarTrigger } from "@workspace/ui/components/sidebar"
import { toast } from "@workspace/ui/components/sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { api } from "@/lib/api"

const tasksQueryKey = ["tasks"] as const

type CreateTaskFormValues = z.input<typeof createTaskInputSchema>

const statusLabels: Record<Task["status"], string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
}

type EditTaskFormValues = z.input<typeof updateTaskInputSchema>

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No tasks yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default function TasksPage() {
  const queryClient = useQueryClient()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [search, setSearch] = useState("")

  const form = useForm<CreateTaskFormValues, unknown, CreateTaskInput>({
    resolver: zodResolver(createTaskInputSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "todo",
    },
  })

  const tasksQuery = useQuery({
    queryKey: tasksQueryKey,
    queryFn: () => api.get<ListTasksResponse>("/api/tasks"),
  })

  const createTaskMutation = useMutation({
    mutationFn: (payload: CreateTaskInput) =>
      api.post<TaskResponse>("/api/tasks", { body: payload }),
    onSuccess: () => {
      toast.success("Task created")
      form.reset({
        title: "",
        description: "",
        status: "todo",
      })
      setIsCreateOpen(false)
      void queryClient.invalidateQueries({ queryKey: tasksQueryKey })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const editForm = useForm<EditTaskFormValues, unknown, UpdateTaskInput>({
    resolver: zodResolver(updateTaskInputSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "todo",
    },
  })

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTaskInput }) =>
      api.patch<TaskResponse>(`/api/tasks/${id}`, { body: payload }),
    onSuccess: () => {
      toast.success("Task updated")
      setEditingTask(null)
      void queryClient.invalidateQueries({ queryKey: tasksQueryKey })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) =>
      api.delete<DeleteTaskResponse>(`/api/tasks/${id}`),
    onSuccess: () => {
      toast.success("Task deleted")
      void queryClient.invalidateQueries({ queryKey: tasksQueryKey })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const columns = useMemo<ColumnDef<Task>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Title",
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => {
          return row.original.description || "-"
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          return statusLabels[row.original.status]
        },
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => {
          return new Date(row.original.createdAt).toLocaleDateString()
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const currentTask = row.original

          return (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  editForm.reset({
                    title: currentTask.title,
                    description: currentTask.description ?? "",
                    status: currentTask.status,
                  })
                  setEditingTask(currentTask)
                }}
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={deleteTaskMutation.isPending}
                onClick={() => deleteTaskMutation.mutate(currentTask.id)}
              >
                Delete
              </Button>
            </div>
          )
        },
      },
    ],
    [deleteTaskMutation.isPending, editForm]
  )

  const allTasks = tasksQuery.data?.tasks ?? []
  const tasks = search.trim()
    ? allTasks.filter(
        (t) =>
          t.title.toLowerCase().includes(search.toLowerCase()) ||
          (t.description ?? "").toLowerCase().includes(search.toLowerCase())
      )
    : allTasks

  function onSubmit(values: CreateTaskInput) {
    createTaskMutation.mutate(values)
  }

  function onEditSubmit(values: UpdateTaskInput) {
    if (!editingTask) {
      return
    }

    updateTaskMutation.mutate({ id: editingTask.id, payload: values })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Tasks</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-center gap-3">
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />

          <div className="ml-auto">
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger render={<Button variant="outline" />}>
                <PlusIcon className="size-4" />
                New task
              </DialogTrigger>
              <DialogContent className="sm:max-w-sm">
                <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
                  <DialogHeader>
                    <DialogTitle>Create task</DialogTitle>
                    <DialogDescription>
                      Add a task using the shared schema.
                    </DialogDescription>
                  </DialogHeader>

                  <FieldGroup className="py-2">
                    <Field data-invalid={!!form.formState.errors.title}>
                      <Label htmlFor="title">Title</Label>
                      <Input id="title" {...form.register("title")} />
                      {form.formState.errors.title && (
                        <FieldError errors={[form.formState.errors.title]} />
                      )}
                    </Field>

                    <Field data-invalid={!!form.formState.errors.description}>
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        {...form.register("description")}
                      />
                      {form.formState.errors.description && (
                        <FieldError
                          errors={[form.formState.errors.description]}
                        />
                      )}
                    </Field>
                  </FieldGroup>

                  <DialogFooter>
                    <DialogClose render={<Button variant="outline" />}>
                      Cancel
                    </DialogClose>
                    <Button
                      type="submit"
                      disabled={createTaskMutation.isPending}
                    >
                      {createTaskMutation.isPending ? (
                        <Loader2Icon className="size-4 animate-spin" />
                      ) : null}
                      Create
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {tasksQuery.isLoading ? (
          <div className="flex min-h-40 items-center justify-center rounded-md border">
            <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : tasksQuery.isError ? (
          <div className="rounded-md border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
            {tasksQuery.error.message}
          </div>
        ) : (
          <DataTable columns={columns} data={tasks} />
        )}
      </div>

      <Dialog
        open={!!editingTask}
        onOpenChange={(open) => {
          if (!open) {
            setEditingTask(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <form onSubmit={editForm.handleSubmit(onEditSubmit)} noValidate>
            <DialogHeader>
              <DialogTitle>Edit task</DialogTitle>
              <DialogDescription>
                Update task fields and save.
              </DialogDescription>
            </DialogHeader>

            <FieldGroup className="py-2">
              <Field data-invalid={!!editForm.formState.errors.title}>
                <Label htmlFor="edit-title">Title</Label>
                <Input id="edit-title" {...editForm.register("title")} />
                {editForm.formState.errors.title && (
                  <FieldError errors={[editForm.formState.errors.title]} />
                )}
              </Field>

              <Field data-invalid={!!editForm.formState.errors.description}>
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  {...editForm.register("description")}
                />
                {editForm.formState.errors.description && (
                  <FieldError
                    errors={[editForm.formState.errors.description]}
                  />
                )}
              </Field>

              <Field data-invalid={!!editForm.formState.errors.status}>
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editForm.watch("status")}
                  onValueChange={(value) => {
                    editForm.setValue(
                      "status",
                      value as UpdateTaskInput["status"],
                      {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true,
                      }
                    )
                  }}
                >
                  <SelectTrigger id="edit-status" className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To do</SelectItem>
                    <SelectItem value="in_progress">In progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
                {editForm.formState.errors.status && (
                  <FieldError errors={[editForm.formState.errors.status]} />
                )}
              </Field>
            </FieldGroup>

            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
                Cancel
              </DialogClose>
              <Button type="submit" disabled={updateTaskMutation.isPending}>
                {updateTaskMutation.isPending ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : null}
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
