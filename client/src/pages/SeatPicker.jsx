import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

const SESSION_ID = 'sess_' + Math.random().toString(36).slice(2)

export default function SeatPicker() {
  const { showtimeId } = useParams()
  const navigate = useNavigate()
  const [seats, setSeats] = useState([])
  const [selected, setSelected] = useState([])
  const [loading, setLoading] = useState(true)
  const [locking, setLocking] = useState(false)

  useEffect(() => {
    axios.get(`/api/seats/${showtimeId}`)
      .then(res => setSeats(res.data))
      .finally(() => setLoading(false))
  }, [showtimeId])

  const byCategory = seats.reduce((acc, seat) => {
    const cat = seat.category || 'silver'
    if (!acc[cat]) acc[cat] = {}
    if (!acc[cat][seat.row]) acc[cat][seat.row] = []
    acc[cat][seat.row].push(seat)
    return acc
  }, {})

  const categoryConfig = {
    platinum: { label: 'Platinum', color: 'text-purple-400', available: 'bg-[#1e0a3c] border-purple-600/50 text-purple-300 hover:bg-purple-700/40 hover:border-purple-400' },
    gold:     { label: 'Gold',     color: 'text-[#f0b429]', available: 'bg-[#1a1500] border-[#f0b429]/40 text-[#f0b429]/70 hover:bg-[#f0b429]/20 hover:border-[#f0b429]' },
    silver:   { label: 'Silver',   color: 'text-slate-300', available: 'bg-[#061224] border-[#1e3a5f] text-slate-400 hover:bg-[#1e3a5f]/60 hover:border-[#4a6fa5]' },
  }
  const categoryOrder = ['platinum', 'gold', 'silver']

  // Attach price to config
  categoryOrder.forEach(cat => {
    const s = seats.find(s => s.category === cat)
    categoryConfig[cat].price = s?.price ?? null
  })

  const toggleSeat = (seat) => {
    if (seat.status === 'booked') return
    if (seat.status === 'locked' && !selected.find(s => s._id === seat._id)) return
    setSelected(prev =>
      prev.find(s => s._id === seat._id)
        ? prev.filter(s => s._id !== seat._id)
        : [...prev, seat]
    )
  }

  const totalAmount = selected.reduce((sum, s) => sum + s.price, 0)

  const handleProceed = async () => {
    if (!selected.length) return
    setLocking(true)
    try {
      await axios.post('/api/seats/lock', { showtimeId, seatIds: selected.map(s => s._id), sessionId: SESSION_ID })
      navigate('/checkout', { state: { showtimeId, seats: selected, sessionId: SESSION_ID, totalAmount } })
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to lock seats. Please try again.')
      const res = await axios.get(`/api/seats/${showtimeId}`)
      setSeats(res.data)
      setSelected([])
    } finally {
      setLocking(false)
    }
  }

  if (loading) return (
    <div className="max-w-[1200px] mx-auto px-6 py-12">
      <div className="h-96 bg-[#0d1b2e] rounded-2xl animate-pulse" />
    </div>
  )

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8 pb-32">

      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-8 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back
      </button>

      {/* Screen */}
      <div className="text-center mb-12">
        <div className="w-2/3 mx-auto h-2 rounded-full bg-gradient-to-r from-transparent via-[#f0b429]/60 to-transparent mb-3" />
        <p className="text-slate-500 text-xs uppercase tracking-[0.3em]">Screen</p>
      </div>

      {/* Seat map */}
      <div className="flex flex-col items-center gap-10">
        {categoryOrder.map(cat => {
          const catRows = byCategory[cat]
          if (!catRows) return null
          const cfg = categoryConfig[cat]
          return (
            <div key={cat} className="w-full">
              {/* Category header */}
              <div className="flex items-center gap-4 mb-5 max-w-2xl mx-auto">
                <div className="flex-1 h-px bg-[#1e3a5f]/50" />
                <span className={`text-xs font-bold uppercase tracking-widest ${cfg.color}`}>
                  {cfg.label}{cfg.price ? ` — ₹${cfg.price}` : ''}
                </span>
                <div className="flex-1 h-px bg-[#1e3a5f]/50" />
              </div>

              {/* Rows */}
              <div className="flex flex-col items-center gap-2">
                {Object.entries(catRows).map(([row, rowSeats]) => (
                  <div key={row} className="flex items-center gap-3">
                    <span className="text-slate-600 text-xs w-5 text-right shrink-0 font-mono">{row}</span>
                    <div className="flex gap-1.5">
                      {rowSeats.map(seat => {
                        const isSel = !!selected.find(s => s._id === seat._id)
                        const isBooked = seat.status === 'booked'
                        const isLocked = seat.status === 'locked' && !isSel

                        let cls = 'w-7 h-7 rounded-t-lg text-[9px] font-semibold transition-all duration-150 flex items-center justify-center border '
                        if (isBooked || isLocked) {
                          cls += 'bg-[#0d0d1a] border-[#1e3a5f]/20 text-slate-800 cursor-not-allowed'
                        } else if (isSel) {
                          cls += 'bg-[#f0b429] border-[#f0b429] text-[#060e1a] scale-110 shadow-[0_0_10px_rgba(240,180,41,0.5)] cursor-pointer'
                        } else {
                          cls += cfg.available + ' cursor-pointer'
                        }

                        return (
                          <button
                            key={seat._id}
                            onClick={() => toggleSeat(seat)}
                            disabled={isBooked || isLocked}
                            title={`${seat.seatCode} — ₹${seat.price}`}
                            className={cls}
                          >
                            {seat.seatNumber}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-8 mt-12 text-xs text-slate-500">
        <span className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-t-md bg-[#061224] border border-[#1e3a5f] inline-block" />
          Available
        </span>
        <span className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-t-md bg-[#f0b429] inline-block" />
          Selected
        </span>
        <span className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-t-md bg-[#0d0d1a] border border-[#1e3a5f]/20 inline-block" />
          Sold
        </span>
      </div>

      {/* Sticky pay bar */}
      {selected.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#060e1a]/95 backdrop-blur-xl border-t border-[#1e3a5f]">
          <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between gap-6">
            <div>
              <p className="text-white font-semibold text-sm">
                {selected.length} Ticket{selected.length > 1 ? 's' : ''}
                <span className="text-slate-400 font-normal ml-2 text-xs">{selected.map(s => s.seatCode).join(', ')}</span>
              </p>
              <p className="text-[#f0b429] font-black text-2xl mt-0.5">₹{totalAmount}</p>
            </div>
            <button
              onClick={handleProceed}
              disabled={locking}
              className="gold-gradient text-[#060e1a] font-black px-12 py-3.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 text-sm shadow-xl glow-gold shrink-0"
            >
              {locking ? 'Please wait...' : `Pay ₹${totalAmount}`}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
