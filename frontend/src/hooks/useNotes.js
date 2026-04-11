/**
 * hooks/useNotes.js — Notes state & CRUD operations
 */

import { useState, useCallback } from 'react'
import { notesAPI } from '../utils/api'
import toast from 'react-hot-toast'

export const useNotes = () => {
  const [notes, setNotes]         = useState([])
  const [loading, setLoading]     = useState(false)
  const [activeNote, setActiveNote] = useState(null)

  // ─── Fetch notes (with optional filters) ─────────────────────────────────
  const fetchNotes = useCallback(async (params = {}) => {
    setLoading(true)
    try {
      const { data } = await notesAPI.getAll(params)
      setNotes(data.notes)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load notes')
    } finally {
      setLoading(false)
    }
  }, [])

  // ─── Search ───────────────────────────────────────────────────────────────
  const searchNotes = useCallback(async (q) => {
    setLoading(true)
    try {
      const { data } = await notesAPI.search(q)
      setNotes(data.notes)
    } catch (err) {
      toast.error('Search failed')
    } finally {
      setLoading(false)
    }
  }, [])

  // ─── Create ───────────────────────────────────────────────────────────────
  const createNote = useCallback(async (noteData = {}) => {
    try {
      const { data } = await notesAPI.create({
        title: 'Untitled Note',
        content: '',
        ...noteData,
      })
      setNotes((prev) => [data.note, ...prev])
      setActiveNote(data.note)
      return data.note
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not create note')
      return null
    }
  }, [])

  // ─── Update (optimistic) ──────────────────────────────────────────────────
  const updateNote = useCallback(async (id, updates) => {
    // Optimistic update
    setNotes((prev) =>
      prev.map((n) => (n._id === id ? { ...n, ...updates } : n))
    )
    if (activeNote?._id === id) {
      setActiveNote((prev) => ({ ...prev, ...updates }))
    }

    try {
      const { data } = await notesAPI.update(id, updates)
      // Sync with server response
      setNotes((prev) =>
        prev.map((n) => (n._id === id ? data.note : n))
      )
      if (activeNote?._id === id) setActiveNote(data.note)
      return data.note
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not save note')
      // Revert optimistic update on failure
      fetchNotes()
      return null
    }
  }, [activeNote, fetchNotes])

  // ─── Delete ───────────────────────────────────────────────────────────────
  const deleteNote = useCallback(async (id) => {
    try {
      await notesAPI.delete(id)
      setNotes((prev) => prev.filter((n) => n._id !== id))
      if (activeNote?._id === id) setActiveNote(null)
      toast.success('Note deleted')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not delete note')
    }
  }, [activeNote])

  return {
    notes, loading, activeNote, setActiveNote,
    fetchNotes, searchNotes, createNote, updateNote, deleteNote,
  }
}
