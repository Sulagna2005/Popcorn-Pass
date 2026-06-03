import { Link, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { useCity } from '../context/CityContext'
import { useAuth } from '../context/AuthContext'
import CitySelector from './CitySelector'

export default function Navbar() {
  const [query, setQuery] = useState('')
  const [userMenu, setUserMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()
  const { city, showSelector, setShowSelector } = useCity()
  const { user, logout } = useAuth()
  const menuRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setUserMenu(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <>
      <nav className={`sticky top-0 z-40 transition-all duration-300 ${scrolled
        ? 'bg-[#060e1a]/98 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
        : 'bg-[#060e1a]'
        } border-b border-[#1e3a5f]/60`}>

        <div className="max-w-[1200px] mx-auto px-6 lg:px-10 h-16 flex items-center gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0 group">
            <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center text-base shadow-lg group-hover:scale-105 transition-transform">
              🍿
            </div>
            <div className="hidden sm:block">
              <span className="font-black text-lg tracking-tight">
                <span className="text-white">Popcorn</span>
                <span className="text-[#f0b429]">Pass</span>
              </span>
            </div>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="flex items-center bg-[#0d1b2e] border border-[#1e3a5f] rounded-xl px-4 py-2.5 gap-3 focus-within:border-[#f0b429] focus-within:shadow-[0_0_0_3px_rgba(240,180,41,0.1)] transition-all">
              <svg className="w-4 h-4 text-[#4a6fa5] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" strokeWidth="2" />
                <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search for Movies..."
                className="flex-1 bg-transparent text-sm text-white placeholder-[#4a6fa5] focus:outline-none"
              />
            </div>
          </form>

          {/* City */}
          <button
            onClick={() => setShowSelector(true)}
            className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-[#f0b429] transition-colors whitespace-nowrap shrink-0 group"
          >
            <svg className="w-4 h-4 text-[#f0b429]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
            <span className="font-medium">{city || 'Select City'}</span>
            <svg className="w-3 h-3 text-[#4a6fa5] group-hover:text-[#f0b429] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Auth */}
          {user ? (
            <div className="relative shrink-0" ref={menuRef}>
              <button onClick={() => setUserMenu(v => !v)} className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-full gold-gradient text-[#060e1a] font-black flex items-center justify-center text-sm shadow-lg group-hover:scale-105 transition-transform">
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs text-[#4a6fa5]">Hi,</p>
                  <p className="text-sm font-semibold text-white leading-none">{user.name?.split(' ')[0]}</p>
                </div>
              </button>
              {userMenu && (
                <div className="absolute right-0 top-12 bg-[#0d1b2e] border border-[#1e3a5f] rounded-2xl shadow-2xl w-52 py-2 z-50 fade-in">
                  <div className="px-4 py-3 border-b border-[#1e3a5f]">
                    <p className="text-xs text-[#4a6fa5]">Signed in as</p>
                    <p className="text-sm text-white font-medium truncate mt-0.5">{user.email}</p>
                  </div>
                  <Link to="/bookings" onClick={() => setUserMenu(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-[#1e3a5f]/50 transition-colors">
                    <svg className="w-4 h-4 text-[#f0b429]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                    My Bookings
                  </Link>
                  <button
                    onClick={() => { logout(); setUserMenu(false) }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-[#1e3a5f]/50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="shrink-0 text-sm font-semibold px-5 py-2 rounded-xl border border-[#f0b429] text-[#f0b429] hover:bg-[#f0b429] hover:text-[#060e1a] transition-all duration-200 whitespace-nowrap"
            >
              Sign In
            </Link>
          )}
        </div>
      </nav>

      {showSelector && <CitySelector />}
    </>
  )
}
