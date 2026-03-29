'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, AlertCircle, ArrowLeft, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useToast } from '@/components/ui/toast'

const AnimatedBackground = dynamic(() => import('@/components/auth/AnimatedBackground'), { 
  ssr: false 
})

const resetSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type ResetForm = z.infer<typeof resetSchema>

interface FieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onFocus' | 'onBlur'> {
  label: string
  error?: string
  rightElement?: React.ReactNode
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
}

function Field({ label, error, rightElement, ...props }: FieldProps) {
  const [focused, setFocused] = useState(false)

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
        {label}
      </label>
      <div className="relative group">
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          animate={{
            boxShadow: focused
              ? '0 0 0 2px #6C5CE7, 0 0 24px rgba(108, 92, 231, 0.15)'
              : error
              ? '0 0 0 1.5px #EF4444'
              : '0 0 0 1px rgba(42, 49, 66, 0.6)',
          }}
          transition={{ duration: 0.2 }}
        />
        <input
          {...props}
          onFocus={e => { setFocused(true); props.onFocus?.(e) }}
          onBlur={e => { setFocused(false); props.onBlur?.(e) }}
          className="w-full bg-[#252B3D]/60 text-white placeholder-gray-600 rounded-xl px-3.5 py-3
                     text-sm outline-none transition-all duration-200 pr-11
                     backdrop-blur-sm border border-transparent
                     hover:bg-[#252B3D]/80"
        />
        {rightElement && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500">{rightElement}</div>
        )}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-1.5 text-xs text-red-400"
          >
            <AlertCircle size={11} />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

interface SubmitButtonProps {
  loading: boolean
  success: boolean
  label: string
}

function SubmitButton({ loading, success, label }: SubmitButtonProps) {
  return (
    <motion.button
      type="submit"
      disabled={loading || success}
      whileHover={{ scale: loading || success ? 1 : 1.01 }}
      whileTap={{ scale: loading || success ? 1 : 0.98 }}
      className="relative w-full py-3 rounded-xl font-medium text-sm text-white overflow-hidden
                 disabled:opacity-80 transition-all duration-200"
      style={{
        background: success
          ? 'linear-gradient(135deg, #00C896, #00a87a)'
          : 'linear-gradient(135deg, #6C5CE7, #5041c4)',
        boxShadow: success
          ? '0 4px 20px rgba(0,200,150,0.25)'
          : '0 4px 20px rgba(108,92,231,0.25)',
      }}
    >
      {!loading && !success && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
        />
      )}

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.span
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-2"
          >
            <Loader2 size={16} className="animate-spin" />
            Resetting password…
          </motion.span>
        ) : success ? (
          <motion.span
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={16} />
            Password reset!
          </motion.span>
        ) : (
          <motion.span
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-2"
          >
            {label}
            <ArrowRight size={16} />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const { toast } = useToast()
  const form = useForm<ResetForm>({ resolver: zodResolver(resetSchema) })

  useEffect(() => {
    if (!token) {
      router.push('/login')
    }
  }, [token, router])

  const handleSubmit = form.handleSubmit(async (data) => {
    if (!token) return

    setLoading(true)
    setServerError('')
    
    try {
      const response = await fetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: data.newPassword }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to reset password')
      }

      setSuccess(true)
      toast({
        type: 'success',
        title: 'Password Reset Successful',
        message: 'Your password has been updated. Redirecting to login...',
      })

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setServerError(errorMessage)
    } finally {
      setLoading(false)
    }
  })

  if (!token) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-[#0d0f17] flex items-center justify-center p-4 relative overflow-hidden">
      <AnimatedBackground />
      
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.22 }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Back button */}
        <motion.button
          type="button"
          onClick={() => router.push('/login')}
          className="mb-6 flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
          whileHover={{ x: -2 }}
        >
          <ArrowLeft size={14} />
          Back to login
        </motion.button>

        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/20 
                       flex items-center justify-center mb-4 border border-green-500/20"
          >
            <CheckCircle2 className="w-6 h-6 text-green-400" />
          </motion.div>
          <h1 className="text-2xl font-bold text-white mb-2">Set new password</h1>
          <p className="text-sm text-gray-400">
            Choose a strong password for your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field
            label="New Password"
            type={showPw ? 'text' : 'password'}
            placeholder="Enter your new password"
            error={form.formState.errors.newPassword?.message}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
            {...form.register('newPassword')}
          />

          <Field
            label="Confirm Password"
            type={showConfirmPw ? 'text' : 'password'}
            placeholder="Confirm your new password"
            error={form.formState.errors.confirmPassword?.message}
            rightElement={
              <button
                type="button"
                onClick={() => setShowConfirmPw(v => !v)}
                className="text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
            {...form.register('confirmPassword')}
          />

          <AnimatePresence>
            {serverError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3.5 py-2.5 text-sm text-red-400"
              >
                <AlertCircle size={14} className="shrink-0" />
                {serverError}
              </motion.div>
            )}
          </AnimatePresence>

          <SubmitButton loading={loading} success={success} label="Reset password" />

          {success && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-gray-400 text-center"
            >
              Redirecting to login page...
            </motion.p>
          )}
        </form>
      </motion.div>
    </div>
  )
}
