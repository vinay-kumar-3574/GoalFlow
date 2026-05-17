import { useState } from 'react'
import EmptyState from '../../components/shared/EmptyState'
import {
  getAdminNotifications,
  markAdminNotificationRead,
  markAllAdminNotificationsRead,
} from '../../lib/adminNotifications'

const TYPE_LABELS = {
  escalation: 'Escalation',
  unlock: 'Goal unlocked',
  employee: 'Employee',
  cycle: 'Cycle',
  export: 'Export',
}

export default function AdminNotificationsPage() {
  const [list, setList] = useState(() => getAdminNotifications())

  function refresh() {
    setList(getAdminNotifications())
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-950">Notifications</h1>
          <p className="mt-1 text-sm text-ink-600">Admin-specific alerts and system events.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            markAllAdminNotificationsRead()
            refresh()
          }}
          className="text-sm font-medium text-teal-700"
        >
          Mark all read
        </button>
      </div>

      {list.length === 0 ? (
        <EmptyState
          className="mt-8"
          icon="inbox"
          title="No notifications"
          description="Escalations, unlock confirmations, cycle changes, and exports will be listed here."
        />
      ) : (
      <ul className="mt-8 space-y-2">
        {list.map((n) => (
          <li
            key={n.id}
            className={`rounded-xl border px-4 py-3 ${
              n.read ? 'border-slate-100 bg-white' : 'border-teal-200 bg-teal-50/50'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-semibold uppercase text-teal-700">
                  {TYPE_LABELS[n.type] || n.type}
                </span>
                <p className="font-medium text-ink-900">{n.title}</p>
                <p className="mt-0.5 text-sm text-ink-600">{n.body}</p>
                <p className="mt-1 text-xs text-ink-400">{new Date(n.at).toLocaleString()}</p>
              </div>
              {!n.read && (
                <button
                  type="button"
                  onClick={() => {
                    markAdminNotificationRead(n.id)
                    refresh()
                  }}
                  className="shrink-0 text-xs font-semibold text-teal-700"
                >
                  Mark read
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
      )}

      <section className="mt-10 rounded-xl border border-dashed border-slate-200 p-4 text-xs text-ink-500">
        <p className="font-semibold text-ink-700">Admin notification types</p>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>Escalation triggered for any employee</li>
          <li>Goal unlocked confirmation</li>
          <li>New employee added to org</li>
          <li>Cycle window opened or closed</li>
          <li>Export completed</li>
          <li>Bulk shared goal push completed</li>
          <li>Manager missing check-in deadline</li>
        </ul>
      </section>
    </div>
  )
}
