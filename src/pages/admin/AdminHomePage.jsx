import { Link } from 'react-router-dom'
import { PERIOD_LABELS } from '../../constants/goals'
import { useAdminData } from '../../hooks/useAdminData'
import { getCycleConfig } from '../../lib/adminStorage'
import { getActiveEscalationCount } from '../../lib/adminEscalations'
import { getAuditLogs, AUDIT_ACTION_LABELS } from '../../lib/auditLog'

const quickActions = [
  { to: '/admin/cycle', label: 'Configure Cycle', color: 'bg-teal-600' },
  { to: '/admin/unlock', label: 'Unlock a Goal', color: 'bg-orange-600' },
  { to: '/admin/audit', label: 'View Audit Log', color: 'bg-slate-700' },
  { to: '/admin/reports', label: 'Export Report', color: 'bg-emerald-600' },
]

export default function AdminHomePage() {
  const { stats, period } = useAdminData()
  const cycle = getCycleConfig()
  const escalations = getActiveEscalationCount()
  const recentAudit = getAuditLogs().slice(0, 5)

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-display text-2xl font-semibold text-ink-950 sm:text-3xl">Admin Dashboard</h1>
      <p className="mt-2 text-ink-600">
        Org-wide governance · FY{cycle.year} · {PERIOD_LABELS[period]}
      </p>

      {escalations > 0 && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          <strong>{escalations} pending escalation(s)</strong> — rules breached.{' '}
          <Link to="/admin/escalations" className="font-semibold underline">
            Review escalations →
          </Link>
        </div>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Card label="Total Employees" value={stats.totalEmployees} />
        <Card label="Total Goals Created" value={stats.totalGoalsCreated} />
        <Card label="Goal Submission Rate" value={`${stats.submissionRate}%`} tone="amber" />
        <Card label="Approval Rate" value={`${stats.approvalRate}%`} tone="teal" />
        <Card
          label="Check-in Completion"
          value={`${stats.checkInCompletionRate}%`}
          sub={`Current: ${PERIOD_LABELS[period]?.split(' ')[0] || period}`}
          tone="green"
        />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        {quickActions.map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm ${a.color} hover:opacity-90`}
          >
            {a.label}
          </Link>
        ))}
      </div>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-500">
          Recent audit activity
        </h2>
        <ul className="mt-3 space-y-2">
          {recentAudit.map((log) => (
            <li
              key={log.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
            >
              <div>
                <p className="font-medium text-ink-900">
                  {AUDIT_ACTION_LABELS[log.action] || log.action} · {log.goalTitle || log.entity}
                </p>
                <p className="text-xs text-ink-500">
                  {log.userName} ({log.role}) · {new Date(log.at).toLocaleString()}
                </p>
              </div>
              <span className="text-xs text-ink-400">
                {log.oldValue} → {log.newValue}
              </span>
            </li>
          ))}
        </ul>
        <Link to="/admin/audit" className="mt-3 inline-block text-sm font-semibold text-teal-700">
          View full audit trail →
        </Link>
      </section>
    </div>
  )
}

function Card({ label, value, sub, tone }) {
  const tones = {
    amber: 'border-amber-200 bg-amber-50',
    teal: 'border-teal-200 bg-teal-50',
    green: 'border-emerald-200 bg-emerald-50',
  }
  return (
    <div className={`rounded-xl border p-4 ${tones[tone] || 'border-slate-200 bg-white'}`}>
      <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-ink-950">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-ink-500">{sub}</p>}
    </div>
  )
}
