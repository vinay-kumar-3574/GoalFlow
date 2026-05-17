import { useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '../../context/AuthContext'
import {
  SHEET_STATUS,
  THRUST_AREAS,
  UOM_DIRECTIONS,
  UOM_LABELS,
  UOM_TYPES,
} from '../../constants/goals'
import { getTeamForManager } from '../../lib/org'
import { pushSharedKpiToTeam } from '../../lib/managerStorage'
import { useManagerTeam } from '../../hooks/useManagerTeam'

export default function SharedKpiPage() {
  const { user } = useAuth()
  const team = getTeamForManager(user?.email)
  const { members, refresh } = useManagerTeam(user?.email, user?.name)

  const [thrustArea, setThrustArea] = useState(THRUST_AREAS[3])
  const [title, setTitle] = useState('Reduce customer complaint TAT')
  const [description, setDescription] = useState(
    'Departmental KPI — company-wide quality initiative',
  )
  const [uomType, setUomType] = useState(UOM_TYPES.numeric)
  const [uomDirection, setUomDirection] = useState(UOM_DIRECTIONS.max)
  const [target, setTarget] = useState('48')
  const [defaultWeight, setDefaultWeight] = useState('15')
  const [weightByEmail, setWeightByEmail] = useState({})
  const [selected, setSelected] = useState(() =>
    team.filter((t) => t.email).map((t) => t.email),
  )
  const [primaryOwner, setPrimaryOwner] = useState(team[0]?.email || '')

  function toggleEmail(email) {
    setSelected((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email],
    )
  }

  function getWeight(email) {
    return weightByEmail[email] ?? defaultWeight
  }

  function handlePush(e) {
    e.preventDefault()
    if (!title.trim()) {
      toast.error('Goal title is required.')
      return
    }
    if (selected.length === 0) {
      toast.error('Select at least one recipient.')
      return
    }
    if (!primaryOwner || !selected.includes(primaryOwner)) {
      toast.error('Primary owner must be a selected recipient.')
      return
    }

    const weightageByEmail = {}
    selected.forEach((email) => {
      weightageByEmail[email] = getWeight(email)
    })

    const results = pushSharedKpiToTeam({
      recipientEmails: selected,
      primaryOwnerEmail: primaryOwner,
      title: title.trim(),
      description: description.trim(),
      target,
      thrustArea,
      uomType,
      uomDirection: uomType === UOM_TYPES.numeric || uomType === UOM_TYPES.percent ? uomDirection : null,
      weightageByEmail,
      managerEmail: user.email,
      managerName: user.name,
    })

    const ok = results.filter((r) => r.ok && !r.skipped).length
    const locked = results.filter((r) => r.error === 'Sheet is locked').length
    refresh()
    if (ok > 0) toast.success(`Pushed shared goal to ${ok} employee(s).`)
    if (locked > 0) toast.message(`${locked} skipped — sheet already locked.`)
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl font-semibold text-ink-950">Push Shared Goals</h1>
      <p className="mt-1 text-sm text-ink-600">
        Creates a master KPI on each sheet. Primary owner&apos;s actuals sync to all linked copies.
      </p>

      <form
        onSubmit={handlePush}
        className="mt-8 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <Field label="Thrust area">
          <select
            value={thrustArea}
            onChange={(e) => setThrustArea(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            {THRUST_AREAS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Goal title">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </Field>

        <Field label="Description">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Unit of measurement">
            <select
              value={uomType}
              onChange={(e) => setUomType(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              {Object.entries(UOM_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </Field>
          {(uomType === UOM_TYPES.numeric || uomType === UOM_TYPES.percent) && (
            <Field label="Direction">
              <select
                value={uomDirection}
                onChange={(e) => setUomDirection(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <option value={UOM_DIRECTIONS.min}>Min (higher is better)</option>
                <option value={UOM_DIRECTIONS.max}>Max (lower is better)</option>
              </select>
            </Field>
          )}
        </div>

        <Field label="Target value (locked on employee sheets)">
          <input
            type={uomType === UOM_TYPES.timeline ? 'date' : 'text'}
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </Field>

        <Field label="Default weightage % (per recipient)">
          <input
            type="number"
            min={10}
            value={defaultWeight}
            onChange={(e) => setDefaultWeight(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </Field>

        <Field label="Recipients">
          <ul className="max-h-48 space-y-2 overflow-y-auto">
            {members.map(({ email, data }) => {
              const profile = team.find((t) => t.email === email)
              const locked = data.sheet.status === SHEET_STATUS.locked
              return (
                <li
                  key={email}
                  className={`rounded-lg border px-3 py-2 ${locked ? 'opacity-50' : ''}`}
                >
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selected.includes(email)}
                      disabled={locked}
                      onChange={() => toggleEmail(email)}
                    />
                    <span className="flex-1 text-sm font-medium">{profile?.name}</span>
                    {selected.includes(email) && !locked && (
                      <input
                        type="number"
                        min={10}
                        value={getWeight(email)}
                        onChange={(e) =>
                          setWeightByEmail((w) => ({ ...w, [email]: e.target.value }))
                        }
                        className="w-14 rounded border border-slate-200 px-1 py-0.5 text-xs"
                        title="Weightage %"
                      />
                    )}
                  </label>
                </li>
              )
            })}
          </ul>
        </Field>

        <Field label="Primary owner (enters master actual)">
          <select
            value={primaryOwner}
            onChange={(e) => setPrimaryOwner(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            {selected.map((email) => {
              const profile = team.find((t) => t.email === email)
              return (
                <option key={email} value={email}>
                  {profile?.name || email}
                </option>
              )
            })}
          </select>
        </Field>

        <button
          type="submit"
          className="w-full rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white hover:bg-violet-700"
        >
          Push shared goal
        </button>
      </form>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ink-500">
        {label}
      </label>
      {children}
    </div>
  )
}
