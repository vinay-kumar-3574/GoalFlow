import { getProgressBadge, scoreToneClasses } from '../../lib/progressScore'

export default function ProgressBadge({ goal, actual, completionDate }) {
  const badge = getProgressBadge(goal, actual, completionDate)

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${scoreToneClasses(badge.tone)}`}
    >
      {badge.display}
    </span>
  )
}
