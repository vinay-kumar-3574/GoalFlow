import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  getManagerNotifications,
  markAllManagerNotificationsRead,
} from '../../lib/managerNotifications'
import { useState } from 'react'

export default function ManagerNotificationsPage() {
  const { user } = useAuth()
  const [list, setList] = useState(() => getManagerNotifications(user?.email))

  function handleMarkAll() {
    setList(markAllManagerNotificationsRead(user?.email))
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-semibold text-ink-950">Notifications</h1>
        <button
          type="button"
          onClick={handleMarkAll}
          className="text-sm font-semibold text-violet-700 hover:underline"
        >
          Mark all read
        </button>
      </div>
      <p className="mt-1 text-sm text-ink-600">Manager alerts for your direct reports only.</p>

      <ul className="mt-6 space-y-3">
        {list.map((n) => (
          <li
            key={n.id}
            className={`rounded-xl border p-4 ${
              n.read ? 'border-slate-200 bg-white' : 'border-violet-200 bg-violet-50/50'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-ink-900">{n.title}</p>
                <p className="mt-1 text-sm text-ink-600">{n.body}</p>
                <p className="mt-2 text-xs text-ink-400">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
              {!n.read && (
                <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" aria-hidden />
              )}
            </div>
            {n.actionPath && (
              <Link
                to={n.actionPath}
                className="mt-3 inline-block text-sm font-semibold text-violet-700 hover:underline"
              >
                Open →
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
