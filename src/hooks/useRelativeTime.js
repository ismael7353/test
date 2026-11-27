import { useEffect, useState } from 'react'
import { formatRelativeTime } from '../lib/format'

export default function useRelativeTime(value) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000)
    return () => window.clearInterval(timer)
  }, [])

  return formatRelativeTime(value, now)
}
