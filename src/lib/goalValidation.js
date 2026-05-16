import {
  MAX_GOALS,
  MIN_WEIGHT_PER_GOAL,
  TARGET_WEIGHT_TOTAL,
  UOM_TYPES,
} from '../constants/goals'

export function sumWeightage(goals) {
  return goals.reduce((sum, g) => sum + (Number(g.weightage) || 0), 0)
}

export function isGoalFieldsComplete(goal) {
  if (!goal.thrustArea?.trim()) return false
  if (!goal.title?.trim()) return false
  if (!goal.description?.trim()) return false
  const w = Number(goal.weightage)
  if (!w || w < MIN_WEIGHT_PER_GOAL) return false

  if (goal.uomType === UOM_TYPES.timeline) {
    return Boolean(goal.deadline)
  }
  if (goal.uomType === UOM_TYPES.zero) return true
  if (goal.uomType === UOM_TYPES.numeric || goal.uomType === UOM_TYPES.percent) {
    if (!goal.uomDirection) return false
    const t = Number(goal.target)
    return !Number.isNaN(t) && goal.target !== '' && goal.target != null
  }
  return false
}

export function validateGoalSheet(goals) {
  const errors = []

  if (goals.length === 0) {
    errors.push('Add at least one goal before submitting.')
    return { valid: false, errors, totalWeight: 0 }
  }

  if (goals.length > MAX_GOALS) {
    errors.push(`Maximum ${MAX_GOALS} goals allowed.`)
  }

  const totalWeight = sumWeightage(goals)

  if (totalWeight !== TARGET_WEIGHT_TOTAL) {
    errors.push(`Total weightage must equal ${TARGET_WEIGHT_TOTAL}% (currently ${totalWeight}%).`)
  }

  goals.forEach((g, i) => {
    const n = i + 1
    if (!g.thrustArea?.trim()) errors.push(`Goal ${n}: select a thrust area.`)
    if (!g.title?.trim()) errors.push(`Goal ${n}: title is required.`)
    if (!g.description?.trim()) errors.push(`Goal ${n}: description is required.`)
    const w = Number(g.weightage)
    if (!w || w < MIN_WEIGHT_PER_GOAL) {
      errors.push(`Goal ${n}: weightage must be at least ${MIN_WEIGHT_PER_GOAL}%.`)
    }
    if (g.uomType === UOM_TYPES.timeline && !g.deadline) {
      errors.push(`Goal ${n}: target completion date is required.`)
    }
    if (g.uomType !== UOM_TYPES.timeline && g.uomType !== UOM_TYPES.zero) {
      const t = Number(g.target)
      if (Number.isNaN(t) || g.target === '' || g.target == null) {
        errors.push(`Goal ${n}: target value is required.`)
      }
    }
    if (
      (g.uomType === UOM_TYPES.numeric || g.uomType === UOM_TYPES.percent) &&
      !g.uomDirection
    ) {
      errors.push(`Goal ${n}: select higher-is-better or lower-is-better.`)
    }
  })

  return { valid: errors.length === 0, errors, totalWeight }
}

export function canEditGoals(sheetStatus, sheet = null) {
  if (sheet?.adminUnlocked) return true
  return sheetStatus === 'draft' || sheetStatus === 'returned'
}

export function canSubmitSheet(goals) {
  const v = validateGoalSheet(goals)
  return v.valid && goals.every(isGoalFieldsComplete)
}
