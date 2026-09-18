import { useRef, useState, type InputHTMLAttributes } from 'react'
import { Loader2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface VideoUrlFieldProps {
  label: string
  value: string
  onValueChange: (url: string) => void
  onUpload: (file: File) => Promise<{ url: string }>
  inputProps: InputHTMLAttributes<HTMLInputElement>
  hint: string
}

export function VideoUrlField({ label, value, onValueChange, onUpload, inputProps, hint }: VideoUrlFieldProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFile(files: FileList | null) {
    const file = files?.[0]
    if (!file) return
    setError(null)
    setUploading(true)
    try {
      const { url } = await onUpload(file)
      onValueChange(url)
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
      <div className="flex items-start gap-4">
        {value && <video src={value} controls className="h-24 w-24 shrink-0 border border-stone object-cover" />}
        <div className="flex-1 space-y-2">
          <Input placeholder="https://... (link externo do vídeo)" {...inputProps} />
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
            {value && (
              <button
                type="button"
                onClick={() => onValueChange('')}
                className="text-xs uppercase tracking-wide text-neutral-500 hover:text-red-600"
              >
                Remover
              </button>
            )}
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
      </div>
    </div>
  )
}
