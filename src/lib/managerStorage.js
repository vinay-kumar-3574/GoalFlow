import { PERIODS, SHEET_STATUS, UOM_TYPES } from '../constants/goals'
import { validateGoalSheet } from './goalValidation'
import {
  createEmptyGoal,
  ensureTeamSeeded,
  getEmployeeData,
  saveEmployeeData,
} from './goalStorage'
import { addNotification } from './notifications'
import { addManagerNotification } from './managerNotifications'
import { registerSharedKpi } from './sharedGoalSync'
import { getEmployeeDisplay, getTeamForManager, MANAGER_EMAIL } from './org'
import { appendAuditLog, AUDIT_ACTIONS } from './auditLog'
import { auditMetaForEmployee } from './auditHelpers'

const MANAGER_DATA_KEY = 'goalflow_manager_data'

function loadManagerStore() {
  try {
    const raw = localStorage.getItem(MANAGER_DATA_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveManagerStore(store) {
  localStorage.setItem(MANAGER_DATA_KEY, JSON.stringify(store))
}

function getManagerRecord(managerEmail) {
  const store = loadManagerStore()
  if (!store[managerEmail]) {
    store[managerEmail] = { comments: {} }
    saveManagerStore(store)
  }
  return store[managerEmail]
}

function ensurePeriodRecord(record, employeeEmail, period) {
  if (!record.comments[employeeEmail]) record.comments[employeeEmail] = {}
  if (!record.comments[employeeEmail][period]) {
    record.comments[employeeEmail][period] = { thread: [], completedAt: null }
  }
  return record.comments[employeeEmail][period]
}

export function getManagerComments(managerEmail, employeeEmail) {
  const record = getManagerRecord(managerEmail)
  return record.comments[employeeEmail] || {}
}

export function getCommentThread(managerEmail, employeeEmail, period) {
  const bucket = getManagerComments(managerEmail, employeeEmail)[period]
  if (!bucket?.thread) return []
  return [...bucket.thread].sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
  )
}

export function getManagerComment(managerEmail, employeeEmail, period) {
  const thread = getCommentThread(managerEmail, employeeEmail, period)
  const bucket = getManagerComments(managerEmail, employeeEmail)[period]
  if (!thread.length) return null
  return {
    ...thread[0],
    completedAt: bucket?.completedAt || null,
  }
}

export function appendManagerComment(managerEmail, employeeEmail, period, text, managerName) {
  const trimmed = text?.trim()
  if (!trimmed) return { ok: false, error: 'Comment cannot be empty.' }

  const store = loadManagerStore()
  const record = store[managerEmail] || { comments: {} }
  const bucket = ensurePeriodRecord(record, employeeEmail, period)
  bucket.thread.push({
    text: trimmed,
    savedAt: new Date().toISOString(),
    managerEmail,
    managerName: managerName || 'Manager',
  })
  store[managerEmail] = record
  saveManagerStore(store)

  const meta = auditMetaForEmployee(employeeEmail)
  appendAuditLog({
    userId: managerEmail,
    userName: managerName || 'Manager',
    role: 'manager',
    action: AUDIT_ACTIONS.comment,
    entity: 'CheckIn',
    entityId: employeeEmail,
    goalTitle: `${period.toUpperCase()} check-in`,
    field: 'comment',
    oldValue: '—',
    newValue: 'added',
    note: trimmed.slice(0, 120),
    department: meta.department,
  })

  return { ok: true, entry: bucket.thread[bucket.thread.length - 1] }
}

export function markCheckInComplete(managerEmail, employeeEmail, period) {
  const store = loadManagerStore()
  const record = store[managerEmail] || { comments: {} }
  const bucket = ensurePeriodRecord(record, employeeEmail, period)
  bucket.completedAt = new Date().toISOString()
  store[managerEmail] = record
  saveManagerStore(store)
  return bucket.completedAt
}

export function isCheckInMarkedComplete(managerEmail, employeeEmail, period) {
  const bucket = getManagerComments(managerEmail, employeeEmail)[period]
  return Boolean(bucket?.completedAt)
}

/** @deprecated use appendManagerComment */
export function saveManagerComment(managerEmail, employeeEmail, period, text) {
  return appendManagerComment(managerEmail, employeeEmail, period, text)
}

export function loadTeamMemberData(employeeEmail) {
  return getEmployeeData(employeeEmail)
}

export function loadTeamData(managerEmail, teamEmails) {
  ensureTeamSeeded(teamEmails)
  return teamEmails.map((email) => ({
    email,
    data: getEmployeeData(email),
  }))
}

export function isDirectReport(managerEmail, employeeEmail) {
  return getTeamForManager(managerEmail).some((m) => m.email === employeeEmail)
}

export function managerUpdateGoal(employeeEmail, goalId, patch, managerEmail) {
  if (managerEmail && !isDirectReport(managerEmail, employeeEmail)) {
    return { ok: false, error: 'Not your direct report.' }
  }

  const data = getEmployeeData(employeeEmail)
  if (data.sheet.status !== SHEET_STATUS.submitted) {
    return { ok: false, error: 'Inline edits allowed only while sheet is submitted (before approval).' }
  }

  const goals = data.sheet.goals.map((g) => (g.id === goalId ? { ...g, ...patch } : g))
  const validation = validateGoalSheet(goals)
  if (!validation.valid) {
    return { ok: false, errors: validation.errors }
  }

  data.sheet.goals = goals
  saveEmployeeData(employeeEmail, data)
  return { ok: true, data }
}

export function managerApproveSheet(employeeEmail, managerEmail, managerName) {
  if (!isDirectReport(managerEmail, employeeEmail)) {
    return { ok: false, error: 'Not your direct report.' }
  }

  const data = getEmployeeData(employeeEmail)
  const canApprove =
    data.sheet.status === SHEET_STATUS.submitted ||
    (data.sheet.adminUnlocked && data.sheet.status === SHEET_STATUS.draft)
  if (!canApprove) {
    return { ok: false, error: 'Only submitted or admin-unlocked sheets can be approved.' }
  }

  const validation = validateGoalSheet(data.sheet.goals)
  if (!validation.valid) {
    return { ok: false, errors: validation.errors }
  }

  data.sheet.status = SHEET_STATUS.locked
  data.sheet.approvedAt = new Date().toISOString()
  data.sheet.returnReason = null
  if (data.sheet.adminUnlocked) {
    data.sheet.adminUnlocked = false
    data.sheet.unlockReason = null
    data.sheet.unlockedGoalId = null
  }
  saveEmployeeData(employeeEmail, data)

  addNotification(employeeEmail, {
    title: 'Goal sheet approved',
    body: `${managerName || 'Your manager'} approved and locked your FY26 goal sheet.`,
  })

  const meta = auditMetaForEmployee(employeeEmail)
  appendAuditLog({
    userId: managerEmail,
    userName: managerName || 'Manager',
    role: 'manager',
    action: AUDIT_ACTIONS.approved,
    entity: 'GoalSheet',
    entityId: employeeEmail,
    goalTitle: meta.goalTitle,
    field: 'status',
    oldValue: 'submitted',
    newValue: 'locked',
    note: 'Goals approved and locked',
    department: meta.department,
  })

  return { ok: true, data }
}

export function managerReturnSheet(employeeEmail, reason, managerEmail, managerName) {
  if (!isDirectReport(managerEmail, employeeEmail)) {
    return { ok: false, error: 'Not your direct report.' }
  }

  const data = getEmployeeData(employeeEmail)
  if (data.sheet.status !== SHEET_STATUS.submitted) {
    return { ok: false, error: 'Only submitted sheets can be returned.' }
  }

  const trimmed = reason?.trim()
  if (!trimmed || trimmed.length < 10) {
    return { ok: false, error: 'Rework comment is required (at least 10 characters).' }
  }

  data.sheet.status = SHEET_STATUS.returned
  data.sheet.returnReason = trimmed
  saveEmployeeData(employeeEmail, data)

  addNotification(employeeEmail, {
    title: 'Goal sheet returned for rework',
    body: `${managerName || 'Your manager'}: ${trimmed}`,
  })

  const meta = auditMetaForEmployee(employeeEmail)
  appendAuditLog({
    userId: managerEmail,
    userName: managerName || 'Manager',
    role: 'manager',
    action: AUDIT_ACTIONS.returned,
    entity: 'GoalSheet',
    entityId: employeeEmail,
    goalTitle: meta.goalTitle,
    field: 'status',
    oldValue: 'submitted',
    newValue: 'returned',
    note: trimmed,
    department: meta.department,
  })

  return { ok: true, data }
}

export function notifyManagerGoalSubmitted(employeeEmail, managerEmail = MANAGER_EMAIL) {
  const profile = getEmployeeDisplay(employeeEmail)
  addManagerNotification(managerEmail, {
    type: 'goal_submitted',
    title: 'Goal sheet submitted',
    body: `${profile.name} submitted FY26 goals for your review.`,
    employeeEmail,
    actionPath: `/manager/approvals/${encodeURIComponent(employeeEmail)}`,
  })
}

export function notifyManagerResubmitted(employeeEmail, managerEmail = MANAGER_EMAIL) {
  const profile = getEmployeeDisplay(employeeEmail)
  addManagerNotification(managerEmail, {
    type: 'resubmitted',
    title: 'Goal sheet resubmitted',
    body: `${profile.name} resubmitted after rework — please review again.`,
    employeeEmail,
    actionPath: `/manager/approvals/${encodeURIComponent(employeeEmail)}`,
  })
}

export function pushSharedKpiToTeam({
  recipientEmails,
  primaryOwnerEmail,
  title,
  description,
  target,
  thrustArea,
  uomType,
  uomDirection,
  weightageByEmail,
  managerEmail,
  managerName,
}) {
  const sharedFrom = `mgr-kpi-${Date.now()}`
  const results = []

  registerSharedKpi(sharedFrom, {
    sharedFrom,
    primaryOwnerEmail,
    recipientEmails,
    title,
    description,
    target,
    thrustArea,
    uomType,
    uomDirection,
    createdAt: new Date().toISOString(),
  })

  for (const email of recipientEmails) {
    const data = getEmployeeData(email)
    if (data.sheet.status === SHEET_STATUS.locked) {
      results.push({ email, ok: false, error: 'Sheet is locked' })
      continue
    }

    const weight = Number(weightageByEmail?.[email]) || 10
    const isPrimary = email === primaryOwnerEmail

    data.sheet.goals.push(
      createEmptyGoal({
        thrustArea,
        title,
        description,
        uomType: uomType || UOM_TYPES.numeric,
        uomDirection: uomDirection || 'max',
        target: String(target),
        deadline: uomType === UOM_TYPES.timeline ? String(target) : '',
        weightage: weight,
        isShared: true,
        sharedFrom,
        readOnly: { title: true, target: true, description: true },
        isPrimaryOwner: isPrimary,
      }),
    )
    saveEmployeeData(email, data)
    addNotification(email, {
      title: 'Shared KPI assigned',
      body: `Departmental KPI "${title}" added to your sheet — review weightage.`,
    })
    results.push({ email, ok: true })
  }

  const pushed = results.filter((r) => r.ok).length
  if (pushed > 0 && managerEmail) {
    appendAuditLog({
      userId: managerEmail,
      userName: managerName || 'Manager',
      role: 'manager',
      action: AUDIT_ACTIONS.shared,
      entity: 'SharedKPI',
      entityId: sharedFrom,
      goalTitle: title,
      field: 'recipients',
      oldValue: '—',
      newValue: `${pushed} employee(s)`,
      note: `Primary owner: ${primaryOwnerEmail}`,
      department: '—',
    })
  }

  return results
}

export function getCheckInCompletion(data, period = PERIODS.q1) {
  if (data.sheet.status !== SHEET_STATUS.locked) {
    return { employeeDone: false, goalsUpdated: 0, totalGoals: data.sheet.goals.length }
  }

  const periodData = data.checkIns?.[period] || {}
  const goals = data.sheet.goals
  let updated = 0

  goals.forEach((g) => {
    const entry = periodData[g.id]
    if (!entry) return
    const hasActual =
      g.uomType === UOM_TYPES.timeline
        ? Boolean(entry.completionDate)
        : entry.actual !== '' && entry.actual != null
    if (hasActual || entry.status !== 'not_started') updated += 1
  })

  return {
    employeeDone: goals.length > 0 && updated === goals.length,
    goalsUpdated: updated,
    totalGoals: goals.length,
  }
}
