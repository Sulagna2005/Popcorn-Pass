import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function Confirmation() {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(`/api/bookings/${bookingId}`)
      .then(res => setBooking(res.data))
      .finally(() => setLoading(false))
  }, [bookingId])

  if (loading) return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="h-64 bg-[#0d1b2e] rounded-2xl animate-pulse" />
    </div>
  )

  if (!booking) return <p className="text-center py-20 text-slate-500">Booking not found.</p>

  const { showtime } = booking

  return (
    <div className="max-w-lg mx-auto px-4 py-10 fade-in">
      {/* Success header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl gold-gradient flex items-center justify-center text-3xl mx-auto mb-4 shadow-xl glow-gold">🎉</div>
        <h1 className="text-2xl font-black text-white">Booking Confirmed!</h1>
        <p className="text-slate-500 text-sm mt-1">Your tickets are ready</p>
      </div>

      {/* Ticket card */}
      <div className="bg-[#0d1b2e] rounded-2xl border border-[#1e3a5f] overflow-hidden">
        {/* Top strip */}
        <div className="px-6 py-4 border-b border-dashed border-[#1e3a5f]">
          <p className="text-[#f0b429] text-xs font-bold uppercase tracking-widest mb-1">Booking ID</p>
          <p className="text-white font-mono text-xl font-black">{booking.bookingId}</p>
        </div>

        {/* Details */}
        <div className="p-6 space-y-5">
          <div>
            <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Movie</p>
            <p className="text-white font-bold text-base">{showtime?.movie?.title}</p>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Cinema</p>
              <p className="text-white text-sm font-medium">{showtime?.cinema?.name}</p>
              <p className="text-slate-500 text-xs mt-0.5">{showtime?.city?.name}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Hall</p>
              <p className="text-white text-sm font-medium">{showtime?.hall?.name}</p>
              <p className="text-slate-500 text-xs mt-0.5">{showtime?.hall?.type}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Date & Time</p>
              <p className="text-white text-sm font-medium">
                {new Date(showtime?.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
              <p className="text-slate-500 text-xs mt-0.5">{showtime?.time}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Seats</p>
              <p className="text-white text-sm font-medium">{booking.seatCodes.join(', ')}</p>
            </div>
          </div>

          <div className="border-t border-[#1e3a5f] pt-4 flex justify-between items-center">
            <p className="text-slate-400 text-sm">Total Paid</p>
            <p className="text-[#f0b429] font-black text-xl">₹{booking.totalAmount}</p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex gap-3">
        <button
          onClick={() => navigate('/')}
          className="flex-1 border border-[#1e3a5f] text-slate-400 hover:text-white hover:border-[#4a6fa5] py-3 rounded-xl text-sm transition-colors"
        >
          Back to Home
        </button>
        <button
          onClick={() => navigate('/bookings')}
          className="flex-1 gold-gradient text-[#060e1a] font-bold py-3 rounded-xl text-sm hover:opacity-90 transition-opacity"
        >
          My Bookings
        </button>
      </div>
    </div>
  )
}
