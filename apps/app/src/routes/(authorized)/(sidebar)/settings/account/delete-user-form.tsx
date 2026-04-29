import { Loader2Icon, Trash2Icon } from "lucide-react"
import { useState } from "react"
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
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDeleteAccount() {
    setIsDeleting(true)

    const result = await deleteUser({
      callbackURL: "/signin",
    })

    setIsDeleting(false)

    if (result.error) {
      toast.error(result.error.message)
      return
    }

    toast.success("Account deleted")
  }

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
            onClick={handleDeleteAccount}
            disabled={isDeleting}
          >
            {isDeleting ? (
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
