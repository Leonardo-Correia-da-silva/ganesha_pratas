import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function ScrollToHash() {
  const location = useLocation()

  useEffect(() => {
    if (!location.hash) return
    const element = document.querySelector(location.hash)
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [location.hash, location.key])

  return null
}
