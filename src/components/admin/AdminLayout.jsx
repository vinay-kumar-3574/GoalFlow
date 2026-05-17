import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { LogoMark } from '../landing/icons'
import { useAuth } from '../../context/AuthContext'
import { ROLE_LABELS } from '../../lib/auth'
import {
  getAdminNotifications,
  markAllAdminNotificationsRead,
  toggleAdminNotificationRead,
} from '../../lib/adminNotifications'
import { useAdminData } from '../../hooks/useAdminData'
import BellButton from '../shared/BellButton'
import NotificationDrawer from '../shared/NotificationDrawer'
import ResetDemoDialog from './ResetDemoDialog'

const mainNav = [
  { to: '/admin', end: true, label: 'Dashboard', short: 'Home' },
  { to: '/admin/cycle', end: false, label: 'Cycle Configuration', short: 'Cycle' },
  { to: '/admin/org', end: false, label: 'Org Hierarchy', short: 'Org' },
  { to: '/admin/unlock', end: false, label: 'Unlock Goals', short: 'Unlock' },
  { to: '/admin/completion', end: false, label: 'Completion Dashboard', short: 'Done' },
  { to: '/admin/reports', end: false, label: 'Achievement Reports', short: 'Report' },
  { to: '/admin/audit', end: false, label: 'Audit Trail', short: 'Audit' },
  { to: '/admin/analytics', end: false, label: 'Analytics', short: 'Stats' },
  { to: '/admin/escalations', end: false, label: 'Escalations', short: 'Esc' },
  {
    to: '/admin/notifications',
    end: false,
    label: 'Notifications',
    short: 'Alerts',
    badge: true,
  },
]

function NavBadge({ count }) {
  if (!count) return null
  return (
    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
      {count}
    </span>
  )
}

function SidebarNav({ user, unread, onNavigate, onResetDemo }) {
  return (
    <>
      <div className="border-b border-slate-100 p-5">
        <NavLink
          to="/admin"
          onClick={onNavigate}
          className="flex items-center gap-2 font-semibold text-ink-900"
        >
          <LogoMark className="h-8 w-8" />
          <span>
            Goal<span className="text-brand-600">Flow</span>
          </span>
        </NavLink>
        <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-teal-700">
          {ROLE_LABELS.admin}
        </p>
        <p className="mt-1 truncate text-sm font-medium text-ink-800">{user?.name}</p>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3" aria-label="Admin navigation">
        {mainNav.map(({ to, end, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-ink-600 hover:bg-slate-100 hover:text-ink-900'
              }`
            }
          >
            {label}
            {badge && <NavBadge count={unread} />}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-100 p-3">
        <button
          type="button"
          onClick={onResetDemo}
          className="w-full rounded-lg px-3 py-2 text-xs text-ink-400 hover:bg-slate-50 hover:text-ink-600"
        >
          Reset demo data
        </button>
      </div>
    </>
  )
}

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const { resetDemo } = useAdminData()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const [notifications, setNotifications] = useState(() => getAdminNotifications())
  const unread = notifications.filter((n) => !n.read).length

  useEffect(() => {
    setNotifications(getAdminNotifications())
  }, [drawerOpen])

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  function openResetDemo() {
    setResetOpen(true)
  }

  function confirmResetDemo() {
    resetDemo()
    setNotifications(getAdminNotifications())
    toast.success('Demo data reset.')
  }

  function handleToggleRead(id) {
    const next = toggleAdminNotificationRead(id)
    setNotifications(next)
    return next
  }

  function handleMarkAllRead() {
    const next = markAllAdminNotificationsRead()
    setNotifications(next)
    return next
  }

  const closeMobile = () => setMobileOpen(false)

  const bottomNav = mainNav.slice(0, 5)

  return (
    <div className="flex min-h-svh bg-slate-100">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-slate-200 bg-white shadow-sm md:flex">
        <div className="flex min-h-0 flex-1 flex-col">
          <SidebarNav
            user={user}
            unread={unread}
            onNavigate={undefined}
            onResetDemo={openResetDemo}
          />
        </div>
        <div className="mt-auto border-t border-slate-100 p-3">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-ink-700 hover:bg-slate-50"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-ink-950/40 md:hidden"
          aria-label="Close menu"
          onClick={closeMobile}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white shadow-xl transition-transform md:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <SidebarNav
            user={user}
            unread={unread}
            onNavigate={closeMobile}
            onResetDemo={() => {
              closeMobile()
              openResetDemo()
            }}
          />
        </div>
        <div className="mt-auto border-t border-slate-100 p-3">
          <button
            type="button"
            onClick={() => {
              closeMobile()
              handleLogout()
            }}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-ink-700"
          >
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col md:pl-60">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
          <button
            type="button"
            className="rounded-lg border border-slate-200 p-2 text-ink-700 md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink-900">{user?.name}</p>
            <p className="text-xs text-ink-500">Admin / HR console · FY26</p>
          </div>
          <BellButton
            unread={unread}
            onClick={() => setDrawerOpen(true)}
            className="md:inline-flex"
          />
          <button
            type="button"
            onClick={handleLogout}
            className="shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-ink-700 md:hidden"
          >
            Sign out
          </button>
        </header>

        <nav
          className="fixed bottom-0 left-0 right-0 z-20 flex border-t border-slate-200 bg-white md:hidden"
          aria-label="Admin quick nav"
        >
          {bottomNav.map(({ to, end, short }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center py-2 text-[10px] font-semibold ${
                  isActive ? 'text-teal-700' : 'text-ink-500'
                }`
              }
            >
              {short}
            </NavLink>
          ))}
        </nav>

        <main className="flex-1 overflow-auto p-4 pb-24 md:p-8 md:pb-8">
          <Outlet />
        </main>
      </div>

      <NotificationDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title="Admin notifications"
        notificationsPath="/admin/notifications"
        items={notifications}
        onMarkAllRead={handleMarkAllRead}
        onToggleRead={handleToggleRead}
      />
      <ResetDemoDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        onConfirm={confirmResetDemo}
      />
    </div>
  )
}
