import { useEffect } from 'react'

export function Sheet({ open, onOpenChange, children }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onOpenChange?.(false)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onOpenChange])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100]">
      <button
        type="button"
        className="absolute inset-0 bg-ink-950/40 transition-opacity"
        aria-label="Close panel"
        onClick={() => onOpenChange?.(false)}
      />
      {children}
    </div>
  )
}

export function SheetContent({ side = 'right', className = '', children }) {
  const sideClass =
    side === 'right'
      ? 'right-0 top-0 h-full w-full max-w-md border-l animate-in slide-in-from-right'
      : 'left-0 top-0 h-full w-full max-w-md border-r'

  return (
    <div
      className={`fixed z-[101] flex flex-col bg-white shadow-xl ${sideClass} ${className}`}
      role="dialog"
      aria-modal="true"
    >
      {children}
    </div>
  )
}

export function SheetHeader({ children, className = '' }) {
  return (
    <div className={`flex items-center justify-between border-b border-slate-200 px-5 py-4 ${className}`}>
      {children}
    </div>
  )
}

export function SheetTitle({ children }) {
  return <h2 className="text-lg font-semibold text-ink-950">{children}</h2>
}

export function SheetBody({ children, className = '' }) {
  return <div className={`flex-1 overflow-y-auto px-5 py-4 ${className}`}>{children}</div>
}
