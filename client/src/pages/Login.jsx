import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') await login(form.email, form.password)
      else await register(form.name, form.email, form.phone, form.password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#1e3a5f]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-[#f0b429]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl gold-gradient flex items-center justify-center text-3xl shadow-2xl glow-gold">
              🍿
            </div>
            <span className="font-black text-2xl">
              <span className="text-white">Popcorn</span>
              <span className="text-[#f0b429]">Pass</span>
            </span>
          </Link>
          <p className="text-slate-500 text-sm mt-2">
            {mode === 'login' ? 'Welcome back! Sign in to continue.' : 'Create your account to get started.'}
          </p>
        </div>

        <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-2xl p-8 shadow-2xl">
          {/* Toggle */}
          <div className="flex bg-[#060e1a] rounded-xl p-1 mb-7 border border-[#1e3a5f]">
            {[['login', 'Sign In'], ['register', 'Register']].map(([m, label]) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError('') }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
                  ${mode === m ? 'gold-gradient text-[#060e1a] shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="text-xs text-[#4a6fa5] font-medium mb-1.5 block">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={set('name')}
                  required
                  className="w-full bg-[#060e1a] border border-[#1e3a5f] rounded-xl px-4 py-3 text-sm text-white placeholder-[#4a6fa5] focus:outline-none focus:border-[#f0b429] focus:shadow-[0_0_0_3px_rgba(240,180,41,0.1)] transition-all"
                />
              </div>
            )}
            <div>
              <label className="text-xs text-[#4a6fa5] font-medium mb-1.5 block">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={set('email')}
                required
                className="w-full bg-[#060e1a] border border-[#1e3a5f] rounded-xl px-4 py-3 text-sm text-white placeholder-[#4a6fa5] focus:outline-none focus:border-[#f0b429] focus:shadow-[0_0_0_3px_rgba(240,180,41,0.1)] transition-all"
              />
            </div>
            {mode === 'register' && (
              <div>
                <label className="text-xs text-[#4a6fa5] font-medium mb-1.5 block">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={set('phone')}
                  required
                  className="w-full bg-[#060e1a] border border-[#1e3a5f] rounded-xl px-4 py-3 text-sm text-white placeholder-[#4a6fa5] focus:outline-none focus:border-[#f0b429] focus:shadow-[0_0_0_3px_rgba(240,180,41,0.1)] transition-all"
                />
              </div>
            )}
            <div>
              <label className="text-xs text-[#4a6fa5] font-medium mb-1.5 block">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={set('password')}
                required
                className="w-full bg-[#060e1a] border border-[#1e3a5f] rounded-xl px-4 py-3 text-sm text-white placeholder-[#4a6fa5] focus:outline-none focus:border-[#f0b429] focus:shadow-[0_0_0_3px_rgba(240,180,41,0.1)] transition-all"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <svg className="w-4 h-4 text-red-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full gold-gradient text-[#060e1a] font-bold py-3.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 text-sm shadow-lg glow-gold mt-2"
            >
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          By continuing, you agree to our{' '}
          <span className="text-[#4a6fa5] hover:text-[#f0b429] cursor-pointer transition-colors">Terms of Service</span>
          {' '}and{' '}
          <span className="text-[#4a6fa5] hover:text-[#f0b429] cursor-pointer transition-colors">Privacy Policy</span>
        </p>
      </div>
    </div>
  )
}
