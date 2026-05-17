import { Link } from 'react-router-dom'
import { SkeletonCard } from '../../components/ui/Skeleton'
import { useDelayedLoading } from '../../hooks/useDelayedLoading'
import { useAuth } from '../../context/AuthContext'
import { PERIODS, SHEET_STATUS } from '../../constants/goals'
import { sumWeightage } from '../../lib/goalValidation'
import { useEmployeeData } from '../../hooks/useEmployeeData'
import SheetStatusBanner from '../../components/employee/SheetStatusBanner'
import CheckInBanner from '../../components/employee/CheckInBanner'
import OverviewGoalStatusDonut from '../../components/employee/OverviewGoalStatusDonut'
import YearTimelineStrip from '../../components/employee/YearTimelineStrip'
import OverviewWeightedScore from '../../components/employee/OverviewWeightedScore'

export default function EmployeeHomePage() {
  const loading = useDelayedLoading(300)
  const { user } = useAuth()
  const { sheet, checkIns } = useEmployeeData(user?.email)
  const totalWeight = sheet ? sumWeightage(sheet.goals) : 0
  const goals = sheet?.goals ?? []

  return (
    <div className="mx-auto max-w-4xl">
      <CheckInBanner sheetStatus={sheet?.status} />

      <h1 className="font-display text-2xl font-semibold text-ink-950 sm:text-3xl">
        Welcome, {user?.name?.split(' ')[0]}
      </h1>
      <p className="mt-2 text-ink-600">
        Your overview for goal setting, quarterly check-ins, and weighted performance.
      </p>

      <div className="mt-6">
        <SheetStatusBanner sheet={sheet} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <OverviewGoalStatusDonut
          goals={goals}
          checkIns={checkIns}
          period={PERIODS.q1}
        />
        {sheet?.status === SHEET_STATUS.locked ? (
          <OverviewWeightedScore goals={goals} checkIns={checkIns} period={PERIODS.q1} />
        ) : (
          <div className="flex flex-col justify-center rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-ink-600">Current Weighted Score</p>
            <p className="mt-2 text-3xl font-bold text-ink-400">—</p>
            <p className="mt-2 text-xs text-ink-500">
              Available after your goal sheet is locked and you complete Q1 check-ins.
            </p>
          </div>
        )}
      </div>

      <div className="mt-4">
        <YearTimelineStrip />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <StatCard label="Goals on sheet" value={goals.length} sub="Max 8" />
            <StatCard label="Weightage" value={`${totalWeight}%`} sub="Target 100%" />
            <StatCard
              label="Sheet status"
              value={sheet?.status?.replace('_', ' ') ?? '—'}
              sub="FY26 cycle"
            />
          </>
        )}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ActionCard
          title="My Goal Sheet"
          desc="Create goals, set thrust areas, targets, and weightage. Submit when total is 100%."
          to="/employee/goals"
          cta={
            sheet?.status === SHEET_STATUS.draft || sheet?.status === SHEET_STATUS.returned
              ? 'Edit sheet'
              : 'View sheet'
          }
        />
        <ActionCard
          title="Quarterly Check-in"
          desc={
            sheet?.status === SHEET_STATUS.locked
              ? 'Enter actual achievement and status for each locked goal.'
              : 'Available after your manager approves and locks your goal sheet.'
          }
          to="/employee/check-in"
          cta="Open check-in"
          disabled={sheet?.status !== SHEET_STATUS.locked}
        />
        <ActionCard
          title="My Progress"
          desc="View planned vs actual and progress scores across Q1–Q4."
          to="/employee/progress"
          cta="View progress"
          disabled={sheet?.status !== SHEET_STATUS.locked}
        />
        <ActionCard
          title="Shared Goals"
          desc="Departmental KPIs on your sheet — weightage only editable."
          to="/employee/shared-goals"
          cta="View shared goals"
        />
      </div>
    </div>
  )
}

function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-ink-500">{label}</p>
      <p className="mt-1 text-2xl font-bold capitalize text-ink-950">{value}</p>
      <p className="text-xs text-ink-500">{sub}</p>
    </div>
  )
}

function ActionCard({ title, desc, to, cta, disabled }) {
  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="font-semibold text-ink-900">{title}</h2>
      <p className="mt-2 flex-1 text-sm text-ink-600">{desc}</p>
      {disabled ? (
        <span className="mt-4 inline-block text-sm font-medium text-ink-400">
          {cta} (locked sheet required)
        </span>
      ) : (
        <Link
          to={to}
          className="mt-4 inline-flex w-fit rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          {cta}
        </Link>
      )}
    </div>
  )
}
