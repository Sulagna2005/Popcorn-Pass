import { useEffect, useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useCity } from '../context/CityContext'
import MovieCard from '../components/MovieCard'

const IMG_BASE = 'https://image.tmdb.org/t/p/original'
const TABS = ['Now Showing', 'Coming Soon', 'Top Rated', 'Premieres']
const WRAP = 'max-w-[1200px] mx-auto px-6 lg:px-10'

function HeroCarousel({ movies }) {
  const [idx, setIdx] = useState(0)
  const timerRef = useRef(null)

  const go = useCallback((i) => setIdx((i + movies.length) % movies.length), [movies.length])

  useEffect(() => {
    timerRef.current = setInterval(() => go(idx + 1), 5000)
    return () => clearInterval(timerRef.current)
  }, [idx, go])

  if (!movies.length) return null
  const m = movies[idx]

  return (
    <div className={`${WRAP} pt-6 pb-2`}>
      <div className="relative h-[260px] md:h-[380px] rounded-2xl overflow-hidden">
        {movies.slice(0, 5).map((movie, i) => (
          <div key={movie.id} className={`absolute inset-0 transition-opacity duration-700 ${i === idx ? 'opacity-100' : 'opacity-0'}`}>
            <img src={`${IMG_BASE}${movie.backdrop_path}`} alt={movie.title} className="w-full h-full object-cover" />
          </div>
        ))}

        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <div className="absolute inset-0 flex items-end p-8">
          <div className="max-w-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold bg-[#f0b429]/20 text-[#f0b429] border border-[#f0b429]/30 px-2.5 py-0.5 rounded-full">
                ⭐ {m.vote_average?.toFixed(1)}
              </span>
              <span className="text-xs text-white/60">{m.release_date?.split('-')[0]}</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-black text-white leading-tight">{m.title}</h1>
            <div className="flex items-center gap-3 mt-4">
              <Link to={`/movie/${m.id}`} className="gold-gradient text-[#060e1a] font-bold px-5 py-2 rounded-lg text-sm hover:opacity-90 transition-opacity">
                Book Tickets
              </Link>
            </div>
          </div>
        </div>

        <button onClick={() => go(idx - 1)} className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button onClick={() => go(idx + 1)} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {movies.slice(0, 5).map((_, i) => (
            <button key={i} onClick={() => go(i)} className={`rounded-full transition-all duration-300 ${i === idx ? 'w-5 h-1.5 bg-[#f0b429]' : 'w-1.5 h-1.5 bg-white/40'}`} />
          ))}
        </div>
      </div>
    </div>
  )
}

function MovieRow({ title, movies, loading, seeAllTab, onTabChange }) {
  const rowRef = useRef(null)
  const scroll = (dir) => rowRef.current?.scrollBy({ left: dir * 880, behavior: 'smooth' })

  return (
    <section className={`${WRAP} mb-10`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">{title}</h2>
        <button onClick={() => onTabChange(seeAllTab)} className="text-sm font-semibold text-[#f0b429] hover:text-[#fcd34d] transition-colors">
          See All ›
        </button>
      </div>

      <div className="relative group/row">
        <button onClick={() => scroll(-1)} className="absolute -left-4 top-1/3 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity shadow-lg hover:bg-[#f0b429] hover:text-black">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>

        <div ref={rowRef} className="flex gap-5 overflow-x-auto hide-scrollbar pb-2">
          {loading
            ? Array(6).fill(0).map((_, i) => (
              <div key={i} className="shrink-0 w-[175px]">
                <div className="aspect-[2/3] skeleton rounded-xl" />
                <div className="h-3 skeleton rounded mt-3 w-3/4" />
                <div className="h-2.5 skeleton rounded mt-2 w-1/2" />
              </div>
            ))
            : movies.slice(0, 12).map(movie => (
              <div key={movie.id} className="shrink-0 w-[175px]">
                <MovieCard movie={movie} />
              </div>
            ))
          }
        </div>

        <button onClick={() => scroll(1)} className="absolute -right-4 top-1/3 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity shadow-lg hover:bg-[#f0b429] hover:text-black">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </section>
  )
}

function TabGrid({ movies, loading }) {
  return (
    <div className={WRAP}>
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {Array(10).fill(0).map((_, i) => (
            <div key={i}>
              <div className="aspect-[2/3] skeleton rounded-xl" />
              <div className="h-3 skeleton rounded mt-3 w-3/4" />
            </div>
          ))}
        </div>
      ) : movies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <p className="text-slate-500 text-sm">No movies found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {movies.map(movie => <MovieCard key={movie.id} movie={movie} />)}
        </div>
      )}
    </div>
  )
}

export default function Home() {
  const { city, setShowSelector } = useCity()
  const [tab, setTab] = useState(null)
  const [movies, setMovies] = useState([])
  const [upcoming, setUpcoming] = useState([])
  const [topRated, setTopRated] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchMovies = useCallback(() => {
    if (!city) { setLoading(false); return }
    setLoading(true)
    axios.get(`/api/movies/bycity?city=${encodeURIComponent(city)}`)
      .then(res => setMovies(Array.isArray(res.data) ? res.data : []))
      .catch(() => setMovies([]))
      .finally(() => setLoading(false))
    axios.get('/api/movies/upcoming').then(res => setUpcoming(Array.isArray(res.data) ? res.data : [])).catch(() => setUpcoming([]))
    axios.get('/api/movies/toprated').then(res => setTopRated(Array.isArray(res.data) ? res.data : [])).catch(() => setTopRated([]))
  }, [city])

  useEffect(() => { fetchMovies() }, [fetchMovies])

  const premieres = movies.filter(m => new Date(m.release_date) >= new Date(Date.now() - 14 * 86400000))

  const tabMovies = { 'Now Showing': movies, 'Coming Soon': upcoming, 'Top Rated': topRated, 'Premieres': premieres }

  if (!city) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-6 px-4">
        <div className="w-20 h-20 rounded-3xl gold-gradient flex items-center justify-center text-4xl shadow-2xl glow-gold">🍿</div>
        <div className="text-center">
          <h2 className="text-2xl font-black text-white">Where are you watching from?</h2>
          <p className="text-slate-500 text-sm mt-2">Select your city to discover movies near you</p>
        </div>
        <button onClick={() => setShowSelector(true)} className="gold-gradient text-[#060e1a] font-bold px-10 py-3.5 rounded-2xl text-sm hover:opacity-90 transition-opacity shadow-xl glow-gold">
          Select Your City
        </button>
      </div>
    )
  }

  return (
    <div className="pb-16">
      <HeroCarousel movies={loading ? [] : movies.filter(m => m.backdrop_path).slice(0, 5)} />

      <div className="mt-8">
        {tab ? (
          <div className={WRAP}>
            <div className="flex items-center gap-3 mb-5">
              <button onClick={() => setTab(null)} className="text-[#4a6fa5] hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <h2 className="text-lg font-bold text-white">{tab}</h2>
            </div>
            <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar">
              {TABS.map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`shrink-0 px-5 py-2 rounded-lg text-sm font-semibold transition-all
                    ${tab === t ? 'gold-gradient text-[#060e1a]' : 'bg-[#0d1b2e] border border-[#1e3a5f] text-slate-400 hover:text-white'}`}>
                  {t}
                </button>
              ))}
            </div>
            <TabGrid movies={tabMovies[tab]} loading={loading} />
          </div>
        ) : (
          <>
            <MovieRow title="Now Showing" movies={movies} loading={loading} seeAllTab="Now Showing" onTabChange={setTab} />
            <MovieRow title="Coming Soon" movies={upcoming} loading={loading} seeAllTab="Coming Soon" onTabChange={setTab} />

            {!loading && (
              <div className={`${WRAP} mb-10`}>
                <div className="rounded-xl overflow-hidden relative h-24 md:h-28 bg-gradient-to-r from-[#1e3a5f] to-[#0d1b2e] border border-[#1e3a5f]/60">
                  <div className="absolute inset-0 flex items-center px-8 gap-6">
                    <div className="text-3xl">🎟️</div>
                    <div>
                      <p className="text-[#f0b429] font-black text-base md:text-xl">Get 20% off on your first booking!</p>
                      <p className="text-slate-400 text-xs mt-0.5">Use code <span className="text-white font-bold">POPCORN20</span> at checkout</p>
                    </div>
                    <button className="ml-auto shrink-0 gold-gradient text-[#060e1a] font-bold px-5 py-2 rounded-lg text-sm hover:opacity-90 transition-opacity hidden md:block">
                      Grab Offer
                    </button>
                  </div>
                </div>
              </div>
            )}

            <MovieRow title="Top Rated" movies={topRated} loading={loading} seeAllTab="Top Rated" onTabChange={setTab} />
            <MovieRow title="Premieres" movies={premieres} loading={loading} seeAllTab="Premieres" onTabChange={setTab} />
          </>
        )}
      </div>
    </div>
  )
}
