import { useEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

export function ScrollToHash() {
  const location = useLocation()
  const navigationType = useNavigationType()

  useEffect(() => {
    if (!location.hash) return
    const element = document.querySelector(location.hash)
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [location.hash, location.key])

  // New pages open at the top. Back/forward (POP) is left alone so the browser
  // can restore where the visitor was, and query-only changes (filters) don't jump.
  useEffect(() => {
    if (location.hash || navigationType === 'POP') return
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [location.pathname, location.hash, navigationType])

  return null
}
