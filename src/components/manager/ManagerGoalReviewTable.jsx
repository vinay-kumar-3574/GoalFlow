import { useRef } from 'react'
import {
  UOM_DIRECTIONS,
  UOM_LABELS,
  UOM_TYPES,
} from '../../constants/goals'
import { sumWeightage } from '../../lib/goalValidation'
import WeightageBar from '../employee/WeightageBar'
import InlineEditableCell from './InlineEditableCell'

const DIRECTION_LABELS = {
  [UOM_DIRECTIONS.min]: 'Min (higher better)',
  [UOM_DIRECTIONS.max]: 'Max (lower better)',
}

export default function ManagerGoalReviewTable({ goals, editable, onUpdateGoal }) {
  const total = sumWeightage(goals)
  const cellRefs = useRef([])

  function focusCell(index) {
    const next = cellRefs.current[index]
    if (next) next.click()
  }

  function saveField(goalId, field, val) {
    onUpdateGoal?.(goalId, { [field]: val })
  }

  let editableIndex = 0

  return (
    <div className="space-y-4">
      <WeightageBar goals={goals} total={total} />

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-ink-500">
              <th className="px-3 py-2">Thrust Area</th>
              <th className="px-3 py-2">Goal Title</th>
              <th className="px-3 py-2">UoM</th>
              <th className="px-3 py-2">Direction</th>
              <th className="px-3 py-2">Target</th>
              <th className="px-3 py-2">Weightage %</th>
            </tr>
          </thead>
          <tbody>
            {goals.map((goal) => {
              const canEditTarget = editable && !goal.readOnly?.target
              const canEditWeight = editable && !goal.isShared
              const targetIdx = canEditTarget ? editableIndex++ : -1
              const weightIdx = canEditWeight ? editableIndex++ : -1

              return (
                <tr key={goal.id} className="border-b border-slate-50 align-top">
                  <td className="px-3 py-3 text-ink-700">{goal.thrustArea}</td>
                  <td className="px-3 py-3">
                    <p className="font-medium text-ink-900">{goal.title}</p>
                    <p className="mt-1 text-xs text-ink-500 line-clamp-2">{goal.description}</p>
                  </td>
                  <td className="px-3 py-3 text-ink-600">{UOM_LABELS[goal.uomType]}</td>
                  <td className="px-3 py-3 text-xs text-ink-500">
                    {goal.uomDirection
                      ? DIRECTION_LABELS[goal.uomDirection]
                      : goal.uomType === UOM_TYPES.zero
                        ? '—'
                        : '—'}
                  </td>
                  <td className="px-3 py-3">
                    {canEditTarget ? (
                      <span ref={(el) => { cellRefs.current[targetIdx] = el }}>
                        <InlineEditableCell
                          value={
                            goal.uomType === UOM_TYPES.timeline
                              ? goal.deadline || goal.target
                              : goal.target
                          }
                          editable
                          type={goal.uomType === UOM_TYPES.timeline ? 'date' : 'text'}
                          onSave={(v) => {
                            if (goal.uomType === UOM_TYPES.timeline) {
                              saveField(goal.id, 'deadline', v)
                              saveField(goal.id, 'target', v)
                            } else {
                              saveField(goal.id, 'target', v)
                            }
                          }}
                          onTab={() => weightIdx >= 0 && focusCell(weightIdx)}
                        />
                      </span>
                    ) : (
                      <span className="font-medium">
                        {goal.uomType === UOM_TYPES.timeline
                          ? goal.deadline || goal.target
                          : goal.target}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    {canEditWeight ? (
                      <span ref={(el) => { cellRefs.current[weightIdx] = el }}>
                        <InlineEditableCell
                          value={goal.weightage}
                          editable
                          type="number"
                          onSave={(v) => saveField(goal.id, 'weightage', v)}
                          onTab={() => focusCell(targetIdx + 1)}
                        />
                      </span>
                    ) : (
                      <span className="font-semibold">{goal.weightage}%</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {editable && (
        <p className="text-xs text-ink-500">
          Click a cell to edit · Enter to save · Tab for next · Esc to cancel
        </p>
      )}
    </div>
  )
}
