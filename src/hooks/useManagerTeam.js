import { useCallback, useEffect, useMemo, useState } from 'react'
import { PERIODS } from '../constants/goals'
import { getTeamForManager } from '../lib/org'
import {
  appendManagerComment,
  getCheckInCompletion,
  getCommentThread,
  getManagerComment,
  isCheckInMarkedComplete,
  loadTeamData,
  managerApproveSheet,
  managerReturnSheet,
  managerUpdateGoal,
  markCheckInComplete,
} from '../lib/managerStorage'
import { getTeamDashboardStats } from '../lib/managerTeamStats'
import { isCheckInWindowActive } from '../lib/cycle'

export function useManagerTeam(managerEmail, managerName) {
  const team = useMemo(() => getTeamForManager(managerEmail), [managerEmail])
  const teamEmails = useMemo(() => team.map((m) => m.email), [team])

  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const activePeriod = isCheckInWindowActive(true)?.period || PERIODS.q1

  const refresh = useCallback(() => {
    if (!managerEmail) return
    setMembers(loadTeamData(managerEmail, teamEmails))
    setLoading(false)
  }, [managerEmail, teamEmails])

  useEffect(() => {
    refresh()
  }, [refresh])

  const getMember = useCallback(
    (employeeEmail) => members.find((m) => m.email === employeeEmail)?.data,
    [members],
  )

  const approveSheet = useCallback(
    (employeeEmail) => {
      const result = managerApproveSheet(employeeEmail, managerEmail, managerName)
      if (result.ok) refresh()
      return result
    },
    [managerEmail, managerName, refresh],
  )

  const returnSheet = useCallback(
    (employeeEmail, reason) => {
      const result = managerReturnSheet(employeeEmail, reason, managerEmail, managerName)
      if (result.ok) refresh()
      return result
    },
    [managerEmail, managerName, refresh],
  )

  const updateGoal = useCallback(
    (employeeEmail, goalId, patch) => {
      const result = managerUpdateGoal(employeeEmail, goalId, patch, managerEmail)
      if (result.ok) refresh()
      return result
    },
    [managerEmail, refresh],
  )

  const addComment = useCallback(
    (employeeEmail, period, text) => {
      const result = appendManagerComment(
        managerEmail,
        employeeEmail,
        period,
        text,
        managerName,
      )
      if (result.ok) refresh()
      return result
    },
    [managerEmail, managerName, refresh],
  )

  const completeCheckIn = useCallback(
    (employeeEmail, period) => {
      markCheckInComplete(managerEmail, employeeEmail, period)
      refresh()
    },
    [managerEmail, refresh],
  )

  const getComment = useCallback(
    (employeeEmail, period = activePeriod) =>
      getManagerComment(managerEmail, employeeEmail, period),
    [managerEmail, activePeriod],
  )

  const getThread = useCallback(
    (employeeEmail, period = activePeriod) =>
      getCommentThread(managerEmail, employeeEmail, period),
    [managerEmail, activePeriod],
  )

  const isCheckInComplete = useCallback(
    (employeeEmail, period = activePeriod) =>
      isCheckInMarkedComplete(managerEmail, employeeEmail, period),
    [managerEmail, activePeriod],
  )

  const dashboardStats = useMemo(
    () => getTeamDashboardStats(members, managerEmail, activePeriod),
    [members, managerEmail, activePeriod],
  )

  const stats = useMemo(
    () => ({
      pending: members.filter((m) => m.data.sheet.status === 'submitted').length,
      returned: members.filter((m) => m.data.sheet.status === 'returned').length,
      locked: members.filter((m) => m.data.sheet.status === 'locked').length,
      draft: members.filter((m) => m.data.sheet.status === 'draft').length,
    }),
    [members],
  )

  return {
    team,
    members,
    loading,
    activePeriod,
    stats,
    dashboardStats,
    refresh,
    getMember,
    approveSheet,
    returnSheet,
    updateGoal,
    addComment,
    completeCheckIn,
    getComment,
    getThread,
    isCheckInComplete,
    getCheckInCompletion: (data, period) => getCheckInCompletion(data, period),
  }
}
