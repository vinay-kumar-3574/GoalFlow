import {
  THRUST_AREAS,
  UOM_DIRECTIONS,
  UOM_LABELS,
  UOM_TYPES,
} from '../../constants/goals'
import { canEditGoals } from '../../lib/goalValidation'
import DatePicker from '../ui/DatePicker'
import GoalStatusStepper from './GoalStatusStepper'

const inputClass =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:bg-slate-50 disabled:text-ink-500'

export default function GoalEditor({
  goal,
  index,
  sheetStatus,
  sheet,
  onChange,
  onRemove,
}) {
  const editable = canEditGoals(sheetStatus, sheet)
  const locked = !editable
  const ro = goal.readOnly || {}

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-ink-900">
            Goal {index + 1}
            {goal.isShared && (
              <span className="ml-2 rounded-full bg-cyan-100 px-2 py-0.5 text-xs font-medium text-cyan-800">
                Shared KPI
              </span>
            )}
          </h3>
          {goal.isShared && (
            <p className="mt-0.5 text-xs text-ink-500">
              Title & target are read-only; adjust weightage only
            </p>
          )}
        </div>
        {editable && !goal.isShared && (
          <button
            type="button"
            onClick={() => onRemove(goal.id)}
            className="text-sm font-medium text-red-600 hover:text-red-700"
          >
            Remove
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-ink-600">Thrust area</label>
          <select
            value={goal.thrustArea}
            disabled={locked}
            onChange={(e) => onChange(goal.id, { thrustArea: e.target.value })}
            className={inputClass}
          >
            <option value="">Select thrust area</option>
            {THRUST_AREAS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-ink-600">Goal title</label>
          <input
            type="text"
            value={goal.title}
            disabled={locked || ro.title}
            onChange={(e) => onChange(goal.id, { title: e.target.value })}
            className={inputClass}
            placeholder="e.g. Increase regional revenue"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-ink-600">Description</label>
          <textarea
            rows={2}
            value={goal.description}
            disabled={locked || ro.description}
            onChange={(e) => onChange(goal.id, { description: e.target.value })}
            className={inputClass}
            placeholder="What you will achieve and how success is measured"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-ink-600">Unit of measurement</label>
          <select
            value={goal.uomType}
            disabled={locked || goal.isShared}
            onChange={(e) => {
              const uomType = e.target.value
              onChange(goal.id, {
                uomType,
                uomDirection:
                  uomType === UOM_TYPES.zero || uomType === UOM_TYPES.timeline
                    ? null
                    : goal.uomDirection || UOM_DIRECTIONS.min,
                target: uomType === UOM_TYPES.zero ? '0' : '',
                deadline: uomType === UOM_TYPES.timeline ? goal.deadline : '',
              })
            }}
            className={inputClass}
          >
            {Object.entries(UOM_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>

        {(goal.uomType === UOM_TYPES.numeric || goal.uomType === UOM_TYPES.percent) && (
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-600">Direction</label>
            <select
              value={goal.uomDirection || UOM_DIRECTIONS.min}
              disabled={locked || goal.isShared}
              onChange={(e) => onChange(goal.id, { uomDirection: e.target.value })}
              className={inputClass}
            >
              <option value={UOM_DIRECTIONS.min}>Higher is better (Min)</option>
              <option value={UOM_DIRECTIONS.max}>Lower is better (Max)</option>
            </select>
          </div>
        )}

        {goal.uomType === UOM_TYPES.timeline ? (
          <div className="sm:col-span-2">
            <DatePicker
              id={`deadline-${goal.id}`}
              label="Target Completion Date"
              value={goal.deadline || ''}
              disabled={locked || ro.target}
              onChange={(date) =>
                onChange(goal.id, { deadline: date, target: date })
              }
            />
          </div>
        ) : goal.uomType === UOM_TYPES.zero ? (
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-600">Target</label>
            <input type="text" value="0" disabled className={inputClass} />
            <p className="mt-1 text-xs text-ink-500">Goal succeeds if achievement = 0</p>
          </div>
        ) : (
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-600">
              Target Value{goal.uomType === UOM_TYPES.percent ? ' (%)' : ''}
            </label>
            <input
              type="number"
              value={goal.target}
              disabled={locked || ro.target}
              onChange={(e) => onChange(goal.id, { target: e.target.value })}
              className={inputClass}
              placeholder="Planned target"
            />
          </div>
        )}

        <div>
          <label className="mb-1 block text-xs font-medium text-ink-600">Weightage (%)</label>
          <input
            type="number"
            min={10}
            max={100}
            value={goal.weightage}
            disabled={locked}
            onChange={(e) => onChange(goal.id, { weightage: e.target.value })}
            className={inputClass}
          />
        </div>
      </div>

      <GoalStatusStepper sheetStatus={sheetStatus} returnReason={sheet?.returnReason} />
    </article>
  )
}
