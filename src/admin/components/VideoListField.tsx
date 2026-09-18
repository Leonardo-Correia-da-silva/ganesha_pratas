import { useRef, useState } from 'react'
import { ArrowDown, ArrowUp, Loader2, Trash2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface VideoListFieldProps {
  label: string
  value: string[]
  onChange: (urls: string[]) => void
  onUpload: (file: File) => Promise<{ url: string }>
  hint: string
}

export function VideoListField({ label, value, onChange, onUpload, hint }: VideoListFieldProps) {
  const [urlInput, setUrlInput] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function addUrl(url: string) {
    const trimmed = url.trim()
    if (!trimmed) return
    onChange([...value, trimmed])
  }

  function handleAddUrl() {
    addUrl(urlInput)
    setUrlInput('')
  }

  function handleRemove(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  function handleMove(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= value.length) return
    const next = [...value]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  async function handleFile(files: FileList | null) {
    const file = files?.[0]
    if (!file) return
    setError(null)
    setUploading(true)
    try {
      const { url } = await onUpload(file)
      addUrl(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível enviar o vídeo.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs uppercase tracking-wide text-neutral-600">{label}</label>

      {value.length > 0 && (
        <ul className="space-y-2">
          {value.map((url, index) => (
            <li key={url} className="flex items-center gap-3 border border-stone p-2">
              <video src={url} muted className="h-14 w-14 shrink-0 border border-stone object-cover" />
              <span className="flex-1 truncate text-xs text-neutral-500">
                {index + 1}. {url}
              </span>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleMove(index, -1)}
                  disabled={index === 0}
                  className="p-1 text-neutral-500 hover:text-ink disabled:opacity-30"
                  aria-label="Mover para cima"
                >
                  <ArrowUp className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(index, 1)}
                  disabled={index === value.length - 1}
                  className="p-1 text-neutral-500 hover:text-ink disabled:opacity-30"
                  aria-label="Mover para baixo"
                >
                  <ArrowDown className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="p-1 text-neutral-500 hover:text-red-600"
                  aria-label="Remover vídeo"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-3">
        <Input
          placeholder="https://... (cole a URL de um vídeo e clique em Adicionar)"
          value={urlInput}
          onChange={(event) => setUrlInput(event.target.value)}
        />
        <Button type="button" variant="outline" size="sm" onClick={handleAddUrl} disabled={!urlInput.trim()}>
          Adicionar
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          loading={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {!uploading && <Upload className="size-3.5" />}
          Enviar vídeo
        </Button>
        {uploading && <Loader2 className="size-4 animate-spin text-neutral-400" />}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        className="hidden"
        onChange={(event) => handleFile(event.target.files)}
        disabled={uploading}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <p className="text-xs text-neutral-500">{hint}</p>
    </div>
  )
}
