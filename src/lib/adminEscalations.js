import { PERIODS, SHEET_STATUS } from '../constants/goals'
import { getCycleConfig, getAllEmployeesWithData } from './adminStorage'
import { getCheckInCompletion } from './managerStorage'
import { isCheckInWindowActive } from './cycle'

const ESCALATION_KEY = 'goalflow_escalation_config'
const ESCALATION_LOG_KEY = 'goalflow_escalation_log'

const DEFAULT_RULES = {
  rule1: { enabled: true, days: 14, label: 'Employee has not submitted goals within N days of cycle open' },
  rule2: { enabled: true, days: 7, label: 'Manager has not approved within N days of submission' },
  rule3: { enabled: true, days: 5, label: 'Quarterly check-in not completed within active window' },
  chain: { employeeToManager: 3, managerToHr: 7, hrFinal: 14 },
}

export function getEscalationRules() {
  try {
    const raw = localStorage.getItem(ESCALATION_KEY)
    if (raw) return { ...DEFAULT_RULES, ...JSON.parse(raw) }
  } catch {
    /* ignore */
  }
  return { ...DEFAULT_RULES }
}

export function saveEscalationRules(rules) {
  localStorage.setItem(ESCALATION_KEY, JSON.stringify(rules))
  return rules
}

export function getEscalationLog() {
  try {
    const raw = localStorage.getItem(ESCALATION_LOG_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  return []
}

function saveEscalationLog(log) {
  localStorage.setItem(ESCALATION_LOG_KEY, JSON.stringify(log.slice(0, 200)))
}

export function markEscalationResolved(id) {
  const log = getEscalationLog()
  const idx = log.findIndex((e) => e.id === id)
  if (idx < 0) return false
  log[idx].resolved = true
  log[idx].resolvedAt = new Date().toISOString()
  saveEscalationLog(log)
  return true
}

function daysSince(iso) {
  if (!iso) return 999
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
}

export function simulateEscalationCheck() {
  const rules = getEscalationRules()
  const cycle = getCycleConfig()
  const employees = getAllEmployeesWithData()
  const active = isCheckInWindowActive(cycle.demoMode)
  const period = active?.period || PERIODS.q1
  const triggered = []
  const now = new Date().toISOString()

  employees.forEach((e) => {
    const { data, name, email, managerEmail, department } = e
    const sheet = data.sheet

    if (rules.rule1?.enabled && cycle.windowOpen?.phase1) {
      const openDays = daysSince(cycle.phase1OpenDate || `${cycle.year}-05-01`)
      if (
        openDays >= (rules.rule1.days || 14) &&
        (sheet.status === SHEET_STATUS.draft || sheet.status === SHEET_STATUS.returned)
      ) {
        triggered.push({
          id: `esc_${Date.now()}_${email}_r1`,
          employeeEmail: email,
          employeeName: name,
          department,
          rule: 'Rule 1',
          ruleKey: 'rule1',
          triggerDate: now,
          notified: `Employee → Manager (Day ${rules.chain?.employeeToManager || 3}) → HR (Day ${rules.chain?.hrFinal || 14})`,
          resolved: false,
        })
      }
    }

    if (rules.rule2?.enabled && sheet.status === SHEET_STATUS.submitted && sheet.submittedAt) {
      const days = daysSince(sheet.submittedAt)
      if (days >= (rules.rule2.days || 7)) {
        triggered.push({
          id: `esc_${Date.now()}_${email}_r2`,
          employeeEmail: email,
          employeeName: name,
          department,
          rule: 'Rule 2',
          ruleKey: 'rule2',
          triggerDate: now,
          notified: `Manager ${managerEmail} · Skip HR Day ${rules.chain?.managerToHr || 7}`,
          resolved: false,
        })
      }
    }

    if (rules.rule3?.enabled && sheet.status === SHEET_STATUS.locked) {
      const windowKey = period === PERIODS.q1 ? 'q1' : period
      const windowOpen = cycle.windowOpen?.[windowKey] || cycle.demoMode
      if (windowOpen) {
        const done = getCheckInCompletion(data, period).employeeDone
        if (!done) {
          triggered.push({
            id: `esc_${Date.now()}_${email}_r3`,
            employeeEmail: email,
            employeeName: name,
            department,
            rule: 'Rule 3',
            ruleKey: 'rule3',
            triggerDate: now,
            notified: `Employee + Manager · ${period.toUpperCase()} window`,
            resolved: false,
          })
        }
      }
    }
  })

  const existing = getEscalationLog()
  const merged = [...triggered, ...existing.filter((e) => !triggered.some((t) => t.employeeEmail === e.employeeEmail && t.ruleKey === e.ruleKey))]
  saveEscalationLog(merged)
  return { triggered: triggered.length, entries: triggered }
}

export function getActiveEscalationCount() {
  return getEscalationLog().filter((e) => !e.resolved).length
}
