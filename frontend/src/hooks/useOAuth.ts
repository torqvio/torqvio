'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/toast'
import { useAuthTokens } from './useAuthTokens'
import { useAuthUser } from './useAuthUser'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8459'

export function useOAuth() {
  const router = useRouter()
  const { toast } = useToast()
  const { storeTokens } = useAuthTokens()
  const { storeUser } = useAuthUser()

  const handleOAuthRedirect = useCallback(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const urlToken = urlParams.get('token')
    const urlError = urlParams.get('error')
    
    if (urlToken) {
      // Store OAuth token (legacy support - creates partial tokens object)
      const oauthTokens = {
        accessToken: urlToken,
        refreshToken: '', // OAuth doesn't provide refresh token initially
        sessionId: ''
      }
      storeTokens(oauthTokens)
      
      // Fetch user info with the new token
      fetch(`${API_BASE}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${urlToken}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            storeUser(data.user)
            // Clean URL
            window.history.replaceState({}, '', window.location.pathname)
            router.push('/dashboard')
          }
        })
        .catch(() => {
          toast({
            type: 'error',
            title: 'Authentication Failed',
            message: 'Unable to complete sign in. Please try again.',
          })
        })
    } else if (urlError) {
      // Handle OAuth errors with user-friendly messages
      let errorMessage = 'Authentication failed'
      let errorDescription = 'Please try signing in again.'
      
      if (urlError === 'access_denied') {
        errorMessage = 'Access Denied'
        errorDescription = 'You cancelled the authentication process.'
      } else if (urlError === 'github_auth_error') {
        errorMessage = 'GitHub Authentication Error'
        errorDescription = 'There was an issue connecting to GitHub. Please try again.'
      } else if (urlError === 'google_auth_error') {
        errorMessage = 'Google Authentication Error'
        errorDescription = 'There was an issue connecting to Google. Please try again.'
      }
      
      toast({
        type: 'error',
        title: errorMessage,
        message: errorDescription,
      })
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [router, toast, storeTokens, storeUser])

  const loginWithGithub = useCallback(async () => {
    try {
      // Redirect to GitHub OAuth
      window.location.href = `${API_BASE}/api/v1/auth/github`
    } catch (error) {
      throw new Error('GitHub login failed')
    }
  }, [])

  const loginWithGoogle = useCallback(async () => {
    try {
      // Redirect to Google OAuth
      window.location.href = `${API_BASE}/api/v1/auth/google`
    } catch (error) {
      throw new Error('Google login failed')
    }
  }, [])

  return {
    handleOAuthRedirect,
    loginWithGithub,
    loginWithGoogle
  }
}
