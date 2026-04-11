/**
 * pages/LoginPage.jsx — Clean auth form with subtle animations
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { authAPI } from '../utils/api'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm]       = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await authAPI.login(form)
      login(data.token, data.user)
      navigate('/', { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel — hidden on mobile */}
      <div className="hidden lg:flex w-[45%] bg-accent-600 dark:bg-accent-800 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background texture circles */}
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-accent-500/30" />
        <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-accent-700/40" />

        <div className="relative z-10">
          <span className="font-serif text-3xl text-white font-medium tracking-wide">Inkwell</span>
        </div>

        <div className="relative z-10 space-y-4">
          <blockquote className="font-serif text-2xl text-white/90 leading-relaxed italic">
            "A place for every thought, big and small."
          </blockquote>
          <p className="text-accent-200 text-sm">Minimal. Focused. Yours.</p>
        </div>

        <div className="relative z-10 flex gap-2">
          <div className="w-8 h-1 rounded-full bg-white" />
          <div className="w-4 h-1 rounded-full bg-white/40" />
          <div className="w-4 h-1 rounded-full bg-white/40" />
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-stone-50 dark:bg-stone-950">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-sm space-y-8"
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center">
            <span className="font-serif text-2xl text-accent-700 dark:text-accent-400">Inkwell</span>
          </div>

          <div>
            <h1 className="font-serif text-2xl text-stone-900 dark:text-stone-50 mb-1">
              Welcome back
            </h1>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              Sign in to your notes
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-stone-600 dark:text-stone-400 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                autoFocus
                placeholder="you@example.com"
                className="input"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-stone-600 dark:text-stone-400 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-xs"
                >
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-stone-500 dark:text-stone-400">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-accent-600 dark:text-accent-400 font-medium hover:underline"
            >
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
