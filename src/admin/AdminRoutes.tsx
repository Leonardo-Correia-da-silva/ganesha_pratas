import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminAuthProvider } from '@/admin/context/AdminAuthContext'
import { RequireAuth } from '@/admin/components/RequireAuth'
import { AdminLayout } from '@/admin/layouts/AdminLayout'
import { Login } from '@/admin/pages/Login'
import { Dashboard } from '@/admin/pages/Dashboard'
import { Products } from '@/admin/pages/Products'
import { ProductForm } from '@/admin/pages/ProductForm'
import { Categories } from '@/admin/pages/Categories'
import { Orders } from '@/admin/pages/Orders'
import { OrderDetail } from '@/admin/pages/OrderDetail'
import { Settings } from '@/admin/pages/Settings'
import { SettingsShipping } from '@/admin/pages/SettingsShipping'

export function AdminRoutes() {
  return (
    <AdminAuthProvider>
      <Routes>
        <Route path="login" element={<Login />} />

        <Route element={<RequireAuth />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/:id/edit" element={<ProductForm />} />
            <Route path="categories" element={<Categories />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="settings" element={<Settings />} />
            <Route path="settings/shipping" element={<SettingsShipping />} />
          </Route>
        </Route>
      </Routes>
    </AdminAuthProvider>
  )
}
