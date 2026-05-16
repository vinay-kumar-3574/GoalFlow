import { useState } from 'react'
import { toast } from 'sonner'
import {
  getEscalationLog,
  getEscalationRules,
  markEscalationResolved,
  saveEscalationRules,
  simulateEscalationCheck,
} from '../../lib/adminEscalations'
import { addAdminNotification } from '../../lib/adminNotifications'

export default function EscalationsPage() {
  const [rules, setRules] = useState(() => getEscalationRules())
  const [log, setLog] = useState(() => getEscalationLog())
  const [simResult, setSimResult] = useState(null)

  function updateRule(key, field, value) {
    setRules((r) => ({
      ...r,
      [key]: { ...r[key], [field]: value },
    }))
  }

  function handleSaveRules() {
    saveEscalationRules(rules)
    toast.success('Escalation rules saved.')
  }

  function handleSimulate() {
    const result = simulateEscalationCheck()
    setLog(getEscalationLog())
    setSimResult(result)
    if (result.triggered > 0) {
      addAdminNotification({
        type: 'escalation',
        title: 'Escalation check complete',
        body: `${result.triggered} escalation(s) triggered`,
      })
    }
    toast.success(`${result.triggered} escalation(s) triggered`)
  }

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-950">Escalation Module</h1>
        <p className="mt-1 text-sm text-ink-600">Rules, chain diagram, simulate, and resolution log.</p>
      </div>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="font-semibold">Rules configuration</h2>
        <ul className="mt-4 space-y-4">
          {['rule1', 'rule2', 'rule3'].map((key, i) => (
            <li key={key} className="rounded-xl border border-slate-100 p-4">
              <p className="text-sm font-medium text-ink-800">
                Rule {i + 1}: {rules[key]?.label}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={rules[key]?.enabled}
                    onChange={(e) => updateRule(key, 'enabled', e.target.checked)}
                  />
                  Enabled
                </label>
                <label className="flex items-center gap-2 text-sm">
                  N days
                  <input
                    type="number"
                    min={1}
                    value={rules[key]?.days}
                    onChange={(e) => updateRule(key, 'days', Number(e.target.value))}
                    className="w-16 rounded border px-2 py-1"
                  />
                </label>
              </div>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={handleSaveRules}
          className="mt-4 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Save rules
        </button>
      </section>

      <section className="rounded-2xl border border-red-100 bg-red-50/50 p-6">
        <h2 className="font-semibold text-red-900">Escalation chain</h2>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm">
          <ChainNode label="Employee" active />
          <Arrow days={rules.chain?.employeeToManager || 3} />
          <ChainNode label="Manager" />
          <Arrow days={rules.chain?.managerToHr || 7} />
          <ChainNode label="Skip-level / HR" highlight />
          <Arrow days={rules.chain?.hrFinal || 14} />
          <ChainNode label="HR final" />
        </div>
        <p className="mt-3 text-center text-xs text-red-800">
          Hover nodes in live system shows notified parties · triggered nodes highlighted on breach
        </p>
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <button
          type="button"
          onClick={handleSimulate}
          className="rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white"
        >
          Simulate Escalation Check
        </button>
        {simResult && (
          <p className="mt-3 text-sm font-medium text-ink-800">
            {simResult.triggered} escalation(s) triggered in this run
          </p>
        )}
      </section>

      <section className="rounded-2xl border bg-white shadow-sm overflow-x-auto">
        <h2 className="border-b px-4 py-3 font-semibold">Escalation log</h2>
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead>
            <tr className="border-b bg-slate-50 text-xs uppercase text-ink-500">
              <th className="px-4 py-2">Employee</th>
              <th className="px-4 py-2">Rule</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Notified</th>
              <th className="px-4 py-2">Resolved</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {log.map((e) => (
              <tr key={e.id} className="border-b border-slate-50">
                <td className="px-4 py-3 font-medium">{e.employeeName}</td>
                <td className="px-4 py-3">{e.rule}</td>
                <td className="px-4 py-3 text-xs">
                  {new Date(e.triggerDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-xs text-ink-600">{e.notified}</td>
                <td className="px-4 py-3">{e.resolved ? 'Y' : 'N'}</td>
                <td className="px-4 py-3">
                  {!e.resolved && (
                    <button
                      type="button"
                      onClick={() => {
                        markEscalationResolved(e.id)
                        setLog(getEscalationLog())
                        toast.success('Marked resolved')
                      }}
                      className="text-teal-700 text-xs font-semibold"
                    >
                      Mark resolved
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {log.length === 0 && (
          <p className="p-6 text-center text-sm text-ink-500">No escalations yet. Run simulate check.</p>
        )}
      </section>
    </div>
  )
}

function ChainNode({ label, active, highlight }) {
  return (
    <div
      title={`Notified: ${label}`}
      className={`rounded-lg px-4 py-2 font-semibold ${
        highlight
          ? 'bg-red-600 text-white'
          : active
            ? 'bg-red-200 text-red-900 ring-2 ring-red-500'
            : 'bg-white border border-red-200 text-red-800'
      }`}
    >
      {label}
    </div>
  )
}

function Arrow({ days }) {
  return (
    <span className="text-xs font-medium text-red-700">
      Day {days} →
    </span>
  )
}
