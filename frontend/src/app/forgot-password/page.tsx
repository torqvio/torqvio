'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { useToast } from '@/components/ui/toast'

const AnimatedBackground = dynamic(() => import('@/components/auth/AnimatedBackground'), { 
  ssr: false 
})
const ForgotPasswordForm = dynamic(() => import('@/components/auth/ForgotPasswordForm'), {
  ssr: false
})

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState('')
  const { toast } = useToast()

  const handleSubmit = async (data: { email: string }) => {
    setLoading(true)
    setServerError('')
    
    try {
      const response = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send reset email')
      }

      setSuccess(true)
      toast({
        type: 'success',
        title: 'Reset Email Sent',
        message: 'Check your inbox for the password reset link.',
      })
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setServerError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-[#0d0f17] flex items-center justify-center p-4 relative overflow-hidden">
      <AnimatedBackground />
      
      <div className="relative z-10 w-full max-w-md">
        <ForgotPasswordForm
          onSubmit={handleSubmit}
          loading={loading}
          success={success}
          serverError={serverError}
          onBack={handleBack}
        />
      </div>
    </div>
  )
}
