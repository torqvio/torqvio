'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, AlertCircle, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

type LoginForm = z.infer<typeof loginSchema>

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
          className="w-full bg-[#252B3D]/60 text-white placeholder-gray-600 rounded-xl px-3 py-2.5
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
      className="relative w-full py-2.5 rounded-xl font-medium text-sm text-white overflow-hidden
                 disabled:opacity-80 transition-all duration-200 mt-1"
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
            Authenticating…
          </motion.span>
        ) : success ? (
          <motion.span
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={16} />
            Redirecting…
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

interface LoginFormProps {
  onSubmit: (data: LoginForm) => Promise<void>
  loading: boolean
  success: boolean
  serverError: string
}

export default function LoginForm({ onSubmit, loading, success, serverError }: LoginFormProps) {
  const [showPw, setShowPw] = useState(false)
  const { toast } = useToast()
  const form = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await onSubmit(data)
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      toast({
        type: 'error',
        title: 'Login Failed',
        message: errorMessage || 'Please check your credentials and try again.'
      })
    }
  })

  return (
    <motion.form
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      transition={{ duration: 0.22 }}
      onSubmit={handleSubmit}
      className="space-y-2"
    >
      <Field
        label="Email"
        type="email"
        placeholder="you@company.com"
        error={form.formState.errors.email?.message}
        {...form.register('email')}
      />

      <Field
        label="Password"
        type={showPw ? 'text' : 'password'}
        placeholder="••••••••"
        error={form.formState.errors.password?.message}
        rightElement={
          <button
            type="button"
            onClick={() => setShowPw(v => !v)}
            className="text-gray-500 hover:text-gray-300 transition-colors"
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
        {...form.register('password')}
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

      <SubmitButton loading={loading} success={success} label="Sign in" />
      
      <div className="text-center">
        <button
          type="button"
          onClick={() => window.location.href = '/forgot-password'}
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          Forgot your password?
        </button>
      </div>
    </motion.form>
  )
}
