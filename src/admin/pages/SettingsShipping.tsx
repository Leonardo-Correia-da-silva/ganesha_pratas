import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { PageHeader } from '@/admin/components/PageHeader'
import { ConfirmDialog } from '@/admin/components/ConfirmDialog'
import { ShippingRegionFormModal } from '@/admin/components/ShippingRegionFormModal'
import { AdminApiError } from '@/admin/services/adminApi'
import {
  createShippingRegion,
  deleteShippingRegion,
  getAdminShippingSettings,
  listShippingRegions,
  updateShippingRegion,
  updateShippingSettings,
} from '@/admin/services/settingsAdminService'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { cn } from '@/utils/cn'
import { formatCurrency } from '@/utils/currency'
import { formatZipCode } from '@/utils/cep'
import type { ShippingMode, ShippingRegion, ShippingRegionInput } from '@/types'

export function SettingsShipping() {
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<ShippingMode>('single')
  const [singlePrice, setSinglePrice] = useState('15.00')
  const [savingSettings, setSavingSettings] = useState(false)
  const [regions, setRegions] = useState<ShippingRegion[]>([])
  const [editing, setEditing] = useState<ShippingRegion | 'new' | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ShippingRegion | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getAdminShippingSettings(), listShippingRegions()])
      .then(([settings, regionList]) => {
        if (settings) {
          setMode(settings.mode)
          setSinglePrice(settings.singlePrice.toFixed(2))
        }
        setRegions(regionList)
      })
      .finally(() => setLoading(false))
  }, [])

  async function handleSaveSettings() {
    setSavingSettings(true)
    setMessage(null)
    setError(null)
    try {
      await updateShippingSettings({ mode, singlePrice: Number(singlePrice) || 0 })
      setMessage('Configuração de frete salva com sucesso.')
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : 'Não foi possível salvar.')
    } finally {
      setSavingSettings(false)
    }
  }

  async function handleSaveRegion(input: ShippingRegionInput) {
    setSaving(true)
    setError(null)
    try {
      if (editing === 'new') {
        const created = await createShippingRegion(input)
        setRegions((prev) => [...prev, created])
      } else if (editing) {
        const updated = await updateShippingRegion(editing.id, input)
        setRegions((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
      }
      setEditing(null)
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : 'Não foi possível salvar a região.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteRegion() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteShippingRegion(deleteTarget.id)
      setRegions((prev) => prev.filter((r) => r.id !== deleteTarget.id))
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Frete" />

      <div className="max-w-2xl border border-stone bg-paper p-5">
        <h2 className="mb-4 text-xs uppercase tracking-widest text-neutral-500">Modo de frete</h2>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setMode('single')}
            className={cn(
              'border p-4 text-left transition-colors',
              mode === 'single' ? 'border-ink bg-offwhite' : 'border-stone hover:border-neutral-400',
            )}
          >
            <p className="text-sm font-medium text-ink">Frete único</p>
            <p className="text-xs text-neutral-500">Mesmo valor para qualquer endereço</p>
          </button>
          <button
            type="button"
            onClick={() => setMode('region')}
            className={cn(
              'border p-4 text-left transition-colors',
              mode === 'region' ? 'border-ink bg-offwhite' : 'border-stone hover:border-neutral-400',
            )}
          >
            <p className="text-sm font-medium text-ink">Frete por região</p>
            <p className="text-xs text-neutral-500">Valor definido por faixa de CEP</p>
          </button>
        </div>

        {mode === 'single' && (
          <div className="mt-4 max-w-xs">
            <Input
              label="Valor do frete (R$)"
              type="number"
              step="0.01"
              min="0"
              value={singlePrice}
              onChange={(e) => setSinglePrice(e.target.value)}
            />
          </div>
        )}

        {message && <p className="mt-3 text-sm text-green-700">{message}</p>}
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <Button className="mt-4" onClick={handleSaveSettings} loading={savingSettings}>
          Salvar
        </Button>
      </div>

      {mode === 'region' && (
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg text-ink">Regiões de entrega</h2>
            <Button size="sm" onClick={() => setEditing('new')}>
              <Plus className="size-4" /> Nova região
            </Button>
          </div>

          {regions.length === 0 ? (
            <EmptyState title="Nenhuma região cadastrada." />
          ) : (
            <div className="overflow-x-auto border border-stone bg-paper">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead className="border-b border-stone bg-offwhite text-xs uppercase tracking-wide text-neutral-500">
                  <tr>
                    <th className="px-4 py-3">Região</th>
                    <th className="px-4 py-3">Faixa de CEP</th>
                    <th className="px-4 py-3">Valor</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone">
                  {regions.map((region) => (
                    <tr key={region.id}>
                      <td className="px-4 py-3 text-ink">{region.name}</td>
                      <td className="px-4 py-3 text-neutral-600">
                        {formatZipCode(region.zipCodeStart)} até {formatZipCode(region.zipCodeEnd)}
                      </td>
                      <td className="px-4 py-3 text-neutral-600">{formatCurrency(region.price)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-1 text-xs font-medium ${
                            region.active ? 'bg-green-100 text-green-800' : 'bg-neutral-200 text-neutral-600'
                          }`}
                        >
                          {region.active ? 'Ativa' : 'Inativa'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditing(region)}
                            className="p-1.5 text-neutral-500 hover:text-ink"
                            aria-label={`Editar ${region.name}`}
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(region)}
                            className="p-1.5 text-neutral-500 hover:text-red-600"
                            aria-label={`Excluir ${region.name}`}
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {editing && (
        <ShippingRegionFormModal
          region={editing === 'new' ? null : editing}
          saving={saving}
          onSave={handleSaveRegion}
          onClose={() => setEditing(null)}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Excluir região"
        description={`Tem certeza que deseja excluir "${deleteTarget?.name}"?`}
        confirmLabel="Excluir"
        loading={deleting}
        onConfirm={handleDeleteRegion}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
