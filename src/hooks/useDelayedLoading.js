import { useEffect, useState } from 'react'

/** Shows loading=true for at least `delayMs` on mount (skeleton UX). */
export function useDelayedLoading(delayMs = 300) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), delayMs)
    return () => clearTimeout(t)
  }, [delayMs])

  return loading
}
