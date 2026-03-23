'use client'

import { Bell, User, Search, ChevronRight, Settings, LogOut, UserCircle } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/providers/AuthProvider'

export default function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { user, logout } = useAuth()

  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
  }

  return (
    <header className="bg-surface border-b border-border h-12 px-6 flex items-center justify-between">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm">
        <span className="text-text-muted">Torqvio</span>
        <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
        <span className="text-text-primary font-medium">Overview</span>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1">
        <button className="p-2 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-light transition-colors">
          <Search className="w-4 h-4" />
        </button>
        <button className="p-2 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-light transition-colors">
          <Bell className="w-4 h-4" />
        </button>
        
        {/* User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            className="ml-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors overflow-hidden"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            {user?.avatar_url ? (
              <img 
                src={user.avatar_url} 
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-3.5 h-3.5 text-white" />
            )}
          </button>
          
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-md shadow-lg z-50">
              <div className="py-1">
                <div className="px-3 py-2 border-b border-border">
                  <p className="text-sm font-medium text-text-primary">{user?.name}</p>
                  <p className="text-xs text-text-muted">{user?.email}</p>
                </div>
                <a 
                  href="/dashboard/settings/profile" 
                  className="flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-surface-light transition-colors"
                >
                  <UserCircle className="w-4 h-4" />
                  Profile
                </a>
                <a 
                  href="/dashboard/settings" 
                  className="flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-surface-light transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </a>
                <hr className="my-1 border-border" />
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text-primary hover:bg-surface-light transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
