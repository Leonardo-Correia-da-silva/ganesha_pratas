import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '@/admin/components/PageHeader'
import { ConfirmDialog } from '@/admin/components/ConfirmDialog'
import { deleteProduct, listAllProducts, updateProduct } from '@/admin/services/productAdminService'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { getProductMainImage } from '@/services/productService'
import { formatCurrency } from '@/utils/currency'
import type { Product } from '@/types'

export function Products() {
  const [products, setProducts] = useState<Product[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function reload() {
    setLoading(true)
    try {
      setProducts(await listAllProducts())
    } catch {
      setError('Não foi possível carregar os produtos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    reload()
  }, [])

  async function handleToggleActive(product: Product) {
    const updated = await updateProduct(product.id, { ...stripMeta(product), active: !product.active })
    setProducts((prev) => prev?.map((p) => (p.id === product.id ? updated : p)) ?? null)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteProduct(deleteTarget.id)
      setProducts((prev) => prev?.filter((p) => p.id !== deleteTarget.id) ?? null)
      setDeleteTarget(null)
    } catch {
      setError('Não foi possível excluir o produto.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Produtos"
        action={
          <Link to="/admin/products/new">
            <Button size="sm">
              <Plus className="size-4" /> Novo produto
            </Button>
          </Link>
        }
      />

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : !products || products.length === 0 ? (
        <EmptyState title="Nenhum produto cadastrado." />
      ) : (
        <div className="overflow-x-auto border border-stone bg-paper">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-stone bg-offwhite text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-3">Produto</th>
                <th className="px-4 py-3">Preço</th>
                <th className="px-4 py-3">Estoque</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="flex items-center gap-3 px-4 py-3">
                    <div className="size-10 shrink-0 overflow-hidden bg-offwhite">
                      {getProductMainImage(product) && (
                        <img src={getProductMainImage(product)!} alt="" className="size-full object-cover" />
                      )}
                    </div>
                    <span className="text-ink">{product.name}</span>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{formatCurrency(product.promotionalPrice ?? product.price)}</td>
                  <td className="px-4 py-3 text-neutral-600">{product.stock}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleActive(product)}
                      className={`px-2.5 py-1 text-xs font-medium ${
                        product.active ? 'bg-green-100 text-green-800' : 'bg-neutral-200 text-neutral-600'
                      }`}
                    >
                      {product.active ? 'Ativo' : 'Inativo'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/admin/products/${product.id}/edit`}
                        className="p-1.5 text-neutral-500 hover:text-ink"
                        aria-label={`Editar ${product.name}`}
                      >
                        <Pencil className="size-4" />
                      </Link>
                      <button
                        onClick={() => setDeleteTarget(product)}
                        className="p-1.5 text-neutral-500 hover:text-red-600"
                        aria-label={`Excluir ${product.name}`}
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

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Excluir produto"
        description={`Tem certeza que deseja excluir "${deleteTarget?.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

function stripMeta(product: Product) {
  const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = product
  return rest
}
