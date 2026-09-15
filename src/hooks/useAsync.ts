import { useEffect, useRef, useState } from 'react'

interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

/** Runs an async loader on mount and whenever a dependency changes, tracking loading/error state. */
export function useAsync<T>(loader: () => Promise<T>, deps: unknown[]): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ data: null, loading: true, error: null })
  const requestId = useRef(0)

  useEffect(() => {
    const currentRequest = ++requestId.current
    setState((prev) => ({ ...prev, loading: true, error: null }))

    loader()
      .then((data) => {
        if (requestId.current === currentRequest) {
          setState({ data, loading: false, error: null })
        }
      })
      .catch((error: unknown) => {
        if (requestId.current === currentRequest) {
          const message = error instanceof Error ? error.message : 'Ocorreu um erro inesperado.'
          setState({ data: null, loading: false, error: message })
        }
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return state
}
