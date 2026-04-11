/**
 * components/NoteEditor.jsx — Rich markdown editor with auto-save
 */

import { useState, useEffect, useCallback } from 'react'
import MDEditor from '@uiw/react-md-editor'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { useAutoSave } from '../hooks/useAutoSave'

const Icon = ({ d, size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
)

const Icons = {
  trash:   'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
  pin:     'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z',
  tag:     'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z',
  folder:  'M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z',
  close:   'M6 18L18 6M6 6l12 12',
  preview: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
  edit2:   'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
}

const COLOR_OPTIONS = [
  { value: 'default', label: 'Default', class: 'bg-stone-300 dark:bg-stone-600' },
  { value: 'red',     label: 'Red',     class: 'bg-red-400' },
  { value: 'orange',  label: 'Orange',  class: 'bg-orange-400' },
  { value: 'yellow',  label: 'Yellow',  class: 'bg-amber-400' },
  { value: 'green',   label: 'Green',   class: 'bg-emerald-400' },
  { value: 'blue',    label: 'Blue',    class: 'bg-blue-400' },
  { value: 'purple',  label: 'Purple',  class: 'bg-purple-400' },
]

export default function NoteEditor({ note, folders, onUpdate, onDelete }) {
  const [title, setTitle]     = useState(note?.title || '')
  const [content, setContent] = useState(note?.content || '')
  const [tags, setTags]       = useState(note?.tags || [])
  const [tagInput, setTagInput] = useState('')
  const [viewMode, setViewMode] = useState('edit')   // 'edit' | 'preview'
  const [showMeta, setShowMeta] = useState(false)

  // Sync local state when note changes
  useEffect(() => {
    if (note) {
      setTitle(note.title || '')
      setContent(note.content || '')
      setTags(note.tags || [])
    }
  }, [note?._id])

  // ─── Auto-save title ──────────────────────────────────────────────────────
  const saveTitle = useCallback(
    (v) => onUpdate(note._id, { title: v }),
    [note?._id, onUpdate]
  )
  const titleStatus = useAutoSave(title, saveTitle, [note?._id])

  // ─── Auto-save content ────────────────────────────────────────────────────
  const saveContent = useCallback(
    (v) => onUpdate(note._id, { content: v }),
    [note?._id, onUpdate]
  )
  const contentStatus = useAutoSave(content, saveContent, [note?._id])

  const saveStatus = contentStatus === 'saving' || titleStatus === 'saving' ? 'saving' : 'saved'

  // ─── Tags ─────────────────────────────────────────────────────────────────
  const addTag = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault()
      const newTag = tagInput.trim().toLowerCase().replace(/\s+/g, '-')
      if (!tags.includes(newTag) && tags.length < 10) {
        const updated = [...tags, newTag]
        setTags(updated)
        onUpdate(note._id, { tags: updated })
      }
      setTagInput('')
    }
    if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      const updated = tags.slice(0, -1)
      setTags(updated)
      onUpdate(note._id, { tags: updated })
    }
  }

  const removeTag = (tag) => {
    const updated = tags.filter((t) => t !== tag)
    setTags(updated)
    onUpdate(note._id, { tags: updated })
  }

  if (!note) return null

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0

  return (
    <motion.div
      key={note._id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col h-full bg-stone-50 dark:bg-stone-950"
    >
      {/* ── Editor Header ── */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('edit')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              viewMode === 'edit'
                ? 'bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-100 shadow-sm'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-700'
            }`}
          >
            <Icon d={Icons.edit2} size={12} /> Edit
          </button>
          <button
            onClick={() => setViewMode('preview')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              viewMode === 'preview'
                ? 'bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-100 shadow-sm'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-700'
            }`}
          >
            <Icon d={Icons.preview} size={12} /> Preview
          </button>
        </div>

        <div className="flex-1" />

        {/* Save status */}
        <span className={`text-xs transition-all ${
          saveStatus === 'saving' ? 'text-amber-500' : 'text-stone-400 dark:text-stone-600'
        }`}>
          {saveStatus === 'saving' ? '● Saving…' : '✓ Saved'}
        </span>

        {/* Meta panel toggle */}
        <button
          onClick={() => setShowMeta((v) => !v)}
          className={`btn-ghost px-2 py-1.5 text-xs ${showMeta ? 'text-accent-600 dark:text-accent-400' : ''}`}
        >
          <Icon d={Icons.tag} size={14} />
        </button>

        {/* Pin */}
        <button
          onClick={() => onUpdate(note._id, { isPinned: !note.isPinned })}
          className={`btn-ghost px-2 py-1.5 text-xs ${note.isPinned ? 'text-accent-600 dark:text-accent-400' : ''}`}
          title={note.isPinned ? 'Unpin' : 'Pin note'}
        >
          <Icon d={Icons.pin} size={14} />
        </button>

        {/* Delete */}
        <button
          onClick={() => {
            if (window.confirm('Delete this note?')) onDelete(note._id)
          }}
          className="btn-ghost px-2 py-1.5 text-xs hover:text-red-500 dark:hover:text-red-400"
          title="Delete note"
        >
          <Icon d={Icons.trash} size={14} />
        </button>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* ── Main Editor Area ── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Title */}
          <div className="px-6 pt-6 pb-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled Note"
              className="w-full bg-transparent font-serif text-2xl font-medium text-stone-900 dark:text-stone-50
                         placeholder-stone-300 dark:placeholder-stone-700 focus:outline-none"
            />
            <p className="text-xs text-stone-400 dark:text-stone-600 mt-1">
              {format(new Date(note.updatedAt), 'MMM d, yyyy · h:mm a')} · {wordCount} words
            </p>
          </div>

          {/* Tags (inline) */}
          <div className="px-6 pb-3 flex flex-wrap gap-1.5 items-center">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full
                           bg-accent-50 dark:bg-accent-900/30 text-accent-700 dark:text-accent-400"
              >
                #{tag}
                <button onClick={() => removeTag(tag)} className="hover:text-red-500">
                  <Icon d={Icons.close} size={10} />
                </button>
              </span>
            ))}
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={addTag}
              placeholder={tags.length === 0 ? '+ Add tag…' : ''}
              className="bg-transparent text-xs text-stone-400 placeholder-stone-300 dark:placeholder-stone-700
                         focus:outline-none focus:text-stone-700 dark:focus:text-stone-300 w-24"
            />
          </div>

          {/* Divider */}
          <div className="mx-6 border-t border-stone-200 dark:border-stone-800 mb-4" />

          {/* Markdown editor / preview */}
          <div className="flex-1 px-2" data-color-mode="light">
            {viewMode === 'edit' ? (
              <MDEditor
                value={content}
                onChange={(v) => setContent(v || '')}
                preview="edit"
                hideToolbar={false}
                height="100%"
                minHeight={400}
                style={{ background: 'transparent', boxShadow: 'none' }}
                textareaProps={{ placeholder: 'Start writing…', style: { minHeight: 400 } }}
              />
            ) : (
              <div className="px-4 pb-12 prose prose-stone dark:prose-invert max-w-none">
                <MDEditor.Markdown source={content || '*Nothing here yet…*'} />
              </div>
            )}
          </div>
        </div>

        {/* ── Meta Panel ── */}
        <AnimatePresence>
          {showMeta && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 220, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="border-l border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden flex-shrink-0"
            >
              <div className="p-4 space-y-5 w-[220px]">
                <div>
                  <h4 className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-2">
                    Folder
                  </h4>
                  <select
                    value={note.folder?._id || ''}
                    onChange={(e) => onUpdate(note._id, { folder: e.target.value || null })}
                    className="input text-xs py-1.5"
                  >
                    <option value="">No folder</option>
                    {folders.map((f) => (
                      <option key={f._id} value={f._id}>{f.icon} {f.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-2">
                    Color Label
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => onUpdate(note._id, { color: c.value })}
                        title={c.label}
                        className={`w-5 h-5 rounded-full ${c.class} transition-transform hover:scale-110 ${
                          note.color === c.value ? 'ring-2 ring-offset-2 ring-accent-500 dark:ring-offset-stone-900' : ''
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-2">
                    Archive
                  </h4>
                  <button
                    onClick={() => onUpdate(note._id, { isArchived: !note.isArchived })}
                    className="btn-secondary text-xs py-1.5 w-full"
                  >
                    {note.isArchived ? 'Unarchive' : 'Archive note'}
                  </button>
                </div>

                <div className="pt-2 border-t border-stone-100 dark:border-stone-800 space-y-1">
                  <p className="text-xs text-stone-400">
                    <span className="font-medium">Created:</span><br />
                    {format(new Date(note.createdAt), 'MMM d, yyyy')}
                  </p>
                  <p className="text-xs text-stone-400">
                    <span className="font-medium">Words:</span> {wordCount}
                  </p>
                  {note.wordCount !== undefined && (
                    <p className="text-xs text-stone-400">
                      <span className="font-medium">Characters:</span> {content.length}
                    </p>
                  )}
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
