import {
  CHECKIN_STATUS,
  PERIODS,
  SHEET_STATUS,
  THRUST_AREAS,
  UOM_LABELS,
} from '../constants/goals'
import { DEMO_USERS, ROLES } from './auth'
import { appendAuditLog, AUDIT_ACTIONS } from './auditLog'
import { addAdminNotification } from './adminNotifications'
import {
  ensureTeamSeeded,
  getEmployeeData,
  saveEmployeeData,
} from './goalStorage'
import {
  getCheckInCompletion,
  getManagerComment,
  isCheckInMarkedComplete,
} from './managerStorage'
import { MANAGER_EMAIL, TEAM_BY_MANAGER } from './org'
import { computeWeightedTotal } from './progressScore'
import { PRIYA_EMAIL, NEHA_EMAIL, AMIT_EMAIL } from './employeeSeed'
import { SEED_VERSION } from './employeeSeed'

const ADMIN_CONFIG_KEY = 'goalflow_admin_config'

const DEFAULT_CYCLE = {
  year: 2026,
  demoMode: true,
  phase1OpenDate: '2026-05-01',
  windowOpen: {
    phase1: true,
    q1: true,
    q2: false,
    q3: false,
    q4: false,
  },
  goalSetting: {
    label: 'Phase 1 Goal Setting',
    startMonth: 5,
    endMonth: 6,
    deadline: '30 June 2026',
  },
  quarters: {
    q1: { label: 'Q1 Check-in (July)', startMonth: 7, endMonth: 8, deadline: '31 July 2026' },
    q2: { label: 'Q2 Check-in (October)', startMonth: 10, endMonth: 11, deadline: '31 October 2026' },
    q3: { label: 'Q3 Check-in (January)', startMonth: 1, endMonth: 2, deadline: '31 January 2027' },
    q4: { label: 'Q4 / Annual (Mar–Apr)', startMonth: 3, endMonth: 4, deadline: '30 April 2027' },
  },
}

const DEFAULT_ORG = {
  departments: ['Sales — North', 'Marketing', 'Sales — Enterprise'],
  managers: [
    {
      email: MANAGER_EMAIL,
      name: 'Raj Mehta',
      reports: [PRIYA_EMAIL, NEHA_EMAIL, AMIT_EMAIL],
    },
  ],
  assignments: {
    [PRIYA_EMAIL]: { managerEmail: MANAGER_EMAIL, department: 'Sales — North' },
    [NEHA_EMAIL]: { managerEmail: MANAGER_EMAIL, department: 'Marketing' },
    [AMIT_EMAIL]: { managerEmail: MANAGER_EMAIL, department: 'Sales — Enterprise' },
  },
  employees: [
    {
      email: PRIYA_EMAIL,
      name: 'Priya Sharma',
      role: ROLES.employee,
      department: 'Sales — North',
      managerEmail: MANAGER_EMAIL,
      status: 'active',
    },
    {
      email: NEHA_EMAIL,
      name: 'Neha Kapoor',
      role: ROLES.employee,
      department: 'Marketing',
      managerEmail: MANAGER_EMAIL,
      status: 'active',
    },
    {
      email: AMIT_EMAIL,
      name: 'Amit Verma',
      role: ROLES.employee,
      department: 'Sales — Enterprise',
      managerEmail: MANAGER_EMAIL,
      status: 'active',
    },
    {
      email: MANAGER_EMAIL,
      name: 'Raj Mehta',
      role: ROLES.manager,
      department: 'Sales Leadership',
      managerEmail: '',
      status: 'active',
    },
    {
      email: 'hr@goalflow.com',
      name: 'Anita Desai',
      role: ROLES.admin,
      department: 'Human Resources',
      managerEmail: '',
      status: 'active',
    },
  ],
}

export function getAdminConfig() {
  try {
    const raw = localStorage.getItem(ADMIN_CONFIG_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (!parsed.org?.employees?.length) {
        parsed.org = { ...DEFAULT_ORG, ...parsed.org, employees: DEFAULT_ORG.employees }
      }
      if (!parsed.cycle?.windowOpen) {
        parsed.cycle = { ...DEFAULT_CYCLE, ...parsed.cycle, windowOpen: DEFAULT_CYCLE.windowOpen }
      }
      return parsed
    }
  } catch {
    /* ignore */
  }
  const config = {
    cycle: DEFAULT_CYCLE,
    thrustAreas: [...THRUST_AREAS],
    org: DEFAULT_ORG,
  }
  saveAdminConfig(config)
  return config
}

export function saveAdminConfig(config) {
  localStorage.setItem(ADMIN_CONFIG_KEY, JSON.stringify(config))
}

export function getCycleConfig() {
  return getAdminConfig().cycle || DEFAULT_CYCLE
}

export function saveCycleConfig(cycle) {
  const openCount = Object.values(cycle.windowOpen || {}).filter(Boolean).length
  if (openCount > 1 && !cycle.demoMode) {
    return { ok: false, error: 'Only one cycle window can be open at a time (disable demo mode).' }
  }
  const config = getAdminConfig()
  config.cycle = { ...config.cycle, ...cycle }
  saveAdminConfig(config)
  appendAuditLog({
    userId: 'hr@goalflow.com',
    userName: 'Admin',
    role: 'admin',
    action: AUDIT_ACTIONS.cycle,
    entity: 'Cycle',
    entityId: String(cycle.year),
    goalTitle: '—',
    field: 'cycle',
    oldValue: '—',
    newValue: 'updated',
    note: 'Cycle configuration saved',
  })
  addAdminNotification({
    type: 'cycle',
    title: 'Cycle configuration saved',
    body: `FY${cycle.year} windows updated`,
  })
  return { ok: true, cycle: config.cycle }
}

export function toggleCycleWindow(key, open) {
  const cycle = getCycleConfig()
  const windowOpen = { ...cycle.windowOpen, [key]: open }
  if (open && !cycle.demoMode) {
    const others = Object.entries(windowOpen).filter(([k, v]) => v && k !== key)
    if (others.length > 0) {
      return { ok: false, error: 'Close other windows first, or enable demo mode.' }
    }
  }
  return saveCycleConfig({ ...cycle, windowOpen })
}

export function getCycleTimelineState() {
  const cycle = getCycleConfig()
  const steps = [
    { key: 'phase1', label: 'Phase 1' },
    { key: 'q1', label: 'Q1' },
    { key: 'q2', label: 'Q2' },
    { key: 'q3', label: 'Q3' },
    { key: 'q4', label: 'Q4' },
  ]
  const openKeys = Object.entries(cycle.windowOpen || {})
    .filter(([, v]) => v)
    .map(([k]) => k)
  const activeKey = openKeys[0] || 'phase1'
  const activeIdx = steps.findIndex((s) => s.key === activeKey)

  return steps.map((s, i) => ({
    ...s,
    status: i < activeIdx ? 'done' : i === activeIdx ? 'active' : 'future',
    open: Boolean(cycle.windowOpen?.[s.key]),
  }))
}

export function getThrustAreas() {
  return getAdminConfig().thrustAreas || [...THRUST_AREAS]
}

export function saveThrustAreas(areas) {
  const config = getAdminConfig()
  config.thrustAreas = areas
  saveAdminConfig(config)
  return areas
}

export function getOrgConfig() {
  return getAdminConfig().org || DEFAULT_ORG
}

export function saveOrgConfig(org) {
  const config = getAdminConfig()
  config.org = org
  saveAdminConfig(config)
  return org
}

export function getOrgEmployees() {
  const org = getOrgConfig()
  return org.employees || DEFAULT_ORG.employees
}

export function getDepartments() {
  const org = getOrgConfig()
  const fromEmployees = getOrgEmployees().map((e) => e.department).filter(Boolean)
  return [...new Set([...(org.departments || []), ...fromEmployees])]
}

export function addDepartment(name) {
  const org = getOrgConfig()
  const trimmed = name?.trim()
  if (!trimmed) return { ok: false, error: 'Department name required' }
  if (!org.departments.includes(trimmed)) {
    org.departments = [...(org.departments || []), trimmed]
    saveOrgConfig(org)
  }
  return { ok: true, departments: org.departments }
}

export function renameDepartment(oldName, newName) {
  const org = getOrgConfig()
  org.departments = (org.departments || []).map((d) => (d === oldName ? newName : d))
  org.employees = (org.employees || []).map((e) =>
    e.department === oldName ? { ...e, department: newName } : e,
  )
  Object.keys(org.assignments || {}).forEach((email) => {
    if (org.assignments[email].department === oldName) {
      org.assignments[email].department = newName
    }
  })
  saveOrgConfig(org)
  return { ok: true }
}

export function upsertOrgEmployee(record, adminUser) {
  const org = getOrgConfig()
  const employees = [...(org.employees || [])]
  const idx = employees.findIndex((e) => e.email === record.email)
  const isNew = idx < 0
  const prev = idx >= 0 ? employees[idx] : null

  if (isNew) {
    employees.push({ ...record, status: record.status || 'active' })
  } else {
    employees[idx] = { ...employees[idx], ...record }
  }

  org.employees = employees
  org.assignments = org.assignments || {}
  org.assignments[record.email] = {
    managerEmail: record.managerEmail || '',
    department: record.department || '',
  }

  if (record.managerEmail) {
    const mgr = org.managers?.find((m) => m.email === record.managerEmail)
    if (mgr && !mgr.reports.includes(record.email)) {
      mgr.reports.push(record.email)
    }
  }

  saveOrgConfig(org)
  ensureTeamSeeded([record.email])

  appendAuditLog({
    userId: adminUser?.email || 'hr@goalflow.com',
    userName: adminUser?.name || 'Admin',
    role: 'admin',
    action: isNew ? AUDIT_ACTIONS.employee : AUDIT_ACTIONS.role,
    entity: 'Employee',
    entityId: record.email,
    goalTitle: '—',
    field: isNew ? 'created' : 'updated',
    oldValue: prev ? prev.role : '—',
    newValue: record.role,
    note: `${record.name} · ${record.department}`,
    department: record.department,
  })

  if (isNew) {
    addAdminNotification({
      type: 'employee',
      title: 'New employee added',
      body: `${record.name} added to org`,
    })
  }

  return { ok: true }
}

export function deactivateOrgEmployee(email, adminUser) {
  const org = getOrgConfig()
  const employees = (org.employees || []).map((e) =>
    e.email === email ? { ...e, status: 'inactive' } : e,
  )
  org.employees = employees
  saveOrgConfig(org)
  appendAuditLog({
    userId: adminUser?.email,
    userName: adminUser?.name,
    role: 'admin',
    action: AUDIT_ACTIONS.employee,
    entity: 'Employee',
    entityId: email,
    goalTitle: '—',
    field: 'status',
    oldValue: 'active',
    newValue: 'inactive',
    note: 'Employee deactivated',
  })
  return { ok: true }
}

export function getAllEmployeeEmails() {
  return getOrgEmployees()
    .filter((e) => e.status !== 'inactive')
    .map((e) => e.email)
}

export function getAllEmployeesWithData() {
  const orgEmployees = getOrgEmployees().filter((e) => e.status !== 'inactive' && e.role === ROLES.employee)
  const emails = orgEmployees.map((e) => e.email)
  ensureTeamSeeded(emails)

  return orgEmployees.map((emp) => {
    const assign = getOrgConfig().assignments[emp.email] || {}
    const teamMember = Object.values(TEAM_BY_MANAGER)
      .flat()
      .find((m) => m.email === emp.email)
    return {
      email: emp.email,
      name: emp.name,
      role: emp.role,
      department: emp.department || assign.department || teamMember?.department || '',
      managerEmail: emp.managerEmail || assign.managerEmail || MANAGER_EMAIL,
      status: emp.status,
      data: getEmployeeData(emp.email),
    }
  })
}

export function getManagersList() {
  return getOrgEmployees().filter(
    (e) => e.status !== 'inactive' && (e.role === ROLES.manager || e.role === ROLES.admin),
  )
}

export function unlockGoal(employeeEmail, goalId, adminUser, reason) {
  const data = getEmployeeData(employeeEmail)
  const goal = data.sheet.goals.find((g) => g.id === goalId)
  if (!goal) return { ok: false, error: 'Goal not found.' }
  if (data.sheet.status !== SHEET_STATUS.locked && !data.sheet.adminUnlocked) {
    return { ok: false, error: 'Goal sheet must be locked to unlock.' }
  }

  const employee = getOrgEmployees().find((e) => e.email === employeeEmail)

  data.sheet.adminUnlocked = true
  data.sheet.status = SHEET_STATUS.draft
  data.sheet.unlockedAt = new Date().toISOString()
  data.sheet.unlockedBy = adminUser.email
  data.sheet.unlockReason = reason?.trim() || 'Admin exception'
  data.sheet.unlockedGoalId = goalId
  saveEmployeeData(employeeEmail, data)

  appendAuditLog({
    userId: adminUser.email,
    userName: adminUser.name,
    role: 'admin',
    action: AUDIT_ACTIONS.unlock,
    entity: 'Goal',
    entityId: employeeEmail,
    goalTitle: goal.title,
    field: 'status',
    oldValue: 'locked',
    newValue: 'draft',
    note: data.sheet.unlockReason,
    department: employee?.department,
  })

  addAdminNotification({
    type: 'unlock',
    title: 'Goal unlocked',
    body: `${employee?.name || employeeEmail} — ${goal.title}`,
  })

  return { ok: true, data }
}

export function unlockGoalSheet(employeeEmail, adminUser, reason) {
  const data = getEmployeeData(employeeEmail)
  const firstGoal = data.sheet.goals[0]
  if (!firstGoal) return { ok: false, error: 'No goals on sheet.' }
  return unlockGoal(employeeEmail, firstGoal.id, adminUser, reason)
}

export function relockGoalSheet(employeeEmail, adminUser) {
  const data = getEmployeeData(employeeEmail)
  if (!data.sheet.adminUnlocked) {
    return { ok: false, error: 'Sheet is not in admin-unlocked state.' }
  }

  data.sheet.adminUnlocked = false
  data.sheet.status = SHEET_STATUS.locked
  data.sheet.relockedAt = new Date().toISOString()
  data.sheet.unlockReason = null
  data.sheet.unlockedGoalId = null
  saveEmployeeData(employeeEmail, data)

  appendAuditLog({
    userId: adminUser.email,
    userName: adminUser.name,
    role: 'admin',
    action: AUDIT_ACTIONS.relock,
    entity: 'GoalSheet',
    entityId: employeeEmail,
    goalTitle: '—',
    field: 'status',
    oldValue: 'draft',
    newValue: 'locked',
    note: 'Admin re-locked',
  })

  return { ok: true, data }
}

export function getAdminDashboardStats(period = PERIODS.q1) {
  const employees = getAllEmployeesWithData()
  const totalEmployees = employees.length
  let totalGoals = 0
  let submitted = 0
  let approved = 0
  let checkInDone = 0

  employees.forEach((e) => {
    totalGoals += e.data.sheet.goals.length
    const st = e.data.sheet.status
    if (st === SHEET_STATUS.submitted || st === SHEET_STATUS.locked || st === SHEET_STATUS.returned) {
      submitted += 1
    }
    if (st === SHEET_STATUS.locked) approved += 1
    if (getCheckInCompletion(e.data, period).employeeDone) checkInDone += 1
  })

  const submissionRate = totalEmployees
    ? Math.round((submitted / totalEmployees) * 100)
    : 0
  const approvalRate = totalEmployees ? Math.round((approved / totalEmployees) * 100) : 0
  const checkInCompletionRate = approved
    ? Math.round((checkInDone / approved) * 100)
    : 0

  return {
    totalEmployees,
    totalGoalsCreated: totalGoals,
    submissionRate,
    approvalRate,
    checkInCompletionRate,
    submittedPending: employees.filter((e) => e.data.sheet.status === SHEET_STATUS.submitted).length,
    adminUnlocked: employees.filter((e) => e.data.sheet.adminUnlocked).length,
  }
}

export function getCompletionCellStatus(employee, period) {
  if (employee.data.sheet.status !== SHEET_STATUS.locked) {
    return { state: 'gray', label: 'Not approved', tooltip: `${employee.name} — goal sheet not approved` }
  }
  const periodData = employee.data.checkIns?.[period] || {}
  const goals = employee.data.sheet.goals
  if (!goals.length) {
    return { state: 'red', label: 'Not started', tooltip: `${employee.name} — no goals` }
  }

  let filled = 0
  let hasPartial = false
  goals.forEach((g) => {
    const entry = periodData[g.id]
    if (!entry) return
    const st = entry.status
    if (st === CHECKIN_STATUS.completed) filled += 1
    else if (st === CHECKIN_STATUS.onTrack || entry.actual) hasPartial = true
  })

  if (getCheckInCompletion(employee.data, period).employeeDone) {
    const date = employee.data.sheet.approvedAt || 'Completed'
    return {
      state: 'green',
      label: 'Complete',
      tooltip: `${employee.name} — check-in complete · ${new Date(date).toLocaleDateString?.() || date}`,
    }
  }
  if (hasPartial || filled > 0) {
    return {
      state: 'amber',
      label: 'In progress',
      tooltip: `${employee.name} — in progress (${filled}/${goals.length} goals)`,
    }
  }
  return {
    state: 'red',
    label: 'Not started',
    tooltip: `${employee.name} — not started · overdue risk`,
  }
}

export function getManagerRollup(period = PERIODS.q1) {
  const managers = getManagersList().filter((m) => m.role === ROLES.manager)
  const employees = getAllEmployeesWithData()

  return managers
    .map((m) => {
      const team = employees.filter((e) => e.managerEmail === m.email)
      const cells = team.map((e) => ({
        employee: e,
        cell: getCompletionCellStatus(e, period),
      }))
      const done = cells.filter((c) => c.cell.state === 'green').length
      const pending = team.length - done
      const pct = team.length ? Math.round((done / team.length) * 100) : 0
      return {
        managerEmail: m.email,
        managerName: m.name,
        teamSize: team.length,
        checkInsDone: done,
        checkInsPending: pending,
        teamCompletePct: pct,
        team: cells,
      }
    })
    .sort((a, b) => b.teamCompletePct - a.teamCompletePct)
}

export function getCompletionRows(period = PERIODS.q1, filters = {}) {
  const employees = getAllEmployeesWithData()
  const managerEmail = filters.manager !== 'all' ? filters.manager : null

  return employees
    .filter((e) => {
      if (filters.department && filters.department !== 'all' && e.department !== filters.department) {
        return false
      }
      if (managerEmail && e.managerEmail !== managerEmail) return false
      return true
    })
    .map((e) => {
      const mgr = e.managerEmail
      const empDone = getCheckInCompletion(e.data, period).employeeDone
      const mgrComment = Boolean(getManagerComment(mgr, e.email, period)?.text)
      const mgrComplete = isCheckInMarkedComplete(mgr, e.email, period)
      const cell = getCompletionCellStatus(e, period)

      return {
        ...e,
        sheetStatus: e.data.sheet.status,
        employeeCheckIn: empDone ? 'Complete' : 'Pending',
        managerComment: mgrComment ? 'Saved' : 'Pending',
        managerCheckIn: mgrComplete ? 'Complete' : 'Pending',
        cell,
      }
    })
}

export function buildAchievementReportRows(filters = {}) {
  const employees = getAllEmployeesWithData()
  const rows = []
  const periodFilter = filters.quarter && filters.quarter !== 'all' ? filters.quarter : null

  employees.forEach((e) => {
    if (filters.department && filters.department !== 'all' && e.department !== filters.department) {
      return
    }
    if (filters.manager && filters.manager !== 'all' && e.managerEmail !== filters.manager) {
      return
    }
    const mgr = getOrgEmployees().find((x) => x.email === e.managerEmail)

    e.data.sheet.goals.forEach((goal) => {
      const periods = periodFilter ? [periodFilter] : [PERIODS.q1, PERIODS.q2, PERIODS.q3, PERIODS.q4]
      const qActuals = {}
      periods.forEach((p) => {
        const entry = e.data.checkIns?.[p]?.[goal.id] || {}
        qActuals[p] = entry.actual ?? entry.completionDate ?? ''
      })

      const finalStatus =
        e.data.checkIns?.[PERIODS.q4]?.[goal.id]?.status ||
        e.data.checkIns?.[PERIODS.q1]?.[goal.id]?.status ||
        CHECKIN_STATUS.notStarted

      if (filters.status && filters.status !== 'all') {
        const statusMap = {
          'Not Started': CHECKIN_STATUS.notStarted,
          'On Track': CHECKIN_STATUS.onTrack,
          Completed: CHECKIN_STATUS.completed,
        }
        if (finalStatus !== statusMap[filters.status]) return
      }
      if (filters.thrustArea && filters.thrustArea !== 'all' && goal.thrustArea !== filters.thrustArea) {
        return
      }
      if (filters.search) {
        const q = filters.search.toLowerCase()
        if (!e.name.toLowerCase().includes(q) && !goal.title.toLowerCase().includes(q)) return
      }

      rows.push({
        employeeName: e.name,
        department: e.department,
        manager: mgr?.name || e.managerEmail,
        goalTitle: goal.title,
        thrustArea: goal.thrustArea,
        uom: UOM_LABELS[goal.uomType] || goal.uomType,
        target: goal.target || goal.deadline || '—',
        q1: qActuals[PERIODS.q1] || '—',
        q2: qActuals[PERIODS.q2] || '—',
        q3: qActuals[PERIODS.q3] || '—',
        q4: qActuals[PERIODS.q4] || '—',
        finalStatus:
          finalStatus === CHECKIN_STATUS.completed
            ? 'Completed'
            : finalStatus === CHECKIN_STATUS.onTrack
              ? 'On Track'
              : 'Not Started',
        email: e.email,
      })
    })
  })

  return rows
}

export function exportAchievementReportCsv(filters, year, quarter) {
  const rows = buildAchievementReportRows(filters)
  const header = [
    'Employee Name',
    'Department',
    'Manager',
    'Goal Title',
    'Thrust Area',
    'UoM',
    'Target',
    'Q1 Actual',
    'Q2 Actual',
    'Q3 Actual',
    'Q4 Actual',
    'Final Status',
  ]
  const lines = [header.join(',')]
  rows.forEach((r) => {
    lines.push(
      [
        `"${r.employeeName}"`,
        `"${r.department}"`,
        `"${r.manager}"`,
        `"${r.goalTitle.replace(/"/g, '""')}"`,
        `"${r.thrustArea}"`,
        r.uom,
        r.target,
        r.q1,
        r.q2,
        r.q3,
        r.q4,
        r.finalStatus,
      ].join(','),
    )
  })

  const qLabel = quarter && quarter !== 'all' ? quarter.toUpperCase() : 'All'
  const filename = `GoalFlow_Achievement_Report_${year}_${qLabel}.csv`
  return { csv: lines.join('\n'), filename, rowCount: rows.length }
}

export function buildAchievementExport(period = PERIODS.q1) {
  return buildAchievementReportRows({ quarter: period })
}

export function exportAchievementCsv(period = PERIODS.q1) {
  const { csv } = exportAchievementReportCsv({ quarter: period }, getCycleConfig().year, period)
  return csv
}

export function resetAllDemoData() {
  const keys = [
    'goalflow_employee_data',
    'goalflow_employee_seed_version',
    'goalflow_admin_config',
    'goalflow_audit_log',
    'goalflow_escalation_config',
    'goalflow_escalation_log',
    'goalflow_admin_notifications',
    'goalflow_manager_data',
    'goalflow_manager_notifications',
  ]
  keys.forEach((k) => localStorage.removeItem(k))
  localStorage.setItem('goalflow_employee_seed_version', String(SEED_VERSION))
  getAdminConfig()
  getAllEmployeesWithData()
  return { ok: true }
}
