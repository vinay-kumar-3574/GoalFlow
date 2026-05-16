import { PERIODS } from '../../constants/goals'
import { computeWeightedTotal } from '../../lib/progressScore'

function toneClass(tone) {
  if (tone === 'green') return 'text-emerald-600'
  if (tone === 'amber') return 'text-amber-600'
  if (tone === 'red') return 'text-red-600'
  return 'text-ink-500'
}

export default function OverviewWeightedScore({ goals, checkIns, period = PERIODS.q1 }) {
  const periodData = checkIns?.[period] || {}
  const { weightedScore, tone } = computeWeightedTotal(goals, periodData)

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-ink-600">Current Weighted Score</p>
      <p className={`mt-2 text-5xl font-bold tracking-tight ${toneClass(tone)}`}>
        {weightedScore != null ? `${weightedScore}%` : '—'}
      </p>
      <p className="mt-2 text-xs text-ink-500">
        Based on {period.toUpperCase()} check-in actuals vs locked targets
      </p>
    </div>
  )
}
