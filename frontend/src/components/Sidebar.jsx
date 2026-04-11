/**
 * components/Sidebar.jsx — Left sidebar: app nav, folders, user info
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const FOLDER_COLORS = {
  gray:   'bg-stone-400',
  red:    'bg-red-400',
  orange: 'bg-orange-400',
  yellow: 'bg-amber-400',
  green:  'bg-emerald-400',
  blue:   'bg-blue-400',
  purple: 'bg-purple-400',
  pink:   'bg-pink-400',
}

// ─── Icon components (inline SVG) ─────────────────────────────────────────────
const Icon = ({ d, size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
)

const Icons = {
  notes:  'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  pin:    'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z',
  archive:'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8',
  plus:   'M12 5v14M5 12h14',
  moon:   'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z',
  sun:    'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z',
  logout: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
  chevron:'M9 5l7 7-7 7',
  edit:   'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  trash:  'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
}

export default function Sidebar({
  activeView, setActiveView,
  folders, uncategorizedCount,
  onCreateFolder, onDeleteFolder,
  totalNotes, pinnedNotes,
  isMobileOpen, onMobileClose,
}) {
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const [newFolderMode, setNewFolderMode] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [foldersExpanded, setFoldersExpanded] = useState(true)
  const [editingFolder, setEditingFolder] = useState(null)
  const [editName, setEditName] = useState('')

  const handleCreateFolder = (e) => {
    e.preventDefault()
    if (!newFolderName.trim()) return
    onCreateFolder({ name: newFolderName.trim() })
    setNewFolderName('')
    setNewFolderMode(false)
  }

  const handleNav = (view) => {
    setActiveView(view)
    onMobileClose?.()
  }

  const userInitials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  const navItem = (view, icon, label, count) => (
    <button
      key={view}
      onClick={() => handleNav(view)}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 group ${
        activeView.id === view
          ? 'bg-accent-50 dark:bg-accent-900/30 text-accent-700 dark:text-accent-400 font-medium'
          : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/60 hover:text-stone-900 dark:hover:text-stone-200'
      }`}
    >
      <Icon d={Icons[icon]} size={15} className="flex-shrink-0" />
      <span className="flex-1 text-left">{label}</span>
      {count !== undefined && (
        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
          activeView.id === view
            ? 'bg-accent-100 dark:bg-accent-900/50 text-accent-600 dark:text-accent-400'
            : 'bg-stone-100 dark:bg-stone-800 text-stone-400'
        }`}>
          {count}
        </span>
      )}
    </button>
  )

  const sidebarContent = (
    <div className="flex flex-col h-full py-4 px-3">

      {/* ── Brand ── */}
      <div className="px-2 mb-6">
        <span className="font-serif text-xl text-stone-900 dark:text-stone-50 font-medium">Inkwell</span>
      </div>

      {/* ── Main Nav ── */}
      <nav className="space-y-0.5 mb-6">
        {navItem('all', 'notes', 'All Notes', totalNotes)}
        {navItem('pinned', 'pin', 'Pinned', pinnedNotes)}
        {navItem('archived', 'archive', 'Archive')}
      </nav>

      {/* ── Folders ── */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="flex items-center justify-between px-2 mb-2">
          <button
            onClick={() => setFoldersExpanded((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider hover:text-stone-600 dark:hover:text-stone-300"
          >
            <Icon
              d={Icons.chevron}
              size={12}
              className={`transition-transform duration-200 ${foldersExpanded ? 'rotate-90' : ''}`}
            />
            Folders
          </button>
          <button
            onClick={() => setNewFolderMode(true)}
            className="w-5 h-5 flex items-center justify-center rounded text-stone-400 hover:text-accent-600 dark:hover:text-accent-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            title="New folder"
          >
            <Icon d={Icons.plus} size={13} />
          </button>
        </div>

        <AnimatePresence>
          {foldersExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-0.5 overflow-hidden"
            >
              {/* All uncategorized */}
              <button
                onClick={() => handleNav({ id: 'uncategorized', label: 'Uncategorized', folderId: 'none' })}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                  activeView.folderId === 'none'
                    ? 'bg-accent-50 dark:bg-accent-900/30 text-accent-700 dark:text-accent-400 font-medium'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/60'
                }`}
              >
                <span className="w-3 h-3 flex-shrink-0 rounded-full bg-stone-300 dark:bg-stone-600" />
                <span className="flex-1 text-left truncate">Uncategorized</span>
                {uncategorizedCount > 0 && (
                  <span className="text-xs text-stone-400">{uncategorizedCount}</span>
                )}
              </button>

              {/* Folder list */}
              {folders.map((folder) => (
                <div key={folder._id} className="group relative">
                  {editingFolder === folder._id ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        if (editName.trim()) {
                          // handled by parent via updateFolder
                        }
                        setEditingFolder(null)
                      }}
                      className="px-3 py-1.5"
                    >
                      <input
                        autoFocus
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onBlur={() => setEditingFolder(null)}
                        className="input text-sm py-1"
                      />
                    </form>
                  ) : (
                    <button
                      onClick={() => handleNav({ id: folder._id, label: folder.name, folderId: folder._id })}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 pr-8 ${
                        activeView.folderId === folder._id
                          ? 'bg-accent-50 dark:bg-accent-900/30 text-accent-700 dark:text-accent-400 font-medium'
                          : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/60'
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 flex-shrink-0 rounded-full ${FOLDER_COLORS[folder.color] || 'bg-stone-400'}`} />
                      <span className="flex-1 text-left truncate">{folder.icon} {folder.name}</span>
                      {folder.noteCount > 0 && (
                        <span className="text-xs text-stone-400">{folder.noteCount}</span>
                      )}
                    </button>
                  )}

                  {/* Folder delete button (hover) */}
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteFolder(folder._id) }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 flex items-center justify-center rounded text-stone-400 hover:text-red-500"
                    title="Delete folder"
                  >
                    <Icon d={Icons.trash} size={12} />
                  </button>
                </div>
              ))}

              {/* New folder input */}
              <AnimatePresence>
                {newFolderMode && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleCreateFolder}
                    className="px-3 py-1.5 overflow-hidden"
                  >
                    <input
                      autoFocus
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      onBlur={() => { if (!newFolderName.trim()) setNewFolderMode(false) }}
                      onKeyDown={(e) => { if (e.key === 'Escape') setNewFolderMode(false) }}
                      placeholder="Folder name…"
                      className="input text-sm py-1.5"
                    />
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Bottom: theme + user ── */}
      <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-800 space-y-2">
        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="btn-ghost w-full justify-start gap-3 text-sm"
        >
          <Icon d={dark ? Icons.sun : Icons.moon} size={15} />
          {dark ? 'Light mode' : 'Dark mode'}
        </button>

        {/* User + logout */}
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="w-7 h-7 rounded-full bg-accent-100 dark:bg-accent-900 text-accent-700 dark:text-accent-400 flex items-center justify-center text-xs font-semibold flex-shrink-0">
            {userInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-stone-800 dark:text-stone-200 truncate">{user?.name}</p>
            <p className="text-xs text-stone-400 truncate">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className="text-stone-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          >
            <Icon d={Icons.logout} size={15} />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 flex-col h-screen bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 flex-shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile overlay sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="fixed inset-0 bg-black/30 z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 w-72 h-full bg-white dark:bg-stone-900 z-50 md:hidden shadow-2xl"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
