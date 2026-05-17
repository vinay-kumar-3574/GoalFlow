import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { SkeletonTableRows } from '../../components/ui/Skeleton'
import { useDelayedLoading } from '../../hooks/useDelayedLoading'
import { useAuth } from '../../context/AuthContext'
import { SHEET_STATUS } from '../../constants/goals'
import { useManagerTeam } from '../../hooks/useManagerTeam'
import SheetStatusPill from '../../components/manager/SheetStatusPill'
import { sumWeightage } from '../../lib/goalValidation'
import { getDaysWaiting } from '../../lib/managerTeamStats'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending', status: SHEET_STATUS.submitted },
  { id: 'approved', label: 'Approved', status: SHEET_STATUS.locked },
  { id: 'returned', label: 'Returned', status: SHEET_STATUS.returned },
]

export default function ApprovalsPage() {
  const loading = useDelayedLoading(300)
  const navigate = useNavigate()
  const { user } = useAuth()
  const { team, members } = useManagerTeam(user?.email, user?.name)
  const [searchParams, setSearchParams] = useSearchParams()
  const filterId = searchParams.get('filter') || 'all'
  const [localFilter, setLocalFilter] = useState(filterId)

  const activeFilter = FILTERS.find((f) => f.id === localFilter) || FILTERS[0]

  const filtered = useMemo(() => {
    if (activeFilter.id === 'all') return members
    return members.filter((m) => m.data.sheet.status === activeFilter.status)
  }, [members, activeFilter])

  function setFilter(id) {
    setLocalFilter(id)
    if (id === 'all') setSearchParams({})
    else setSearchParams({ filter: id })
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-2xl font-semibold text-ink-950">Pending Approvals</h1>
      <p className="mt-1 text-sm text-ink-600">
        Review submitted goal sheets. Inline edit target and weightage before approving.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              localFilter === f.id
                ? 'bg-violet-600 text-white'
                : 'border border-slate-200 bg-white text-ink-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-6">
          <SkeletonTableRows rows={4} />
        </div>
      ) : filtered.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-ink-500">
          No employees in this filter.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {filtered.map(({ email, data }) => {
            const profile = team.find((t) => t.email === email)
            const days = getDaysWaiting(data.sheet.submittedAt)
            const canReview = data.sheet.status === SHEET_STATUS.submitted

            return (
              <li key={email}>
                <button
                  type="button"
                  onClick={() => navigate(`/manager/approvals/${encodeURIComponent(email)}`)}
                  className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-shadow hover:border-violet-300 hover:shadow-md"
                >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-ink-900">{profile?.name}</p>
                      <SheetStatusPill status={data.sheet.status} />
                    </div>
                    <p className="mt-1 text-xs text-ink-500">
                      {data.sheet.goals.length} goals · {sumWeightage(data.sheet.goals)}% total
                    </p>
                    {data.sheet.submittedAt && (
                      <p className="mt-1 text-xs text-ink-500">
                        Submitted {new Date(data.sheet.submittedAt).toLocaleDateString()}
                        {days != null && data.sheet.status === SHEET_STATUS.submitted && (
                          <span className="ml-2 font-medium text-amber-700">
                            · {days} day{days !== 1 ? 's' : ''} waiting
                          </span>
                        )}
                      </p>
                    )}
                    {data.sheet.status === SHEET_STATUS.returned && data.sheet.returnReason && (
                      <p className="mt-2 text-xs text-amber-800">
                        Returned: {data.sheet.returnReason}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white">
                    {canReview ? 'Review →' : 'View →'}
                  </span>
                </div>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
