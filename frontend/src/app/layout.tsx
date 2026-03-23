import './globals.css'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/providers/AuthProvider'
import { ToastProvider } from '@/components/ui/toast'
import AnimatedBackground from '@/components/auth/AnimatedBackground'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Torqvio - Durable Execution Dashboard',
  description: 'Control center for everything async',
  icons: {
    icon: '/favicon-purple.svg',
    shortcut: '/favicon-purple.svg',
    apple: '/favicon-purple.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <AnimatedBackground />
        </div>
        <ToastProvider>
          <AuthProvider>
            <div className="min-h-screen relative z-10">
              {children}
            </div>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  )
}
