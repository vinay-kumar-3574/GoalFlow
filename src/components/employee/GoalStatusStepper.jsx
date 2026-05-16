import { SHEET_STATUS } from '../../constants/goals'

const STEPS = [
  { key: 'created', label: 'Created' },
  { key: 'submitted', label: 'Submitted' },
  { key: 'review', label: 'Under Review' },
  { key: 'approved', label: 'Approved' },
  { key: 'locked', label: 'Locked' },
]

function CheckIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function GoalStatusStepper({ sheetStatus, returnReason }) {
  function stepState(index) {
    if (sheetStatus === SHEET_STATUS.draft) {
      if (index === 0) return 'active'
      return 'pending'
    }

    if (sheetStatus === SHEET_STATUS.submitted) {
      if (index <= 1) return 'done'
      if (index === 2) return 'active'
      return 'pending'
    }

    if (sheetStatus === SHEET_STATUS.returned) {
      if (index <= 1) return 'done'
      if (index === 3) return 'returned'
      return 'pending'
    }

    if (sheetStatus === SHEET_STATUS.locked) {
      if (index <= 3) return 'done'
      if (index === 4) return 'active'
      return 'pending'
    }

    return 'pending'
  }

  return (
    <div className="mt-4 border-t border-slate-100 pt-4">
      <ol className="flex items-start justify-between gap-1">
        {STEPS.map((step, i) => {
          const state = stepState(i)
          const label =
            sheetStatus === SHEET_STATUS.returned && i === 3 ? 'Returned' : step.label

          return (
            <li key={step.key} className="flex flex-1 flex-col items-center text-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold ${
                  state === 'done'
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : state === 'active'
                      ? 'border-indigo-600 bg-indigo-600 text-white'
                      : state === 'returned'
                        ? 'border-amber-500 bg-amber-100 text-amber-900'
                        : 'border-slate-200 bg-white text-slate-400'
                }`}
                title={
                  state === 'returned' && returnReason
                    ? `Manager rework: ${returnReason}`
                    : undefined
                }
              >
                {state === 'done' ? <CheckIcon /> : state === 'active' ? '●' : i + 1}
              </div>
              <span
                className={`mt-1.5 max-w-[4.5rem] text-[10px] leading-tight sm:max-w-none sm:text-xs ${
                  state === 'returned'
                    ? 'font-semibold text-amber-800'
                    : state === 'active'
                      ? 'font-semibold text-indigo-700'
                      : state === 'done'
                        ? 'text-emerald-700'
                        : 'text-slate-400'
                }`}
              >
                {label}
              </span>
            </li>
          )
        })}
      </ol>
      {sheetStatus === SHEET_STATUS.returned && returnReason && (
        <p className="mt-2 text-center text-xs text-amber-800">{returnReason}</p>
      )}
    </div>
  )
}
