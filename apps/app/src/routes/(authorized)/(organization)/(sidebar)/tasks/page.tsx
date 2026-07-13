import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

import type { TaskListResponse } from "@workspace/shared/api/tasks/types"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@workspace/ui/components/breadcrumb"
import { Separator } from "@workspace/ui/components/separator"
import { SidebarTrigger } from "@workspace/ui/components/sidebar"
import { AddTaskForm } from "@/components/tasks/add-task-form"
import { TasksDataTable } from "@/components/tasks/tasks-data-table"
import { api } from "@/lib/api"

function queryOptions() {
  return {
    queryKey: ["tasks"],
    queryFn: () => api.get<TaskListResponse>("/api/tasks"),
  }
}

export const Route = createFileRoute(
  "/(authorized)/(organization)/(sidebar)/tasks/"
)({
  component: Page,
})

function Header() {
  return (
    <header className="flex h-18 items-center gap-2 px-5">
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="mr-2 data-[orientation=vertical]:h-4 data-[orientation=vertical]:self-center"
      />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Tasks</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto flex space-x-3">
        <AddTaskForm />
      </div>
    </header>
  )
}

function Page() {
  const { data: tasks } = useSuspenseQuery(queryOptions())

  return (
    <>
      <title>Tasks</title>
      <Header />
      <div className="p-5 pt-0">
        <TasksDataTable data={tasks} />
      </div>
    </>
  )
}
