'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/lib/api'

interface Category {
  id: number
  name: string
  color: string
  note_count: number
}

interface Note {
  id: number
  title: string
  body: string
  category: Category
  user: {
    id: number
    email: string
  }
  created_at: string
  updated_at: string
}

interface NotesResponse {
  count: number
  has_next: boolean
  has_previous: boolean
  current_page: number
  total_pages: number
  next: string | null
  previous: string | null
  results: Note[]
}

export default function HomePage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [hasNext, setHasNext] = useState(false)
  
  const { user, token, logout, isLoading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Wait for auth to finish loading before checking token
    if (authLoading) {
      console.log('HomePage - Auth still loading, waiting...')
      return
    }
    
    console.log('HomePage - Auth finished loading. Token:', token ? 'exists' : 'none')
    console.log('HomePage - User:', user)
    
    if (!token) {
      console.log('HomePage - No token found, redirecting to login')
      router.push('/login')
      return
    }
    
    console.log('HomePage - Token exists, fetching data')
    fetchCategories()
    fetchNotes()
  }, [token, router, authLoading, user])

  useEffect(() => {
    fetchNotes()
  }, [selectedCategory])

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories/')
      setCategories(response.data.results || response.data)
    } catch (err: any) {
      if (err.response?.status === 401) {
        logout()
        router.push('/login')
      }
    }
  }

  const fetchNotes = async (page = 1) => {
    try {
      setIsLoading(true)
      let url = `/notes/?page=${page}&page_size=9`
      if (selectedCategory) {
        url += `&category=${selectedCategory}`
      }
      
      const response = await api.get(url)
      const data: NotesResponse = response.data
      
      if (page === 1) {
        setNotes(data.results)
      } else {
        setNotes(prev => [...prev, ...data.results])
      }
      
      setHasNext(data.has_next)
    } catch (err: any) {
      if (err.response?.status === 401) {
        logout()
        router.push('/login')
      } else {
        setError('Failed to load notes')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      // Parse the date - Django sends ISO format that includes timezone info
      const date = new Date(dateString)
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date'
      }
      
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      
      const noteDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      
      if (noteDate.getTime() === today.getTime()) {
        return 'Today'
      } else if (noteDate.getTime() === yesterday.getTime()) {
        return 'Yesterday'
      } else {
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      }
    } catch (error) {
      console.error('Date parsing error:', error, 'for date:', dateString)
      return 'Unknown'
    }
  }

  const getCategoryColorWithOpacity = (color: string, opacity: number) => {
    // Convert hex to rgba
    const hex = color.replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${opacity})`
  }

  // Show loading while auth is being resolved
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAF1E3' }}>
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  // If auth is done loading but no user, let useEffect handle redirect
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF1E3' }}>
      {/* Top Bar with New Note Button */}
      <header style={{ backgroundColor: '#FAF1E3' }}>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-end items-center py-4">
            <Link
              href="/new-note"
              className="custom-btn"
            >
              + New Note
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen" style={{ backgroundColor: '#FAF1E3' }}>
          <div className="p-4">
            <nav className="space-y-0">
              {/* All Categories Button */}
              <button
                onClick={() => setSelectedCategory(null)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors text-black category-link ${
                  selectedCategory === null
                    ? 'font-bold'
                    : 'font-medium'
                }`}
              >
                All Categories
              </button>
              
              {/* Category Buttons */}
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors text-black category-link  ${
                    selectedCategory === category.id
                      ? 'font-bold'
                      : 'font-medium'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: category.color }}
                      ></div>
                      {category.name}
                    </div>
                    <span className="text-xs text-gray-500 px-2 py-1 rounded-full">
                      {category.note_count}
                    </span>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {isLoading && notes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500">Loading your notes...</div>
            </div>
          ) : (
            <>
              {notes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="flex justify-center">
                    <Image
                      src="/new_note.png"
                      alt="No notes"
                      width={200}
                      height={200}
                    />
                  </div>
                  <p className="text-lg text-gray-600 mb-8">
                    {selectedCategory ? 'No notes in this category.' : "I'm just here waiting for your charming notes..."}
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 grid-cols-3">
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      className="shadow rounded-lg h-64 flex flex-col cursor-pointer hover:shadow-lg transition-shadow"
                      style={{ 
                        border: `3px solid ${note.category.color}`,
                        backgroundColor: getCategoryColorWithOpacity(note.category.color, 0.5)
                      }}
                      onClick={() => router.push(`/note/${note.id}`)}
                    >
                      <div className="p-4 flex-1 flex flex-col">
                        {/* Date and Category at top */}
                        <div className="flex justify-between items-center mb-2">
                          <div className="text-xs text-gray-500 font-medium">
                            {formatDate(note.updated_at)}
                          </div>
                          <div className="text-xs text-gray-500 font-medium">
                            {note.category.name}
                          </div>
                        </div>
                        
                        {/* Title */}
                        <h3 className="text-base font-semibold text-gray-900 line-clamp-2 mb-3">
                          {note.title}
                        </h3>
                        
                        {/* Body */}
                        <div className="text-sm text-gray-600 flex-1 overflow-hidden">
                          <div className="whitespace-pre-wrap break-words line-clamp-4">
                            {note.body}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Load More Button */}
              {hasNext && (
                <div className="text-center mt-8">
                  <button
                    onClick={() => fetchNotes(Math.floor(notes.length / 9) + 1)}
                    disabled={isLoading}
                    className="custom-btn"
                  >
                    {isLoading ? 'Loading...' : 'Load More Notes'}
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}
