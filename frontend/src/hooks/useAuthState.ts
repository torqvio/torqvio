'use client'

import { useState, useCallback } from 'react'

export function useAuthState() {
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState(false)

  const clearError = useCallback(() => {
    setServerError('')
  }, [])

  const setError = useCallback((error: string) => {
    setServerError(error)
  }, [])

  const setSuccessState = useCallback(() => {
    setSuccess(true)
  }, [])

  const resetState = useCallback(() => {
    setServerError('')
    setSuccess(false)
  }, [])

  return {
    serverError,
    success,
    setSuccess,
    setError,
    clearError,
    setSuccessState,
    resetState,
  }
}
