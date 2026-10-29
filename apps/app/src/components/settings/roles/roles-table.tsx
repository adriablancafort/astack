import { useSuspenseQuery } from "@tanstack/react-query"
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  PlusIcon,
  Search,
} from "lucide-react"
import { useState } from "react"

import { Button } from "@workspace/ui/components/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@workspace/ui/components/input-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import {
  RoleDialog,
  resourceLabel,
} from "@/components/settings/roles/role-dialog"
import { RoleRowActions } from "@/components/settings/roles/role-row-actions"
import type { organization } from "@/lib/auth/client"
import { organizationRolesQueryOptions } from "@/lib/auth/organization"
import { useCheckPermission } from "@/lib/auth/permissions"

type OrganizationRole = NonNullable<
  Awaited<ReturnType<typeof organization.listRoles>>["data"]
>[number]

type RoleRow = {
  id: string
  name: string
  permission: Record<string, readonly string[] | undefined>
  source?: OrganizationRole
}

function summarizePermissions(
  permission: Record<string, readonly string[] | undefined>
) {
  const parts = Object.entries(permission)
    .filter((entry): entry is [string, readonly string[]] =>
      Boolean(entry[1]?.length)
    )
    .map(
      ([resource, actions]) =>
        `${resourceLabel(resource)} (${actions.join(", ")})`
    )

  return parts.length > 0 ? parts.join(", ") : "No permissions"
}

function columnClass(columnId: string) {
  if (columnId === "name") {
    return "w-40 align-top font-medium"
  }

  if (columnId === "permissions") {
    return "whitespace-normal text-muted-foreground"
  }

  if (columnId === "actions") {
    return "w-0"
  }

  return undefined
}

export function RolesTable() {
  const { data: roles } = useSuspenseQuery(organizationRolesQueryOptions())
  const canCreate = useCheckPermission({ ac: ["create"] })
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<OrganizationRole>()

  const data: RoleRow[] = [
    {
      id: "owner",
      name: "Owner",
      permission: {},
    },
    ...roles.map((role) => ({
      id: role.id,
      name: role.displayName,
      permission: role.permission,
      source: role,
    })),
  ]

  const columns: ColumnDef<RoleRow>[] = [
    {
      accessorKey: "name",
      header: "Role",
    },
    {
      id: "permissions",
      header: "Permissions",
      cell: ({ row }) =>
        row.original.id === "owner"
          ? "Full access. This role can't be changed."
          : summarizePermissions(row.original.permission),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const role = row.original.source
        if (!role) {
          return null
        }

        return (
          <RoleRowActions
            role={role}
            onEdit={() => {
              setEditingRole(role)
              setDialogOpen(true)
            }}
          />
        )
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row.id,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false,
    state: {
      columnFilters,
    },
  })

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4">
        <InputGroup className="max-w-xs">
          <InputGroupInput
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) => {
              table.getColumn("name")?.setFilterValue(event.target.value)
              table.setPageIndex(0)
            }}
            placeholder="Search roles..."
          />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
        </InputGroup>
        <Button
          disabled={!canCreate}
          onClick={() => {
            setEditingRole(undefined)
            setDialogOpen(true)
          }}
        >
          <PlusIcon />
          Create role
        </Button>
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={
                      header.column.id === "name"
                        ? "w-40"
                        : header.column.id === "actions"
                          ? "w-0"
                          : undefined
                    }
                  >
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
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={columnClass(cell.column.id)}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No results
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-4">
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm font-medium">Rows per page</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium pr-2">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount() || 1}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight />
          </Button>
        </div>
      </div>

      <RoleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        role={editingRole}
      />
    </div>
  )
}
