import { useCallback, useEffect, useState } from 'react'
import { PERIODS } from '../constants/goals'
import {
  deactivateOrgEmployee,
  getAdminConfig,
  getAdminDashboardStats,
  getAllEmployeesWithData,
  getCompletionRows,
  getCycleConfig,
  getDepartments,
  getOrgConfig,
  getOrgEmployees,
  getThrustAreas,
  relockGoalSheet,
  resetAllDemoData,
  saveCycleConfig,
  saveOrgConfig,
  saveThrustAreas,
  toggleCycleWindow,
  unlockGoal,
  unlockGoalSheet,
  upsertOrgEmployee,
  addDepartment,
  renameDepartment,
} from '../lib/adminStorage'
import { isCheckInWindowActive } from '../lib/cycle'

export function useAdminData() {
  const [config, setConfig] = useState(() => getAdminConfig())
  const [employees, setEmployees] = useState(() => getAllEmployeesWithData())
  const [period, setPeriod] = useState(
    () => isCheckInWindowActive(true)?.period || PERIODS.q1,
  )

  const refresh = useCallback(() => {
    setConfig(getAdminConfig())
    setEmployees(getAllEmployeesWithData())
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const stats = getAdminDashboardStats(period)
  const completionRows = getCompletionRows(period)

  return {
    config,
    cycle: getCycleConfig(),
    thrustAreas: getThrustAreas(),
    org: getOrgConfig(),
    orgEmployees: getOrgEmployees(),
    departments: getDepartments(),
    employees,
    stats,
    completionRows,
    period,
    setPeriod,
    refresh,
    saveCycle: (cycle) => {
      const r = saveCycleConfig(cycle)
      if (r.ok) refresh()
      return r
    },
    toggleWindow: (key, open) => {
      const r = toggleCycleWindow(key, open)
      if (r.ok) refresh()
      return r
    },
    saveThrustAreas: (areas) => {
      saveThrustAreas(areas)
      refresh()
    },
    saveOrg: (org) => {
      saveOrgConfig(org)
      refresh()
    },
    upsertEmployee: (record, adminUser) => {
      const r = upsertOrgEmployee(record, adminUser)
      if (r.ok) refresh()
      return r
    },
    deactivateEmployee: (email, adminUser) => {
      const r = deactivateOrgEmployee(email, adminUser)
      if (r.ok) refresh()
      return r
    },
    addDepartment,
    renameDepartment,
    unlockGoal: (email, goalId, adminUser, reason) => {
      const r = unlockGoal(email, goalId, adminUser, reason)
      if (r.ok) refresh()
      return r
    },
    unlockSheet: (email, adminUser, reason) => {
      const r = unlockGoalSheet(email, adminUser, reason)
      if (r.ok) refresh()
      return r
    },
    relockSheet: (email, adminUser) => {
      const r = relockGoalSheet(email, adminUser)
      if (r.ok) refresh()
      return r
    },
    resetDemo: () => {
      resetAllDemoData()
      refresh()
    },
  }
}
