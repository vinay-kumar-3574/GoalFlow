import { useState } from 'react'
import { toast } from 'sonner'
import CycleStepper from '../../components/admin/CycleStepper'
import { useAdminData } from '../../hooks/useAdminData'
import { getCycleTimelineState } from '../../lib/adminStorage'

const WINDOW_KEYS = [
  { key: 'phase1', label: 'Phase 1 Goal Setting' },
  { key: 'q1', label: 'Q1 Check-in (July)' },
  { key: 'q2', label: 'Q2 Check-in (October)' },
  { key: 'q3', label: 'Q3 Check-in (January)' },
  { key: 'q4', label: 'Q4 / Annual (March–April)' },
]

export default function CycleSettingsPage() {
  const { cycle, saveCycle, toggleWindow, refresh } = useAdminData()
  const [form, setForm] = useState({ ...cycle })
  const [warn, setWarn] = useState('')

  function handleToggle(key, open) {
    const r = toggleWindow(key, open)
    if (!r.ok) {
      setWarn(r.error)
      toast.error(r.error)
      return
    }
    setWarn('')
    setForm((f) => ({
      ...f,
      windowOpen: { ...f.windowOpen, [key]: open },
    }))
    refresh()
    toast.success(`${key} window ${open ? 'opened' : 'closed'}`)
  }

  function handleSave(e) {
    e.preventDefault()
    const openCount = Object.values(form.windowOpen || {}).filter(Boolean).length
    if (openCount > 1 && !form.demoMode) {
      setWarn('Only one window can be open at a time (or enable demo mode).')
      toast.error(warn)
      return
    }
    const r = saveCycle(form)
    if (!r.ok) {
      toast.error(r.error)
      return
    }
    toast.success('Cycle configuration saved.')
  }

  const timeline = getCycleTimelineState()

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-semibold text-ink-950">Cycle Configuration</h1>
      <p className="mt-1 text-sm text-ink-600">
        FY windows, manual open/close toggles, and cycle timeline.
      </p>

      <CycleStepper />

      <div className="mt-4 flex flex-wrap gap-2">
        {timeline.map((s) => (
          <span
            key={s.key}
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              s.status === 'active'
                ? 'bg-teal-100 text-teal-800'
                : s.status === 'done'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-100 text-slate-500'
            }`}
          >
            {s.label}: {s.status}
          </span>
        ))}
      </div>

      {warn && (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {warn}
        </p>
      )}

      <form onSubmit={handleSave} className="mt-8 space-y-6 rounded-2xl border bg-white p-6 shadow-sm">
        <div>
          <label className="text-xs font-semibold uppercase text-ink-500">Cycle year</label>
          <input
            type="number"
            value={form.year}
            onChange={(e) => setForm((f) => ({ ...f, year: Number(e.target.value) }))}
            className="mt-1 w-32 rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase text-ink-500">
            Phase 1 open date (default 1 May)
          </label>
          <input
            type="date"
            value={form.phase1OpenDate || '2026-05-01'}
            onChange={(e) => setForm((f) => ({ ...f, phase1OpenDate: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.demoMode}
            onChange={(e) => setForm((f) => ({ ...f, demoMode: e.target.checked }))}
            className="rounded border-slate-300"
          />
          Demo mode — allow multiple windows open
        </label>

        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-ink-800">Window toggles</legend>
          {WINDOW_KEYS.map(({ key, label }) => (
            <label
              key={key}
              className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3"
            >
              <span className="text-sm font-medium">{label}</span>
              <input
                type="checkbox"
                checked={Boolean(form.windowOpen?.[key])}
                onChange={(e) => handleToggle(key, e.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
            </label>
          ))}
        </fieldset>

        <button
          type="submit"
          className="w-full rounded-xl bg-teal-600 py-3 text-sm font-semibold text-white hover:bg-teal-700"
        >
          Save Cycle Configuration
        </button>
      </form>
    </div>
  )
}
