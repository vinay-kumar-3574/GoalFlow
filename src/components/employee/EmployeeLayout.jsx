import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LogoMark } from '../landing/icons'
import { useAuth } from '../../context/AuthContext'
import { ROLE_LABELS } from '../../lib/auth'
import { SHEET_STATUS_LABELS } from '../../constants/goals'
import { getUnreadCount } from '../../lib/notifications'
import { useEmployeeData } from '../../hooks/useEmployeeData'

const mainNav = [
  { to: '/employee', end: true, label: 'Overview', short: 'Home' },
  { to: '/employee/goals', end: false, label: 'My Goal Sheet', short: 'Goals' },
  { to: '/employee/shared-goals', end: false, label: 'Shared Goals', short: 'Shared' },
  { to: '/employee/check-in', end: false, label: 'Quarterly Check-in', short: 'Check-in' },
  { to: '/employee/progress', end: false, label: 'My Progress', short: 'Progress' },
]

function SidebarNav({ user, sheet, unread, onNavigate }) {
  return (
    <>
      <div className="border-b border-slate-100 p-5">
        <NavLink
          to="/employee"
          onClick={onNavigate}
          className="flex items-center gap-2 font-semibold text-ink-900"
        >
          <LogoMark className="h-8 w-8" />
          <span>
            Goal<span className="text-brand-600">Flow</span>
          </span>
        </NavLink>
        <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-brand-600">
          {ROLE_LABELS.employee}
        </p>
        <p className="mt-1 truncate text-sm font-medium text-ink-800">{user?.name}</p>
        {sheet && (
          <p className="mt-2 rounded-lg bg-brand-50 px-2.5 py-1.5 text-xs font-medium text-brand-800">
            {SHEET_STATUS_LABELS[sheet.status] || sheet.status}
          </p>
        )}
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3" aria-label="Employee navigation">
        {mainNav.map(({ to, end, label }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-ink-600 hover:bg-slate-100 hover:text-ink-900'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-100 p-3">
        <NavLink
          to="/employee/notifications"
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium ${
              isActive
                ? 'bg-brand-600 text-white'
                : 'text-ink-600 hover:bg-slate-100'
            }`
          }
        >
          Notifications
          {unread > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
              {unread}
            </span>
          )}
        </NavLink>
      </div>
    </>
  )
}

export default function EmployeeLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { sheet } = useEmployeeData(user?.email)
  const [mobileOpen, setMobileOpen] = useState(false)
  const unread = user?.email ? getUnreadCount(user.email) : 0

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  const closeMobile = () => setMobileOpen(false)

  return (
    <div className="flex min-h-svh bg-slate-100">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-slate-200 bg-white shadow-sm md:flex md:flex-col">
        <SidebarNav user={user} sheet={sheet} unread={unread} />
        <div className="border-t border-slate-100 p-3">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-ink-700 hover:bg-slate-50"
          >
            Sign out
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
        <SidebarNav user={user} sheet={sheet} unread={unread} onNavigate={closeMobile} />
        <div className="mt-auto border-t border-slate-100 p-3">
          <button
            type="button"
            onClick={() => {
              closeMobile()
              handleLogout()
            }}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-ink-700"
          >
            Sign out
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
            <p className="text-xs text-ink-500">Employee portal</p>
          </div>
          <NavLink
            to="/employee/notifications"
            className="relative rounded-lg p-2 text-ink-600 hover:bg-slate-100 md:hidden"
            aria-label="Notifications"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-6-6 6 6 0 00-6 6v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {unread > 0 && (
              <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                {unread}
              </span>
            )}
          </NavLink>
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
          aria-label="Employee quick nav"
        >
          {mainNav.slice(0, 4).map(({ to, end, short }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center py-2 text-[10px] font-semibold ${
                  isActive ? 'text-brand-700' : 'text-ink-500'
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
    </div>
  )
}
