import { useCallback, useEffect, useState } from 'react'
import { SHEET_STATUS } from '../constants/goals'
import {
  createEmptyGoal,
  getEmployeeData,
  resetEmployeeToDraftDemo,
  resetEmployeeToLockedDemo,
  saveEmployeeData,
  simulateApprove,
  simulateReturn,
  setSheetStatusDemo as setSheetStatusDemoStorage,
} from '../lib/goalStorage'
import { validateGoalSheet } from '../lib/goalValidation'
import { syncSharedGoalCheckIn } from '../lib/sharedGoalSync'
import {
  notifyManagerGoalSubmitted,
  notifyManagerResubmitted,
} from '../lib/managerStorage'

export function useEmployeeData(email) {
  const [data, setData] = useState(() => (email ? getEmployeeData(email) : null))

  useEffect(() => {
    if (email) setData(getEmployeeData(email))
  }, [email])

  const persist = useCallback(
    (next) => {
      if (!email) return
      saveEmployeeData(email, next)
      setData(next)
    },
    [email],
  )

  const updateSheet = useCallback(
    (patch) => {
      if (!data) return
      persist({ ...data, sheet: { ...data.sheet, ...patch } })
    },
    [data, persist],
  )

  const setGoals = useCallback(
    (goals) => {
      updateSheet({ goals })
    },
    [updateSheet],
  )

  const addGoal = useCallback(() => {
    if (!data) return
    if (data.sheet.goals.length >= 8) return
    setGoals([...data.sheet.goals, createEmptyGoal()])
  }, [data, setGoals])

  const updateGoal = useCallback(
    (id, patch) => {
      if (!data) return
      const goals = data.sheet.goals.map((g) => {
        if (g.id !== id) return g
        const next = { ...g, ...patch }
        if (g.readOnly?.title && 'title' in patch) next.title = g.title
        if (g.readOnly?.target && 'target' in patch) next.target = g.target
        if (g.readOnly?.description && 'description' in patch) next.description = g.description
        return next
      })
      setGoals(goals)
    },
    [data, setGoals],
  )

  const removeGoal = useCallback(
    (id) => {
      if (!data) return
      const goal = data.sheet.goals.find((g) => g.id === id)
      if (goal?.isShared) return
      setGoals(data.sheet.goals.filter((g) => g.id !== id))
    },
    [data, setGoals],
  )

  const submitSheet = useCallback(() => {
    if (!data) return { ok: false, errors: ['No data'] }
    const validation = validateGoalSheet(data.sheet.goals)
    if (!validation.valid) return { ok: false, errors: validation.errors }

    const wasReturned = data.sheet.status === SHEET_STATUS.returned
    persist({
      ...data,
      sheet: {
        ...data.sheet,
        status: SHEET_STATUS.submitted,
        submittedAt: new Date().toISOString(),
        returnReason: null,
      },
    })
    if (wasReturned) notifyManagerResubmitted(email)
    else notifyManagerGoalSubmitted(email)
    return { ok: true }
  }, [data, persist])

  const saveCheckIn = useCallback(
    (period, goalId, entry) => {
      if (!data || !email) return
      const goal = data.sheet.goals.find((g) => g.id === goalId)
      const nextEntry = { ...entry, updatedAt: new Date().toISOString() }
      const next = {
        ...data,
        checkIns: {
          ...data.checkIns,
          [period]: {
            ...data.checkIns[period],
            [goalId]: nextEntry,
          },
        },
      }
      persist(next)
      if (goal?.isShared && goal?.isPrimaryOwner) {
        syncSharedGoalCheckIn(email, goal, period, nextEntry)
      }
    },
    [data, persist, email],
  )

  const reload = useCallback(() => {
    if (email) setData(getEmployeeData(email))
  }, [email])

  const saveDraft = useCallback(() => {
    if (!data || !email) return
    saveEmployeeData(email, {
      ...data,
      sheet: { ...data.sheet, lastSavedAt: new Date().toISOString() },
    })
    reload()
  }, [data, email, reload])

  return {
    data,
    sheet: data?.sheet,
    checkIns: data?.checkIns,
    addGoal,
    updateGoal,
    removeGoal,
    submitSheet,
    saveDraft,
    saveCheckIn,
    simulateApprove: () => {
      simulateApprove(email)
      reload()
    },
    simulateReturn: (reason) => {
      simulateReturn(email, reason)
      reload()
    },
    resetToLockedDemo: () => {
      resetEmployeeToLockedDemo(email)
      reload()
    },
    resetToDraftDemo: () => {
      resetEmployeeToDraftDemo(email)
      reload()
    },
    setSheetStatusDemo: (status) => {
      setSheetStatusDemoStorage(email, status)
      reload()
    },
    reload,
  }
}
