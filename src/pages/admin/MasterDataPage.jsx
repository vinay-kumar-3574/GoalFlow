import { useState } from 'react'
import { toast } from 'sonner'
import { useAdminData } from '../../hooks/useAdminData'

export default function MasterDataPage() {
  const { thrustAreas, saveThrustAreas: persistAreas } = useAdminData()
  const [areas, setAreas] = useState([...thrustAreas])
  const [newArea, setNewArea] = useState('')

  function handleAdd(e) {
    e.preventDefault()
    const trimmed = newArea.trim()
    if (!trimmed) return
    if (areas.includes(trimmed)) {
      toast.error('Thrust area already exists.')
      return
    }
    setAreas([...areas, trimmed])
    setNewArea('')
  }

  function handleRemove(area) {
    setAreas(areas.filter((a) => a !== area))
  }

  function handleSave() {
    persistAreas(areas)
    toast.success('Thrust areas saved.')
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="font-display text-2xl font-semibold text-ink-950">Master Data</h1>
      <p className="mt-1 text-sm text-ink-600">
        Thrust areas available on employee goal sheets. UoM types are fixed per BRD (Numeric, %,
        Timeline, Zero-based).
      </p>

      <section className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase text-ink-500">Thrust areas</h2>
        <ul className="mt-4 space-y-2">
          {areas.map((area) => (
            <li
              key={area}
              className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
            >
              <span className="text-sm font-medium">{area}</span>
              <button
                type="button"
                onClick={() => handleRemove(area)}
                className="text-xs font-medium text-red-600 hover:underline"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>

        <form onSubmit={handleAdd} className="mt-4 flex gap-2">
          <input
            value={newArea}
            onChange={(e) => setNewArea(e.target.value)}
            placeholder="New thrust area"
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-lg border border-teal-300 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-900"
          >
            Add
          </button>
        </form>

        <button
          type="button"
          onClick={handleSave}
          className="mt-6 w-full rounded-xl bg-teal-600 py-3 text-sm font-semibold text-white"
        >
          Save thrust areas
        </button>
      </section>

      <section className="mt-8 rounded-2xl border border-dashed border-slate-300 p-5 text-sm text-ink-600">
        <h2 className="font-semibold text-ink-800">Units of measurement (read-only)</h2>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>Numeric — Min (higher better) or Max (lower better)</li>
          <li>Percentage (%)</li>
          <li>Timeline (date deadline)</li>
          <li>Zero-based (zero = success)</li>
        </ul>
      </section>
    </div>
  )
}
