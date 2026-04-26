import { Route, Routes } from "react-router"
import PageNotFound from "@/routes/(authorized)/(sidebar)/[...all]/page"
import SidebarLayout from "@/routes/(authorized)/(sidebar)/layout"
import HomePage from "@/routes/(authorized)/(sidebar)/page"
import TasksPage from "@/routes/(authorized)/(sidebar)/tasks/page"
import CreateOrganizationPage from "@/routes/(authorized)/create-organization/page"
import AuthorizedLayout from "@/routes/(authorized)/layout"
import UnauthorizedLayout from "@/routes/(unauthorized)/layout"
import ResetPasswordPage from "@/routes/(unauthorized)/reset-password/page"
import SetNewPasswordPage from "@/routes/(unauthorized)/set-new-password/page"
import SigninPage from "@/routes/(unauthorized)/signin/page"
import SignupPage from "@/routes/(unauthorized)/signup/page"

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthorizedLayout />}>
        <Route
          path="/create-organization"
          element={<CreateOrganizationPage />}
        />
        <Route element={<SidebarLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="*" element={<PageNotFound />} />
        </Route>
      </Route>

      <Route element={<UnauthorizedLayout />}>
        <Route path="/signin" element={<SigninPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/set-new-password" element={<SetNewPasswordPage />} />
      </Route>
    </Routes>
  )
}
