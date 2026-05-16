import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { UOM_LABELS } from '../../constants/goals'
import { useEmployeeData } from '../../hooks/useEmployeeData'
import SheetStatusBanner from '../../components/employee/SheetStatusBanner'

export default function SharedGoalsPage() {
  const { user } = useAuth()
  const { sheet } = useEmployeeData(user?.email)

  if (!sheet) return null

  const shared = sheet.goals.filter((g) => g.isShared)

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-semibold text-ink-950">Shared Goals</h1>
      <p className="mt-1 text-sm text-ink-600">
        Departmental KPIs pushed by your manager or HR. Title and target are read-only; you may
        adjust weightage only.
      </p>

      <div className="mt-4">
        <SheetStatusBanner sheet={sheet} />
      </div>

      {shared.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-ink-600">No shared goals on your sheet yet.</p>
          <p className="mt-2 text-sm text-ink-500">
            When HR assigns a departmental KPI, it will appear here and on your goal sheet.
          </p>
          <Link
            to="/employee/goals"
            className="mt-4 inline-block text-sm font-semibold text-brand-700 hover:underline"
          >
            Go to My Goal Sheet →
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {shared.map((goal) => (
            <li
              key={goal.id}
              className="rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50/80 to-white p-5 shadow-sm"
            >
              <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-xs font-semibold text-cyan-800">
                Shared KPI
              </span>
              <h2 className="mt-2 text-lg font-semibold text-ink-900">{goal.title}</h2>
              <p className="mt-1 text-sm text-ink-600">{goal.description}</p>
              <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-ink-500">Thrust area</dt>
                  <dd className="font-medium">{goal.thrustArea}</dd>
                </div>
                <div>
                  <dt className="text-ink-500">Target (locked)</dt>
                  <dd className="font-medium">
                    {goal.uomType === 'timeline' ? goal.deadline : goal.target}
                  </dd>
                </div>
                <div>
                  <dt className="text-ink-500">Your weightage</dt>
                  <dd className="font-bold text-brand-700">{goal.weightage}%</dd>
                </div>
              </dl>
              <p className="mt-3 text-xs text-ink-500">
                UoM: {UOM_LABELS[goal.uomType]} · Actuals sync from the primary owner
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
