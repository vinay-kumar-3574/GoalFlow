import { PERIODS, SHEET_STATUS } from '../constants/goals'
import { computeWeightedTotal } from './progressScore'
import {
  getCheckInCompletion,
  getManagerComment,
  isCheckInMarkedComplete,
} from './managerStorage'

export function getDaysWaiting(submittedAt) {
  if (!submittedAt) return null
  const ms = Date.now() - new Date(submittedAt).getTime()
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)))
}

export function getCheckInStatusLabel(data, managerEmail, employeeEmail, period = PERIODS.q1) {
  if (data.sheet.status !== SHEET_STATUS.locked) return 'Not Started'

  const completion = getCheckInCompletion(data, period)
  const marked = isCheckInMarkedComplete(managerEmail, employeeEmail, period)
  const hasComment = Boolean(getManagerComment(managerEmail, employeeEmail, period)?.text)

  if (marked || (completion.employeeDone && hasComment)) return 'Complete'
  if (completion.goalsUpdated > 0 || hasComment) return 'Pending'
  return 'Not Started'
}

export function getTeamDashboardStats(members, managerEmail, period = PERIODS.q1) {
  const totalMembers = members.length
  let pendingApproval = 0
  let approved = 0
  let checkInsCompleted = 0
  let checkInsPending = 0

  members.forEach(({ email, data }) => {
    const status = data.sheet.status
    if (status === SHEET_STATUS.submitted) pendingApproval += 1
    if (status === SHEET_STATUS.locked) approved += 1

    const checkLabel = getCheckInStatusLabel(data, managerEmail, email, period)
    if (status === SHEET_STATUS.locked) {
      if (checkLabel === 'Complete') checkInsCompleted += 1
      else if (checkLabel === 'Pending') checkInsPending += 1
      else checkInsPending += 1
    }
  })

  return {
    totalMembers,
    pendingApproval,
    approved,
    checkInsCompleted,
    checkInsPending,
  }
}

export function getMemberRowMetrics(email, data, managerEmail, period = PERIODS.q1) {
  const periodData = data.checkIns?.[period] || {}
  const { weightedScore, tone } = computeWeightedTotal(data.sheet.goals, periodData)
  const goalsSubmitted =
    data.sheet.status !== SHEET_STATUS.draft && data.sheet.goals.length > 0

  return {
    goalsSubmitted,
    goalsCount: data.sheet.goals.length,
    approvalStatus: data.sheet.status,
    checkInStatus: getCheckInStatusLabel(data, managerEmail, email, period),
    weightedScore: data.sheet.status === SHEET_STATUS.locked ? weightedScore : null,
    scoreTone: tone,
    daysWaiting: getDaysWaiting(data.sheet.submittedAt),
  }
}
