'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import PageTransition from '@/components/PageTransition'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { register } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)

    try {
      await register(email, password)
      router.push('/')
    } catch (err: any) {
      if (err.response?.data?.email) {
        setError(err.response.data.email[0])
      } else if (err.response?.data?.non_field_errors) {
        setError(err.response.data.non_field_errors[0])
      } else {
        setError('Registration failed')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#FAF1E3' }}>
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Image
                src="/sign_in.png"
                alt="Sign Up"
                width={180}
                height={100}
                priority
              />
            </div>
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-extrabold inria-serif-bold" style={{ color: '#88642A' }}>
              Yay, New Friend!
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email Field with Floating Label */}
            <div className="floating-label-container">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="floating-label-input"
                placeholder=" "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label htmlFor="email" className="floating-label">
                Email address
              </label>
            </div>

            {/* Password Field with Floating Label */}
            <div className="floating-label-container">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                className="floating-label-input pr-10"
                placeholder=" "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <label htmlFor="password" className="floating-label">
                Password
              </label>
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center z-10"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L5.636 5.636m4.242 4.242L14.12 14.12m-4.242-4.242L5.636 5.636m8.484 8.484l4.242 4.242M9.878 9.878l4.242 4.242m0 0L19.878 19.878" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="custom-btn w-full"
            >
              {isLoading ? 'Sign Up' : 'Sign Up'}
            </button>
          </div>

          <div className="text-center">
            <span className="text-sm ">
              <Link href="/login" className="text-primary underline">
                We’re already friends!
              </Link>
            </span>
          </div>
        </form>
        </div>
      </div>
    </PageTransition>
  )
}