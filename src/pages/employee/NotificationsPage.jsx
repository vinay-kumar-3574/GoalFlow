import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getNotifications, markAllRead, saveNotifications } from '../../lib/notifications'

export default function NotificationsPage() {
  const { user } = useAuth()
  const [list, setList] = useState(() => getNotifications(user?.email))
  const unread = list.filter((n) => !n.read).length

  function handleMarkAllRead() {
    const updated = markAllRead(user.email)
    setList(updated)
  }

  function toggleRead(id) {
    const updated = list.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    setList(updated)
    saveNotifications(user.email, updated)
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-950">Notifications</h1>
          <p className="mt-1 text-sm text-ink-600">
            {unread > 0 ? `${unread} unread` : 'All caught up'}
          </p>
        </div>
        {unread > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-ink-700 hover:bg-slate-50"
          >
            Mark all read
          </button>
        )}
      </div>

      <ul className="mt-6 space-y-3">
        {list.map((n) => (
          <li
            key={n.id}
            className={`rounded-xl border p-4 transition-colors ${
              n.read
                ? 'border-slate-200 bg-white'
                : 'border-brand-200 bg-brand-50/50'
            }`}
          >
            <button
              type="button"
              onClick={() => toggleRead(n.id)}
              className="w-full text-left"
            >
              <div className="flex items-start gap-2">
                {!n.read && (
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-600" />
                )}
                <div className={!n.read ? '' : 'pl-4'}>
                  <p className="font-semibold text-ink-900">{n.title}</p>
                  <p className="mt-1 text-sm text-ink-600">{n.body}</p>
                  <p className="mt-2 text-xs text-ink-400">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
