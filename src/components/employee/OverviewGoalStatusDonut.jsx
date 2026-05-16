import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { CHECKIN_STATUS, CHECKIN_STATUS_LABELS } from '../../constants/goals'

const STATUS_COLORS = {
  [CHECKIN_STATUS.notStarted]: '#94a3b8',
  [CHECKIN_STATUS.onTrack]: '#f59e0b',
  [CHECKIN_STATUS.completed]: '#10b981',
}

export default function OverviewGoalStatusDonut({ goals, checkIns, period = 'q1' }) {
  const periodData = checkIns?.[period] || {}
  const counts = {
    [CHECKIN_STATUS.notStarted]: 0,
    [CHECKIN_STATUS.onTrack]: 0,
    [CHECKIN_STATUS.completed]: 0,
  }

  goals.forEach((g) => {
    const status = periodData[g.id]?.status || CHECKIN_STATUS.notStarted
    counts[status] = (counts[status] || 0) + 1
  })

  const data = [
    CHECKIN_STATUS.notStarted,
    CHECKIN_STATUS.onTrack,
    CHECKIN_STATUS.completed,
  ]
    .map((key) => ({
      name: CHECKIN_STATUS_LABELS[key],
      value: counts[key],
      key,
    }))
    .filter((d) => d.value > 0)

  const total = goals.length

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-500">
        Goal status (Q1)
      </h2>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data.length ? data : [{ name: 'No data', value: 1, key: 'empty' }]}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {(data.length ? data : [{ key: 'empty' }]).map((entry) => (
              <Cell
                key={entry.key}
                fill={STATUS_COLORS[entry.key] || '#e2e8f0'}
              />
            ))}
          </Pie>
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-ink-900 text-2xl font-bold"
          >
            {total}
          </text>
          <text
            x="50%"
            y="58%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-ink-500 text-xs"
          >
            goals
          </text>
        </PieChart>
      </ResponsiveContainer>
      <ul className="mt-2 flex flex-wrap justify-center gap-4 text-xs text-ink-600">
        {Object.entries(CHECKIN_STATUS_LABELS).map(([key, label]) => (
          <li key={key} className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: STATUS_COLORS[key] }}
            />
            {label} ({counts[key]})
          </li>
        ))}
      </ul>
    </div>
  )
}
