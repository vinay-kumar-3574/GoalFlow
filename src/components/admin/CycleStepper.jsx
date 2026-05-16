import { getCycleTimelineState } from '../../lib/adminStorage'

export default function CycleStepper() {
  const steps = getCycleTimelineState()

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between gap-1">
        {steps.map((step, i) => (
          <div key={step.key} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              {i > 0 && (
                <div
                  className={`h-0.5 flex-1 ${step.status === 'future' ? 'bg-slate-200' : 'bg-teal-500'}`}
                />
              )}
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  step.status === 'done'
                    ? 'bg-teal-600 text-white'
                    : step.status === 'active'
                      ? 'bg-teal-100 text-teal-800 ring-2 ring-teal-600'
                      : 'bg-slate-100 text-slate-400'
                }`}
              >
                {step.status === 'done' ? '✓' : step.label.replace('Phase 1', 'P1')}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 ${steps[i + 1].status === 'future' ? 'bg-slate-200' : 'bg-teal-500'}`}
                />
              )}
            </div>
            <p
              className={`mt-2 text-center text-[10px] font-semibold sm:text-xs ${
                step.status === 'active' ? 'text-teal-700' : 'text-ink-500'
              }`}
            >
              {step.label}
            </p>
            {step.open && (
              <span className="mt-0.5 text-[9px] font-medium text-emerald-600">Open</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
