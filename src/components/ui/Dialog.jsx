import { useEffect } from 'react'

export function Dialog({ open, onOpenChange, children }) {
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-ink-950/50"
        aria-label="Close dialog"
        onClick={() => onOpenChange?.(false)}
      />
      <div role="dialog" aria-modal="true" className="relative z-10 w-full max-w-md">
        {children}
      </div>
    </div>
  )
}

export function DialogContent({ className = '', children }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-xl ${className}`}>
      {children}
    </div>
  )
}

export function DialogHeader({ children }) {
  return <div className="mb-4">{children}</div>
}

export function DialogTitle({ children }) {
  return <h2 className="text-lg font-semibold text-ink-950">{children}</h2>
}

export function DialogDescription({ children }) {
  return <p className="mt-2 text-sm text-ink-600">{children}</p>
}

export function DialogFooter({ children }) {
  return <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">{children}</div>
}
