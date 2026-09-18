import { Outlet } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { FloatingWhatsAppButton } from '@/components/layout/FloatingWhatsAppButton'
import { ScrollToHash } from '@/components/layout/ScrollToHash'

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToHash />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <FloatingWhatsAppButton />
    </div>
  )
}
