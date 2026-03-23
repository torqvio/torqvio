'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/toast'
import { useAuthTokens } from '@/hooks/useAuthTokens'
import { useAuthUser } from '@/hooks/useAuthUser'
import { useOAuth } from '@/hooks/useOAuth'
import { apiClient } from '@/services/api'

interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user' | 'viewer'
  avatar_url?: string
}

interface AuthTokens {
  accessToken: string
  refreshToken: string
  sessionId: string
}

interface AuthContextType {
  user: User | null
  tokens: AuthTokens | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  loginWithGithub: () => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => void
  refreshTokens: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { toast } = useToast()
  const { tokens, storeTokens, clearTokens, initializeTokens } = useAuthTokens()
  const { user, storeUser, clearUser, initializeUser } = useAuthUser()
  const { handleOAuthRedirect, loginWithGithub, loginWithGoogle } = useOAuth()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initialize stored auth data
    const storedTokens = initializeTokens()
    const storedUser = initializeUser()
    
    // Handle OAuth redirect
    handleOAuthRedirect()
    
    setIsLoading(false)
  }, [initializeTokens, initializeUser, handleOAuthRedirect])

  // Helper function to clear all auth data
  const clearAuthData = useCallback(() => {
    clearTokens()
    clearUser()
  }, [clearTokens, clearUser])

  // Helper function to store auth data
  const storeAuthData = useCallback((user: User, tokens: AuthTokens) => {
    storeUser(user)
    storeTokens(tokens)
  }, [storeUser, storeTokens])

  // Token refresh function
  const refreshTokens = useCallback(async () => {
    if (!tokens?.refreshToken) {
      throw new Error('No refresh token available')
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8459'}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: tokens.refreshToken }),
    })
    
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Token refresh failed')

    const newTokens: AuthTokens = {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      sessionId: data.sessionId
    }
    
    storeTokens(newTokens)
  }, [tokens, storeTokens])

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiClient.login(email, password)
    const newTokens: AuthTokens = {
      accessToken: data.token,
      refreshToken: '', // Will be updated by API response
      sessionId: '' // Will be updated by API response
    }
    
    storeAuthData(data.user, newTokens)
    router.push('/dashboard')
  }, [router, storeAuthData])

  const register = useCallback(async (email: string, password: string, name: string) => {
    const data = await apiClient.register(email, password, name)
    const newTokens: AuthTokens = {
      accessToken: data.token,
      refreshToken: '', // Will be updated by API response
      sessionId: '' // Will be updated by API response
    }
    
    storeAuthData(data.user, newTokens)
    router.push('/dashboard')
  }, [router, storeAuthData])

  const logout = useCallback(() => {
    clearAuthData()
    router.push('/login')
  }, [router, clearAuthData])

  return (
    <AuthContext.Provider value={{
      user,
      tokens,
      isLoading,
      isAuthenticated: !!user && !!tokens,
      login,
      register,
      loginWithGithub,
      loginWithGoogle,
      logout,
      refreshTokens,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
