import { getTimelinePhaseIndex } from '../../lib/cycle'

const PHASES = [
  { id: 0, label: 'Goal Setting', sub: 'May' },
  { id: 1, label: 'Q1', sub: 'Jul' },
  { id: 2, label: 'Q2', sub: 'Oct' },
  { id: 3, label: 'Q3', sub: 'Jan' },
  { id: 4, label: 'Q4', sub: 'Mar' },
]

function CheckSmall() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function YearTimelineStrip() {
  const current = getTimelinePhaseIndex()

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-ink-500">
        FY cycle timeline
      </h2>
      <ol className="flex items-start justify-between gap-1">
        {PHASES.map((phase, i) => {
          const isPast = i < current
          const isCurrent = i === current
          const isFuture = i > current

          return (
            <li key={phase.id} className="flex flex-1 flex-col items-center">
              {i > 0 && (
                <span
                  className={`absolute hidden h-0.5 w-full sm:block ${
                    isPast || isCurrent ? 'bg-emerald-400' : 'bg-slate-200'
                  }`}
                  aria-hidden
                />
              )}
              <div
                className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold ${
                  isCurrent
                    ? 'border-indigo-600 bg-indigo-600 text-white shadow-md'
                    : isPast
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-400'
                }`}
              >
                {isPast ? <CheckSmall /> : i + 1}
              </div>
              <p
                className={`mt-2 text-center text-[10px] font-semibold leading-tight sm:text-xs ${
                  isCurrent ? 'text-indigo-700' : isPast ? 'text-emerald-700' : 'text-slate-400'
                }`}
              >
                {phase.label}
              </p>
              <p className="text-[10px] text-slate-500">{phase.sub}</p>
              {i < PHASES.length - 1 && (
                <span
                  className={`absolute top-4 hidden h-0.5 sm:block ${
                    i < current ? 'bg-emerald-400' : 'bg-slate-200'
                  }`}
                  style={{ left: `${(i + 0.5) * (100 / (PHASES.length - 1))}%` }}
                  aria-hidden
                />
              )}
            </li>
          )
        })}
      </ol>
      <div className="relative mt-2 flex">
        {PHASES.slice(0, -1).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full ${i < current ? 'bg-emerald-400' : i === current ? 'bg-gradient-to-r from-emerald-400 to-slate-200' : 'bg-slate-200'}`}
          />
        ))}
      </div>
    </div>
  )
}
