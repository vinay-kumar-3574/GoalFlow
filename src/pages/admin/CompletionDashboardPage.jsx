import { Fragment, useMemo, useState } from 'react'
import { PERIOD_LABELS, PERIODS } from '../../constants/goals'
import { useAdminData } from '../../hooks/useAdminData'
import { getCompletionRows, getDepartments, getManagerRollup } from '../../lib/adminStorage'
import { getManagersList } from '../../lib/adminStorage'

const periods = [PERIODS.q1, PERIODS.q2, PERIODS.q3, PERIODS.q4]

const CELL_STYLES = {
  green: 'bg-emerald-500',
  amber: 'bg-amber-400',
  red: 'bg-red-400',
  gray: 'bg-slate-300',
}

export default function CompletionDashboardPage() {
  const { period, setPeriod } = useAdminData()
  const [expandedMgr, setExpandedMgr] = useState(null)

  const rows = useMemo(() => getCompletionRows(period), [period])
  const rollup = useMemo(() => getManagerRollup(period), [period])
  const departments = getDepartments()
  const managers = getManagersList()

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-display text-2xl font-semibold text-ink-950">Completion Dashboard</h1>
      <p className="mt-1 text-sm text-ink-600">Employee grid and manager rollup by quarter.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {periods.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${
              period === p ? 'bg-teal-600 text-white' : 'border border-slate-200 bg-white text-ink-700'
            }`}
          >
            {p.toUpperCase()}
          </button>
        ))}
      </div>

      <p className="mt-2 text-xs text-ink-500">{PERIOD_LABELS[period]}</p>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase text-ink-500">Employee grid</h2>
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-ink-600">
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded bg-emerald-500" /> Complete
          </span>
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded bg-amber-400" /> In progress
          </span>
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded bg-red-400" /> Not started
          </span>
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded bg-slate-300" /> Not approved
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {rows.map((r) => (
            <div
              key={r.email}
              title={r.cell?.tooltip}
              className={`rounded-lg p-3 text-center text-xs font-medium text-white ${CELL_STYLES[r.cell?.state] || CELL_STYLES.gray}`}
            >
              <p className="truncate font-semibold">{r.name.split(' ')[0]}</p>
              <p className="mt-0.5 opacity-90">{r.cell?.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase text-ink-500">Manager rollup</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-xs uppercase text-ink-500">
                <th className="px-4 py-2">Manager</th>
                <th className="px-4 py-2">Team size</th>
                <th className="px-4 py-2">Done</th>
                <th className="px-4 py-2">Pending</th>
                <th className="px-4 py-2">% complete</th>
                <th className="px-4 py-2">Progress</th>
              </tr>
            </thead>
            <tbody>
              {rollup.map((m) => (
                <Fragment key={m.managerEmail}>
                  <tr
                    className="cursor-pointer border-b border-slate-50 hover:bg-slate-50"
                    onClick={() =>
                      setExpandedMgr(expandedMgr === m.managerEmail ? null : m.managerEmail)
                    }
                  >
                    <td className="px-4 py-3 font-medium">{m.managerName}</td>
                    <td className="px-4 py-3">{m.teamSize}</td>
                    <td className="px-4 py-3 text-emerald-700">{m.checkInsDone}</td>
                    <td className="px-4 py-3 text-amber-700">{m.checkInsPending}</td>
                    <td className="px-4 py-3 font-semibold">{m.teamCompletePct}%</td>
                    <td className="px-4 py-3">
                      <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full bg-teal-500"
                          style={{ width: `${m.teamCompletePct}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                  {expandedMgr === m.managerEmail && (
                    <tr key={`${m.managerEmail}-exp`}>
                      <td colSpan={6} className="bg-slate-50 px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          {m.team.map(({ employee, cell }) => (
                            <div
                              key={employee.email}
                              title={cell.tooltip}
                              className={`rounded px-2 py-1 text-xs text-white ${CELL_STYLES[cell.state]}`}
                            >
                              {employee.name.split(' ')[0]}
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
