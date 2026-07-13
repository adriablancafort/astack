import { useMutation, useQueryClient } from "@tanstack/react-query"
import { MoreHorizontalIcon, PencilIcon, Trash2Icon } from "lucide-react"
import { useState } from "react"

import type { TaskListResponse } from "@workspace/shared/api/tasks/types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { toast } from "@workspace/ui/components/sonner"
import { Spinner } from "@workspace/ui/components/spinner"
import { EditTaskForm } from "@/components/tasks/edit-task-form"
import { api } from "@/lib/api"
import { useCheckPermission } from "@/lib/auth/permissions"

type TaskRowActionsProps = {
  task: TaskListResponse[number]
}

export function TaskRowActions({ task }: TaskRowActionsProps) {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const queryClient = useQueryClient()
  const canUpdate = useCheckPermission({ todo: ["update"] })
  const canDelete = useCheckPermission({ todo: ["delete"] })

  const deleteTaskMutation = useMutation({
    mutationFn: () => api.delete(`/api/tasks/${task.id}`),
    onSuccess: () => {
      toast.success(`"${task.title}" deleted`)
      setDeleteOpen(false)
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  return (
    <>
      <AlertDialog
        open={deleteOpen}
        onOpenChange={(nextOpen) => {
          setDeleteOpen(nextOpen)
          deleteTaskMutation.reset()
        }}
      >
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Open actions for ${task.title}`}
            >
              <MoreHorizontalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={4}>
            <DropdownMenuItem
              disabled={!canUpdate}
              onClick={() => setEditOpen(true)}
            >
              <PencilIcon />
              Edit
            </DropdownMenuItem>
            <AlertDialogTrigger
              disabled={!canDelete}
              render={
                <DropdownMenuItem
                  variant="destructive"
                  disabled={!canDelete || deleteTaskMutation.isPending}
                >
                  <Trash2Icon />
                  Delete
                </DropdownMenuItem>
              }
            />
          </DropdownMenuContent>
        </DropdownMenu>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete task</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{task.title}"
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteTaskMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteTaskMutation.isPending}
              onClick={() => deleteTaskMutation.mutate()}
            >
              {deleteTaskMutation.isPending ? (
                <Spinner className="mx-3" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditTaskForm task={task} open={editOpen} onOpenChange={setEditOpen} />
    </>
  )
}
