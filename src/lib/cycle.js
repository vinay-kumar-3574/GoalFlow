import { PERIODS, SHEET_STATUS } from '../constants/goals'
import { getCycleConfig } from './adminStorage'

const DEADLINES = {
  [PERIODS.q1]: { label: 'Q1 Check-in', deadline: '31 July 2026', monthEnd: 7, dayEnd: 31 },
  [PERIODS.q2]: { label: 'Q2 Check-in', deadline: '31 October 2026', monthEnd: 10, dayEnd: 31 },
  [PERIODS.q3]: { label: 'Q3 Check-in', deadline: '31 January 2027', monthEnd: 1, dayEnd: 31 },
  [PERIODS.q4]: { label: 'Q4 / Annual', deadline: '30 April 2027', monthEnd: 4, dayEnd: 30 },
}

export function getCheckInDeadline(period) {
  return DEADLINES[period] || null
}

export function getActivePeriod() {
  const month = new Date().getMonth() + 1
  if (month === 5 || month === 6) return { phase: 'goal_setting', period: null }
  if (month === 7 || month === 8) return { phase: 'checkin', period: PERIODS.q1 }
  if (month === 10 || month === 11) return { phase: 'checkin', period: PERIODS.q2 }
  if (month === 1 || month === 2) return { phase: 'checkin', period: PERIODS.q3 }
  if (month === 3 || month === 4) return { phase: 'checkin', period: PERIODS.q4 }
  return { phase: 'closed', period: null }
}

export function isCheckInWindowActive(demoAllowAll) {
  const config = getCycleConfig()
  if (config.demoMode || demoAllowAll === true) {
    const openQ = ['q1', 'q2', 'q3', 'q4'].find((k) => config.windowOpen?.[k])
    return { phase: 'checkin', period: openQ || PERIODS.q1 }
  }
  const wo = config.windowOpen || {}
  if (wo.phase1) return { phase: 'goal_setting', period: null }
  if (wo.q1) return { phase: 'checkin', period: PERIODS.q1 }
  if (wo.q2) return { phase: 'checkin', period: PERIODS.q2 }
  if (wo.q3) return { phase: 'checkin', period: PERIODS.q3 }
  if (wo.q4) return { phase: 'checkin', period: PERIODS.q4 }
  const active = getActivePeriod()
  if (active.phase === 'checkin') return active
  return null
}

export function isCheckInOpen(period) {
  const active = getActivePeriod()
  return active.phase === 'checkin' && active.period === period
}

export function canEmployeeCheckIn(sheetStatus, period, demoAllowAll = true) {
  if (sheetStatus !== SHEET_STATUS.locked) return false
  if (demoAllowAll) return true
  return isCheckInOpen(period)
}

export function getBannerDismissKey(period) {
  return `goalflow.banner.dismissed.${period}`
}

export function isBannerDismissed(period) {
  try {
    return sessionStorage.getItem(getBannerDismissKey(period)) === '1'
  } catch {
    return false
  }
}

export function dismissBanner(period) {
  try {
    sessionStorage.setItem(getBannerDismissKey(period), '1')
  } catch {
    /* ignore */
  }
}

/** Timeline phase index for overview strip: 0=May, 1=Q1, 2=Q2, 3=Q3, 4=Q4 */
export function getTimelinePhaseIndex() {
  const month = new Date().getMonth() + 1
  if (month === 5 || month === 6) return 0
  if (month >= 7 && month <= 9) return 1
  if (month >= 10 && month <= 12) return 2
  if (month <= 2) return 3
  if (month >= 3 && month <= 4) return 4
  return 1
}
