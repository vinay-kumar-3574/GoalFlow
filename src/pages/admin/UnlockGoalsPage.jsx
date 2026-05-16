import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '../../context/AuthContext'
import { SHEET_STATUS } from '../../constants/goals'
import { useAdminData } from '../../hooks/useAdminData'

export default function UnlockGoalsPage() {
  const { user } = useAuth()
  const { employees, unlockGoal, refresh } = useAdminData()
  const [search, setSearch] = useState('')
  const [reason, setReason] = useState('')
  const [selected, setSelected] = useState(null)
  const [confirm, setConfirm] = useState(null)

  const lockedEmployees = useMemo(() => {
    return employees
      .filter((e) => e.data.sheet.status === SHEET_STATUS.locked && !e.data.sheet.adminUnlocked)
      .filter((e) => {
        if (!search) return true
        const q = search.toLowerCase()
        return (
          e.name.toLowerCase().includes(q) || e.department?.toLowerCase().includes(q)
        )
      })
  }, [employees, search])

  function handleConfirmUnlock() {
    if (!confirm) return
    if (!reason.trim() || reason.trim().length < 10) {
      toast.error('Provide unlock reason (min 10 characters) for audit trail.')
      return
    }
    const result = unlockGoal(confirm.email, confirm.goalId, user, reason)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success('Goal unlocked — sheet returned to Draft for employee edit.')
    setReason('')
    setSelected(null)
    setConfirm(null)
    refresh()
  }

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-2xl font-semibold text-ink-950">Unlock Goals</h1>
      <p className="mt-1 text-sm text-ink-600">
        Exception workflow with mandatory reason. Re-lock happens when manager re-approves.
      </p>

      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by employee name or department…"
        className="mt-6 w-full max-w-md rounded-lg border border-slate-200 px-3 py-2 text-sm"
      />

      <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
        <label className="text-xs font-semibold uppercase text-ink-500">
          Unlock reason (audit) <span className="text-red-600">*</span>
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={2}
          placeholder="Mandatory reason before unlock is confirmed…"
          className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
      </section>

      {lockedEmployees.map((e) => (
        <section key={e.email} className="mt-8">
          <h2 className="font-semibold text-ink-900">
            {e.name} · {e.department}
          </h2>
          <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-xs uppercase text-ink-500">
                  <th className="px-4 py-2">Goal Title</th>
                  <th className="px-4 py-2">Thrust Area</th>
                  <th className="px-4 py-2">Weight</th>
                  <th className="px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {e.data.sheet.goals.map((g) => (
                  <tr
                    key={g.id}
                    className={`border-b ${selected?.goalId === g.id ? 'bg-teal-50' : ''}`}
                  >
                    <td className="px-4 py-3 font-medium">{g.title}</td>
                    <td className="px-4 py-3 text-ink-600">{g.thrustArea}</td>
                    <td className="px-4 py-3">{g.weightage}%</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => {
                          setSelected({ email: e.email, goalId: g.id, title: g.title })
                          setConfirm({
                            email: e.email,
                            goalId: g.id,
                            title: g.title,
                            employeeName: e.name,
                          })
                        }}
                        className="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        Unlock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      {lockedEmployees.length === 0 && (
        <p className="mt-8 text-sm text-ink-500">No locked goal sheets match your search.</p>
      )}

      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="font-semibold text-ink-950">Confirm unlock</h3>
            <p className="mt-3 text-sm text-ink-700">
              This will allow <strong>{confirm.employeeName}</strong> to edit{' '}
              <strong>{confirm.title}</strong>. The goal sheet status returns to Draft. Are you
              sure?
            </p>
            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={handleConfirmUnlock}
                className="flex-1 rounded-xl bg-teal-600 py-2 text-sm font-semibold text-white"
              >
                Yes, unlock
              </button>
              <button
                type="button"
                onClick={() => setConfirm(null)}
                className="flex-1 rounded-xl border py-2 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
