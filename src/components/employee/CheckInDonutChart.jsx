import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { calculateProgressScore } from '../../lib/progressScore'

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16']

export default function CheckInDonutChart({ goals, periodData }) {
  const data = goals
    .map((goal, i) => {
      const entry = periodData?.[goal.id]
      const score = calculateProgressScore(goal, entry?.actual, entry?.completionDate)
      const weight = Number(goal.weightage) || 0
      const contribution = score != null ? (score * weight) / 100 : 0
      return {
        name: goal.title || `Goal ${i + 1}`,
        score: score ?? 0,
        value: contribution > 0 ? contribution : 0.01,
        weight,
        displayScore: score != null ? `${score}%` : '—',
      }
    })
    .filter((d) => d.value > 0)

  if (data.length === 0) {
    return (
      <p className="text-center text-sm text-ink-500">
        Enter actuals above to see the progress breakdown chart.
      </p>
    )
  }

  return (
    <div>
      <h3 className="mb-4 text-center text-lg font-semibold text-ink-900">
        Goal Progress Breakdown
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, _name, props) => [
              `${props.payload.displayScore} (weighted: ${Math.round(value * 10) / 10}%)`,
              props.payload.name,
            ]}
          />
          <Legend
            formatter={(value, entry) => {
              const p = entry.payload
              return `${value} — ${p.displayScore}`
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
