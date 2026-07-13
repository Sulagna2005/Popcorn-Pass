import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useCity } from '../context/CityContext'

const IMG_BASE = 'https://image.tmdb.org/t/p/original'
const IMG_W500 = 'https://image.tmdb.org/t/p/w500'

export default function MovieDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { city, setShowSelector } = useCity()
  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(true)

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  })
  const [date, setDate] = useState(dates[0])

  useEffect(() => {
    axios.get(`/api/movies/${id}`)
      .then(res => setMovie(res.data))
      .finally(() => setLoading(false))
  }, [id])

  const handleBook = () => {
    if (!city) return setShowSelector(true)
    navigate(`/movie/${id}/showtimes?city=${encodeURIComponent(city)}&date=${date}&title=${encodeURIComponent(movie?.title || '')}`)
  }

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-96 bg-[#0d1b2e] rounded-2xl" />
    </div>
  )

  if (!movie) return <p className="text-center py-20 text-gray-500">Movie not found.</p>

  return (
    <div>
      {/* Backdrop */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        {movie.backdrop_path && (
          <img src={`${IMG_BASE}${movie.backdrop_path}`} alt="" className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#060e1a] via-[#060e1a]/60 to-transparent" />
      </div>

      <div className="max-w-[1200px] mx-auto px-6 lg:px-10 -mt-32 relative z-10 pb-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="w-40 md:w-56 shrink-0">
            <img
              src={`${IMG_W500}${movie.poster_path}`}
              alt={movie.title}
              className="w-full rounded-xl shadow-2xl"
            />
          </div>

          {/* Info */}
          <div className="flex-1 pt-4 md:pt-16">
            <h1 className="text-3xl md:text-4xl font-bold text-white">{movie.title}</h1>
            <div className="flex flex-wrap gap-3 mt-3 text-sm text-slate-400">
              <span className="text-[#f0b429] font-semibold">⭐ {movie.vote_average?.toFixed(1)}</span>
              <span>{movie.release_date?.split('-')[0]}</span>
              {movie.runtime && <span>{movie.runtime} min</span>}
              {movie.genres?.map(g => (
                <span key={g.id} className="bg-[#0d1b2e] border border-[#1e3a5f] px-2 py-0.5 rounded-lg text-xs">{g.name}</span>
              ))}
            </div>
            <p className="mt-4 text-slate-400 text-sm leading-relaxed max-w-2xl">{movie.overview}</p>

            {/* Cast */}
            {movie.cast?.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Cast</p>
                <p className="text-sm text-slate-300">{movie.cast.map(c => c.name).join(', ')}</p>
              </div>
            )}

            {/* Booking controls */}
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => setShowSelector(true)}
                className="flex items-center gap-2 bg-[#0d1b2e] border border-[#1e3a5f] text-white rounded-xl px-4 py-2.5 text-sm hover:border-[#f0b429] transition-colors"
              >
                <svg className="w-3.5 h-3.5 text-[#f0b429]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                {city || 'Select City'}
              </button>

              <select
                value={date}
                onChange={e => setDate(e.target.value)}
                className="bg-[#0d1b2e] border border-[#1e3a5f] text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#f0b429] transition-colors"
              >
                {dates.map(d => (
                  <option key={d} value={d}>
                    {new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </option>
                ))}
              </select>

              <button
                onClick={handleBook}
                className="gold-gradient text-[#060e1a] font-bold px-8 py-2.5 rounded-xl hover:opacity-90 transition-opacity text-sm shadow-lg glow-gold"
              >
                Book Tickets
              </button>
            </div>
          </div>
        </div>

        {/* Trailer */}
        {movie.trailer && (
          <div className="mt-10">
            <h2 className="text-base font-bold text-white mb-4">Trailer</h2>
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-[#1e3a5f]">
              <iframe
                src={`https://www.youtube.com/embed/${movie.trailer.key}`}
                title="Trailer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
