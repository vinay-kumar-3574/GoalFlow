import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import LandingPage from './components/landing/LandingPage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import EmployeeLayout from './components/employee/EmployeeLayout'
import EmployeeHomePage from './pages/employee/EmployeeHomePage'
import GoalSheetPage from './pages/employee/GoalSheetPage'
import CheckInPage from './pages/employee/CheckInPage'
import ProgressPage from './pages/employee/ProgressPage'
import SharedGoalsPage from './pages/employee/SharedGoalsPage'
import NotificationsPage from './pages/employee/NotificationsPage'
import ManagerLayout from './components/manager/ManagerLayout'
import ManagerHomePage from './pages/manager/ManagerHomePage'
import ApprovalsPage from './pages/manager/ApprovalsPage'
import ApprovalDetailPage from './pages/manager/ApprovalDetailPage'
import TeamCheckInPage from './pages/manager/TeamCheckInPage'
import CheckInDetailPage from './pages/manager/CheckInDetailPage'
import SharedKpiPage from './pages/manager/SharedKpiPage'
import TeamReportsPage from './pages/manager/TeamReportsPage'
import ManagerNotificationsPage from './pages/manager/ManagerNotificationsPage'
import AdminLayout from './components/admin/AdminLayout'
import AdminHomePage from './pages/admin/AdminHomePage'
import CompletionDashboardPage from './pages/admin/CompletionDashboardPage'
import AchievementReportsPage from './pages/admin/AchievementReportsPage'
import UnlockGoalsPage from './pages/admin/UnlockGoalsPage'
import AuditLogPage from './pages/admin/AuditLogPage'
import CycleSettingsPage from './pages/admin/CycleSettingsPage'
import OrgHierarchyPage from './pages/admin/OrgHierarchyPage'
import AnalyticsPage from './pages/admin/AnalyticsPage'
import EscalationsPage from './pages/admin/EscalationsPage'
import AdminNotificationsPage from './pages/admin/AdminNotificationsPage'
import { ROLES } from './lib/auth'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route
            path="/employee"
            element={
              <ProtectedRoute allowedRoles={[ROLES.employee]}>
                <EmployeeLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<EmployeeHomePage />} />
            <Route path="goals" element={<GoalSheetPage />} />
            <Route path="shared-goals" element={<SharedGoalsPage />} />
            <Route path="check-in" element={<CheckInPage />} />
            <Route path="progress" element={<ProgressPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
          </Route>

          <Route
            path="/manager"
            element={
              <ProtectedRoute allowedRoles={[ROLES.manager]}>
                <ManagerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ManagerHomePage />} />
            <Route path="approvals" element={<ApprovalsPage />} />
            <Route path="approvals/:employeeEmail" element={<ApprovalDetailPage />} />
            <Route path="check-in" element={<TeamCheckInPage />} />
            <Route path="check-in/:employeeEmail" element={<CheckInDetailPage />} />
            <Route path="shared-kpi" element={<SharedKpiPage />} />
            <Route path="reports" element={<TeamReportsPage />} />
            <Route path="notifications" element={<ManagerNotificationsPage />} />
          </Route>

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={[ROLES.admin]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminHomePage />} />
            <Route path="cycle" element={<CycleSettingsPage />} />
            <Route path="org" element={<OrgHierarchyPage />} />
            <Route path="unlock" element={<UnlockGoalsPage />} />
            <Route path="completion" element={<CompletionDashboardPage />} />
            <Route path="reports" element={<AchievementReportsPage />} />
            <Route path="export" element={<Navigate to="/admin/reports" replace />} />
            <Route path="audit" element={<AuditLogPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="escalations" element={<EscalationsPage />} />
            <Route path="notifications" element={<AdminNotificationsPage />} />
            <Route path="master-data" element={<Navigate to="/admin/org" replace />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
