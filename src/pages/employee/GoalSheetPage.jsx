import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../../context/AuthContext'
import { MAX_GOALS, SHEET_STATUS } from '../../constants/goals'
import {
  canEditGoals,
  canSubmitSheet,
  sumWeightage,
  validateGoalSheet,
} from '../../lib/goalValidation'
import { addSharedGoalDemo } from '../../lib/goalStorage'
import { useEmployeeData } from '../../hooks/useEmployeeData'
import GoalEditor from '../../components/employee/GoalEditor'
import SheetStatusBanner from '../../components/employee/SheetStatusBanner'
import WeightageBar from '../../components/employee/WeightageBar'

export default function GoalSheetPage() {
  const { user } = useAuth()
  const {
    sheet,
    addGoal,
    updateGoal,
    removeGoal,
    submitSheet,
    saveDraft,
    simulateApprove,
    simulateReturn,
    resetToDraftDemo,
    resetToLockedDemo,
    setSheetStatusDemo,
    reload,
  } = useEmployeeData(user?.email)

  const [errors, setErrors] = useState([])

  if (!sheet) return null

  const editable = canEditGoals(sheet.status, sheet)
  const isDraftLike =
    sheet.status === SHEET_STATUS.draft || sheet.status === SHEET_STATUS.returned
  const totalWeight = sumWeightage(sheet.goals)
  const preview = validateGoalSheet(sheet.goals)
  const readyToSubmit = canSubmitSheet(sheet.goals)
  const atMaxGoals = sheet.goals.length >= MAX_GOALS

  function handleSaveDraft() {
    saveDraft()
    toast.success('Draft saved successfully.')
  }

  function handleSubmit() {
    setErrors([])
    const result = submitSheet()
    if (!result.ok) {
      setErrors(result.errors)
      toast.error('Fix validation errors before submitting.')
      return
    }
    toast.success('Goal sheet submitted for manager approval.')
  }

  function handleAddSharedDemo() {
    addSharedGoalDemo(user.email)
    reload()
    toast.message('Sample shared KPI added.')
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-950">My Goal Sheet</h1>
          <p className="mt-1 text-sm text-ink-600">
            FY goal sheet — thrust areas, UoM, targets, and weightage (100% total, min 10% each).
          </p>
        </div>
        {sheet.status === SHEET_STATUS.locked && (
          <Link
            to="/employee/check-in"
            className="inline-flex rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Go to check-in →
          </Link>
        )}
      </div>

      <SheetStatusBanner sheet={sheet} />

      {sheet.adminUnlocked && (
        <div className="mt-4 rounded-xl border border-orange-300 bg-orange-50 px-4 py-3 text-sm text-orange-900">
          <p className="font-semibold">Admin exception unlock active</p>
          <p className="mt-1 text-xs">{sheet.unlockReason}</p>
          <p className="mt-1 text-xs text-orange-800">
            You may edit goals until HR re-locks your sheet. Changes are audit-logged.
          </p>
        </div>
      )}

      <div className="mt-4">
        <WeightageBar goals={sheet.goals} total={totalWeight} />
      </div>

      {!preview.valid && editable && sheet.goals.length > 0 && (
        <ul className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {preview.errors.slice(0, 5).map((e) => (
            <li key={e}>• {e}</li>
          ))}
          {preview.errors.length > 5 && <li>• …and {preview.errors.length - 5} more</li>}
        </ul>
      )}

      {errors.length > 0 && (
        <ul className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {errors.map((e) => (
            <li key={e}>• {e}</li>
          ))}
        </ul>
      )}

      <div className="mt-6 space-y-4">
        {sheet.goals.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-ink-500">
            No goals yet. Add your first goal below.
          </p>
        )}
        {sheet.goals.map((goal, i) => (
          <GoalEditor
            key={goal.id}
            goal={goal}
            index={i}
            sheetStatus={sheet.status}
            sheet={sheet}
            onChange={updateGoal}
            onRemove={removeGoal}
          />
        ))}
      </div>

      {editable && (
        <div className="mt-4">
          <span className="group relative inline-block">
            <button
              type="button"
              onClick={addGoal}
              disabled={atMaxGoals}
              className="w-full rounded-xl border-2 border-dashed border-brand-300 bg-brand-50/50 py-3 text-sm font-semibold text-brand-800 transition-colors hover:bg-brand-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-400 sm:w-auto sm:px-6"
            >
              Add Another Goal +
            </button>
            {atMaxGoals && (
              <span className="pointer-events-none absolute -top-9 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded bg-ink-900 px-2 py-1 text-xs text-white group-hover:block">
                Maximum 8 goals reached
              </span>
            )}
          </span>
        </div>
      )}

      {isDraftLike && (
        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="rounded-xl border-2 border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-ink-800 hover:bg-slate-50"
          >
            Save as Draft
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!readyToSubmit}
            title={
              !readyToSubmit
                ? 'Requires 100% weightage and all required fields on every goal'
                : undefined
            }
            className="rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Submit for Approval
          </button>
        </div>
      )}

      {sheet.status === SHEET_STATUS.submitted && (
        <p className="mt-6 text-sm text-ink-600">
          Your sheet is with your manager. You cannot edit until they approve or return it.
        </p>
      )}

      {sheet.status === SHEET_STATUS.locked && (
        <p className="mt-6 text-sm text-ink-600">
          Goals are locked. Use{' '}
          <Link to="/employee/check-in" className="font-medium text-brand-700 hover:underline">
            Quarterly Check-in
          </Link>{' '}
          to record actuals.
        </p>
      )}

      <details className="mt-10 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
        <summary className="cursor-pointer text-sm font-medium text-ink-700">
          Demo tools (simulate manager actions)
        </summary>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              resetToLockedDemo()
              toast.success('Reset to Priya locked demo (5 goals).')
            }}
            className="rounded-lg border border-indigo-300 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-900"
          >
            Reset locked demo (5 goals)
          </button>
          <button
            type="button"
            onClick={() => {
              resetToDraftDemo()
              toast.message('Sheet reset to draft (demo).')
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium"
          >
            Reset to draft (demo)
          </button>
          <button
            type="button"
            onClick={() => {
              setSheetStatusDemo(SHEET_STATUS.submitted)
              toast.message('Sheet set to submitted (demo).')
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium"
          >
            Set submitted (stepper)
          </button>
          <button
            type="button"
            onClick={() => {
              setSheetStatusDemo(SHEET_STATUS.returned)
              toast.message('Sheet set to returned (demo).')
            }}
            className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-900"
          >
            Set returned (stepper)
          </button>
          {sheet.status === SHEET_STATUS.submitted && (
            <>
              <button
                type="button"
                onClick={() => {
                  simulateApprove()
                  toast.success('Sheet approved and locked (demo).')
                }}
                className="rounded-lg bg-ink-800 px-3 py-1.5 text-xs font-medium text-white"
              >
                Simulate approval
              </button>
              <button
                type="button"
                onClick={() => {
                  simulateReturn()
                  toast.message('Sheet returned for rework (demo).')
                }}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium"
              >
                Simulate return
              </button>
            </>
          )}
          {editable && !sheet.goals.some((g) => g.isShared) && (
            <button
              type="button"
              onClick={handleAddSharedDemo}
              className="rounded-lg border border-cyan-300 bg-cyan-50 px-3 py-1.5 text-xs font-medium text-cyan-900"
            >
              Add sample shared KPI
            </button>
          )}
          {isDraftLike && sheet.goals.length > 0 && (
            <button
              type="button"
              onClick={() => {
                simulateApprove()
                toast.success('Skipped to locked (demo).')
              }}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium"
            >
              Skip to locked (demo)
            </button>
          )}
        </div>
      </details>
    </div>
  )
}
