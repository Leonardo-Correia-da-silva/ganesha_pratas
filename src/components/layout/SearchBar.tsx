import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'

export function SearchBar({ onClose }: { onClose?: () => void }) {
  const [term, setTerm] = useState('')
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const trimmed = term.trim()
    if (!trimmed) return
    navigate(`/produtos?busca=${encodeURIComponent(trimmed)}`)
    onClose?.()
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 border-b border-ink py-2">
      <Search className="size-4 shrink-0 text-neutral-500" aria-hidden />
      <input
        ref={inputRef}
        type="search"
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        placeholder="Pesquisar joias..."
        aria-label="Pesquisar produtos"
        className="w-full bg-transparent text-sm text-ink placeholder:text-neutral-400 focus:outline-none"
      />
      {onClose && (
        <button type="button" onClick={onClose} aria-label="Fechar pesquisa" className="text-neutral-500">
          <X className="size-4" />
        </button>
      )}
    </form>
  )
}
