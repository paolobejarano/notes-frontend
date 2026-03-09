'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '@/lib/api'

interface User {
  id: number
  email: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if we're in the browser
    if (typeof window === 'undefined') {
      return
    }

    // Check for existing token on mount
    try {
      const storedToken = localStorage.getItem('token')
      const storedUserEmail = localStorage.getItem('userEmail')
      
      console.log('Stored token:', storedToken ? 'exists' : 'none')
      console.log('Stored email:', storedUserEmail)
      
      if (storedToken && storedUserEmail) {
        setToken(storedToken)
        setUser({ id: 0, email: storedUserEmail })
        console.log('User restored from localStorage')
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error)
    }
    
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login/', { email, password })
      const { user, tokens } = response.data
      
      setUser(user)
      setToken(tokens.access)
      localStorage.setItem('token', tokens.access)
      localStorage.setItem('refreshToken', tokens.refresh)
      localStorage.setItem('userEmail', user.email)
    } catch (error) {
      throw error
    }
  }

  const register = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/signup/', { email, password })
      const { user, tokens } = response.data
      
      setUser(user)
      setToken(tokens.access)
      localStorage.setItem('token', tokens.access)
      localStorage.setItem('refreshToken', tokens.refresh)
      localStorage.setItem('userEmail', user.email)
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    console.log('LOGOUT CALLED - Stack trace:')
    console.trace()
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('userEmail')
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      register,
      logout,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}