import { useEffect, useRef, useState } from 'react'

export default function InlineEditableCell({
  value,
  editable,
  type = 'text',
  onSave,
  onTab,
  className = '',
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value ?? '')
  const inputRef = useRef(null)

  useEffect(() => {
    if (!editing) setDraft(value ?? '')
  }, [value, editing])

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  if (!editable) {
    return <span className={className}>{value ?? '—'}</span>
  }

  function commit() {
    setEditing(false)
    if (String(draft) !== String(value ?? '')) onSave?.(draft)
  }

  function cancel() {
    setDraft(value ?? '')
    setEditing(false)
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className={`rounded border border-transparent px-1 py-0.5 text-left hover:border-violet-300 hover:bg-violet-50 ${className}`}
        title="Click to edit"
      >
        {value ?? '—'}
      </button>
    )
  }

  return (
    <input
      ref={inputRef}
      type={type}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          commit()
        }
        if (e.key === 'Escape') {
          e.preventDefault()
          cancel()
        }
        if (e.key === 'Tab') {
          e.preventDefault()
          commit()
          onTab?.()
        }
      }}
      onBlur={commit}
      className={`w-full min-w-[4rem] rounded border border-violet-400 bg-white px-2 py-1 text-sm ring-2 ring-violet-500/20 ${className}`}
    />
  )
}
