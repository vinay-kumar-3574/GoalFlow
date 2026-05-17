import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/Dialog'

export default function ResetDemoDialog({ open, onOpenChange, onConfirm }) {
  const [text, setText] = useState('')

  function handleClose() {
    setText('')
    onOpenChange(false)
  }

  function handleConfirm() {
    if (text !== 'RESET') return
    onConfirm()
    setText('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset demo data</DialogTitle>
          <DialogDescription>
            This clears all localStorage demo data and re-seeds defaults. Type{' '}
            <strong>RESET</strong> to confirm.
          </DialogDescription>
        </DialogHeader>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type RESET"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono"
          autoComplete="off"
        />
        <DialogFooter>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={text !== 'RESET'}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            Reset all data
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
