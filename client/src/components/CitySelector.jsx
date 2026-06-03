import { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { useCity } from '../context/CityContext'
import { CityIcons } from './CityIcons'

const POPULAR = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chandigarh', 'Ahmedabad', 'Pune', 'Chennai', 'Kolkata', 'Kochi']

export default function CitySelector() {
  const { selectCity, setShowSelector } = useCity()
  const [cities, setCities] = useState([])
  const [query, setQuery] = useState('')
  const [showAll, setShowAll] = useState(false)
  const [detecting, setDetecting] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    axios.get('/api/cities').then(res => setCities(res.data))
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  const otherCities = cities.filter(c => !POPULAR.includes(c.name))
  const filtered = query ? cities.filter(c => c.name.toLowerCase().includes(query.toLowerCase())) : null

  const detectLocation = () => {
    if (!navigator.geolocation) return
    setDetecting(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
          const data = await res.json()
          const detected = data.address?.city || data.address?.town || data.address?.state_district || ''
          const match = cities.find(c => detected.toLowerCase().includes(c.name.toLowerCase()))
          if (match) selectCity(match.name)
          else alert(`Detected: ${detected}. Not in our city list yet.`)
        } catch { alert('Could not detect city') }
        setDetecting(false)
      },
      () => { alert('Location access denied'); setDetecting(false) }
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-[#060e1a]/80 backdrop-blur-sm pt-12 px-4" onClick={(e) => e.target === e.currentTarget && setShowSelector(false)}>
      <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-2xl w-full max-w-3xl max-h-[82vh] overflow-hidden shadow-2xl fade-in flex flex-col">

        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-[#1e3a5f] shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold text-base">Select Your City</h2>
            <button onClick={() => setShowSelector(false)} className="w-8 h-8 rounded-lg bg-[#1e3a5f]/50 text-slate-400 hover:text-white hover:bg-[#1e3a5f] transition-colors flex items-center justify-center text-lg leading-none">
              ✕
            </button>
          </div>

          {/* Search */}
          <div className="flex items-center gap-3 bg-[#060e1a] border border-[#1e3a5f] rounded-xl px-4 py-3 focus-within:border-[#f0b429] focus-within:shadow-[0_0_0_3px_rgba(240,180,41,0.1)] transition-all">
            <svg className="w-4 h-4 text-[#4a6fa5] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" strokeWidth="2" />
              <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search for your city"
              className="flex-1 bg-transparent text-sm text-white placeholder-[#4a6fa5] outline-none"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-[#4a6fa5] hover:text-white transition-colors text-lg leading-none">✕</button>
            )}
          </div>

          {/* Detect location */}
          <button onClick={detectLocation} className="flex items-center gap-2 mt-3 text-[#f0b429] text-sm font-medium hover:text-[#fcd34d] transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3" strokeWidth="2" />
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3" strokeWidth="2" strokeLinecap="round" />
            </svg>
            {detecting ? 'Detecting your location...' : 'Detect my location'}
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {filtered ? (
            <div>
              <p className="text-xs text-[#4a6fa5] uppercase tracking-wider font-semibold mb-3">
                {filtered.length} result{filtered.length !== 1 ? 's' : ''}
              </p>
              {filtered.length === 0 ? (
                <p className="text-slate-500 text-sm py-8 text-center">No cities found for "{query}"</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {filtered.map(c => (
                    <button
                      key={c._id}
                      onClick={() => selectCity(c.name)}
                      className="text-sm text-slate-300 hover:text-[#f0b429] py-2.5 px-3 text-left hover:bg-[#1e3a5f]/40 rounded-xl transition-colors border border-transparent hover:border-[#1e3a5f]"
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Popular Cities */}
              <p className="text-xs text-[#4a6fa5] uppercase tracking-wider font-semibold text-center mb-5">Popular Cities</p>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-3 mb-8">
                {POPULAR.map(name => (
                  <button
                    key={name}
                    onClick={() => selectCity(name)}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#060e1a] border border-[#1e3a5f] group-hover:border-[#f0b429]/50 group-hover:bg-[#1e3a5f]/30 transition-all p-2 text-[#4a6fa5] group-hover:text-[#f0b429]">
                      {CityIcons[name]}
                    </div>
                    <span className="text-xs text-slate-400 group-hover:text-[#f0b429] transition-colors text-center leading-tight font-medium">
                      {name === 'Delhi' ? 'Delhi-NCR' : name}
                    </span>
                  </button>
                ))}
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-[#1e3a5f]" />
                <p className="text-xs text-[#4a6fa5] uppercase tracking-wider font-semibold">Other Cities</p>
                <div className="flex-1 h-px bg-[#1e3a5f]" />
              </div>

              <div className={`grid grid-cols-3 sm:grid-cols-5 gap-x-2 gap-y-1 transition-all ${!showAll ? 'max-h-36 overflow-hidden' : ''}`}>
                {otherCities.map(c => (
                  <button
                    key={c._id}
                    onClick={() => selectCity(c.name)}
                    className="text-sm text-slate-400 hover:text-[#f0b429] py-2 px-2 text-left rounded-lg hover:bg-[#1e3a5f]/30 transition-colors"
                  >
                    {c.name}
                  </button>
                ))}
              </div>

              <div className="text-center mt-4">
                <button
                  onClick={() => setShowAll(v => !v)}
                  className="text-[#f0b429] text-sm font-semibold hover:text-[#fcd34d] transition-colors"
                >
                  {showAll ? '↑ Hide all cities' : '↓ Show all cities'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
