import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { PERIODS } from '../../constants/goals'
import {
  buildAchievementReportRows,
  exportAchievementReportCsv,
  getCycleConfig,
  getDepartments,
  getManagersList,
  getThrustAreas,
} from '../../lib/adminStorage'
import { appendAuditLog, AUDIT_ACTIONS } from '../../lib/auditLog'
import { addAdminNotification } from '../../lib/adminNotifications'
import { useAuth } from '../../context/AuthContext'

export default function AchievementReportsPage() {
  const { user } = useAuth()
  const cycle = getCycleConfig()
  const [filters, setFilters] = useState({
    department: 'all',
    manager: 'all',
    quarter: 'all',
    status: 'all',
    thrustArea: 'all',
    search: '',
  })
  const [sortKey, setSortKey] = useState('employeeName')
  const [sortDir, setSortDir] = useState(1)

  const rows = useMemo(() => {
    const list = buildAchievementReportRows(filters)
    return [...list].sort((a, b) => {
      const av = String(a[sortKey] ?? '').toLowerCase()
      const bv = String(b[sortKey] ?? '').toLowerCase()
      return av.localeCompare(bv) * sortDir
    })
  }, [filters, sortKey, sortDir])

  function setFilter(key, value) {
    setFilters((f) => ({ ...f, [key]: value }))
  }

  function handleExport() {
    const { csv, filename } = exportAchievementReportCsv(
      filters,
      cycle.year,
      filters.quarter,
    )
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    appendAuditLog({
      userId: user.email,
      userName: user.name,
      role: 'admin',
      action: AUDIT_ACTIONS.export,
      entity: 'Report',
      entityId: filename,
      goalTitle: 'Achievement',
      field: 'csv',
      oldValue: '—',
      newValue: `${rows.length} rows`,
      note: 'Export completed',
    })
    addAdminNotification({
      type: 'export',
      title: 'Export completed',
      body: filename,
    })
    toast.success('CSV downloaded.')
  }

  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="font-display text-2xl font-semibold text-ink-950">Achievement Report</h1>
      <p className="mt-1 text-sm text-ink-600">Full org report with filters and CSV export.</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <FilterSelect
          label="Department"
          value={filters.department}
          onChange={(v) => setFilter('department', v)}
          options={[{ v: 'all', l: 'All' }, ...getDepartments().map((d) => ({ v: d, l: d }))]}
        />
        <FilterSelect
          label="Manager"
          value={filters.manager}
          onChange={(v) => setFilter('manager', v)}
          options={[
            { v: 'all', l: 'All' },
            ...getManagersList()
              .filter((m) => m.role === 'manager')
              .map((m) => ({ v: m.email, l: m.name })),
          ]}
        />
        <FilterSelect
          label="Quarter"
          value={filters.quarter}
          onChange={(v) => setFilter('quarter', v)}
          options={[
            { v: 'all', l: 'All' },
            { v: PERIODS.q1, l: 'Q1' },
            { v: PERIODS.q2, l: 'Q2' },
            { v: PERIODS.q3, l: 'Q3' },
            { v: PERIODS.q4, l: 'Q4' },
          ]}
        />
        <FilterSelect
          label="Status"
          value={filters.status}
          onChange={(v) => setFilter('status', v)}
          options={[
            { v: 'all', l: 'All' },
            { v: 'Not Started', l: 'Not Started' },
            { v: 'On Track', l: 'On Track' },
            { v: 'Completed', l: 'Completed' },
          ]}
        />
        <FilterSelect
          label="Thrust area"
          value={filters.thrustArea}
          onChange={(v) => setFilter('thrustArea', v)}
          options={[
            { v: 'all', l: 'All' },
            ...getThrustAreas().map((t) => ({ v: t, l: t })),
          ]}
        />
        <label className="block text-xs text-ink-500">
          Search employee
          <input
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
            className="mt-0.5 w-full rounded-lg border px-2 py-1.5 text-sm"
            placeholder="Name…"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-600">
          Showing <strong>{rows.length}</strong> of <strong>{rows.length}</strong> rows
        </p>
        <button
          type="button"
          onClick={handleExport}
          className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white"
        >
          Export to CSV
        </button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead>
            <tr className="border-b bg-slate-50 text-xs uppercase text-ink-500">
              {[
                ['employeeName', 'Employee'],
                ['department', 'Dept'],
                ['manager', 'Manager'],
                ['goalTitle', 'Goal'],
                ['thrustArea', 'Thrust'],
                ['uom', 'UoM'],
                ['target', 'Target'],
                ['q1', 'Q1'],
                ['q2', 'Q2'],
                ['q3', 'Q3'],
                ['q4', 'Q4'],
                ['finalStatus', 'Status'],
              ].map(([key, label]) => (
                <th
                  key={key}
                  className="cursor-pointer px-2 py-2"
                  onClick={() => {
                    if (sortKey === key) setSortDir((d) => -d)
                    else {
                      setSortKey(key)
                      setSortDir(1)
                    }
                  }}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-slate-50">
                <td className="px-2 py-2 font-medium">{r.employeeName}</td>
                <td className="px-2 py-2">{r.department}</td>
                <td className="px-2 py-2">{r.manager}</td>
                <td className="px-2 py-2">{r.goalTitle}</td>
                <td className="px-2 py-2 text-xs">{r.thrustArea}</td>
                <td className="px-2 py-2">{r.uom}</td>
                <td className="px-2 py-2">{r.target}</td>
                <td className="px-2 py-2">{r.q1}</td>
                <td className="px-2 py-2">{r.q2}</td>
                <td className="px-2 py-2">{r.q3}</td>
                <td className="px-2 py-2">{r.q4}</td>
                <td className="px-2 py-2">{r.finalStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <label className="block text-xs text-ink-500">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-0.5 w-full rounded-lg border px-2 py-1.5 text-sm"
      >
        {options.map((o) => (
          <option key={o.v} value={o.v}>
            {o.l}
          </option>
        ))}
      </select>
    </label>
  )
}
