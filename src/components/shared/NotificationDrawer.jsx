import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Sheet, SheetBody, SheetContent, SheetHeader, SheetTitle } from '../ui/Sheet'

export default function NotificationDrawer({
  open,
  onOpenChange,
  title = 'Notifications',
  notificationsPath,
  items,
  onMarkAllRead,
  onToggleRead,
  emptyMessage = 'No notifications yet.',
}) {
  const [list, setList] = useState(items)

  useEffect(() => {
    if (open) setList(items)
  }, [open, items])

  const unread = list.filter((n) => !n.read).length

  function handleMarkAll() {
    const next = onMarkAllRead()
    setList(next)
  }

  function handleToggle(id) {
    const next = onToggleRead(id)
    setList(next)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <div className="flex items-center gap-2">
            {unread > 0 && (
              <button
                type="button"
                onClick={handleMarkAll}
                className="text-xs font-semibold text-teal-700 hover:underline"
              >
                Mark all read
              </button>
            )}
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-lg p-1 text-ink-500 hover:bg-slate-100"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </SheetHeader>
        <SheetBody>
          {list.length === 0 ? (
            <p className="text-center text-sm text-ink-500">{emptyMessage}</p>
          ) : (
            <ul className="space-y-2">
              {list.map((n) => (
                <li
                  key={n.id}
                  className={`rounded-xl border p-3 text-sm ${
                    n.read ? 'border-slate-100 bg-white' : 'border-teal-200 bg-teal-50/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-ink-900">{n.title}</p>
                      <p className="mt-0.5 text-ink-600">{n.body}</p>
                      <p className="mt-1 text-xs text-ink-400">
                        {new Date(n.createdAt || n.at).toLocaleString()}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggle(n.id)}
                      className="shrink-0 text-xs font-medium text-teal-700"
                    >
                      {n.read ? 'Unread' : 'Mark read'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {notificationsPath && (
            <Link
              to={notificationsPath}
              onClick={() => onOpenChange(false)}
              className="mt-4 block text-center text-sm font-semibold text-teal-700"
            >
              View all notifications →
            </Link>
          )}
        </SheetBody>
      </SheetContent>
    </Sheet>
  )
}
