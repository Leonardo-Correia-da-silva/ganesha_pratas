import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export function NotFound() {
  return (
    <div className="container-luxe flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="font-display text-6xl text-gold">404</p>
      <h1 className="mt-4 font-display text-2xl text-ink">Página não encontrada</h1>
      <p className="mt-2 max-w-sm text-sm text-neutral-500">
        A página que você procura não existe ou foi movida.
      </p>
      <Link to="/" className="mt-8">
        <Button>Voltar para a loja</Button>
      </Link>
    </div>
  )
}
