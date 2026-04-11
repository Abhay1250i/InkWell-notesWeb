/**
 * components/NoteCard.jsx — Single note card in the list panel
 */

import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'

const COLOR_ACCENTS = {
  default: '',
  red:     'border-l-4 border-l-red-400',
  orange:  'border-l-4 border-l-orange-400',
  yellow:  'border-l-4 border-l-amber-400',
  green:   'border-l-4 border-l-emerald-400',
  blue:    'border-l-4 border-l-blue-400',
  purple:  'border-l-4 border-l-purple-400',
}

// Strip markdown symbols for clean preview
const stripMarkdown = (text = '') =>
  text
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*|__|\*|_|~~|`/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^>\s/gm, '')
    .replace(/\n+/g, ' ')
    .trim()

export default function NoteCard({ note, isActive, onClick }) {
  const preview = stripMarkdown(note.content)
  const timeAgo = formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.18 }}
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border transition-all duration-150 group
        ${COLOR_ACCENTS[note.color] || ''}
        ${isActive
          ? 'bg-accent-50 dark:bg-accent-900/20 border-accent-200 dark:border-accent-800 shadow-card'
          : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 hover:shadow-card-hover'
        }`}
    >
      {/* Top row: pin indicator + time */}
      <div className="flex items-center justify-between mb-1.5 gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {note.isPinned && (
            <span className="text-accent-500 dark:text-accent-400 flex-shrink-0" title="Pinned">
              📌
            </span>
          )}
          <h3 className={`font-serif text-sm font-medium truncate ${
            isActive
              ? 'text-accent-800 dark:text-accent-200'
              : 'text-stone-900 dark:text-stone-100'
          }`}>
            {note.title || 'Untitled Note'}
          </h3>
        </div>
        <span className="text-xs text-stone-400 dark:text-stone-600 flex-shrink-0 whitespace-nowrap">
          {timeAgo}
        </span>
      </div>

      {/* Preview text */}
      {preview && (
        <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed mb-2">
          {preview}
        </p>
      )}

      {/* Tags */}
      {note.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {note.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 text-xs rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400"
            >
              #{tag}
            </span>
          ))}
          {note.tags.length > 3 && (
            <span className="text-xs text-stone-400">+{note.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Folder badge */}
      {note.folder && (
        <div className="mt-2 flex items-center gap-1">
          <span className="text-xs text-stone-400 dark:text-stone-500">
            {note.folder.icon} {note.folder.name}
          </span>
        </div>
      )}
    </motion.button>
  )
}
