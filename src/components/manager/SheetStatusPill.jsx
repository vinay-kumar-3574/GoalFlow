import { SHEET_STATUS, SHEET_STATUS_LABELS } from '../../constants/goals'

const STYLES = {
  [SHEET_STATUS.draft]: 'bg-slate-100 text-slate-700',
  [SHEET_STATUS.submitted]: 'bg-amber-100 text-amber-900',
  [SHEET_STATUS.returned]: 'bg-orange-100 text-orange-900',
  [SHEET_STATUS.locked]: 'bg-emerald-100 text-emerald-800',
}

export default function SheetStatusPill({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STYLES[status] || STYLES.draft}`}
    >
      {SHEET_STATUS_LABELS[status] || status}
    </span>
  )
}
