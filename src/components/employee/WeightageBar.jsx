import { MAX_GOALS, TARGET_WEIGHT_TOTAL } from '../../constants/goals'

const SEGMENT_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6']

export default function WeightageBar({ goals, total }) {
  const ok = total === TARGET_WEIGHT_TOTAL
  const segments = goals.map((g, i) => ({
    id: g.id,
    title: g.title?.trim() || `Goal ${i + 1}`,
    weight: Number(g.weightage) || 0,
    color: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
  }))

  return (
    <div
      className={`rounded-xl border-2 bg-white p-4 transition-colors ${
        ok ? 'border-emerald-500' : 'border-red-500'
      }`}
    >
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-ink-800">Total weightage</span>
        <span className={ok ? 'font-bold text-emerald-700' : 'font-bold text-red-600'}>
          {total}% / {TARGET_WEIGHT_TOTAL}%
        </span>
      </div>

      {/* Segmented stacked bar — each segment width = goal weightage % of bar */}
      <div
        className="flex h-4 w-full overflow-hidden rounded-full bg-slate-200"
        role="img"
        aria-label={`Weightage distribution: ${total} percent of 100`}
      >
        {segments.map((seg) =>
          seg.weight > 0 ? (
            <div
              key={seg.id}
              title={`${seg.title} — ${seg.weight}%`}
              className="h-full shrink-0 grow-0 transition-opacity hover:opacity-85"
              style={{
                width: `${seg.weight}%`,
                flexBasis: `${seg.weight}%`,
                backgroundColor: seg.color,
              }}
            />
          ) : null,
        )}
      </div>

      <p className="mt-2 text-xs text-ink-500">
        {total} / {TARGET_WEIGHT_TOTAL}% used · {goals.length} of {MAX_GOALS} goals · min 10% each
      </p>

      <ul className="mt-3 flex flex-wrap gap-2">
        {segments.map((seg) => (
          <li
            key={seg.id}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-100 bg-slate-50 px-2 py-0.5 text-[10px] text-ink-600"
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: seg.color }}
            />
            <span className="max-w-[140px] truncate font-medium">{seg.title}</span>
            <span>{seg.weight}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
