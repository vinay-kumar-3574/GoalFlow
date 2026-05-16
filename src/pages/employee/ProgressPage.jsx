import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  CHECKIN_STATUS_LABELS,
  PERIOD_LABELS,
  PERIODS,
  SHEET_STATUS,
  UOM_LABELS,
  UOM_TYPES,
} from '../../constants/goals'
import { getProgressBadge, scoreToneClasses } from '../../lib/progressScore'
import { useEmployeeData } from '../../hooks/useEmployeeData'
import SheetStatusBanner from '../../components/employee/SheetStatusBanner'

const periods = [PERIODS.q1, PERIODS.q2, PERIODS.q3, PERIODS.q4]

function ScoreCell({ goal, entry }) {
  const hasData =
    goal.uomType === UOM_TYPES.timeline
      ? Boolean(entry?.completionDate)
      : entry?.actual !== '' && entry?.actual != null && entry?.actual !== undefined

  if (!hasData) {
    return <span className="text-ink-400">—</span>
  }

  const badge = getProgressBadge(goal, entry?.actual, entry?.completionDate)
  if (badge.score != null) {
    return (
      <span
        className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${scoreToneClasses(badge.tone)}`}
      >
        {badge.display}
      </span>
    )
  }

  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${scoreToneClasses(badge.tone)}`}
    >
      {badge.display}
    </span>
  )
}

export default function ProgressPage() {
  const { user } = useAuth()
  const { sheet, checkIns } = useEmployeeData(user?.email)

  if (!sheet) return null

  if (sheet.status !== SHEET_STATUS.locked) {
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-2xl font-semibold text-ink-950">My Progress</h1>
        <div className="mt-4">
          <SheetStatusBanner sheet={sheet} />
        </div>
        <p className="mt-6 text-ink-600">
          Progress tracking is available after your goal sheet is approved and locked.
        </p>
        <Link to="/employee/goals" className="mt-4 inline-block text-sm font-semibold text-brand-700">
          ← Go to goal sheet
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-2xl font-semibold text-ink-950">My Progress</h1>
      <p className="mt-1 text-sm text-ink-600">
        Planned targets vs actuals and computed scores across all quarters.
      </p>

      {sheet.goals.length === 0 ? (
        <p className="mt-8 text-center text-ink-500">No goals on your sheet.</p>
      ) : (
        <div className="mt-6 space-y-6">
          {sheet.goals.map((goal, i) => (
            <article
              key={goal.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
                <p className="text-xs font-medium text-brand-600">{goal.thrustArea}</p>
                <h2 className="font-semibold text-ink-900">
                  {i + 1}. {goal.title}
                </h2>
                <p className="mt-1 text-xs text-ink-500">
                  {UOM_LABELS[goal.uomType]} · Weight {goal.weightage}%
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-ink-500">
                      <th className="px-5 py-3">Quarter</th>
                      <th className="px-5 py-3">Planned</th>
                      <th className="px-5 py-3">Actual</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {periods.map((p) => {
                      const entry = checkIns?.[p]?.[goal.id]
                      const planned =
                        goal.uomType === UOM_TYPES.timeline
                          ? goal.deadline
                          : goal.uomType === UOM_TYPES.zero
                            ? '0'
                            : `${goal.target}${goal.uomType === UOM_TYPES.percent ? '%' : ''}`

                      return (
                        <tr key={p} className="border-b border-slate-50 last:border-0">
                          <td className="px-5 py-3 font-medium text-ink-800">
                            {PERIOD_LABELS[p].split(' ')[0]}
                          </td>
                          <td className="px-5 py-3 text-ink-600">{planned || '—'}</td>
                          <td className="px-5 py-3 text-ink-800">
                            {entry?.completionDate || entry?.actual || '—'}
                          </td>
                          <td className="px-5 py-3">
                            {entry?.status ? CHECKIN_STATUS_LABELS[entry.status] : '—'}
                          </td>
                          <td className="px-5 py-3">
                            <ScoreCell goal={goal} entry={entry} />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </article>
          ))}
        </div>
      )}

      <Link
        to="/employee/check-in"
        className="mt-8 inline-flex rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Update check-in →
      </Link>
    </div>
  )
}
