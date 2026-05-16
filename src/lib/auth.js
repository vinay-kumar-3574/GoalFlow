export const ROLES = {
  employee: 'employee',
  manager: 'manager',
  admin: 'admin',
}

export const ROLE_LABELS = {
  [ROLES.employee]: 'Employee',
  [ROLES.manager]: 'Manager (L1)',
  [ROLES.admin]: 'Admin / HR',
}

export const DEMO_USERS = [
  {
    email: 'priya@goalflow.com',
    password: 'demo123',
    role: ROLES.employee,
    name: 'Priya Sharma',
    demoNote: 'Locked sheet · 5 goals · Q1 check-in',
  },
  {
    email: 'amit@goalflow.com',
    password: 'demo123',
    role: ROLES.employee,
    name: 'Amit Verma',
    demoNote: 'Draft sheet · test Save / Submit / Add goal',
  },
  {
    email: 'raj@goalflow.com',
    password: 'demo123',
    role: ROLES.manager,
    name: 'Raj Mehta',
    demoNote: 'Team: Priya, Neha (pending), Amit (draft)',
  },
  {
    email: 'hr@goalflow.com',
    password: 'demo123',
    role: ROLES.admin,
    name: 'Anita Desai',
    demoNote: 'Completion dashboard · export · unlock · audit',
  },
]

const STORAGE_KEY = 'goalflow_session'

export function getDashboardPath(role) {
  if (role === ROLES.manager) return '/manager'
  if (role === ROLES.admin) return '/admin'
  return '/employee'
}

export function authenticate(email, password) {
  const user = DEMO_USERS.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password,
  )
  if (!user) return null
  return { email: user.email, name: user.name, role: user.role }
}

export function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function saveSession(user) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEY)
}
