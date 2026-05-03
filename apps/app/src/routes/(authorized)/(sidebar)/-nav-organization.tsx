import { useQueryClient } from "@tanstack/react-query"
import { Navigate, useNavigate } from "@tanstack/react-router"
import { ChevronsUpDownIcon, PlusIcon } from "lucide-react"
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
import {
  organization,
  useActiveOrganization,
  useListOrganizations,
} from "@/lib/auth-client"

export function NavOrganization() {
  const { isMobile } = useSidebar()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: activeOrganization, isPending: isActiveOrganizationPending } =
    useActiveOrganization()
  const { data: organizations } = useListOrganizations()
  const organizationName = activeOrganization?.name || "Loading..."

  async function handleSetActiveOrganization(organizationId: string) {
    await organization.setActive(
      {
        organizationId,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries()
        },
        onError: (ctx) => {
          toast.error(ctx.error.message)
        },
      }
    )
  }

  function handleAddOrganization() {
    navigate({ to: "/create-organization" })
  }

  if (!isActiveOrganizationPending && !activeOrganization) {
    return <Navigate to="/create-organization" replace />
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
              {organizationName[0]?.toUpperCase()}
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{organizationName}</span>
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
              {organizations &&
                organizations.map((org) => (
                  <DropdownMenuItem
                    key={org.id}
                    onClick={() => handleSetActiveOrganization(org.id)}
                    className="gap-2 p-2"
                  >
                    <div className="flex size-6 items-center justify-center rounded-md border">
                      {org.name[0]?.toUpperCase()}
                    </div>
                    {org.name}
                  </DropdownMenuItem>
                ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="gap-2 p-2"
                onClick={handleAddOrganization}
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
