/**
 * pages/SignupPage.jsx — Registration form
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { authAPI } from '../utils/api'
import { useAuth } from '../context/AuthContext'

export default function SignupPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm]         = useState({ name: '', email: '', password: '' })
  const [loading, setLoading]   = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      const { data } = await authAPI.signup(form)
      login(data.token, data.user)
      toast.success(`Welcome, ${data.user.name}! 🎉`)
      navigate('/', { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  const strength = (() => {
    const p = form.password
    if (!p) return 0
    let s = 0
    if (p.length >= 6)  s++
    if (p.length >= 10) s++
    if (/[A-Z]/.test(p) && /[0-9]/.test(p)) s++
    return s
  })()

  const strengthLabel = ['', 'Weak', 'Fair', 'Strong'][strength]
  const strengthColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-accent-500'][strength]

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex w-[45%] bg-stone-900 dark:bg-stone-800 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-accent-600/10 blur-3xl" />

        <div className="relative z-10">
          <span className="font-serif text-3xl text-white font-medium tracking-wide">Inkwell</span>
        </div>

        <div className="relative z-10 space-y-6">
          {['Capture every idea', 'Organize with folders', 'Search instantly', 'Works everywhere'].map((feature, i) => (
            <motion.div
              key={feature}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className="w-5 h-5 rounded-full bg-accent-500/20 border border-accent-500/40 flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-accent-400" />
              </div>
              <span className="text-stone-300 text-sm">{feature}</span>
            </motion.div>
          ))}
        </div>

        <div className="relative z-10">
          <p className="text-stone-600 text-xs">Free to use. No ads. No tracking.</p>
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
          <div className="lg:hidden text-center">
            <span className="font-serif text-2xl text-accent-700 dark:text-accent-400">Inkwell</span>
          </div>

          <div>
            <h1 className="font-serif text-2xl text-stone-900 dark:text-stone-50 mb-1">
              Create your space
            </h1>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              Start capturing ideas in seconds
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-stone-600 dark:text-stone-400 uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                autoFocus
                placeholder="Ada Lovelace"
                className="input"
              />
            </div>

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
                  minLength={6}
                  placeholder="Min. 6 characters"
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

              {/* Password strength bar */}
              {form.password && (
                <div className="pt-1 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i <= strength ? strengthColor : 'bg-stone-200 dark:bg-stone-700'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-stone-400">{strengthLabel}</p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account…
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-stone-500 dark:text-stone-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-accent-600 dark:text-accent-400 font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
