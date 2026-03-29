'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, ArrowLeft, ArrowRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

const forgotSchema = z.object({
  email: z.string().email('Enter a valid email'),
})

type ForgotForm = z.infer<typeof forgotSchema>

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
      {/* Subtle shimmer sweep */}
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
            Sending reset link…
          </motion.span>
        ) : success ? (
          <motion.span
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={16} />
            Email sent!
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

interface ForgotPasswordFormProps {
  onSubmit: (data: ForgotForm) => Promise<void>
  loading: boolean
  success: boolean
  serverError: string
  onBack?: () => void
}

export default function ForgotPasswordForm({ onSubmit, loading, success, serverError, onBack }: ForgotPasswordFormProps) {
  const { toast } = useToast()
  const form = useForm<ForgotForm>({ resolver: zodResolver(forgotSchema) })

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await onSubmit(data)
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      toast({
        type: 'error',
        title: 'Request Failed',
        message: errorMessage || 'Please check your email and try again.'
      })
    }
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.22 }}
      className="w-full max-w-sm"
    >
      {/* Back button */}
      {onBack && (
        <motion.button
          type="button"
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
          whileHover={{ x: -2 }}
        >
          <ArrowLeft size={14} />
          Back to login
        </motion.button>
      )}

      {/* Header */}
      <div className="mb-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 
                     flex items-center justify-center mb-4 border border-purple-500/20"
        >
          <Mail className="w-6 h-6 text-purple-400" />
        </motion.div>
        <h1 className="text-2xl font-bold text-white mb-2">Reset your password</h1>
        <p className="text-sm text-gray-400">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          label="Email"
          type="email"
          placeholder="you@company.com"
          error={form.formState.errors.email?.message}
          {...form.register('email')}
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

        <SubmitButton loading={loading} success={success} label="Send reset link" />

        {success && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-gray-400 text-center"
          >
            Check your inbox (and spam folder) for the reset link.
          </motion.p>
        )}
      </form>
    </motion.div>
  )
}
