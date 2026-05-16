import { CHECKIN_STATUS, PERIODS, SHEET_STATUS, UOM_TYPES, UOM_DIRECTIONS } from '../constants/goals'
import { getAllEmployeesWithData } from './adminStorage'
import { computeWeightedTotal } from './progressScore'
import { getCheckInCompletion } from './managerStorage'
import { isCheckInMarkedComplete } from './managerStorage'
import { MANAGER_EMAIL } from './org'
import { DEMO_USERS, ROLES } from './auth'

const PERIOD_LIST = [PERIODS.q1, PERIODS.q2, PERIODS.q3, PERIODS.q4]

export function getQoQTrend() {
  const employees = getAllEmployeesWithData()
  const deptMap = {}

  PERIOD_LIST.forEach((p) => {
    employees.forEach((e) => {
      const dept = e.department || 'Unassigned'
      if (!deptMap[dept]) deptMap[dept] = { q1: [], q2: [], q3: [], q4: [] }
      const periodData = e.data.checkIns?.[p] || {}
      const { total } = computeWeightedTotal(e.data.sheet.goals, periodData)
      if (total != null) deptMap[dept][p].push(total)
    })
  })

  const departments = Object.keys(deptMap)
  const chartData = PERIOD_LIST.map((p) => {
    const row = { period: p.toUpperCase() }
    departments.forEach((d) => {
      const vals = deptMap[d][p]
      row[d] = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0
    })
    return row
  })

  return { chartData, departments }
}

export function getThrustAreaDistribution() {
  const employees = getAllEmployeesWithData()
  const counts = {}
  employees.forEach((e) => {
    e.data.sheet.goals.forEach((g) => {
      const ta = g.thrustArea || 'Other'
      counts[ta] = (counts[ta] || 0) + 1
    })
  })
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1
  return Object.entries(counts).map(([name, value]) => ({
    name,
    value,
    percent: Math.round((value / total) * 100),
  }))
}

export function getUomDistribution() {
  const employees = getAllEmployeesWithData()
  const counts = {
    'Numeric Min': 0,
    'Numeric Max': 0,
    Timeline: 0,
    'Zero-based': 0,
    Other: 0,
  }

  employees.forEach((e) => {
    e.data.sheet.goals.forEach((g) => {
      if (g.uomType === UOM_TYPES.timeline) counts.Timeline += 1
      else if (g.uomType === UOM_TYPES.zero) counts['Zero-based'] += 1
      else if (g.uomType === UOM_TYPES.numeric || g.uomType === UOM_TYPES.percent) {
        if (g.uomDirection === UOM_DIRECTIONS.max) counts['Numeric Max'] += 1
        else counts['Numeric Min'] += 1
      } else counts.Other += 1
    })
  })

  return Object.entries(counts)
    .filter(([, v]) => v > 0)
    .map(([name, count]) => ({ name, count }))
}

export function getStatusBreakdownByQuarter() {
  return PERIOD_LIST.map((p) => {
    const row = { period: p.toUpperCase(), notStarted: 0, onTrack: 0, completed: 0 }
    getAllEmployeesWithData().forEach((e) => {
      if (e.data.sheet.status !== SHEET_STATUS.locked) return
      const periodData = e.data.checkIns?.[p] || {}
      e.data.sheet.goals.forEach((g) => {
        const st = periodData[g.id]?.status || CHECKIN_STATUS.notStarted
        if (st === CHECKIN_STATUS.completed) row.completed += 1
        else if (st === CHECKIN_STATUS.onTrack) row.onTrack += 1
        else row.notStarted += 1
      })
    })
    return row
  })
}

export function getCompletionHeatmap() {
  const employees = getAllEmployeesWithData()
  return employees.map((e) => {
    const row = { name: e.name, email: e.email, quarters: {} }
    PERIOD_LIST.forEach((p) => {
      if (e.data.sheet.status !== SHEET_STATUS.locked) {
        row.quarters[p] = null
        return
      }
      const periodData = e.data.checkIns?.[p] || {}
      const { total } = computeWeightedTotal(e.data.sheet.goals, periodData)
      row.quarters[p] = total != null ? Math.round(total) : 0
    })
    return row
  })
}

export function getManagerEffectiveness(period = PERIODS.q1) {
  const managers = DEMO_USERS.filter((u) => u.role === ROLES.manager)
  const employees = getAllEmployeesWithData()

  return managers.map((m) => {
    const team = employees.filter((e) => e.managerEmail === m.email)
    const teamSize = team.length
    let checkInsDone = 0
    let scoreSum = 0
    let scoreCount = 0

    team.forEach((e) => {
      if (getCheckInCompletion(e.data, period).employeeDone) checkInsDone += 1
      const periodData = e.data.checkIns?.[period] || {}
      const { total } = computeWeightedTotal(e.data.sheet.goals, periodData)
      if (total != null) {
        scoreSum += total
        scoreCount += 1
      }
    })

    const mgrMarked = team.filter((e) =>
      isCheckInMarkedComplete(m.email, e.email, period),
    ).length

    const rate = teamSize ? Math.round((checkInsDone / teamSize) * 100) : 0
    const avgScore = scoreCount ? Math.round(scoreSum / scoreCount) : 0

    return {
      managerEmail: m.email,
      managerName: m.name,
      teamSize,
      checkInsDone,
      checkInsPending: teamSize - checkInsDone,
      mgrMarked,
      checkInRate: rate,
      avgTeamScore: avgScore,
    }
  })
}

export function heatmapColor(pct) {
  if (pct == null) return { bg: '#e2e8f0', text: '#475569' }
  const lightness = 95 - (pct / 100) * 65
  const text = lightness < 55 ? '#ffffff' : '#0f172a'
  return { bg: `hsl(142 76% ${lightness}%)`, text }
}
