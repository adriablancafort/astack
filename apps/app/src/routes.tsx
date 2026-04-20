import { Route, Routes } from "react-router"
import AuthorizedLayout from "@/routes/(authorized)/layout"
import SidebarLayout from "@/routes/(authorized)/(sidebar)/layout"
import HomePage from "@/routes/(authorized)/(sidebar)/page"
import UnauthorizedLayout from "@/routes/(unauthorized)/layout"
import SigninPage from "@/routes/(unauthorized)/signin/page"
import SignupPage from "@/routes/(unauthorized)/signup/page"
import RecoverPasswordPage from "@/routes/(unauthorized)/recover-password/page"

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthorizedLayout />}>
        <Route element={<SidebarLayout />}>
          <Route index element={<HomePage />} />
        </Route>
      </Route>

      <Route element={<UnauthorizedLayout />}>
        <Route path="/signin" element={<SigninPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/recover-password" element={<RecoverPasswordPage />} />
      </Route>
    </Routes>
  )
}
