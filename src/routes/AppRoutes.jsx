import { Route, Routes } from 'react-router-dom'
import { RouteGuard } from '../components/auth/RouteGuard'
import { AppLayout } from '../components/layout/AppLayout'
import { AuthLayout } from '../components/layout/AuthLayout'
import { AdminPage } from '../pages/AdminPage'
import { AchievementsPage } from '../pages/AchievementsPage'
import { AttendancePage } from '../pages/AttendancePage'
import { HomePage } from '../pages/HomePage'
import { LoginPage } from '../pages/LoginPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { ProfilePage } from '../pages/ProfilePage'
import { RegisterPage } from '../pages/RegisterPage'
import { SchedulePage } from '../pages/SchedulePage'
import { SectionsPage } from '../pages/SectionsPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/sections" element={<SectionsPage />} />
        <Route path="/schedule" element={<SchedulePage />} />

        <Route element={<RouteGuard />}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
        </Route>

        <Route element={<RouteGuard allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
