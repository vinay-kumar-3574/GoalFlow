import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../../context/AuthContext'
import {
  CHECKIN_STATUS,
  CHECKIN_STATUS_LABELS,
  PERIOD_LABELS,
  PERIODS,
  SHEET_STATUS,
  UOM_LABELS,
  UOM_TYPES,
} from '../../constants/goals'
import { canEmployeeCheckIn } from '../../lib/cycle'
import { appendAuditLog, AUDIT_ACTIONS } from '../../lib/auditLog'
import { auditMetaForEmployee } from '../../lib/auditHelpers'
import { getEmployeeDisplay } from '../../lib/org'
import { computeWeightedTotal } from '../../lib/progressScore'
import { useEmployeeData } from '../../hooks/useEmployeeData'
import SheetStatusBanner from '../../components/employee/SheetStatusBanner'
import ProgressBadge from '../../components/employee/ProgressBadge'
import CheckInDonutChart from '../../components/employee/CheckInDonutChart'

const periodKeys = [PERIODS.q1, PERIODS.q2, PERIODS.q3, PERIODS.q4]

const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6']

function scoreTotalClass(tone) {
  if (tone === 'green') return 'text-emerald-600'
  if (tone === 'amber') return 'text-amber-600'
  if (tone === 'red') return 'text-red-600'
  return 'text-ink-500'
}

export default function CheckInPage() {
  const { user } = useAuth()
  const { sheet, checkIns, saveCheckIn } = useEmployeeData(user?.email)
  const [activePeriod, setActivePeriod] = useState(PERIODS.q1)

  if (!sheet) return null

  if (sheet.status !== SHEET_STATUS.locked) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-2xl font-semibold text-ink-950">Quarterly Check-in</h1>
        <SheetStatusBanner sheet={sheet} />
        <p className="mt-6 text-ink-600">
          Check-ins are available after your goal sheet is approved and locked.
        </p>
        <Link
          to="/employee/goals"
          className="mt-4 inline-block text-sm font-semibold text-brand-700 hover:underline"
        >
          ← Back to goal sheet
        </Link>
      </div>
    )
  }

  const periodData = checkIns?.[activePeriod] || {}
  const canCheckIn = canEmployeeCheckIn(sheet.status, activePeriod, true)
  const { rows, weightedScore, tone } = computeWeightedTotal(sheet.goals, periodData)

  function getEntry(goalId) {
    return (
      periodData[goalId] || {
        actual: '',
        status: CHECKIN_STATUS.notStarted,
        completionDate: '',
      }
    )
  }

  function handleChange(goalId, patch) {
    const current = getEntry(goalId)
    saveCheckIn(activePeriod, goalId, { ...current, ...patch })
  }

  function handleSaveCheckIn() {
    if (user?.email) {
      const profile = getEmployeeDisplay(user.email)
      const meta = auditMetaForEmployee(user.email)
      appendAuditLog({
        userId: user.email,
        userName: profile.name,
        role: 'employee',
        action: AUDIT_ACTIONS.achievement,
        entity: 'CheckIn',
        entityId: user.email,
        goalTitle: `${activePeriod.toUpperCase()} check-in`,
        field: 'achievement',
        oldValue: '—',
        newValue: weightedScore != null ? `${weightedScore}%` : 'saved',
        note: `Saved ${activePeriod.toUpperCase()} check-in`,
        department: meta.department,
      })
    }
    toast.success('Check-in saved successfully.')
  }

  function plannedLabel(goal) {
    if (goal.uomType === UOM_TYPES.timeline) return goal.deadline || '—'
    if (goal.uomType === UOM_TYPES.zero) return '0 (zero = success)'
    return `${goal.target}${goal.uomType === UOM_TYPES.percent ? '%' : ''}`
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-semibold text-ink-950">Quarterly Check-in</h1>
      <p className="mt-1 text-sm text-ink-600">
        Log actual achievement vs planned target. Progress updates as you type.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {periodKeys.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setActivePeriod(p)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              activePeriod === p
                ? 'bg-brand-600 text-white'
                : 'border border-slate-200 bg-white text-ink-700'
            }`}
          >
            {p.toUpperCase()}
          </button>
        ))}
      </div>

      <p className="mt-2 text-xs text-ink-500">{PERIOD_LABELS[activePeriod]}</p>

      {!canCheckIn && (
        <p className="mt-4 text-sm text-amber-800">This quarter window is closed on the live calendar.</p>
      )}

      <div className="mt-6 space-y-4">
        {sheet.goals.map((goal, i) => {
          const entry = getEntry(goal.id)

          return (
            <article
              key={goal.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-medium text-brand-600">{goal.thrustArea}</p>
                  <h3 className="font-semibold text-ink-900">
                    {i + 1}. {goal.title}
                    {goal.isShared && (
                      <span className="ml-2 text-xs font-normal text-cyan-700">(shared)</span>
                    )}
                  </h3>
                </div>
                <ProgressBadge
                  goal={goal}
                  actual={entry.actual}
                  completionDate={entry.completionDate}
                />
              </div>

              <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-ink-500">Planned (locked)</dt>
                  <dd className="font-medium text-ink-900">{plannedLabel(goal)}</dd>
                </div>
                <div>
                  <dt className="text-ink-500">UoM</dt>
                  <dd className="text-ink-800">{UOM_LABELS[goal.uomType]}</dd>
                </div>
              </dl>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-ink-600">
                    Actual achievement
                  </label>
                  {goal.uomType === UOM_TYPES.timeline ? (
                    <input
                      type="date"
                      value={entry.completionDate || ''}
                      disabled={goal.isShared && !goal.isPrimaryOwner}
                      onChange={(e) =>
                        handleChange(goal.id, {
                          completionDate: e.target.value,
                          actual: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:bg-slate-50"
                    />
                  ) : (
                    <input
                      type="number"
                      value={entry.actual}
                      disabled={goal.isShared && !goal.isPrimaryOwner}
                      onChange={(e) => handleChange(goal.id, { actual: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:bg-slate-50"
                      placeholder={
                        goal.isShared && !goal.isPrimaryOwner
                          ? 'Synced from primary owner'
                          : 'Enter actual'
                      }
                    />
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-ink-600">Status</label>
                  <select
                    value={entry.status}
                    onChange={(e) => handleChange(goal.id, { status: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
                  >
                    {Object.entries(CHECKIN_STATUS_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {sheet.goals.length === 0 && (
        <p className="text-center text-sm text-ink-500">No goals on your sheet.</p>
      )}

      <button
        type="button"
        onClick={handleSaveCheckIn}
        className="mt-8 w-full rounded-xl bg-brand-600 py-3.5 text-sm font-semibold text-white hover:bg-brand-700 sm:w-auto sm:px-10"
      >
        Save Check-in
      </button>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-500">
          Status breakdown
        </h2>
        <CheckInDonutChart goals={sheet.goals} periodData={periodData} />
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="text-center">
          <p className="text-sm font-medium text-ink-600">Total Weighted Score</p>
          <p className={`mt-1 text-4xl font-bold ${scoreTotalClass(tone)}`}>
            {weightedScore != null ? `${weightedScore}%` : '—'}
          </p>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase text-ink-500">
                <th className="py-2 pr-4">Goal Title</th>
                <th className="py-2 pr-4">Weightage</th>
                <th className="py-2 pr-4">Score</th>
                <th className="py-2">Weighted Contribution</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.goal.id} className="border-b border-slate-50">
                  <td className="py-2.5 pr-4 font-medium text-ink-900">
                    <span
                      className="mr-2 inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                    />
                    {row.goal.title}
                  </td>
                  <td className="py-2.5 pr-4 text-ink-600">{row.weight}%</td>
                  <td className="py-2.5 pr-4 font-medium text-ink-800">
                    {row.score != null ? `${row.score}%` : '—'}
                  </td>
                  <td className="py-2.5 font-semibold text-brand-700">
                    {row.contribution != null ? `${row.contribution}%` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
