import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { CartProvider } from '@/contexts/CartContext'
import { PublicLayout } from '@/layouts/PublicLayout'
import { Home } from '@/pages/Home'
import { Catalog } from '@/pages/Catalog'
import { CategoryPage } from '@/pages/CategoryPage'
import { ProductPage } from '@/pages/ProductPage'
import { Cart } from '@/pages/Cart'
import { Checkout } from '@/pages/Checkout'
import { OrderConfirmation } from '@/pages/OrderConfirmation'
import { NotFound } from '@/pages/NotFound'
import { Spinner } from '@/components/ui/Spinner'

const AdminRoutes = lazy(() => import('@/admin/AdminRoutes').then((m) => ({ default: m.AdminRoutes })))

function AdminFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-offwhite">
      <Spinner />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          <Route
            path="/admin/*"
            element={
              <Suspense fallback={<AdminFallback />}>
                <AdminRoutes />
              </Suspense>
            }
          />

          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/produtos" element={<Catalog />} />
            <Route path="/categoria/:slug" element={<CategoryPage />} />
            <Route path="/produto/:slug" element={<ProductPage />} />
            <Route path="/carrinho" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/pedido/:id" element={<OrderConfirmation />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </CartProvider>
    </BrowserRouter>
  )
}
