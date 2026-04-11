/**
 * hooks/useFolders.js — Folder state & operations
 */

import { useState, useCallback } from 'react'
import { foldersAPI } from '../utils/api'
import toast from 'react-hot-toast'

export const useFolders = () => {
  const [folders, setFolders]           = useState([])
  const [uncategorizedCount, setUncategorizedCount] = useState(0)
  const [loading, setLoading]           = useState(false)

  const fetchFolders = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await foldersAPI.getAll()
      setFolders(data.folders)
      setUncategorizedCount(data.uncategorizedCount)
    } catch (err) {
      toast.error('Failed to load folders')
    } finally {
      setLoading(false)
    }
  }, [])

  const createFolder = useCallback(async ({ name, icon = '📁', color = 'gray' }) => {
    try {
      const { data } = await foldersAPI.create({ name, icon, color })
      setFolders((prev) => [...prev, { ...data.folder, noteCount: 0 }])
      toast.success(`Folder "${name}" created`)
      return data.folder
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not create folder')
      return null
    }
  }, [])

  const updateFolder = useCallback(async (id, updates) => {
    try {
      const { data } = await foldersAPI.update(id, updates)
      setFolders((prev) => prev.map((f) => (f._id === id ? { ...f, ...data.folder } : f)))
      return data.folder
    } catch (err) {
      toast.error('Could not update folder')
      return null
    }
  }, [])

  const deleteFolder = useCallback(async (id) => {
    try {
      await foldersAPI.delete(id)
      setFolders((prev) => prev.filter((f) => f._id !== id))
      toast.success('Folder deleted')
    } catch (err) {
      toast.error('Could not delete folder')
    }
  }, [])

  return {
    folders, uncategorizedCount, loading,
    fetchFolders, createFolder, updateFolder, deleteFolder,
  }
}
