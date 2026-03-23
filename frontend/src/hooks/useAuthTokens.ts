'use client'

import { useState, useCallback } from 'react'

interface AuthTokens {
  accessToken: string
  refreshToken: string
  sessionId: string
}

const ACCESS_TOKEN_KEY = 'af_access_token'
const REFRESH_TOKEN_KEY = 'af_refresh_token'
const SESSION_ID_KEY = 'af_session_id'

export function useAuthTokens() {
  const [tokens, setTokens] = useState<AuthTokens | null>(null)

  const clearTokens = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(SESSION_ID_KEY)
    document.cookie = 'af_access_token=; path=/; max-age=0'
    setTokens(null)
  }, [])

  const storeTokens = useCallback((tokens: AuthTokens) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken)
    localStorage.setItem(SESSION_ID_KEY, tokens.sessionId)
    document.cookie = `af_access_token=${tokens.accessToken}; path=/; max-age=86400; SameSite=Lax`
    setTokens(tokens)
  }, [])

  const initializeTokens = useCallback(() => {
    const storedAccessToken = localStorage.getItem(ACCESS_TOKEN_KEY)
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
    const storedSessionId = localStorage.getItem(SESSION_ID_KEY)
    
    if (storedAccessToken && storedRefreshToken && storedSessionId) {
      const newTokens: AuthTokens = {
        accessToken: storedAccessToken,
        refreshToken: storedRefreshToken,
        sessionId: storedSessionId
      }
      setTokens(newTokens)
      // Ensure cookie is in sync with localStorage
      document.cookie = `af_access_token=${storedAccessToken}; path=/; max-age=86400; SameSite=Lax`
      return newTokens
    }
    return null
  }, [])

  return {
    tokens,
    setTokens,
    clearTokens,
    storeTokens,
    initializeTokens
  }
}
