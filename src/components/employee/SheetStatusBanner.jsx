import { SHEET_STATUS, SHEET_STATUS_LABELS } from '../../constants/goals'

const styles = {
  draft: 'border-slate-200 bg-slate-50 text-ink-800',
  submitted: 'border-amber-200 bg-amber-50 text-amber-900',
  returned: 'border-orange-200 bg-orange-50 text-orange-900',
  locked: 'border-brand-200 bg-brand-50 text-brand-900',
}

export default function SheetStatusBanner({ sheet }) {
  if (!sheet) return null
  const label = SHEET_STATUS_LABELS[sheet.status] || sheet.status

  return (
    <div className={`rounded-xl border px-4 py-3 ${styles[sheet.status] || styles.draft}`}>
      <p className="text-sm font-semibold">{label}</p>
      {sheet.status === SHEET_STATUS.returned && sheet.returnReason && (
        <p className="mt-1 text-sm opacity-90">Manager note: {sheet.returnReason}</p>
      )}
      {sheet.status === SHEET_STATUS.submitted && sheet.submittedAt && (
        <p className="mt-1 text-xs opacity-75">
          Submitted {new Date(sheet.submittedAt).toLocaleString()}
        </p>
      )}
      {sheet.status === SHEET_STATUS.locked && sheet.approvedAt && (
        <p className="mt-1 text-xs opacity-75">
          Approved {new Date(sheet.approvedAt).toLocaleString()} — targets are locked
        </p>
      )}
    </div>
  )
}
