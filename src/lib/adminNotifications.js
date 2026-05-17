const ADMIN_NOTIF_KEY = 'goalflow_admin_notifications'

const SEED = [
  {
    id: 'an_1',
    at: new Date(Date.now() - 3600000).toISOString(),
    type: 'escalation',
    title: 'Escalation triggered',
    body: 'Amit Verma — Rule 1: goals not submitted within window',
    read: false,
  },
  {
    id: 'an_2',
    at: new Date(Date.now() - 7200000).toISOString(),
    type: 'unlock',
    title: 'Goal unlocked',
    body: 'Priya Sharma — exception unlock logged in audit trail',
    read: true,
  },
]

export function getAdminNotifications() {
  try {
    const raw = localStorage.getItem(ADMIN_NOTIF_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  localStorage.setItem(ADMIN_NOTIF_KEY, JSON.stringify(SEED))
  return SEED
}

function save(list) {
  localStorage.setItem(ADMIN_NOTIF_KEY, JSON.stringify(list.slice(0, 100)))
}

export function getAdminUnreadCount() {
  return getAdminNotifications().filter((n) => !n.read).length
}

export function addAdminNotification({ type, title, body }) {
  const list = getAdminNotifications()
  list.unshift({
    id: `an_${Date.now()}`,
    at: new Date().toISOString(),
    type,
    title,
    body,
    read: false,
  })
  save(list)
  return list[0]
}

export function markAdminNotificationRead(id) {
  const list = getAdminNotifications().map((n) =>
    n.id === id ? { ...n, read: true } : n,
  )
  save(list)
  return list
}

export function markAllAdminNotificationsRead() {
  const list = getAdminNotifications().map((n) => ({ ...n, read: true }))
  save(list)
  return list
}

export function toggleAdminNotificationRead(id) {
  const list = getAdminNotifications().map((n) =>
    n.id === id ? { ...n, read: !n.read } : n,
  )
  save(list)
  return list
}
