import { useState } from 'react'
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { PERIODS } from '../../constants/goals'
import { useAdminData } from '../../hooks/useAdminData'
import {
  getCompletionHeatmap,
  getManagerEffectiveness,
  getQoQTrend,
  getStatusBreakdownByQuarter,
  getThrustAreaDistribution,
  getUomDistribution,
  heatmapColor,
} from '../../lib/adminAnalytics'

const COLORS = ['#0d9488', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
const STACK_COLORS = { notStarted: '#94a3b8', onTrack: '#6366f1', completed: '#10b981' }

export default function AnalyticsPage() {
  const { period } = useAdminData()
  const [view, setView] = useState('department')
  const { chartData, departments } = getQoQTrend()
  const thrust = getThrustAreaDistribution()
  const uom = getUomDistribution()
  const statusQ = getStatusBreakdownByQuarter()
  const heatmap = getCompletionHeatmap()
  const managers = getManagerEffectiveness(period)

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-950">Analytics</h1>
        <p className="mt-1 text-sm text-ink-600">QoQ trends, distributions, heatmap, manager effectiveness.</p>
      </div>

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">QoQ achievement trend</h2>
          <select
            value={view}
            onChange={(e) => setView(e.target.value)}
            className="rounded-lg border px-2 py-1 text-sm"
          >
            <option value="department">By department</option>
          </select>
        </div>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis unit="%" domain={[0, 100]} />
              <Tooltip />
              <Legend />
              {departments.slice(0, 4).map((d, i) => (
                <Line key={d} type="monotone" dataKey={d} stroke={COLORS[i % COLORS.length]} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="font-semibold">Goal distribution by thrust area</h2>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={thrust} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} label>
                  {thrust.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, n, p) => [`${v} (${p.payload.percent}%)`, n]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="font-semibold">UoM type distribution</h2>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={uom}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#0d9488" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="font-semibold">Status breakdown per quarter</h2>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusQ}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="notStarted" stackId="a" fill={STACK_COLORS.notStarted} name="Not Started" />
              <Bar dataKey="onTrack" stackId="a" fill={STACK_COLORS.onTrack} name="On Track" />
              <Bar dataKey="completed" stackId="a" fill={STACK_COLORS.completed} name="Completed" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-5 shadow-sm overflow-x-auto">
        <h2 className="font-semibold">Completion heatmap</h2>
        <table className="mt-4 w-full min-w-[400px] text-xs">
          <thead>
            <tr>
              <th className="px-2 py-1 text-left">Employee</th>
              {['q1', 'q2', 'q3', 'q4'].map((q) => (
                <th key={q} className="px-2 py-1 text-center">
                  {q.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {heatmap.map((row) => (
              <tr key={row.email}>
                <td className="px-2 py-1 font-medium">{row.name}</td>
                {[PERIODS.q1, PERIODS.q2, PERIODS.q3, PERIODS.q4].map((p) => {
                  const pct = row.quarters[p]
                  const { bg, text } = heatmapColor(pct)
                  return (
                    <td key={p} className="px-1 py-1">
                      <div
                        className="rounded px-2 py-2 text-center font-semibold"
                        style={{ backgroundColor: bg, color: text }}
                      >
                        {pct == null ? '—' : `${pct}%`}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-3 flex items-center gap-2 text-xs text-ink-500">
          <span>0%</span>
          <div
            className="h-3 flex-1 rounded"
            style={{
              background: 'linear-gradient(to right, hsl(142 76% 95%), hsl(142 76% 30%))',
            }}
          />
          <span>100%</span>
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="font-semibold">Manager effectiveness</h2>
        <table className="mt-4 w-full text-left text-sm">
          <thead>
            <tr className="border-b text-xs uppercase text-ink-500">
              <th className="px-3 py-2">Manager</th>
              <th className="px-3 py-2">Team</th>
              <th className="px-3 py-2">Done</th>
              <th className="px-3 py-2">Rate %</th>
              <th className="px-3 py-2">Avg score %</th>
            </tr>
          </thead>
          <tbody>
            {managers.map((m) => (
              <tr key={m.managerEmail} className="border-b border-slate-50">
                <td className="px-3 py-2 font-medium">{m.managerName}</td>
                <td className="px-3 py-2">{m.teamSize}</td>
                <td className="px-3 py-2">{m.checkInsDone}</td>
                <td className="px-3 py-2">
                  <span
                    className={`font-semibold ${
                      m.checkInRate >= 80
                        ? 'text-emerald-700'
                        : m.checkInRate >= 50
                          ? 'text-amber-700'
                          : 'text-red-600'
                    }`}
                  >
                    {m.checkInRate}%
                  </span>
                </td>
                <td className="px-3 py-2">{m.avgTeamScore}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
