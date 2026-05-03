import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router"
import { useSession } from "@/lib/auth-client"

export const Route = createFileRoute("/(authorized)")({
  component: Layout,
})

function Layout() {
  const { data: session, isPending } = useSession()

  if (isPending) {
    return null
  }

  if (!session) {
    return <Navigate to="/signin" replace />
  }

  return <Outlet />
}
