export function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) {
    return (
      <div className="flex items-center gap-2">
        <button type="button" disabled className="rounded-lg border px-3 py-1 text-sm opacity-40">
          Previous
        </button>
        <span className="rounded-lg bg-teal-600 px-3 py-1 text-sm font-semibold text-white">1</span>
        <button type="button" disabled className="rounded-lg border px-3 py-1 text-sm opacity-40">
          Next
        </button>
      </div>
    )
  }

  const maxVisible = 5
  let start = Math.max(1, page - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages, start + maxVisible - 1)
  start = Math.max(1, end - maxVisible + 1)

  const pages = []
  for (let i = start; i <= end; i++) pages.push(i)

  return (
    <div className="flex flex-wrap items-center gap-1">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="rounded-lg border border-slate-200 px-3 py-1 text-sm disabled:opacity-40"
      >
        ←
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPageChange(p)}
          className={`min-w-[2rem] rounded-lg px-3 py-1 text-sm font-medium ${
            p === page
              ? 'bg-teal-600 text-white'
              : 'border border-slate-200 text-ink-700 hover:bg-slate-50'
          }`}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="rounded-lg border border-slate-200 px-3 py-1 text-sm disabled:opacity-40"
      >
        →
      </button>
    </div>
  )
}
