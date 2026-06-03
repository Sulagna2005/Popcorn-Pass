import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

export default function MyBookings() {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    axios.get('/api/bookings/my', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setBookings(res.data))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false))
  }, [token])

  if (!user) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <p className="text-slate-400">Please sign in to view your bookings.</p>
      <button onClick={() => navigate('/login')} className="gold-gradient text-[#060e1a] font-bold px-8 py-2.5 rounded-xl text-sm">
        Sign In
      </button>
    </div>
  )

  return (
    <div className="max-w-[1200px] mx-auto px-6 lg:px-10 py-10">
      <h1 className="text-2xl font-black text-white mb-8">My Bookings</h1>

      {loading ? (
        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => <div key={i} className="h-28 bg-[#0d1b2e] rounded-2xl animate-pulse" />)}
        </div>
      ) : bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="text-5xl">🎬</div>
          <p className="text-slate-400 text-lg">No bookings yet</p>
          <button onClick={() => navigate('/')} className="gold-gradient text-[#060e1a] font-bold px-8 py-2.5 rounded-xl text-sm">
            Browse Movies
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(b => {
            const st = b.showtime
            return (
              <div key={b._id} onClick={() => navigate(`/confirmation/${b.bookingId}`)}
                className="bg-[#0d1b2e] border border-[#1e3a5f]/60 rounded-2xl p-5 flex items-center justify-between gap-4 cursor-pointer hover:border-[#f0b429]/40 transition-colors">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center text-[#060e1a] font-black text-lg shrink-0">
                    🎟
                  </div>
                  <div>
                    <p className="text-white font-bold">{st?.movie?.title}</p>
                    <p className="text-slate-400 text-sm mt-0.5">
                      {st?.cinema?.name} &middot; {st?.city?.name}
                    </p>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {st?.date} &middot; {st?.time} &middot; {b.seatCodes.join(', ')}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[#f0b429] font-black text-lg">₹{b.totalAmount}</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    b.status === 'confirmed' ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'
                  }`}>
                    {b.status}
                  </span>
                  <p className="text-slate-600 text-xs mt-1">{b.bookingId}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
