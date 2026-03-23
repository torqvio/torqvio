'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import type { User } from '@/types/api'

interface LocalStorageData {
  user: User | null
  token: string | null
  hasToken: boolean
}

export default function DebugAuthPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [localStorageData, setLocalStorageData] = useState<LocalStorageData | null>(null)

  useEffect(() => {
    // Check localStorage
    const storedUser = localStorage.getItem('af_user')
    const storedToken = localStorage.getItem('af_access_token')
    
    setLocalStorageData({
      user: storedUser ? JSON.parse(storedUser) : null,
      token: storedToken ? storedToken.substring(0, 20) + '...' : null,
      hasToken: !!storedToken
    })
  }, [])

  if (isLoading) {
    return <div className="p-8 text-white">Loading...</div>
  }

  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl font-bold mb-4">Auth Debug Info</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">Auth Provider State:</h2>
          <pre className="bg-gray-800 p-4 rounded">
            {JSON.stringify({
              isAuthenticated,
              user,
              isLoading
            }, null, 2)}
          </pre>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Local Storage:</h2>
          <pre className="bg-gray-800 p-4 rounded">
            {JSON.stringify(localStorageData, null, 2)}
          </pre>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">User Avatar URL:</h2>
          {user?.avatar_url ? (
            <div>
              <p className="text-green-400 mb-2">Avatar URL found: {user.avatar_url}</p>
              <img 
                src={user.avatar_url} 
                alt="User Avatar" 
                className="w-20 h-20 rounded-full border-2 border-purple-500"
                onError={(e) => {
                  console.error('Avatar failed to load:', e)
                  e.currentTarget.style.display = 'none'
                }}
                onLoad={() => {
                  console.log('Avatar loaded successfully')
                }}
              />
            </div>
          ) : (
            <p className="text-red-400">No avatar_url found on user object</p>
          )}
        </div>
      </div>
    </div>
  )
}
