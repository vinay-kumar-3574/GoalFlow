import { useMemo, useState } from 'react'
import {
  AUDIT_ACTION_LABELS,
  AUDIT_ACTIONS,
  filterAuditLogs,
  getAuditLogs,
  paginateLogs,
} from '../../lib/auditLog'
import { getDepartments } from '../../lib/adminStorage'

const ACTION_OPTIONS = [
  { v: 'all', l: 'All actions' },
  ...Object.entries(AUDIT_ACTIONS).map(([, v]) => ({
    v,
    l: AUDIT_ACTION_LABELS[v] || v,
  })),
]

export default function AuditLogPage() {
  const [action, setAction] = useState('all')
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [department, setDepartment] = useState('all')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const all = getAuditLogs()
    return filterAuditLogs(all, { action, search, dateFrom, dateTo, department })
  }, [action, search, dateFrom, dateTo, department])

  const { items, total, totalPages } = useMemo(
    () => paginateLogs(filtered, page, 10),
    [filtered, page],
  )

  const departments = getDepartments()

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-display text-2xl font-semibold text-ink-950">Audit Trail</h1>
      <p className="mt-1 text-sm text-ink-600">Newest first · 10 rows per page.</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          placeholder="Actor name search…"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
        <select
          value={action}
          onChange={(e) => {
            setAction(e.target.value)
            setPage(1)
          }}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          {ACTION_OPTIONS.map((o) => (
            <option key={o.v} value={o.v}>
              {o.l}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => {
            setDateFrom(e.target.value)
            setPage(1)
          }}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          placeholder="From"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => {
            setDateTo(e.target.value)
            setPage(1)
          }}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          placeholder="To"
        />
        <select
          value={department}
          onChange={(e) => {
            setDepartment(e.target.value)
            setPage(1)
          }}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm sm:col-span-2"
        >
          <option value="all">All departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b bg-slate-50 text-xs uppercase text-ink-500">
              <th className="px-3 py-2">Timestamp</th>
              <th className="px-3 py-2">Actor</th>
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2">Action</th>
              <th className="px-3 py-2">Goal title</th>
              <th className="px-3 py-2">Old</th>
              <th className="px-3 py-2">New</th>
            </tr>
          </thead>
          <tbody>
            {items.map((log) => (
              <tr key={log.id} className="border-b border-slate-50 align-top">
                <td className="px-3 py-2 text-xs whitespace-nowrap">
                  {new Date(log.at).toLocaleString()}
                </td>
                <td className="px-3 py-2 font-medium">{log.userName || log.userId}</td>
                <td className="px-3 py-2 capitalize text-xs">{log.role}</td>
                <td className="px-3 py-2 text-xs">
                  {AUDIT_ACTION_LABELS[log.action] || log.action}
                </td>
                <td className="px-3 py-2">{log.goalTitle || log.entity}</td>
                <td className="px-3 py-2 text-xs">{log.oldValue}</td>
                <td className="px-3 py-2 text-xs">{log.newValue}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && (
          <p className="p-8 text-center text-sm text-ink-500">No entries match filters.</p>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <p className="text-ink-500">
          Page {page} of {totalPages} · {total} entries
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border px-3 py-1 disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border px-3 py-1 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
