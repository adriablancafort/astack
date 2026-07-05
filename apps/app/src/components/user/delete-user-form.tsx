import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Trash2Icon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { FieldGroup, FieldLegend } from "@workspace/ui/components/field"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@workspace/ui/components/item"
import { toast } from "@workspace/ui/components/sonner"
import { Spinner } from "@/components/spinner"
import { deleteUser } from "@/lib/auth/client"

export function DeleteAccountForm() {
  const queryClient = useQueryClient()

  const deleteUserMutation = useMutation({
    mutationFn: async () => {
      const result = await deleteUser({
        callbackURL: "/signin",
      })

      if (result.error) {
        throw new Error(result.error.message)
      }
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ["session"] })
      toast.success("Account deleted")
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  return (
    <FieldGroup>
      <FieldLegend>Danger zone</FieldLegend>

      <Item variant="outline">
        <ItemContent>
          <ItemTitle>Delete account</ItemTitle>
          <ItemDescription>Permanently delete your account</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => deleteUserMutation.mutate()}
            disabled={deleteUserMutation.isPending}
          >
            {deleteUserMutation.isPending ? (
              <Spinner />
            ) : (
              <Trash2Icon className="size-4" />
            )}
            Delete account
          </Button>
        </ItemActions>
      </Item>
    </FieldGroup>
  )
}
