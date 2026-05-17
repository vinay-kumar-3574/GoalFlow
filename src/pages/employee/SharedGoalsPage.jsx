import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../../context/AuthContext'
import { UOM_LABELS } from '../../constants/goals'
import { useEmployeeData } from '../../hooks/useEmployeeData'
import { sumWeightage, validateGoalSheet } from '../../lib/goalValidation'
import SheetStatusBanner from '../../components/employee/SheetStatusBanner'
import EmptyState from '../../components/shared/EmptyState'

export default function SharedGoalsPage() {
  const { user } = useAuth()
  const { sheet, updateGoal, reload } = useEmployeeData(user?.email)
  const [drafts, setDrafts] = useState({})

  if (!sheet) return null

  const shared = sheet.goals.filter((g) => g.isShared)

  function getWeight(goal) {
    return drafts[goal.id] ?? goal.weightage ?? ''
  }

  function setWeight(goalId, value) {
    setDrafts((d) => ({ ...d, [goalId]: value }))
  }

  function handleSave(goal) {
    const weight = Number(getWeight(goal))
    if (!weight || weight < 10) {
      toast.error('Weightage must be at least 10%.')
      return
    }
    const nextGoals = sheet.goals.map((g) =>
      g.id === goal.id ? { ...g, weightage: weight } : g,
    )
    const validation = validateGoalSheet(nextGoals)
    if (!validation.valid) {
      toast.error(validation.errors[0] || 'Invalid weightage total.')
      return
    }
    updateGoal(goal.id, { weightage: weight })
    reload()
    toast.success('Weightage saved.')
    setDrafts((d) => {
      const next = { ...d }
      delete next[goal.id]
      return next
    })
  }

  const total = sumWeightage(
    sheet.goals.map((g) =>
      g.isShared ? { ...g, weightage: Number(getWeight(g)) || g.weightage } : g,
    ),
  )

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-semibold text-ink-950">Shared Goals</h1>
      <p className="mt-1 text-sm text-ink-600">
        Departmental KPIs pushed by your manager. Title and target are read-only; adjust
        weightage here.
      </p>

      <div className="mt-4">
        <SheetStatusBanner sheet={sheet} />
      </div>

      {shared.length > 0 && (
        <p className="mt-2 text-xs text-ink-500">Sheet total weightage: {total}%</p>
      )}

      {shared.length === 0 ? (
        <EmptyState
          icon="target"
          className="mt-8"
          title="No shared goals yet"
          description="When your manager pushes a departmental KPI, it will appear here for weightage only."
        >
          <Link
            to="/employee/goals"
            className="inline-block text-sm font-semibold text-brand-700 hover:underline"
          >
            Go to My Goal Sheet →
          </Link>
        </EmptyState>
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
                  <dt className="text-ink-500">UoM</dt>
                  <dd className="font-medium">{UOM_LABELS[goal.uomType]}</dd>
                </div>
              </dl>
              <div className="mt-4 flex flex-wrap items-end gap-3">
                <label className="text-xs font-semibold text-ink-600">
                  Your weightage %
                  <input
                    type="number"
                    min={10}
                    max={100}
                    value={getWeight(goal)}
                    onChange={(e) => setWeight(goal.id, e.target.value)}
                    className="mt-1 block w-24 rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => handleSave(goal)}
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
                >
                  Save weightage
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
