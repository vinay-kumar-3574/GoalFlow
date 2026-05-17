import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { PERIOD_LABELS, PERIODS, SHEET_STATUS } from '../../constants/goals'
import { getCheckInDeadline, isCheckInWindowActive, isPeriodWindowOpen } from '../../lib/cycle'
import { computeWeightedTotal } from '../../lib/progressScore'
import { getCheckInStatusLabel } from '../../lib/managerTeamStats'
import { useManagerTeam } from '../../hooks/useManagerTeam'
import EmptyState from '../../components/shared/EmptyState'

const periodKeys = [PERIODS.q1, PERIODS.q2, PERIODS.q3, PERIODS.q4]

function StatusBadge({ status }) {
  const map = {
    Complete: 'bg-emerald-100 text-emerald-800',
    Pending: 'bg-amber-100 text-amber-900',
    'Not Started': 'bg-slate-100 text-slate-600',
    Overdue: 'bg-red-100 text-red-800',
  }
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${map[status]}`}>
      {status}
    </span>
  )
}

export default function TeamCheckInPage() {
  const { user } = useAuth()
  const { team, members, isCheckInComplete } = useManagerTeam(user?.email, user?.name)
  const window = isCheckInWindowActive(true)
  const [activePeriod, setActivePeriod] = useState(window?.period || PERIODS.q1)
  const meta = getCheckInDeadline(activePeriod)

  const locked = members.filter((m) => m.data.sheet.status === SHEET_STATUS.locked)

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-2xl font-semibold text-ink-950">Team Check-ins</h1>
      <p className="mt-1 text-sm text-ink-600">
        Review planned vs actual and add structured comments for the active quarter.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {periodKeys.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setActivePeriod(p)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              activePeriod === p
                ? 'bg-violet-600 text-white'
                : 'border border-slate-200 bg-white text-ink-700'
            }`}
          >
            {p.toUpperCase()}
          </button>
        ))}
      </div>
      <p className="mt-1 text-xs text-ink-500">
        {PERIOD_LABELS[activePeriod]}
        {meta && ` · Deadline ${meta.deadline}`}
      </p>

      <ul className="mt-6 space-y-3">
        {locked.length === 0 && (
          <li>
            <EmptyState
              icon="target"
              title="No team check-ins yet"
              description="Approve and lock goal sheets for your direct reports to start quarterly check-ins."
            />
          </li>
        )}
        {locked.map(({ email, data }) => {
          const profile = team.find((t) => t.email === email)
          const marked = isCheckInComplete(email, activePeriod)
          let status = getCheckInStatusLabel(data, user?.email, email, activePeriod)
          const windowClosed = !isPeriodWindowOpen(activePeriod, true)
          const isComplete = marked || status === 'Complete'
          if (windowClosed && !isComplete) {
            status = 'Overdue'
          }
          const periodData = data.checkIns?.[activePeriod] || {}
          const { weightedScore } = computeWeightedTotal(data.sheet.goals, periodData)

          return (
            <li
              key={email}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div>
                <p className="font-semibold text-ink-900">{profile?.name}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <StatusBadge status={marked ? 'Complete' : status} />
                  {weightedScore != null && (
                    <span className="text-xs text-ink-500">Score {weightedScore}%</span>
                  )}
                </div>
              </div>
              <Link
                to={`/manager/check-in/${encodeURIComponent(email)}?period=${activePeriod}`}
                className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
              >
                Open check-in
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
