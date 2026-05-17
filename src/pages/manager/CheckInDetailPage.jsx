import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../../context/AuthContext'
import {
  CHECKIN_STATUS_LABELS,
  PERIOD_LABELS,
  PERIODS,
  SHEET_STATUS,
  UOM_LABELS,
  UOM_TYPES,
} from '../../constants/goals'
import { decodeEmployeeParam, getEmployeeDisplay } from '../../lib/org'
import {
  computeWeightedTotal,
  formatProgressScore,
  getScoreTone,
} from '../../lib/progressScore'
import { useManagerTeam } from '../../hooks/useManagerTeam'

function scoreClass(tone) {
  if (tone === 'green') return 'text-emerald-600'
  if (tone === 'amber') return 'text-amber-600'
  if (tone === 'red') return 'text-red-600'
  return 'text-ink-500'
}

function rowHighlight(score) {
  if (score == null) return ''
  if (score < 50) return 'bg-red-50'
  if (score < 80) return 'bg-amber-50'
  return ''
}

export default function CheckInDetailPage() {
  const { employeeEmail: param } = useParams()
  const employeeEmail = decodeEmployeeParam(param || '')
  const [searchParams] = useSearchParams()
  const period = searchParams.get('period') || PERIODS.q1

  const { user } = useAuth()
  const {
    getMember,
    getThread,
    addComment,
    completeCheckIn,
    isCheckInComplete,
  } = useManagerTeam(user?.email, user?.name)

  const data = getMember(employeeEmail)
  const profile = getEmployeeDisplay(employeeEmail)
  const thread = getThread(employeeEmail, period)
  const [newComment, setNewComment] = useState('')
  const completed = isCheckInComplete(employeeEmail, period)

  if (!data) {
    return (
      <p className="text-ink-600">
        Employee not found.{' '}
        <Link to="/manager/check-in" className="text-violet-700 underline">
          Back
        </Link>
      </p>
    )
  }

  if (data.sheet.status !== SHEET_STATUS.locked) {
    return (
      <div>
        <p className="text-ink-600">Check-in requires a locked goal sheet.</p>
        <Link to="/manager/approvals" className="mt-2 inline-block text-violet-700 underline">
          Approvals
        </Link>
      </div>
    )
  }

  const periodData = data.checkIns?.[period] || {}
  const { rows, weightedScore, tone } = computeWeightedTotal(data.sheet.goals, periodData)

  function plannedLabel(goal) {
    if (goal.uomType === UOM_TYPES.timeline) return goal.deadline || '—'
    if (goal.uomType === UOM_TYPES.zero) return '0'
    return goal.target
  }

  function handleAddComment() {
    const result = addComment(employeeEmail, period, newComment)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success('Comment saved (permanent record).')
    setNewComment('')
  }

  function handleMarkComplete() {
    if (thread.length === 0 && !newComment.trim()) {
      toast.error('Add a check-in comment before marking complete.')
      return
    }
    if (newComment.trim()) addComment(employeeEmail, period, newComment)
    completeCheckIn(employeeEmail, period)
    toast.success('Check-in marked complete for this employee.')
  }

  return (
    <div className="mx-auto max-w-5xl">
      <Link to="/manager/check-in" className="text-sm font-medium text-violet-700 hover:underline">
        ← Team check-ins
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-950">
            {profile.name} — {period.toUpperCase()}
          </h1>
          <p className="text-sm text-ink-600">{PERIOD_LABELS[period]}</p>
          {completed && (
            <span className="mt-2 inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
              Manager check-in complete
            </span>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs text-ink-500">Weighted score</p>
          <p className={`text-3xl font-bold ${scoreClass(tone)}`}>
            {weightedScore != null ? `${weightedScore}%` : '—'}
          </p>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-ink-500">
              <th className="px-4 py-2">Goal title</th>
              <th className="px-4 py-2">Planned target</th>
              <th className="px-4 py-2">Actual achievement</th>
              <th className="px-4 py-2">Progress score</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ goal, score }) => {
              const entry = periodData[goal.id] || {}
              return (
                <tr key={goal.id} className={`border-b border-slate-50 ${rowHighlight(score)}`}>
                  <td className="px-4 py-3 font-medium text-ink-900">
                    {goal.title}
                    {goal.isShared && (
                      <span className="ml-1 text-[10px] text-cyan-700">(shared)</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{plannedLabel(goal)}</td>
                  <td className="px-4 py-3">
                    {goal.uomType === UOM_TYPES.timeline
                      ? entry.completionDate || entry.actual || '—'
                      : entry.actual ?? '—'}
                  </td>
                  <td
                    className={`px-4 py-3 font-bold ${scoreClass(getScoreTone(score))}`}
                  >
                    {formatProgressScore(score)}
                    {score != null && score < 80 && score >= 50 && (
                      <span className="ml-1 text-[10px] font-normal text-amber-700">
                        deviation
                      </span>
                    )}
                    {score != null && score < 50 && (
                      <span className="ml-1 text-[10px] font-normal text-red-700">
                        critical
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink-600">
                    {CHECKIN_STATUS_LABELS[entry.status] || '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-ink-900">Add check-in comment</h2>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={4}
          placeholder="Structured feedback for this quarter…"
          className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
        />
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleAddComment}
            disabled={!newComment.trim()}
            className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
          >
            Save comment
          </button>
          <button
            type="button"
            onClick={handleMarkComplete}
            className="rounded-xl border-2 border-emerald-500 bg-emerald-50 px-5 py-2.5 text-sm font-semibold text-emerald-900 hover:bg-emerald-100"
          >
            Mark check-in complete
          </button>
        </div>
      </section>

      {thread.length > 0 && (
        <section className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h2 className="text-sm font-semibold uppercase text-ink-500">
            Previous check-in comments
          </h2>
          <ul className="mt-3 space-y-3">
            {thread.map((c, i) => (
              <li key={i} className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
                <p className="text-ink-800">{c.text}</p>
                <p className="mt-1 text-xs text-ink-500">
                  {c.managerName || 'Manager'} · {new Date(c.savedAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-ink-400">Comments cannot be deleted once saved.</p>
        </section>
      )}
    </div>
  )
}
