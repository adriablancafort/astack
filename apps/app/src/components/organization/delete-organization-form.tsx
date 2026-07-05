import { useMutation } from "@tanstack/react-query"
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
import { organization } from "@/lib/auth/client"

export function DeleteOrganizationForm({
  organizationId,
}: {
  organizationId: string
}) {
  const deleteOrganizationMutation = useMutation({
    mutationFn: async () => {
      const result = await organization.delete({ organizationId })

      if (result.error) {
        throw new Error(result.error.message)
      }
    },
    onSuccess: () => {
      toast.success("Organization deleted")
      window.location.assign("/")
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
            onClick={() => deleteOrganizationMutation.mutate()}
            disabled={deleteOrganizationMutation.isPending}
          >
            {deleteOrganizationMutation.isPending ? (
              <Spinner />
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
