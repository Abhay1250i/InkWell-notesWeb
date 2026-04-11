/**
 * pages/DashboardPage.jsx — Main app layout: sidebar + note list + editor
 */

import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNotes } from '../hooks/useNotes'
import { useFolders } from '../hooks/useFolders'
import Sidebar from '../components/Sidebar'
import NoteCard from '../components/NoteCard'
import NoteEditor from '../components/NoteEditor'

const Icon = ({ d, size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
)

const ICONS = {
  menu:    'M4 6h16M4 12h16M4 18h16',
  search:  'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  plus:    'M12 5v14M5 12h14',
  notes:   'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  edit:    'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  back:    'M15 19l-7-7 7-7',
  close:   'M6 18L18 6M6 6l12 12',
}

export default function DashboardPage() {
  const {
    notes, loading, activeNote, setActiveNote,
    fetchNotes, searchNotes, createNote, updateNote, deleteNote,
  } = useNotes()

  const {
    folders, uncategorizedCount,
    fetchFolders, createFolder, deleteFolder,
  } = useFolders()

  // Which section is active: {id, label, folderId?}
  const [activeView, setActiveView]   = useState({ id: 'all', label: 'All Notes' })
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileNavOpen, setMobileNavOpen]   = useState(false)
  // On mobile: show 'list' pane or 'editor' pane
  const [mobilePanel, setMobilePanel] = useState('list')

  // ─── Load folders once on mount ──────────────────────────────────────────
  useEffect(() => { fetchFolders() }, [])

  // ─── Re-fetch notes when the active view changes ──────────────────────────
  useEffect(() => {
    setSearchQuery('')
    const { id, folderId } = activeView
    if      (id === 'all')      fetchNotes({})
    else if (id === 'pinned')   fetchNotes({ pinned: 'true' })
    else if (id === 'archived') fetchNotes({ archived: 'true' })
    else if (folderId)          fetchNotes({ folder: folderId })
  }, [activeView])

  // ─── Debounced search ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!searchQuery.trim()) {
      // Restore current view's notes
      const { id, folderId } = activeView
      if      (id === 'all')      fetchNotes({})
      else if (id === 'pinned')   fetchNotes({ pinned: 'true' })
      else if (id === 'archived') fetchNotes({ archived: 'true' })
      else if (folderId)          fetchNotes({ folder: folderId })
      return
    }
    const timer = setTimeout(() => searchNotes(searchQuery), 320)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // ─── Create a new note in the current folder (if applicable) ─────────────
  const handleCreateNote = useCallback(async () => {
    const extras = {}
    if (activeView.folderId && activeView.folderId !== 'none') {
      extras.folder = activeView.folderId
    }
    const note = await createNote(extras)
    if (note) {
      await fetchFolders()          // Update folder note counts
      setMobilePanel('editor')
    }
  }, [activeView, createNote, fetchFolders])

  // ─── Select a note ────────────────────────────────────────────────────────
  const handleNoteClick = useCallback((note) => {
    setActiveNote(note)
    setMobilePanel('editor')
  }, [setActiveNote])

  // ─── Update note (and optionally refresh folder counts) ──────────────────
  const handleUpdate = useCallback(async (id, updates) => {
    await updateNote(id, updates)
    // Refresh folder counts when folder assignment or archive status changes
    if (updates.folder !== undefined || updates.isArchived !== undefined) {
      fetchFolders()
    }
  }, [updateNote, fetchFolders])

  // ─── Delete note ─────────────────────────────────────────────────────────
  const handleDelete = useCallback(async (id) => {
    await deleteNote(id)
    await fetchFolders()
    setMobilePanel('list')
  }, [deleteNote, fetchFolders])

  // ─── Change view ─────────────────────────────────────────────────────────
  const handleViewChange = useCallback((view) => {
    setActiveView(view)
    setActiveNote(null)
    setMobileNavOpen(false)
  }, [setActiveNote])

  // ─── Folder actions ───────────────────────────────────────────────────────
  const handleCreateFolder = useCallback(async (data) => {
    await createFolder(data)
    await fetchFolders()
  }, [createFolder, fetchFolders])

  const handleDeleteFolder = useCallback(async (id) => {
    if (!window.confirm('Delete this folder? Notes inside will be moved to Uncategorized.')) return
    await deleteFolder(id)
    // If we were viewing this folder, go back to All Notes
    if (activeView.folderId === id) {
      setActiveView({ id: 'all', label: 'All Notes' })
      setActiveNote(null)
    }
  }, [deleteFolder, activeView, setActiveNote])

  // Derived counts for sidebar badges
  const totalNotes   = notes.length
  const pinnedCount  = notes.filter((n) => n.isPinned).length

  return (
    <div className="flex h-screen overflow-hidden bg-stone-50 dark:bg-stone-950">

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <Sidebar
        activeView={activeView}
        setActiveView={handleViewChange}
        folders={folders}
        uncategorizedCount={uncategorizedCount}
        onCreateFolder={handleCreateFolder}
        onDeleteFolder={handleDeleteFolder}
        totalNotes={totalNotes}
        pinnedNotes={pinnedCount}
        isMobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
      />

      {/* ── Note List Panel ──────────────────────────────────────────────── */}
      <section
        className={`
          flex-shrink-0 flex flex-col
          w-full md:w-72 lg:w-80 xl:w-96
          border-r border-stone-200 dark:border-stone-800
          bg-white dark:bg-stone-900
          ${mobilePanel === 'editor' ? 'hidden md:flex' : 'flex'}
        `}
      >
        {/* List header */}
        <div className="flex items-center gap-2 px-3 py-3 border-b border-stone-200 dark:border-stone-800">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileNavOpen(true)}
            className="md:hidden btn-ghost p-1.5 -ml-1 flex-shrink-0"
            aria-label="Open menu"
          >
            <Icon d={ICONS.menu} size={18} />
          </button>

          {/* Search box */}
          <div className="relative flex-1">
            <Icon
              d={ICONS.search}
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search…"
              className="input pl-8 py-1.5 text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <Icon d={ICONS.close} size={12} />
              </button>
            )}
          </div>

          {/* New note button */}
          <button
            onClick={handleCreateNote}
            className="btn-primary flex-shrink-0 px-2.5 py-1.5"
            title="New note (N)"
          >
            <Icon d={ICONS.plus} size={16} />
          </button>
        </div>

        {/* Section heading */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-stone-100 dark:border-stone-800/60">
          <div>
            <h2 className="text-sm font-semibold text-stone-800 dark:text-stone-200">
              {searchQuery
                ? `Results for "${searchQuery}"`
                : (activeView.label || 'All Notes')}
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              {loading ? 'Loading…' : `${notes.length} note${notes.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        {/* Note cards */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loading ? (
            <LoadingPlaceholders />
          ) : notes.length === 0 ? (
            <EmptyState
              isSearch={!!searchQuery}
              query={searchQuery}
              onCreateNote={handleCreateNote}
            />
          ) : (
            <AnimatePresence mode="popLayout">
              {notes.map((note) => (
                <NoteCard
                  key={note._id}
                  note={note}
                  isActive={activeNote?._id === note._id}
                  onClick={() => handleNoteClick(note)}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </section>

      {/* ── Editor Panel ─────────────────────────────────────────────────── */}
      <main
        className={`
          flex-1 min-w-0 flex flex-col overflow-hidden
          ${mobilePanel === 'list' ? 'hidden md:flex' : 'flex'}
        `}
      >
        {/* Mobile: back to list */}
        {activeNote && (
          <div className="md:hidden flex items-center gap-2 px-3 py-2
            border-b border-stone-200 dark:border-stone-800
            bg-white dark:bg-stone-900 flex-shrink-0">
            <button
              onClick={() => setMobilePanel('list')}
              className="btn-ghost gap-1.5 text-sm -ml-1"
            >
              <Icon d={ICONS.back} size={16} />
              Notes
            </button>
          </div>
        )}

        {activeNote ? (
          <NoteEditor
            key={activeNote._id}
            note={activeNote}
            folders={folders}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        ) : (
          <EmptyEditor onCreateNote={handleCreateNote} />
        )}
      </main>
    </div>
  )
}

/* ─── Sub-components ──────────────────────────────────────────────────────── */

function LoadingPlaceholders() {
  return (
    <div className="space-y-2 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 rounded-xl border border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900">
          <div className="h-3.5 bg-stone-100 dark:bg-stone-800 rounded-full w-3/4 mb-3" />
          <div className="h-2.5 bg-stone-100 dark:bg-stone-800 rounded-full w-full mb-1.5" />
          <div className="h-2.5 bg-stone-100 dark:bg-stone-800 rounded-full w-5/6" />
        </div>
      ))}
    </div>
  )
}

function EmptyState({ isSearch, query, onCreateNote }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center h-48 text-center px-6"
    >
      <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center mb-3">
        <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"
          className="text-stone-400">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <p className="text-sm font-medium text-stone-600 dark:text-stone-400">
        {isSearch ? `No notes match "${query}"` : 'No notes here yet'}
      </p>
      <p className="text-xs text-stone-400 dark:text-stone-600 mt-1">
        {isSearch ? 'Try a different search term' : 'Create your first note to get started'}
      </p>
      {!isSearch && (
        <button
          onClick={onCreateNote}
          className="btn-primary mt-4 text-xs py-1.5 px-3"
        >
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Note
        </button>
      )}
    </motion.div>
  )
}

function EmptyEditor({ onCreateNote }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="space-y-5 max-w-xs"
      >
        {/* Decorative mark */}
        <div className="relative mx-auto w-20 h-20">
          <div className="absolute inset-0 rounded-3xl bg-accent-50 dark:bg-accent-900/20 rotate-6" />
          <div className="absolute inset-0 rounded-3xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
            <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round"
              className="text-stone-400 dark:text-stone-500">
              <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
        </div>

        <div className="space-y-2">
          <p className="font-serif text-xl text-stone-600 dark:text-stone-400">
            Your canvas awaits
          </p>
          <p className="text-sm text-stone-400 dark:text-stone-600 leading-relaxed">
            Select a note from the list, or create a new one to start writing.
          </p>
        </div>

        <button
          onClick={onCreateNote}
          className="btn-primary mx-auto gap-2"
        >
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Note
        </button>

        {/* Keyboard shortcut hints */}
        <div className="flex items-center justify-center gap-4 pt-2">
          <span className="text-xs text-stone-300 dark:text-stone-700 flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-500 font-mono text-xs">⌘K</kbd>
            search
          </span>
          <span className="text-xs text-stone-300 dark:text-stone-700 flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-500 font-mono text-xs">N</kbd>
            new note
          </span>
        </div>
      </motion.div>
    </div>
  )
}
