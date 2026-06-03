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
      <div className="h-64 bg-[#1a1a1a] rounded-xl animate-pulse" />
    </div>
  )

  if (!booking) return <p className="text-center py-20 text-gray-500">Booking not found.</p>

  const { showtime } = booking

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      {/* Success header */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🎉</div>
        <h1 className="text-2xl font-bold text-white">Booking Confirmed!</h1>
        <p className="text-gray-500 text-sm mt-1">Your tickets are ready</p>
      </div>

      {/* Ticket card */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] overflow-hidden">
        {/* Top section */}
        <div className="p-6 border-b border-dashed border-[#2a2a2a]">
          <p className="text-[#f5c518] text-xs font-semibold uppercase tracking-wider mb-1">Booking ID</p>
          <p className="text-white font-mono text-xl font-bold">{booking.bookingId}</p>
        </div>

        {/* Details */}
        <div className="p-6 space-y-4">
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Movie</p>
            <p className="text-white font-semibold">{showtime?.movie?.title}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Cinema</p>
              <p className="text-white text-sm">{showtime?.cinema?.name}</p>
              <p className="text-gray-500 text-xs">{showtime?.city?.name}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Hall</p>
              <p className="text-white text-sm">{showtime?.hall?.name}</p>
              <p className="text-gray-500 text-xs">{showtime?.hall?.type}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Date & Time</p>
              <p className="text-white text-sm">
                {new Date(showtime?.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
              <p className="text-gray-500 text-xs">{showtime?.time}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Seats</p>
              <p className="text-white text-sm">{booking.seatCodes.join(', ')}</p>
            </div>
          </div>
          <div className="border-t border-[#2a2a2a] pt-4 flex justify-between">
            <p className="text-gray-400 text-sm">Total Paid</p>
            <p className="text-[#f5c518] font-bold text-lg">₹{booking.totalAmount}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={() => navigate('/')}
          className="flex-1 border border-[#2a2a2a] text-gray-400 hover:text-white py-3 rounded-lg text-sm transition-colors"
        >
          Back to Home
        </button>
        <button
          className="flex-1 bg-[#f5c518] text-black font-bold py-3 rounded-lg hover:bg-[#e6b800] transition-colors text-sm"
          onClick={() => alert('Ticket download coming soon — Java service in Phase 4!')}
        >
          Download Ticket
        </button>
      </div>
    </div>
  )
}
