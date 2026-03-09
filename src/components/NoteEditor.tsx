'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/lib/api'
import PageTransition from '@/components/PageTransition'

interface Category {
  id: number
  name: string
  color: string
}

interface NoteEditorProps {
  noteId?: number
  initialTitle?: string
  initialBody?: string
  initialCategoryId?: number
  initialLastSaved?: string
}

export default function NoteEditor({ 
  noteId, 
  initialTitle = '', 
  initialBody = '', 
  initialCategoryId,
  initialLastSaved
}: NoteEditorProps) {
  const [title, setTitle] = useState(initialTitle)
  const [body, setBody] = useState(initialBody)
  const [selectedCategory, setSelectedCategory] = useState<number | null>(initialCategoryId || null)
  const [categories, setCategories] = useState<Category[]>([])
  const [error, setError] = useState('')
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null)
  const [currentNoteId, setCurrentNoteId] = useState<number | null>(noteId || null)

  const { token, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!token) {
      router.push('/login')
      return
    }
    
    fetchCategories()
  }, [token, router])

  useEffect(() => {
    // Set first category as default when categories are loaded (only for new notes)
    if (categories.length > 0 && selectedCategory === null && !noteId) {
      console.log('Setting default category:', categories[0])
      setSelectedCategory(categories[0].id)
    }
  }, [categories, selectedCategory, noteId])

  useEffect(() => {
    console.log('Selected category changed:', selectedCategory)
  }, [selectedCategory])

  useEffect(() => {
    // Set initial last saved time for existing notes
    if (initialLastSaved && !lastSaved) {
      setLastSaved(new Date(initialLastSaved))
    }
  }, [initialLastSaved, lastSaved])

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (isDropdownOpen && !target.closest('.dropdown-container')) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories/')
      setCategories(response.data.results || response.data)
    } catch (err: any) {
      if (err.response?.status === 401) {
        logout()
        router.push('/login')
      } else {
        setError('Failed to load categories')
      }
    } finally {
      setIsLoadingCategories(false)
    }
  }

  const getSelectedCategoryColor = () => {
    if (!selectedCategory) return '#957139'
    const category = categories.find(c => c.id === selectedCategory)
    return category?.color || '#957139'
  }

  const getCategoryColorWithOpacity = (opacity: number) => {
    const color = getSelectedCategoryColor()
    const hex = color.replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${opacity})`
  }

  const saveNote = useCallback(async () => {
    if (!title.trim() && !body.trim()) return
    if (!selectedCategory) return
    if (isSaving) return // Prevent concurrent saves

    setIsSaving(true)
    setError('')

    try {
      if (currentNoteId) {
        // Update existing note
        console.log('Updating existing note:', currentNoteId)
        await api.put(`/notes/${currentNoteId}/update/`, {
          title: title.trim(),
          body: body.trim(),
          category: selectedCategory
        })
      } else {
        // Create new note
        console.log('Creating new note')
        const response = await api.post('/notes/create/', {
          title: title.trim() || 'Untitled Note',
          body: body.trim(),
          category: selectedCategory
        })
        console.log('Note created with ID:', response.data.id)
        setCurrentNoteId(response.data.id)
        // Note: Don't navigate away to keep user in editing mode
      }
      setLastSaved(new Date())
    } catch (err: any) {
      if (err.response?.status === 401) {
        logout()
        router.push('/login')
      } else {
        setError('Failed to save note')
      }
    } finally {
      setIsSaving(false)
    }
  }, [title, body, selectedCategory, currentNoteId, isSaving, logout, router])

  // Auto-save effect
  useEffect(() => {
    if (!title && !body) return
    if (isSaving) return // Don't set new timeout while saving

    if (saveTimeout) {
      clearTimeout(saveTimeout)
    }

    const timeout = setTimeout(() => {
      if (!isSaving) { // Double-check before calling
        saveNote()
      }
    }, 1500)

    setSaveTimeout(timeout)

    return () => {
      if (timeout) clearTimeout(timeout)
    }
  }, [title, body, selectedCategory, currentNoteId, saveNote, isSaving])

  const formatLastSaved = () => {
    if (!lastSaved) return ''
    return lastSaved.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).replace(' at ', ' at ')
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#FAF1E3' }}>
        {/* Header */}
        <header style={{ backgroundColor: '#FAF1E3' }}>
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6 lg:py-8">
              {/* Custom Category Dropdown */}
              <div className="relative dropdown-container">
                {isLoadingCategories ? (
                  <div className="text-black">Loading categories...</div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setIsDropdownOpen(!isDropdownOpen)
                      }}
                      className="flex items-center space-x-2 px-3 py-2 border-2 rounded-md text-black focus:outline-none focus:border-indigo-500"
                      style={{ borderColor: '#957139', backgroundColor: '#FAF1E3', minWidth: '250px' }}
                    >
                      {selectedCategory ? (
                        <>
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: categories.find(c => c.id === selectedCategory)?.color }}
                          ></div>
                          <span>{categories.find(c => c.id === selectedCategory)?.name}</span>
                          <svg className="w-5 h-5 ml-auto" fill="none" stroke="#957139" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                          </svg>
                        </>
                      ) : (
                        <span>Select category</span>
                      )}
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-1 w-full rounded-md shadow-lg z-50" 
                        style={{ borderColor: '#957139', backgroundColor: '#FAF1E3' }}
                      >
                        {categories
                          .filter((category) => category.id !== selectedCategory)
                          .map((category) => (
                            <button
                              key={category.id}
                              type="button"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                console.log('Category option clicked:', category.name, category.id)
                                setSelectedCategory(category.id)
                                setIsDropdownOpen(false)
                              }}
                              className="w-full flex items-center space-x-2 px-3 py-2 text-left category-link first:rounded-t-md last:rounded-b-md"
                            >
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: category.color }}
                              ></div>
                              <span className="text-black">{category.name}</span>
                            </button>
                          ))}
                      </motion.div>
                    )}
                  </>
                )}
              </div>

              {/* Close Button */}
              <Link href="/" className="hover:opacity-75" style={{ color: '#957139' }}>
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="pb-6 lg:pb-8 px-4 sm:px-6 lg:px-8 flex-1 flex">
          {/* Big Note Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="rounded-lg shadow-lg border-3 overflow-hidden scroll-gradient-container w-full"
            style={{ 
              borderColor: getSelectedCategoryColor(),
              backgroundColor: getCategoryColorWithOpacity(0.5),
            }}
          >
            <div className="p-6 lg:p-8 h-full flex flex-col overflow-y-auto">
              {/* Timestamp at top right */}
              <div className="flex justify-end mb-2">
                <div className="text-xs text-black font-medium">
                  {isSaving ? (
                    <span>Saving...</span>
                  ) : lastSaved ? (
                    <span>Last Edited: {formatLastSaved()}</span>
                  ) : (
                    <span></span>
                  )}
                </div>
              </div>

              {/* Title Field */}
              <div className="mt-3 mb-3">
                <textarea
                  placeholder="Note title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-2xl font-bold text-black placeholder-black resize-none border-none outline-none bg-transparent inria-serif-bold"
                  rows={1}
                  style={{
                    minHeight: '3rem',
                    maxHeight: '8rem',
                    overflow: 'hidden'
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement
                    target.style.height = 'auto'
                    target.style.height = `${Math.min(target.scrollHeight, 128)}px`
                  }}
                />
              </div>

              {/* Body Field */}
              <div className="flex-1">
                <textarea
                  placeholder="Pour your heart out..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full h-full text-black placeholder-black resize-none border-none outline-none bg-transparent font-sans"
                  style={{ minHeight: '20rem' }}
                />
              </div>
            </div>
          </motion.div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
        </main>
      </div>
    </PageTransition>
  )
}