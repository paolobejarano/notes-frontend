'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/lib/api'
import NoteEditor from '@/components/NoteEditor'

interface Note {
  id: number
  title: string
  body: string
  updated_at: string
  category: {
    id: number
    name: string
    color: string
  }
}

export default function EditNotePage() {
  const [note, setNote] = useState<Note | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const params = useParams()
  const router = useRouter()
  const { token, logout } = useAuth()

  const noteId = Number(params.id)

  useEffect(() => {
    if (!token) {
      router.push('/login')
      return
    }

    if (!noteId || isNaN(noteId)) {
      router.push('/')
      return
    }

    fetchNote()
  }, [token, router, noteId])

  const fetchNote = async () => {
    try {
      setIsLoading(true)
      const response = await api.get(`/notes/${noteId}/`)
      setNote(response.data)
    } catch (err: any) {
      if (err.response?.status === 401) {
        logout()
        router.push('/login')
      } else if (err.response?.status === 404 || err.response?.status === 403) {
        router.push('/')
      } else {
        setError('Failed to load note')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAF1E3' }}>
        <div className="text-gray-500">Loading note...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAF1E3' }}>
        <div className="text-red-600">{error}</div>
      </div>
    )
  }

  if (!note) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAF1E3' }}>
        <div className="text-gray-500">Note not found</div>
      </div>
    )
  }

  return (
    <NoteEditor
      noteId={note.id}
      initialTitle={note.title}
      initialBody={note.body}
      initialCategoryId={note.category.id}
      initialLastSaved={note.updated_at}
    />
  )
}