import { Loader2Icon, Trash2Icon } from "lucide-react"
import * as React from "react"
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
import { organization } from "@/lib/auth-client"

export function DeleteOrganizationForm({
  organizationId,
}: {
  organizationId: string
}) {
  const [isDeleting, setIsDeleting] = React.useState(false)

  async function handleDeleteOrganization() {
    setIsDeleting(true)

    const result = await organization.delete({ organizationId })

    setIsDeleting(false)

    if (result.error) {
      toast.error(result.error.message)
      return
    }

    toast.success("Organization deleted")
    window.location.assign("/")
  }

  return (
    <FieldGroup>
      <FieldLegend>Danger zone</FieldLegend>

      <Item variant="outline">
        <ItemContent>
          <ItemTitle>Delete organization</ItemTitle>
          <ItemDescription>
            Permanently delete your organization
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDeleteOrganization}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <Trash2Icon className="size-4" />
            )}
            Delete organization
          </Button>
        </ItemActions>
      </Item>
    </FieldGroup>
  )
}
