const AUDIT_KEY = 'goalflow_audit_log'

export const AUDIT_ACTIONS = {
  submitted: 'submitted',
  approved: 'approved',
  returned: 'returned',
  unlock: 'unlock',
  shared: 'shared',
  achievement: 'achievement',
  comment: 'comment',
  cycle: 'cycle',
  employee: 'employee',
  role: 'role',
  config: 'config',
  relock: 'relock',
  export: 'export',
}

export const AUDIT_ACTION_LABELS = {
  [AUDIT_ACTIONS.submitted]: 'Goal submitted',
  [AUDIT_ACTIONS.approved]: 'Goal approved',
  [AUDIT_ACTIONS.returned]: 'Goal returned',
  [AUDIT_ACTIONS.unlock]: 'Goal unlocked',
  [AUDIT_ACTIONS.shared]: 'Shared goal pushed',
  [AUDIT_ACTIONS.achievement]: 'Achievement updated',
  [AUDIT_ACTIONS.comment]: 'Check-in comment added',
  [AUDIT_ACTIONS.cycle]: 'Cycle window opened/closed',
  [AUDIT_ACTIONS.employee]: 'Employee added/deactivated',
  [AUDIT_ACTIONS.role]: 'Role changed',
  [AUDIT_ACTIONS.config]: 'Configuration updated',
  [AUDIT_ACTIONS.relock]: 'Goal re-locked',
  [AUDIT_ACTIONS.export]: 'Export completed',
}

const SEED_LOGS = [
  {
    id: 'audit_seed_1',
    at: new Date(Date.now() - 86400000 * 2).toISOString(),
    userId: 'hr@goalflow.com',
    userName: 'Anita Desai',
    role: 'admin',
    action: AUDIT_ACTIONS.unlock,
    entity: 'Goal',
    entityId: 'priya@goalflow.com',
    goalTitle: 'Increase North region revenue',
    field: 'adminUnlocked',
    oldValue: 'locked',
    newValue: 'draft',
    note: 'Policy exception — target adjustment',
    department: 'Sales — North',
  },
  {
    id: 'audit_seed_2',
    at: new Date(Date.now() - 86400000).toISOString(),
    userId: 'hr@goalflow.com',
    userName: 'Anita Desai',
    role: 'admin',
    action: AUDIT_ACTIONS.relock,
    entity: 'GoalSheet',
    entityId: 'priya@goalflow.com',
    goalTitle: '—',
    field: 'status',
    oldValue: 'unlocked',
    newValue: 'locked',
    note: 'Exception edit completed',
    department: 'Sales — North',
  },
  {
    id: 'audit_seed_3',
    at: new Date(Date.now() - 3600000 * 5).toISOString(),
    userId: 'raj@goalflow.com',
    userName: 'Raj Mehta',
    role: 'manager',
    action: AUDIT_ACTIONS.approved,
    entity: 'GoalSheet',
    entityId: 'priya@goalflow.com',
    goalTitle: 'FY26 sheet',
    field: 'status',
    oldValue: 'submitted',
    newValue: 'locked',
    note: 'Approved and locked',
    department: 'Sales — North',
  },
]

export function getAuditLogs() {
  try {
    const raw = localStorage.getItem(AUDIT_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  localStorage.setItem(AUDIT_KEY, JSON.stringify(SEED_LOGS))
  return SEED_LOGS
}

function saveLogs(logs) {
  localStorage.setItem(AUDIT_KEY, JSON.stringify(logs))
}

export function appendAuditLog(entry) {
  const logs = getAuditLogs()
  logs.unshift({
    id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    at: new Date().toISOString(),
    ...entry,
  })
  saveLogs(logs.slice(0, 500))
  return logs[0]
}

export function filterAuditLogs(
  logs,
  { action, role, search, dateFrom, dateTo, department } = {},
) {
  return logs.filter((l) => {
    if (action && action !== 'all' && l.action !== action) return false
    if (role && role !== 'all' && l.role !== role) return false
    if (department && department !== 'all' && l.department !== department) return false
    if (dateFrom && new Date(l.at) < new Date(dateFrom)) return false
    if (dateTo) {
      const end = new Date(dateTo)
      end.setHours(23, 59, 59, 999)
      if (new Date(l.at) > end) return false
    }
    if (search) {
      const q = search.toLowerCase()
      const hay = `${l.entityId} ${l.field} ${l.note || ''} ${l.userName || ''} ${l.goalTitle || ''}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })
}

export function paginateLogs(logs, page = 1, perPage = 10) {
  const sorted = [...logs].sort((a, b) => new Date(b.at) - new Date(a.at))
  const total = sorted.length
  const start = (page - 1) * perPage
  return {
    items: sorted.slice(start, start + perPage),
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  }
}
