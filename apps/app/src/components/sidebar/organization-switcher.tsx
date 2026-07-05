import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import {
  ChevronsUpDownIcon,
  GalleryVerticalEndIcon,
  PlusIcon,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@workspace/ui/components/sidebar"
import { toast } from "@workspace/ui/components/sonner"
import { organization } from "@/lib/auth/client"
import {
  fullOrganizationQueryOptions,
  organizationsListQueryOptions,
} from "@/lib/auth/organization"

export function OrganizationSwitcher() {
  const { isMobile } = useSidebar()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data: activeOrganization } = useQuery(fullOrganizationQueryOptions())
  const { data: organizations } = useQuery(organizationsListQueryOptions())

  const setActiveMutation = useMutation({
    mutationFn: async (organizationId: string) => {
      const result = await organization.setActive({ organizationId })
      if (result.error) {
        throw new Error(result.error.message)
      }
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({ type: "active" })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  if (!activeOrganization) {
    return null
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground"
              />
            }
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <GalleryVerticalEndIcon className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">
                {activeOrganization.name}
              </span>
            </div>
            <ChevronsUpDownIcon className="ml-auto" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Organizations
              </DropdownMenuLabel>
              {organizations?.map((org) => (
                <DropdownMenuItem
                  key={org.id}
                  onClick={() => setActiveMutation.mutate(org.id)}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    <GalleryVerticalEndIcon className="size-4 shrink-0" />
                  </div>
                  {org.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="gap-2 p-2"
                onClick={() => navigate({ to: "/create-organization" })}
              >
                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                  <PlusIcon className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">
                  Add organization
                </div>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
