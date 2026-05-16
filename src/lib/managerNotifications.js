const KEY_PREFIX = 'goalflow_manager_notifications_'

const DEFAULT = [
  {
    id: 'mn1',
    type: 'goal_submitted',
    title: 'Goal sheet submitted',
    body: 'Neha Kapoor submitted FY26 goals for your review.',
    read: false,
    createdAt: new Date().toISOString(),
    employeeEmail: 'neha@goalflow.com',
    actionPath: '/manager/approvals/neha%40goalflow.com',
  },
  {
    id: 'mn2',
    type: 'checkin_window',
    title: 'Q1 check-in window open',
    body: 'Complete structured check-ins for your direct reports by 31 July 2026.',
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    actionPath: '/manager/check-in',
  },
  {
    id: 'mn3',
    type: 'escalation',
    title: 'Check-in pending — Amit Verma',
    body: 'Amit has not completed Q1 updates on a locked sheet (demo escalation).',
    read: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    employeeEmail: 'amit@goalflow.com',
    actionPath: '/manager/check-in',
  },
]

export function getManagerNotifications(managerEmail) {
  try {
    const raw = localStorage.getItem(KEY_PREFIX + managerEmail)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  saveManagerNotifications(managerEmail, DEFAULT)
  return DEFAULT
}

export function saveManagerNotifications(managerEmail, list) {
  localStorage.setItem(KEY_PREFIX + managerEmail, JSON.stringify(list))
}

export function getManagerUnreadCount(managerEmail) {
  return getManagerNotifications(managerEmail).filter((n) => !n.read).length
}

export function markAllManagerNotificationsRead(managerEmail) {
  const list = getManagerNotifications(managerEmail).map((n) => ({ ...n, read: true }))
  saveManagerNotifications(managerEmail, list)
  return list
}

export function addManagerNotification(managerEmail, notification) {
  const list = getManagerNotifications(managerEmail)
  list.unshift({
    id: `mn_${Date.now()}`,
    read: false,
    createdAt: new Date().toISOString(),
    ...notification,
  })
  saveManagerNotifications(managerEmail, list)
  return list
}
