'use client'

import { useState, useCallback } from 'react'

interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user' | 'viewer'
  avatar_url?: string
}

const USER_KEY = 'af_user'

export function useAuthUser() {
  const [user, setUser] = useState<User | null>(null)

  const clearUser = useCallback(() => {
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }, [])

  const storeUser = useCallback((user: User) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    setUser(user)
  }, [])

  const initializeUser = useCallback(() => {
    const storedUser = localStorage.getItem(USER_KEY)
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        setUser(userData)
        return userData
      } catch {
        clearUser()
      }
    }
    return null
  }, [clearUser])

  return {
    user,
    setUser,
    clearUser,
    storeUser,
    initializeUser
  }
}
