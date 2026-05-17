import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../../context/AuthContext'
import { SHEET_STATUS } from '../../constants/goals'
import { decodeEmployeeParam, getEmployeeDisplay, MANAGER_EMAIL } from '../../lib/org'
import { isDirectReport } from '../../lib/managerStorage'
import { useManagerTeam } from '../../hooks/useManagerTeam'
import ManagerGoalReviewTable from '../../components/manager/ManagerGoalReviewTable'
import SheetStatusPill from '../../components/manager/SheetStatusPill'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/Dialog'

export default function ApprovalDetailPage() {
  const { employeeEmail: param } = useParams()
  const employeeEmail = decodeEmployeeParam(param || '')
  const navigate = useNavigate()
  const { user } = useAuth()
  const { getMember, approveSheet, returnSheet, updateGoal } = useManagerTeam(
    user?.email,
    user?.name,
  )

  const data = getMember(employeeEmail)
  const profile = getEmployeeDisplay(employeeEmail)
  const [returnMode, setReturnMode] = useState(false)
  const [returnReason, setReturnReason] = useState('')
  const [validationErrors, setValidationErrors] = useState([])
  const [approveOpen, setApproveOpen] = useState(false)

  if (!isDirectReport(user?.email || MANAGER_EMAIL, employeeEmail)) {
    return (
      <p className="text-ink-600">
        You can only review your direct reports.{' '}
        <Link to="/manager" className="text-violet-700 underline">
          Team dashboard
        </Link>
      </p>
    )
  }

  if (!data) {
    return (
      <p className="text-ink-600">
        Employee not found.{' '}
        <Link to="/manager/approvals" className="text-violet-700 underline">
          Back
        </Link>
      </p>
    )
  }

  const sheet = data.sheet
  const editable = sheet.status === SHEET_STATUS.submitted

  function handleUpdateGoal(goalId, patch) {
    const result = updateGoal(employeeEmail, goalId, patch)
    if (!result.ok) {
      setValidationErrors(result.errors || [result.error])
    } else {
      setValidationErrors([])
    }
  }

  function handleApprove() {
    const result = approveSheet(employeeEmail)
    if (!result.ok) {
      setValidationErrors(result.errors || [result.error])
      toast.error(result.error || 'Approval failed')
      setApproveOpen(false)
      return
    }
    toast.success('Goals approved and locked.')
    setApproveOpen(false)
    navigate('/manager/approvals')
  }

  function handleReturn() {
    const result = returnSheet(employeeEmail, returnReason)
    if (!result.ok) {
      toast.error(result.error || 'Return failed')
      return
    }
    toast.message('Returned for rework with notification sent.')
    navigate('/manager/approvals')
  }

  return (
    <div className="mx-auto max-w-5xl">
      <Link to="/manager/approvals" className="text-sm font-medium text-violet-700 hover:underline">
        ← Pending approvals
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-950">{profile.name}</h1>
          <p className="text-sm text-ink-600">{profile.department}</p>
          <p className="text-xs text-ink-500">{profile.title}</p>
          {profile.reportingLine && (
            <p className="mt-1 text-xs font-medium text-violet-700">{profile.reportingLine}</p>
          )}
        </div>
        <SheetStatusPill status={sheet.status} />
      </div>

      {!editable && (
        <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-ink-600">
          {sheet.status === SHEET_STATUS.locked
            ? 'Goals are locked. Manager cannot edit targets or weightage after approval.'
            : 'Sheet is not awaiting approval.'}
          {sheet.status === SHEET_STATUS.locked && (
            <>
              {' '}
              <Link
                to={`/manager/check-in/${encodeURIComponent(employeeEmail)}`}
                className="font-semibold text-violet-700"
              >
                Open check-in →
              </Link>
            </>
          )}
        </p>
      )}

      {validationErrors.length > 0 && (
        <ul className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {validationErrors.map((e) => (
            <li key={e}>• {e}</li>
          ))}
        </ul>
      )}

      <div className="mt-6">
        <ManagerGoalReviewTable
          goals={sheet.goals}
          editable={editable}
          onUpdateGoal={handleUpdateGoal}
        />
      </div>

      {editable && (
        <>
          {returnMode && (
            <section className="mt-8 rounded-2xl border-2 border-amber-300 bg-amber-50/50 p-5">
              <h2 className="font-semibold text-amber-900">
                Mandatory rework comment <span className="text-red-600">*</span>
              </h2>
              <p className="mt-1 text-xs text-amber-800">
                Employee will receive this reason by notification. Minimum 10 characters.
              </p>
              <textarea
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                rows={4}
                className="mt-3 w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm"
                placeholder="Describe required changes…"
              />
            </section>
          )}

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
            {!returnMode ? (
              <button
                type="button"
                onClick={() => setReturnMode(true)}
                className="rounded-xl border-2 border-amber-300 bg-amber-50 px-6 py-3 text-sm font-semibold text-amber-900"
              >
                Return for Rework
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setReturnMode(false)
                    setReturnReason('')
                  }}
                  className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-medium"
                >
                  Cancel return
                </button>
                <button
                  type="button"
                  onClick={handleReturn}
                  disabled={returnReason.trim().length < 10}
                  className="rounded-xl bg-amber-600 px-6 py-3 text-sm font-semibold text-white disabled:opacity-50"
                >
                  Send return notification
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => setApproveOpen(true)}
              disabled={returnMode}
              className="rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-violet-700 disabled:opacity-50"
            >
              Approve Goals
            </button>
          </div>
        </>
      )}

      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve goal sheet</DialogTitle>
            <DialogDescription>
              Approve all goals for <strong>{profile.name}</strong>? This will lock their goal
              sheet.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setApproveOpen(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApprove}
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Confirm approval
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
