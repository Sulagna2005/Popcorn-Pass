import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { useCity } from '../context/CityContext'
import MovieCard from '../components/MovieCard'

export default function SearchResults() {
  const [searchParams] = useSearchParams()
  const q = searchParams.get('q') || ''
  const { city } = useCity()
  const [movies, setMovies] = useState([])
  const [cinemas, setCinemas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!q) return
    setLoading(true)
    const requests = [axios.get(`/api/movies/search?q=${encodeURIComponent(q)}`)]
    if (city) requests.push(axios.get(`/api/cinemas/search?city=${encodeURIComponent(city)}&q=${encodeURIComponent(q)}`))
    Promise.all(requests)
      .then(([movRes, cinRes]) => {
        setMovies(movRes.data)
        setCinemas(cinRes?.data || [])
      })
      .finally(() => setLoading(false))
  }, [q, city])

  if (!q) return <p className="text-center py-20 text-slate-500">Enter something to search.</p>

  const chainColors = { PVR: 'text-blue-400 bg-blue-400/10 border-blue-400/20', INOX: 'text-purple-400 bg-purple-400/10 border-purple-400/20', Cinepolis: 'text-green-400 bg-green-400/10 border-green-400/20', Miraj: 'text-orange-400 bg-orange-400/10 border-orange-400/20', Carnival: 'text-pink-400 bg-pink-400/10 border-pink-400/20' }

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8 fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white">
          Results for <span className="text-[#f0b429]">"{q}"</span>
        </h1>
        {city && <p className="text-slate-500 text-sm mt-1">Showing results in <span className="text-slate-300">{city}</span></p>}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array(10).fill(0).map((_, i) => (
            <div key={i}>
              <div className="aspect-[2/3] skeleton rounded-2xl" />
              <div className="h-3 skeleton rounded mt-3 w-3/4" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {movies.length > 0 && (
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1 h-5 gold-gradient rounded-full" />
                <h2 className="text-base font-bold text-white">Movies</h2>
                <span className="text-xs bg-[#0d1b2e] border border-[#1e3a5f] text-[#4a6fa5] px-2 py-0.5 rounded-full">{movies.length}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {movies.map(m => <MovieCard key={m.id} movie={m} />)}
              </div>
            </section>
          )}

          {cinemas.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1 h-5 gold-gradient rounded-full" />
                <h2 className="text-base font-bold text-white">Cinemas in {city}</h2>
                <span className="text-xs bg-[#0d1b2e] border border-[#1e3a5f] text-[#4a6fa5] px-2 py-0.5 rounded-full">{cinemas.length}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cinemas.map(c => (
                  <div key={c._id} className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-2xl p-5 hover:border-[#f0b429]/30 transition-colors card-hover">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold truncate">{c.name}</p>
                        <p className="text-[#4a6fa5] text-xs mt-1.5 flex items-center gap-1.5">
                          <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                          </svg>
                          {c.address}
                        </p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-lg border font-semibold shrink-0 ${chainColors[c.chain] || 'text-slate-400 bg-slate-400/10 border-slate-400/20'}`}>
                        {c.chain}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {movies.length === 0 && cinemas.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#0d1b2e] border border-[#1e3a5f] flex items-center justify-center text-2xl">🔍</div>
              <p className="text-slate-500 text-sm">No results found for "{q}"</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
