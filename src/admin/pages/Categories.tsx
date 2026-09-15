import { useEffect, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '@/admin/components/PageHeader'
import { ConfirmDialog } from '@/admin/components/ConfirmDialog'
import { CategoryFormModal } from '@/admin/components/CategoryFormModal'
import {
  createCategory,
  deleteCategory,
  listAllCategories,
  updateCategory,
} from '@/admin/services/categoryAdminService'
import { AdminApiError } from '@/admin/services/adminApi'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import type { Category, CategoryInput } from '@/types'

export function Categories() {
  const [categories, setCategories] = useState<Category[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<Category | 'new' | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [saving, setSaving] = useState(false)

  async function reload() {
    setLoading(true)
    try {
      setCategories(await listAllCategories())
    } catch {
      setError('Não foi possível carregar as categorias.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    reload()
  }, [])

  async function handleSave(input: CategoryInput) {
    setSaving(true)
    setError(null)
    try {
      if (editing === 'new') {
        const created = await createCategory(input)
        setCategories((prev) => [...(prev ?? []), created])
      } else if (editing) {
        const updated = await updateCategory(editing.id, input)
        setCategories((prev) => prev?.map((c) => (c.id === updated.id ? updated : c)) ?? null)
      }
      setEditing(null)
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : 'Não foi possível salvar a categoria.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteCategory(deleteTarget.id)
      setCategories((prev) => prev?.filter((c) => c.id !== deleteTarget.id) ?? null)
      setDeleteTarget(null)
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : 'Não foi possível excluir a categoria.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Categorias"
        action={
          <Button size="sm" onClick={() => setEditing('new')}>
            <Plus className="size-4" /> Nova categoria
          </Button>
        }
      />

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : !categories || categories.length === 0 ? (
        <EmptyState title="Nenhuma categoria cadastrada." />
      ) : (
        <div className="overflow-x-auto border border-stone bg-paper">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="border-b border-stone bg-offwhite text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone">
              {categories.map((category) => (
                <tr key={category.id}>
                  <td className="px-4 py-3 text-ink">{category.name}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2.5 py-1 text-xs font-medium ${
                        category.active ? 'bg-green-100 text-green-800' : 'bg-neutral-200 text-neutral-600'
                      }`}
                    >
                      {category.active ? 'Ativa' : 'Inativa'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditing(category)}
                        className="p-1.5 text-neutral-500 hover:text-ink"
                        aria-label={`Editar ${category.name}`}
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(category)}
                        className="p-1.5 text-neutral-500 hover:text-red-600"
                        aria-label={`Excluir ${category.name}`}
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

      {editing && (
        <CategoryFormModal
          category={editing === 'new' ? null : editing}
          saving={saving}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Excluir categoria"
        description={`Tem certeza que deseja excluir "${deleteTarget?.name}"?`}
        confirmLabel="Excluir"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
