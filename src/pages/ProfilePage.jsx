import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROLE_LABELS, ROLES } from '../lib/auth'
import { getEmployeeDisplay } from '../lib/org'

const accent = {
  [ROLES.employee]: {
    badge: 'bg-brand-100 text-brand-800 dark:bg-brand-900/40 dark:text-brand-200',
    button: 'bg-brand-600 hover:bg-brand-700',
  },
  [ROLES.manager]: {
    badge: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200',
    button: 'bg-violet-600 hover:bg-violet-700',
  },
  [ROLES.admin]: {
    badge: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200',
    button: 'bg-teal-600 hover:bg-teal-700',
  },
}

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const org = user?.role === ROLES.employee ? getEmployeeDisplay(user.email) : null
  const styles = accent[user?.role] || accent[ROLES.employee]

  function handleSignOut() {
    logout()
    navigate('/login', { replace: true })
  }

  if (!user) return null

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-display text-2xl font-semibold text-ink-950 dark:text-slate-100">Profile</h1>
      <p className="mt-1 text-sm text-ink-600 dark:text-slate-400">Your account and role in GoalFlow.</p>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-bold ${styles.badge}`}
          >
            {user.name
              ?.split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-semibold text-ink-900 dark:text-slate-100">{user.name}</h2>
            <p className="mt-0.5 text-sm text-ink-500 dark:text-slate-400">{user.email}</p>
            <span
              className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles.badge}`}
            >
              {ROLE_LABELS[user.role]}
            </span>
          </div>
        </div>

        <dl className="mt-6 space-y-3 border-t border-slate-100 pt-6 text-sm dark:border-slate-700">
          {org?.department && (
            <div className="flex justify-between gap-4">
              <dt className="text-ink-500 dark:text-slate-400">Department</dt>
              <dd className="font-medium text-ink-900 dark:text-slate-200">{org.department}</dd>
            </div>
          )}
          {org?.title && (
            <div className="flex justify-between gap-4">
              <dt className="text-ink-500 dark:text-slate-400">Title</dt>
              <dd className="font-medium text-ink-900 dark:text-slate-200">{org.title}</dd>
            </div>
          )}
          {org?.reportingLine && (
            <div className="flex justify-between gap-4">
              <dt className="text-ink-500 dark:text-slate-400">Reporting</dt>
              <dd className="text-right font-medium text-ink-900 dark:text-slate-200">{org.reportingLine}</dd>
            </div>
          )}
          <div className="flex justify-between gap-4">
            <dt className="text-ink-500 dark:text-slate-400">Cycle</dt>
            <dd className="font-medium text-ink-900 dark:text-slate-200">FY26</dd>
          </div>
        </dl>

        <button
          type="button"
          onClick={handleSignOut}
          className={`mt-6 w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white ${styles.button}`}
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
