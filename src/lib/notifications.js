const KEY = 'goalflow_notifications'

const DEFAULT_NOTIFICATIONS = [
  {
    id: 'n1',
    title: 'Q1 check-in window is open',
    body: 'Submit your planned vs actual updates by July 31.',
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'n2',
    title: 'Goal sheet approved',
    body: 'Your manager has locked your goal sheet for FY26.',
    read: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'n3',
    title: 'Shared KPI assigned',
    body: 'Departmental KPI has been added to your sheet — review weightage.',
    read: true,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
]

export function getNotifications(email) {
  try {
    const raw = localStorage.getItem(`${KEY}_${email}`)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  const seeded = DEFAULT_NOTIFICATIONS
  saveNotifications(email, seeded)
  return seeded
}

export function saveNotifications(email, list) {
  localStorage.setItem(`${KEY}_${email}`, JSON.stringify(list))
}

export function getUnreadCount(email) {
  return getNotifications(email).filter((n) => !n.read).length
}

export function markAllRead(email) {
  const list = getNotifications(email).map((n) => ({ ...n, read: true }))
  saveNotifications(email, list)
  return list
}

export function addNotification(email, { title, body }) {
  const list = getNotifications(email)
  list.unshift({
    id: `n_${Date.now()}`,
    title,
    body,
    read: false,
    createdAt: new Date().toISOString(),
  })
  saveNotifications(email, list)
  return list
}
