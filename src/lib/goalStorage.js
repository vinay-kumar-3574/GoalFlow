import { SHEET_STATUS } from '../constants/goals'
import {
  AMIT_EMAIL,
  NEHA_EMAIL,
  PRIYA_EMAIL,
  SEED_VERSION,
  buildAmitDraftSeed,
  buildNehaSubmittedSeed,
  buildPriyaDraftSeed,
  buildPriyaLockedSeed,
  getSeedForEmail,
} from './employeeSeed'

const STORAGE_KEY = 'goalflow_employee_data'
const VERSION_KEY = 'goalflow_employee_seed_version'

function emptySheet() {
  return {
    status: SHEET_STATUS.draft,
    submittedAt: null,
    approvedAt: null,
    returnReason: null,
    goals: [],
  }
}

function emptyUserData() {
  return {
    sheet: emptySheet(),
    checkIns: { q1: {}, q2: {}, q3: {}, q4: {} },
  }
}

function loadAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveAll(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function applySeedIfNeeded(all, email) {
  const seededVersion = Number(localStorage.getItem(VERSION_KEY) || 0)
  const priya = all[PRIYA_EMAIL]
  const needsPriyaReseed =
    email === PRIYA_EMAIL &&
    (seededVersion < SEED_VERSION || !priya?.sheet?.goals || priya.sheet.goals.length < 5)

  if (needsPriyaReseed) {
    all[PRIYA_EMAIL] = buildPriyaLockedSeed()
    localStorage.setItem(VERSION_KEY, String(SEED_VERSION))
  }

  if (email === AMIT_EMAIL && !all[AMIT_EMAIL]) {
    all[AMIT_EMAIL] = buildAmitDraftSeed()
    localStorage.setItem(VERSION_KEY, String(SEED_VERSION))
  }

  if (email === NEHA_EMAIL && !all[NEHA_EMAIL]) {
    all[NEHA_EMAIL] = buildNehaSubmittedSeed()
    localStorage.setItem(VERSION_KEY, String(SEED_VERSION))
  }

  return all
}

/** Ensure all direct reports exist when manager opens team views */
export function ensureTeamSeeded(emails) {
  let all = loadAll()
  let changed = false
  for (const email of emails) {
    if (!all[email]) {
      const preset = getSeedForEmail(email)
      if (preset) {
        all[email] = preset
        changed = true
      }
    }
  }
  if (changed) saveAll(all)
}

export function getEmployeeData(email) {
  let all = loadAll()
  all = applySeedIfNeeded(all, email)
  if (!all[email]) {
    const preset = getSeedForEmail(email)
    all[email] = preset || emptyUserData()
    saveAll(all)
  } else {
    saveAll(all)
  }
  return all[email]
}

export function saveEmployeeData(email, data) {
  const all = loadAll()
  all[email] = data
  saveAll(all)
}

export function createGoalId() {
  return `goal_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export function createEmptyGoal(overrides = {}) {
  return {
    id: createGoalId(),
    thrustArea: '',
    title: '',
    description: '',
    uomType: 'numeric',
    uomDirection: 'min',
    target: '',
    deadline: '',
    weightage: '',
    isShared: false,
    sharedFrom: null,
    readOnly: { title: false, target: false, description: false },
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

export function resetEmployeeToLockedDemo(email) {
  if (email === PRIYA_EMAIL) {
    const data = buildPriyaLockedSeed()
    saveEmployeeData(email, data)
    return data
  }
  return getEmployeeData(email)
}

export function resetEmployeeToDraftDemo(email) {
  if (email === PRIYA_EMAIL) {
    const data = buildPriyaDraftSeed()
    saveEmployeeData(email, data)
    return data
  }
  if (email === AMIT_EMAIL) {
    const data = buildAmitDraftSeed()
    saveEmployeeData(email, data)
    return data
  }
  const data = getEmployeeData(email)
  data.sheet.status = SHEET_STATUS.draft
  data.sheet.submittedAt = null
  data.sheet.approvedAt = null
  data.sheet.returnReason = null
  saveEmployeeData(email, data)
  return data
}

export function simulateApprove(email) {
  const data = getEmployeeData(email)
  data.sheet.status = SHEET_STATUS.locked
  data.sheet.approvedAt = new Date().toISOString()
  data.sheet.returnReason = null
  saveEmployeeData(email, data)
  return data
}

export function setSheetStatusDemo(email, status) {
  const data = getEmployeeData(email)
  data.sheet.status = status
  if (status === SHEET_STATUS.submitted) {
    data.sheet.submittedAt = data.sheet.submittedAt || new Date().toISOString()
    data.sheet.returnReason = null
  } else if (status === SHEET_STATUS.returned) {
    data.sheet.returnReason =
      data.sheet.returnReason || 'Please revise weightage on goal 2 and resubmit.'
  } else if (status === SHEET_STATUS.draft) {
    data.sheet.submittedAt = null
    data.sheet.approvedAt = null
    data.sheet.returnReason = null
  }
  saveEmployeeData(email, data)
  return data
}

export function simulateReturn(email, reason = 'Please revise weightage on goal 2.') {
  const data = getEmployeeData(email)
  data.sheet.status = SHEET_STATUS.returned
  data.sheet.returnReason = reason
  saveEmployeeData(email, data)
  return data
}

export function addSharedGoalDemo(email) {
  const data = getEmployeeData(email)
  if (data.sheet.goals.some((g) => g.isShared)) return data

  data.sheet.goals.push(
    createEmptyGoal({
      thrustArea: 'Operational Excellence',
      title: 'Reduce customer complaint TAT',
      description: 'Departmental KPI — company-wide quality initiative',
      uomType: 'numeric',
      uomDirection: 'max',
      target: '48',
      weightage: 15,
      isShared: true,
      sharedFrom: 'dept-kpi-tat',
      readOnly: { title: true, target: true, description: true },
    }),
  )
  saveEmployeeData(email, data)
  return data
}
