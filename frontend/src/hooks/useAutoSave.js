/**
 * hooks/useAutoSave.js — Debounced auto-save for the note editor
 */

import { useEffect, useRef, useState } from 'react'

const DEBOUNCE_MS = 1200  // Save 1.2s after last keystroke

export const useAutoSave = (value, saveFn, deps = []) => {
  const [saveStatus, setSaveStatus] = useState('saved') // 'saved' | 'saving' | 'error'
  const timerRef    = useRef(null)
  const initialRef  = useRef(true)  // Skip save on first render

  useEffect(() => {
    // Skip the very first effect run (no changes yet)
    if (initialRef.current) {
      initialRef.current = false
      return
    }

    setSaveStatus('saving')
    clearTimeout(timerRef.current)

    timerRef.current = setTimeout(async () => {
      try {
        await saveFn(value)
        setSaveStatus('saved')
      } catch {
        setSaveStatus('error')
      }
    }, DEBOUNCE_MS)

    return () => clearTimeout(timerRef.current)
  }, [value, ...deps])

  return saveStatus
}
