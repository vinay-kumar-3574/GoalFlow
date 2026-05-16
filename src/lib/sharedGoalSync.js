import { UOM_TYPES } from '../constants/goals'
import { getEmployeeData, saveEmployeeData } from './goalStorage'
import { MANAGER_EMAIL } from './org'
import { addManagerNotification } from './managerNotifications'

const REGISTRY_KEY = 'goalflow_shared_registry'

export function loadSharedRegistry() {
  try {
    const raw = localStorage.getItem(REGISTRY_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveSharedRegistry(registry) {
  localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry))
}

export function registerSharedKpi(sharedFrom, meta) {
  const registry = loadSharedRegistry()
  registry[sharedFrom] = meta
  saveSharedRegistry(registry)
}

/** Sync primary owner check-in entry to all linked recipient goals */
export function syncSharedGoalCheckIn(primaryOwnerEmail, goal, period, entry) {
  if (!goal?.sharedFrom || !goal?.isPrimaryOwner) return

  const registry = loadSharedRegistry()
  const meta = registry[goal.sharedFrom]
  const recipients = meta?.recipientEmails || []

  recipients.forEach((email) => {
    if (email === primaryOwnerEmail) return
    const data = getEmployeeData(email)
    const linked = data.sheet.goals.find((g) => g.sharedFrom === goal.sharedFrom)
    if (!linked) return

    data.checkIns = data.checkIns || { q1: {}, q2: {}, q3: {}, q4: {} }
    data.checkIns[period] = {
      ...data.checkIns[period],
      [linked.id]: {
        ...entry,
        syncedFrom: primaryOwnerEmail,
        updatedAt: new Date().toISOString(),
      },
    }
    saveEmployeeData(email, data)
  })

  addManagerNotification(MANAGER_EMAIL, {
    type: 'shared_sync',
    title: 'Shared goal achievement updated',
    body: `Primary owner updated "${goal.title}" — synced to linked team sheets.`,
    actionPath: '/manager/check-in',
    employeeEmail: primaryOwnerEmail,
  })
}

export function getSharedGoalEntryForSave(goal, entry) {
  return entry
}
