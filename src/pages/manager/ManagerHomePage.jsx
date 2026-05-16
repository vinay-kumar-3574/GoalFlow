import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { SHEET_STATUS } from '../../constants/goals'
import { getCheckInDeadline, isCheckInWindowActive } from '../../lib/cycle'
import { getMemberRowMetrics } from '../../lib/managerTeamStats'
import { useManagerTeam } from '../../hooks/useManagerTeam'
import SheetStatusPill from '../../components/manager/SheetStatusPill'

function scoreClass(tone) {
  if (tone === 'green') return 'text-emerald-600'
  if (tone === 'amber') return 'text-amber-600'
  if (tone === 'red') return 'text-red-600'
  return 'text-ink-400'
}

export default function ManagerHomePage() {
  const { user } = useAuth()
  const { team, members, dashboardStats, activePeriod } = useManagerTeam(
    user?.email,
    user?.name,
  )
  const window = isCheckInWindowActive(true)
  const deadline = getCheckInDeadline(activePeriod)

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-display text-2xl font-semibold text-ink-950 sm:text-3xl">
        Team Dashboard
      </h1>
      <p className="mt-2 text-ink-600">FY26 · Direct reports only</p>

      {deadline && window && (
        <div className="mt-4 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-900">
          <strong>{deadline.label}</strong> — deadline <strong>{deadline.deadline}</strong>
        </div>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <SummaryCard label="Total team members" value={dashboardStats.totalMembers} />
        <SummaryCard
          label="Goals pending approval"
          value={dashboardStats.pendingApproval}
          tone="amber"
          to="/manager/approvals?filter=pending"
        />
        <SummaryCard label="Goals approved" value={dashboardStats.approved} tone="green" />
        <SummaryCard
          label="Check-ins completed"
          value={dashboardStats.checkInsCompleted}
          tone="green"
          sub={`This quarter (${activePeriod.toUpperCase()})`}
        />
        <SummaryCard
          label="Check-ins pending"
          value={dashboardStats.checkInsPending}
          tone="amber"
          to="/manager/check-in"
        />
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="font-semibold text-ink-900">Team members</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-ink-500">
                <th className="px-4 py-2">Employee name</th>
                <th className="px-4 py-2">Goals submitted</th>
                <th className="px-4 py-2">Approval status</th>
                <th className="px-4 py-2">Latest check-in</th>
                <th className="px-4 py-2">Weighted score</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map(({ email, data }) => {
                const profile = team.find((t) => t.email === email)
                const m = getMemberRowMetrics(email, data, user?.email, activePeriod)

                return (
                  <tr key={email} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink-900">{profile?.name}</p>
                      <p className="text-xs text-ink-500">{profile?.department}</p>
                    </td>
                    <td className="px-4 py-3">
                      {m.goalsSubmitted ? (
                        <span className="text-emerald-700 font-medium">Yes ({m.goalsCount})</span>
                      ) : (
                        <span className="text-ink-400">No</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <SheetStatusPill status={m.approvalStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <CheckInBadge status={m.checkInStatus} />
                    </td>
                    <td className={`px-4 py-3 font-bold ${scoreClass(m.scoreTone)}`}>
                      {m.weightedScore != null ? `${m.weightedScore}%` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {data.sheet.status === SHEET_STATUS.submitted && (
                          <Link
                            to={`/manager/approvals/${encodeURIComponent(email)}`}
                            className="rounded-lg bg-violet-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-violet-700"
                          >
                            Review pending
                          </Link>
                        )}
                        {data.sheet.status === SHEET_STATUS.locked && (
                          <Link
                            to={`/manager/check-in/${encodeURIComponent(email)}?period=${activePeriod}`}
                            className="rounded-lg border border-violet-300 px-2.5 py-1 text-xs font-semibold text-violet-800 hover:bg-violet-50"
                          >
                            Start check-in
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function SummaryCard({ label, value, tone, sub, to }) {
  const tones = {
    amber: 'border-amber-200 bg-amber-50',
    green: 'border-emerald-200 bg-emerald-50',
  }
  const inner = (
    <div className={`rounded-xl border p-4 ${tones[tone] || 'border-slate-200 bg-white'}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-ink-950">{value}</p>
      {sub && <p className="mt-0.5 text-[10px] text-ink-500">{sub}</p>}
    </div>
  )
  if (to) return <Link to={to}>{inner}</Link>
  return inner
}

function CheckInBadge({ status }) {
  const styles = {
    Complete: 'bg-emerald-100 text-emerald-800',
    Pending: 'bg-amber-100 text-amber-900',
    'Not Started': 'bg-slate-100 text-slate-600',
  }
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${styles[status]}`}>
      {status}
    </span>
  )
}
