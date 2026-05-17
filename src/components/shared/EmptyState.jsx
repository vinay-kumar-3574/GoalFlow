import { Inbox, Target } from 'lucide-react'

const ICONS = {
  inbox: Inbox,
  target: Target,
}

export default function EmptyState({
  icon = 'inbox',
  title = 'No items found',
  description,
  children,
  className = '',
}) {
  const Icon = ICONS[icon] || Inbox

  return (
    <div
      className={`rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center ${className}`}
    >
      <Icon className="mx-auto h-10 w-10 text-slate-300" strokeWidth={1.5} aria-hidden />
      <h2 className="mt-4 font-semibold text-ink-900">{title}</h2>
      {description && <p className="mt-2 text-sm text-ink-500">{description}</p>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  )
}
