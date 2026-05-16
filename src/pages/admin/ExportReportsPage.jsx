import { useState } from 'react'
import { toast } from 'sonner'
import { PERIOD_LABELS, PERIODS } from '../../constants/goals'
import { buildAchievementExport, exportAchievementCsv } from '../../lib/adminStorage'

const periods = [PERIODS.q1, PERIODS.q2, PERIODS.q3, PERIODS.q4]

export default function ExportReportsPage() {
  const [period, setPeriod] = useState(PERIODS.q1)
  const preview = buildAchievementExport(period).slice(0, 50)

  function handleDownload() {
    const csv = exportAchievementCsv(period)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `goalflow-achievement-${period}-fy26.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Achievement report downloaded.')
  }

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-display text-2xl font-semibold text-ink-950">Export Reports</h1>
      <p className="mt-1 text-sm text-ink-600">
        Org-wide achievement export: planned target vs actual per goal (CSV).
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
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
          onClick={handleDownload}
          className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
        >
          Download CSV
        </button>
      </div>

      <p className="mt-2 text-xs text-ink-500">
        {buildAchievementExport(period).length} rows in full export
      </p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[900px] text-left text-sm">
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
            {preview.map((r, i) => (
              <tr key={i} className="border-b border-slate-50">
                <td className="px-3 py-2">{r.employee}</td>
                <td className="px-3 py-2 font-medium">{r.goal}</td>
                <td className="px-3 py-2">{r.planned}</td>
                <td className="px-3 py-2">{r.actual || '—'}</td>
                <td className="px-3 py-2">{r.progressScore || '—'}</td>
                <td className="px-3 py-2">{r.weightage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
        {preview.length === 0 && (
          <p className="p-8 text-center text-sm text-ink-500">No data for this period.</p>
        )}
      </div>
    </div>
  )
}
