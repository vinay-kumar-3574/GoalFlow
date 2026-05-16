import { UOM_DIRECTIONS, UOM_TYPES } from '../constants/goals'

export function calculateProgressScore(goal, actual, completionDate) {
  const target = Number(goal.target)
  const achieved = actual === '' || actual == null ? NaN : Number(actual)

  if (goal.uomType === UOM_TYPES.zero) {
    if (achieved === 0) return 100
    if (!Number.isNaN(achieved)) return 0
    return null
  }

  if (goal.uomType === UOM_TYPES.timeline) {
    if (!goal.deadline || !completionDate) return null
    const deadline = new Date(goal.deadline)
    const done = new Date(completionDate)
    if (done <= deadline) return 100
    const msLate = done - deadline
    const msTotal = Math.max(deadline - new Date(goal.createdAt || deadline), 1)
    const penalty = Math.min(100, Math.round((msLate / msTotal) * 100))
    return Math.max(0, 100 - penalty)
  }

  if (Number.isNaN(achieved) || Number.isNaN(target) || target === 0) return null

  let ratio
  if (goal.uomDirection === UOM_DIRECTIONS.max) {
    if (achieved === 0) return null
    ratio = target / achieved
  } else {
    ratio = achieved / target
  }

  return Math.min(100, Math.round(ratio * 100))
}

export function getScoreTone(score) {
  if (score == null) return 'neutral'
  if (score >= 80) return 'green'
  if (score >= 50) return 'amber'
  return 'red'
}

export function scoreToneClasses(tone) {
  switch (tone) {
    case 'green':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200'
    case 'amber':
      return 'bg-amber-100 text-amber-900 border-amber-200'
    case 'red':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200'
  }
}

export function getTimelineDelayDays(deadline, completionDate) {
  if (!deadline || !completionDate) return 0
  const d = new Date(deadline)
  const c = new Date(completionDate)
  if (c <= d) return 0
  return Math.ceil((c - d) / (1000 * 60 * 60 * 24))
}

/** Inline badge for check-in row */
export function getProgressBadge(goal, actual, completionDate) {
  const score = calculateProgressScore(goal, actual, completionDate)
  const hasActual =
    goal.uomType === UOM_TYPES.timeline
      ? Boolean(completionDate)
      : actual !== '' && actual != null && actual !== undefined

  if (!hasActual) {
    return { label: 'Enter actual', tone: 'neutral', score: null, display: '—' }
  }

  if (goal.uomType === UOM_TYPES.timeline) {
    const days = getTimelineDelayDays(goal.deadline, completionDate)
    if (days === 0) {
      return { label: 'On Time ✓', tone: 'green', score: 100, display: 'On Time ✓' }
    }
    return {
      label: `${days} days delayed`,
      tone: 'red',
      score: score ?? 0,
      display: `${days} days delayed`,
    }
  }

  if (goal.uomType === UOM_TYPES.zero) {
    const n = Number(actual)
    if (n === 0) {
      return { label: '✓ Success', tone: 'green', score: 100, display: '✓ Success' }
    }
    return { label: '✗ Incident Recorded', tone: 'red', score: 0, display: '✗ Incident Recorded' }
  }

  if (score == null) {
    return { label: '—', tone: 'neutral', score: null, display: '—' }
  }

  return {
    label: `${score}%`,
    tone: getScoreTone(score),
    score,
    display: `${score}%`,
  }
}

export function formatProgressScore(score) {
  if (score == null) return '—'
  return `${score}%`
}

export function computeWeightedTotal(goals, periodData) {
  let total = 0
  let weightSum = 0
  const rows = goals.map((goal) => {
    const entry = periodData?.[goal.id]
    const actual = entry?.actual
    const completionDate = entry?.completionDate
    const score = calculateProgressScore(goal, actual, completionDate)
    const weight = Number(goal.weightage) || 0
    const contribution = score != null ? (score * weight) / 100 : 0
    if (score != null) {
      total += contribution
      weightSum += weight
    }
    return {
      goal,
      weight,
      score,
      contribution: score != null ? Math.round(contribution * 10) / 10 : null,
    }
  })

  const weightedScore =
    weightSum > 0
      ? Math.round(
          goals.reduce((s, g) => {
            const entry = periodData?.[g.id]
            const sc = calculateProgressScore(g, entry?.actual, entry?.completionDate)
            const w = Number(g.weightage) || 0
            return s + (sc != null ? (sc * w) / 100 : 0)
          }, 0),
        )
      : null

  return { rows, weightedScore, tone: getScoreTone(weightedScore) }
}
