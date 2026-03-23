import ModernSidebar from '@/components/layout/modern-sidebar'
import Header from '@/components/layout/header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-transparent" style={{ height: '100vh' }}>
      <ModernSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-shrink-0">
          <Header />
        </div>
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
