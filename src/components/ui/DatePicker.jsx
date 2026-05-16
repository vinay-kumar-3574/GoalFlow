import { useEffect, useRef, useState } from 'react'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function toYmd(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function parseYmd(s) {
  if (!s) return null
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export default function DatePicker({ value, onChange, disabled, label, id }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const selected = parseYmd(value)
  const [view, setView] = useState(() => selected || new Date())

  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const year = view.getFullYear()
  const month = view.getMonth()
  const first = new Date(year, month, 1)
  const startPad = first.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < startPad; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const display = value
    ? selected?.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Pick a date'

  return (
    <div ref={ref} className="relative">
      {label && (
        <label htmlFor={id} className="mb-1 block text-xs font-medium text-ink-600">
          {label}
        </label>
      )}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm text-ink-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:bg-slate-50 disabled:text-ink-500"
      >
        <span className={value ? '' : 'text-ink-400'}>{display}</span>
        <svg className="h-4 w-4 text-ink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute left-0 z-50 mt-1 w-[280px] rounded-xl border border-slate-200 bg-white p-3 shadow-xl"
          role="dialog"
        >
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              className="rounded p-1 hover:bg-slate-100"
              onClick={() => setView(new Date(year, month - 1, 1))}
            >
              ‹
            </button>
            <span className="text-sm font-semibold text-ink-900">
              {MONTHS[month]} {year}
            </span>
            <button
              type="button"
              className="rounded p-1 hover:bg-slate-100"
              onClick={() => setView(new Date(year, month + 1, 1))}
            >
              ›
            </button>
          </div>
          <div className="grid grid-cols-7 gap-0.5 text-center text-xs text-ink-500">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <span key={d} className="py-1 font-medium">
                {d}
              </span>
            ))}
            {cells.map((day, i) =>
              day == null ? (
                <span key={`e-${i}`} />
              ) : (
                <button
                  key={day}
                  type="button"
                  onClick={() => {
                    const next = toYmd(new Date(year, month, day))
                    onChange(next)
                    setOpen(false)
                  }}
                  className={`rounded-lg py-1.5 text-sm ${
                    value === toYmd(new Date(year, month, day))
                      ? 'bg-indigo-600 font-semibold text-white'
                      : 'text-ink-800 hover:bg-slate-100'
                  }`}
                >
                  {day}
                </button>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  )
}
