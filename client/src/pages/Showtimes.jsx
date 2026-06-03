import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function Showtimes() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const city = searchParams.get('city')
  const date = searchParams.get('date')
  const titleFromUrl = searchParams.get('title') || ''

  const [grouped, setGrouped] = useState([])
  const [loading, setLoading] = useState(true)
  const [movieTitle, setMovieTitle] = useState(titleFromUrl)

  useEffect(() => {
    axios.get(`/api/showtimes?movieId=${id}&city=${encodeURIComponent(city)}&date=${date}`)
      .then(res => setGrouped(res.data))
      .finally(() => setLoading(false))
  }, [id, city, date])

  const hallTypeColor = { IMAX: 'text-blue-400', '4DX': 'text-purple-400', Gold: 'text-[#f0b429]', Standard: 'text-slate-400' }

  return (
    <div className="max-w-[1200px] mx-auto px-6 lg:px-10 py-8">
      <div className="mb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-4 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back
        </button>
        <h1 className="text-2xl font-black text-white">{movieTitle}</h1>
        <p className="text-slate-400 text-sm mt-1">
          {city} &middot; {new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => <div key={i} className="h-32 bg-[#0d1b2e] rounded-xl animate-pulse" />)}
        </div>
      ) : grouped.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="text-4xl">🎬</div>
          <p className="text-slate-500">No showtimes available for this selection.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map(({ cinema, showtimes }) => (
            <div key={cinema._id} className="bg-[#0d1b2e] rounded-xl p-5 border border-[#1e3a5f]/60">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-white font-bold">{cinema.name}</h2>
                  <p className="text-slate-500 text-xs mt-0.5">{cinema.address}</p>
                </div>
                <span className="text-xs bg-[#1e3a5f] text-[#f0b429] px-2 py-0.5 rounded font-medium">{cinema.chain}</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {showtimes.map(st => (
                  <button
                    key={st._id}
                    onClick={() => navigate(`/booking/${st._id}`)}
                    disabled={st.availableSeats === 0}
                    className={`flex flex-col items-center border rounded-lg px-4 py-2.5 text-sm transition-all
                      ${st.availableSeats === 0
                        ? 'border-[#1e3a5f]/30 text-slate-600 cursor-not-allowed'
                        : 'border-[#1e3a5f] hover:border-[#f0b429] text-white hover:text-[#f0b429] hover:bg-[#1e3a5f]/20'
                      }`}
                  >
                    <span className="font-bold">{st.time}</span>
                    <span className={`text-xs mt-0.5 ${hallTypeColor[st.hall?.type] || 'text-slate-400'}`}>{st.hall?.type}</span>
                    <span className="text-xs text-slate-500 mt-0.5">
                      {st.availableSeats === 0 ? 'Sold Out' : `${st.availableSeats} seats`}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
