import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { SkeletonTableRows } from '../../components/ui/Skeleton'
import { useDelayedLoading } from '../../hooks/useDelayedLoading'
import { ROLES } from '../../lib/auth'
import { useAuth } from '../../context/AuthContext'
import { useAdminData } from '../../hooks/useAdminData'

const emptyForm = {
  email: '',
  name: '',
  role: ROLES.employee,
  department: '',
  managerEmail: '',
  status: 'active',
}

export default function OrgHierarchyPage() {
  const loading = useDelayedLoading(300)
  const { user } = useAuth()
  const { orgEmployees, departments, upsertEmployee, deactivateEmployee, addDepartment, refresh } =
    useAdminData()
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('name')
  const [sortDir, setSortDir] = useState(1)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [newDept, setNewDept] = useState('')
  const [confirmDeactivate, setConfirmDeactivate] = useState(null)

  const managers = orgEmployees.filter((e) => e.role === ROLES.manager && e.status === 'active')

  const rows = useMemo(() => {
    let list = [...orgEmployees]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.department?.toLowerCase().includes(q),
      )
    }
    list.sort((a, b) => {
      const av = (a[sortKey] || '').toString().toLowerCase()
      const bv = (b[sortKey] || '').toString().toLowerCase()
      return av.localeCompare(bv) * sortDir
    })
    return list
  }, [orgEmployees, search, sortKey, sortDir])

  function managerName(email) {
    return orgEmployees.find((e) => e.email === email)?.name || '—'
  }

  function toggleSort(key) {
    if (sortKey === key) setSortDir((d) => -d)
    else {
      setSortKey(key)
      setSortDir(1)
    }
  }

  function openAdd() {
    setForm(emptyForm)
    setModal('add')
  }

  function openEdit(emp) {
    setForm({ ...emp })
    setModal('edit')
  }

  function handleSave(e) {
    e.preventDefault()
    if (!form.email || !form.name) {
      toast.error('Email and name required')
      return
    }
    upsertEmployee(form, user)
    toast.success(modal === 'add' ? 'Employee added' : 'Employee updated')
    setModal(null)
    refresh()
  }

  function handleDeactivate(email) {
    deactivateEmployee(email, user)
    toast.success('Employee deactivated')
    setConfirmDeactivate(null)
    refresh()
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-950">Organization Hierarchy</h1>
          <p className="mt-1 text-sm text-ink-600">Employees, managers, departments, and roles.</p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Add New Employee
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email, department…"
          className="min-w-[200px] flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
        <div className="flex gap-2">
          <input
            value={newDept}
            onChange={(e) => setNewDept(e.target.value)}
            placeholder="New department"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={() => {
              addDepartment(newDept)
              setNewDept('')
              toast.success('Department added')
              refresh()
            }}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium"
          >
            Add dept
          </button>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-4">
            <SkeletonTableRows rows={6} />
          </div>
        ) : (
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b bg-slate-50 text-xs uppercase text-ink-500">
              {[
                ['name', 'Name'],
                ['role', 'Role'],
                ['department', 'Department'],
                ['managerEmail', 'Manager'],
                ['email', 'Email'],
                ['status', 'Status'],
              ].map(([key, label]) => (
                <th key={key} className="cursor-pointer px-4 py-2" onClick={() => toggleSort(key)}>
                  {label} {sortKey === key ? (sortDir > 0 ? '↑' : '↓') : ''}
                </th>
              ))}
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((emp) => (
              <tr key={emp.email} className="border-b border-slate-50">
                <td className="px-4 py-3 font-medium">{emp.name}</td>
                <td className="px-4 py-3 capitalize">{emp.role}</td>
                <td className="px-4 py-3">{emp.department}</td>
                <td className="px-4 py-3">{managerName(emp.managerEmail)}</td>
                <td className="px-4 py-3 text-ink-500">{emp.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      emp.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100'
                    }`}
                  >
                    {emp.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => openEdit(emp)}
                    className="mr-2 text-teal-700 font-medium"
                  >
                    Edit
                  </button>
                  {emp.status === 'active' && emp.role === ROLES.employee && (
                    <button
                      type="button"
                      onClick={() => setConfirmDeactivate(emp.email)}
                      className="text-red-600 font-medium"
                    >
                      Deactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/40 p-4">
          <form
            onSubmit={handleSave}
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2 className="text-lg font-semibold">
              {modal === 'add' ? 'Add Employee' : 'Edit Employee'}
            </h2>
            <div className="mt-4 space-y-3">
              <Field label="Name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} />
              <Field
                label="Email"
                value={form.email}
                disabled={modal === 'edit'}
                onChange={(v) => setForm((f) => ({ ...f, email: v }))}
              />
              <label className="block text-xs text-ink-500">
                Role
                <select
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                  className="mt-0.5 w-full rounded-lg border px-2 py-1.5 text-sm"
                >
                  <option value={ROLES.employee}>Employee</option>
                  <option value={ROLES.manager}>Manager</option>
                  <option value={ROLES.admin}>Admin</option>
                </select>
              </label>
              <label className="block text-xs text-ink-500">
                Department
                <select
                  value={form.department}
                  onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                  className="mt-0.5 w-full rounded-lg border px-2 py-1.5 text-sm"
                >
                  <option value="">—</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs text-ink-500">
                Manager
                <select
                  value={form.managerEmail}
                  onChange={(e) => setForm((f) => ({ ...f, managerEmail: e.target.value }))}
                  className="mt-0.5 w-full rounded-lg border px-2 py-1.5 text-sm"
                >
                  <option value="">—</option>
                  {managers.map((m) => (
                    <option key={m.email} value={m.email}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mt-6 flex gap-2">
              <button type="submit" className="flex-1 rounded-xl bg-teal-600 py-2 text-sm font-semibold text-white">
                Save
              </button>
              <button
                type="button"
                onClick={() => setModal(null)}
                className="flex-1 rounded-xl border py-2 text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {confirmDeactivate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <p className="font-semibold">Deactivate employee?</p>
            <p className="mt-2 text-sm text-ink-600">They will no longer appear in active lists.</p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => handleDeactivate(confirmDeactivate)}
                className="flex-1 rounded-xl bg-red-600 py-2 text-sm font-semibold text-white"
              >
                Deactivate
              </button>
              <button
                type="button"
                onClick={() => setConfirmDeactivate(null)}
                className="flex-1 rounded-xl border py-2 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, value, onChange, disabled }) {
  return (
    <label className="block text-xs text-ink-500">
      {label}
      <input
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="mt-0.5 w-full rounded-lg border px-2 py-1.5 text-sm disabled:bg-slate-50"
      />
    </label>
  )
}
