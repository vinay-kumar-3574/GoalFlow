import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { PERIOD_LABELS, PERIODS, SHEET_STATUS } from '../../constants/goals'
import { computeWeightedTotal } from '../../lib/progressScore'
import { getCheckInStatusLabel } from '../../lib/managerTeamStats'
import { useManagerTeam } from '../../hooks/useManagerTeam'

const periods = [PERIODS.q1, PERIODS.q2, PERIODS.q3, PERIODS.q4]

function exportCsv(rows, period) {
  const header = ['Employee', 'Goal', 'Planned', 'Actual', 'Score', 'Weight', 'Status']
  const lines = [header.join(',')]
  rows.forEach((r) => {
    lines.push(
      [
        r.employee,
        `"${r.goal.replace(/"/g, '""')}"`,
        r.planned,
        r.actual,
        r.score,
        r.weight,
        r.status,
      ].join(','),
    )
  })
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `team-report-${period}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function TeamReportsPage() {
  const { user } = useAuth()
  const { team, members } = useManagerTeam(user?.email, user?.name)
  const [period, setPeriod] = useState(PERIODS.q1)

  const reportRows = useMemo(() => {
    const flat = []
    members.forEach(({ email, data }) => {
      if (data.sheet.status !== SHEET_STATUS.locked) return
      const profile = team.find((t) => t.email === email)
      const periodData = data.checkIns?.[period] || {}
      data.sheet.goals.forEach((goal) => {
        const entry = periodData[goal.id] || {}
        const { rows } = computeWeightedTotal([goal], periodData)
        const score = rows[0]?.score
        flat.push({
          employee: profile?.name,
          goal: goal.title,
          planned: goal.target || goal.deadline,
          actual: entry.actual ?? entry.completionDate ?? '',
          score: score != null ? `${score}%` : '',
          weight: goal.weightage,
          status: entry.status || '',
        })
      })
    })
    return flat
  }, [members, team, period])

  const summary = useMemo(() => {
    let totalScore = 0
    let count = 0
    let completedCheckIns = 0
    let lockedCount = 0

    members.forEach(({ email, data }) => {
      if (data.sheet.status !== SHEET_STATUS.locked) return
      lockedCount += 1
      const periodData = data.checkIns?.[period] || {}
      const { weightedScore } = computeWeightedTotal(data.sheet.goals, periodData)
      if (weightedScore != null) {
        totalScore += weightedScore
        count += 1
      }
      if (getCheckInStatusLabel(data, user?.email, email, period) === 'Complete') {
        completedCheckIns += 1
      }
    })

    return {
      avgScore: count ? Math.round(totalScore / count) : null,
      completionRate: lockedCount
        ? Math.round((completedCheckIns / lockedCount) * 100)
        : 0,
      lockedCount,
    }
  }, [members, user?.email, period])

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-display text-2xl font-semibold text-ink-950">Team Reports</h1>
      <p className="mt-1 text-sm text-ink-600">
        Planned vs actual by quarter. For org-wide export, use Admin CSV (demo).
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          {periods.map((p) => (
            <option key={p} value={p}>
              {PERIOD_LABELS[p]}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => exportCsv(reportRows, period)}
          className="rounded-lg border border-violet-300 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-900"
        >
          Export team CSV
        </button>
        <Link
          to="/admin"
          className="text-sm text-ink-500 hover:text-violet-700"
          title="Admin module placeholder"
        >
          Admin org-wide export →
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-ink-500">Avg weighted score</p>
          <p className="mt-1 text-2xl font-bold text-ink-950">
            {summary.avgScore != null ? `${summary.avgScore}%` : '—'}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-ink-500">Check-in completion</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{summary.completionRate}%</p>
          <p className="text-xs text-ink-500">of {summary.lockedCount} locked sheets</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-ink-500">Report rows</p>
          <p className="mt-1 text-2xl font-bold text-ink-950">{reportRows.length}</p>
        </div>
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead>
            <tr className="border-b bg-slate-50 text-xs uppercase text-ink-500">
              <th className="px-3 py-2">Employee</th>
              <th className="px-3 py-2">Goal</th>
              <th className="px-3 py-2">Planned</th>
              <th className="px-3 py-2">Actual</th>
              <th className="px-3 py-2">Score</th>
              <th className="px-3 py-2">Wt%</th>
            </tr>
          </thead>
          <tbody>
            {reportRows.map((r, i) => (
              <tr key={i} className="border-b border-slate-50">
                <td className="px-3 py-2">{r.employee}</td>
                <td className="px-3 py-2 font-medium">{r.goal}</td>
                <td className="px-3 py-2">{r.planned}</td>
                <td className="px-3 py-2">{r.actual || '—'}</td>
                <td className="px-3 py-2">{r.score || '—'}</td>
                <td className="px-3 py-2">{r.weight}%</td>
              </tr>
            ))}
          </tbody>
        </table>
        {reportRows.length === 0 && (
          <p className="p-8 text-center text-sm text-ink-500">No locked goals for this quarter.</p>
        )}
      </div>
    </div>
  )
}
