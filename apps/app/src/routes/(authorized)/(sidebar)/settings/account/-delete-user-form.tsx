import { useMutation } from "@tanstack/react-query"
import { Loader2Icon, Trash2Icon } from "lucide-react"

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
import { deleteUser } from "@/lib/auth-client"

export function DeleteAccountForm() {
  const deleteUserMutation = useMutation({
    mutationFn: async () => {
      const result = await deleteUser({
        callbackURL: "/signin",
      })

      if (result.error) {
        throw new Error(result.error.message)
      }
    },
    onSuccess: () => {
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
              <Loader2Icon className="size-4 animate-spin" />
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
