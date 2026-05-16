import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  dismissBanner,
  getCheckInDeadline,
  isBannerDismissed,
  isCheckInWindowActive,
} from '../../lib/cycle'
import { PERIODS, SHEET_STATUS } from '../../constants/goals'

export default function CheckInBanner({ sheetStatus }) {
  const window = isCheckInWindowActive(true)
  const period = window?.period || PERIODS.q1
  const [hidden, setHidden] = useState(() => isBannerDismissed(period))

  if (sheetStatus !== SHEET_STATUS.locked || hidden) {
    return null
  }

  const meta = getCheckInDeadline(period)

  function handleDismiss() {
    dismissBanner(period)
    setHidden(true)
  }

  return (
    <div className="sticky top-0 z-30 -mx-4 mb-6 border-b border-indigo-200 bg-gradient-to-r from-indigo-50 to-brand-50 px-4 py-3 shadow-md md:-mx-8 md:px-8">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-indigo-900">
            {meta?.label || 'Q1 Check-in'} is open — Deadline:{' '}
            <strong>{meta?.deadline || '31 July 2026'}</strong>. Complete now →
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/employee/check-in"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Go to Check-in
          </Link>
          <button
            type="button"
            onClick={handleDismiss}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-indigo-800 hover:bg-indigo-100"
            aria-label="Dismiss banner"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  )
}
