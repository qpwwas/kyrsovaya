import { Route, Routes } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { AdminPage } from '../pages/AdminPage'
import { AchievementsPage } from '../pages/AchievementsPage'
import { AttendancePage } from '../pages/AttendancePage'
import { HomePage } from '../pages/HomePage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { SchedulePage } from '../pages/SchedulePage'
import { SectionsPage } from '../pages/SectionsPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/sections" element={<SectionsPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/achievements" element={<AchievementsPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
