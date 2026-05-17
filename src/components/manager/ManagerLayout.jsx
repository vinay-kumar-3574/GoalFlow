import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LogoMark } from '../landing/icons'
import { useAuth } from '../../context/AuthContext'
import { ROLE_LABELS } from '../../lib/auth'
import {
  getManagerNotifications,
  markAllManagerNotificationsRead,
  toggleManagerNotificationRead,
} from '../../lib/managerNotifications'
import { useManagerTeam } from '../../hooks/useManagerTeam'
import BellButton from '../shared/BellButton'
import NotificationDrawer from '../shared/NotificationDrawer'

const mainNav = [
  { to: '/manager', end: true, label: 'Team Dashboard', short: 'Home' },
  {
    to: '/manager/approvals',
    end: false,
    label: 'Pending Approvals',
    short: 'Approve',
    badgeKey: 'pending',
  },
  { to: '/manager/shared-kpi', end: false, label: 'Push Shared Goals', short: 'Shared' },
  { to: '/manager/check-in', end: false, label: 'Team Check-ins', short: 'Check-in' },
  { to: '/manager/reports', end: false, label: 'Team Reports', short: 'Reports' },
]

function NavBadge({ count }) {
  if (!count) return null
  return (
    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
      {count}
    </span>
  )
}

function SidebarNav({ user, pendingCount, unread, onNavigate, onOpenNotifications }) {
  return (
    <>
      <div className="border-b border-slate-100 p-5">
        <NavLink
          to="/manager"
          onClick={onNavigate}
          className="flex items-center gap-2 font-semibold text-ink-900"
        >
          <LogoMark className="h-8 w-8" />
          <span>
            Goal<span className="text-brand-600">Flow</span>
          </span>
        </NavLink>
        <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-violet-600">
          {ROLE_LABELS.manager}
        </p>
        <p className="mt-1 truncate text-sm font-medium text-ink-800">{user?.name}</p>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3" aria-label="Manager navigation">
        {mainNav.map(({ to, end, label, badgeKey }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-ink-600 hover:bg-slate-100 hover:text-ink-900'
              }`
            }
          >
            {label}
            {badgeKey === 'pending' && <NavBadge count={pendingCount} />}
          </NavLink>
        ))}
        <button
          type="button"
          onClick={onOpenNotifications}
          className="flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-ink-600 hover:bg-slate-100"
        >
          Notifications
          <NavBadge count={unread} />
        </button>
      </nav>
    </>
  )
}

export default function ManagerLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { stats } = useManagerTeam(user?.email, user?.name)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    if (user?.email) setNotifications(getManagerNotifications(user.email))
  }, [user?.email, drawerOpen])

  const unread = notifications.filter((n) => !n.read).length

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  function handleToggleRead(id) {
    if (!user?.email) return notifications
    const next = toggleManagerNotificationRead(user.email, id)
    setNotifications(next)
    return next
  }

  function handleMarkAllRead() {
    if (!user?.email) return notifications
    const next = markAllManagerNotificationsRead(user.email)
    setNotifications(next)
    return next
  }

  const closeMobile = () => setMobileOpen(false)
  const openDrawer = () => setDrawerOpen(true)

  const bottomNav = [
    ...mainNav.slice(0, 4),
    { to: '/manager/notifications', end: false, short: 'Alerts', isDrawer: true },
  ]

  return (
    <div className="flex min-h-svh bg-slate-100">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-slate-200 bg-white shadow-sm md:flex">
        <SidebarNav
          user={user}
          pendingCount={stats.pending}
          unread={unread}
          onOpenNotifications={openDrawer}
        />
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
        <SidebarNav
          user={user}
          pendingCount={stats.pending}
          unread={unread}
          onNavigate={closeMobile}
          onOpenNotifications={() => {
            closeMobile()
            openDrawer()
          }}
        />
        <div className="mt-auto border-t border-slate-100 p-3">
          <button
            type="button"
            onClick={() => {
              closeMobile()
              handleLogout()
            }}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium"
          >
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col md:pl-60">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
          <button
            type="button"
            className="rounded-lg border border-slate-200 p-2 md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{user?.name}</p>
            <p className="text-xs text-ink-500">Manager portal</p>
          </div>
          <BellButton unread={unread} onClick={openDrawer} />
        </header>

        <nav className="fixed bottom-0 left-0 right-0 z-20 flex border-t bg-white md:hidden">
          {bottomNav.map(({ to, end, short, isDrawer }) =>
            isDrawer ? (
              <button
                key={short}
                type="button"
                onClick={openDrawer}
                className="flex flex-1 flex-col items-center py-2 text-[10px] font-semibold text-ink-500"
              >
                {short}
              </button>
            ) : (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex flex-1 flex-col items-center py-2 text-[10px] font-semibold ${
                    isActive ? 'text-violet-700' : 'text-ink-500'
                  }`
                }
              >
                {short}
              </NavLink>
            ),
          )}
        </nav>

        <main className="flex-1 overflow-auto p-4 pb-24 md:p-8 md:pb-8">
          <Outlet />
        </main>
      </div>

      {user?.email && (
        <NotificationDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          title="Manager notifications"
          notificationsPath="/manager/notifications"
          items={notifications}
          onMarkAllRead={handleMarkAllRead}
          onToggleRead={handleToggleRead}
        />
      )}
    </div>
  )
}
