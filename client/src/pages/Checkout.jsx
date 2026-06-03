import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

function loadRazorpay() {
  return new Promise(resolve => {
    if (window.Razorpay) return resolve(true)
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload = () => resolve(true)
    s.onerror = () => resolve(false)
    document.body.appendChild(s)
  })
}

export default function Checkout() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { user, token } = useAuth()
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
  })
  const [loading, setLoading] = useState(false)

  if (!state) return <p className="text-center py-20 text-slate-500">No booking in progress.</p>

  const { showtimeId, seats, sessionId, totalAmount } = state

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handlePay = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const loaded = await loadRazorpay()
      if (!loaded) { alert('Failed to load payment gateway. Please try again.'); setLoading(false); return }

      // Create Razorpay order
      const { data } = await axios.post('/api/bookings/create-order', { totalAmount })

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'PopcornPass',
        description: `${seats.length} ticket${seats.length > 1 ? 's' : ''}`,
        order_id: data.orderId,
        prefill: { name: form.name, email: form.email, contact: form.phone },
        theme: { color: '#f0b429' },
        handler: async (response) => {
          try {
            const headers = token ? { Authorization: `Bearer ${token}` } : {}
            const res = await axios.post('/api/bookings', {
              showtimeId,
              seatIds: seats.map(s => s._id),
              sessionId,
              totalAmount,
              user: { name: form.name, email: form.email, phone: form.phone },
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }, { headers })
            navigate(`/confirmation/${res.data.bookingId}`)
          } catch (err) {
            alert(err.response?.data?.error || 'Booking failed after payment. Contact support.')
          } finally {
            setLoading(false)
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      }

      new window.Razorpay(options).open()
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.detail || err.message || 'Could not initiate payment.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-8 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back
        </button>

        <h1 className="text-2xl font-black text-white mb-8 text-center">Checkout</h1>

        {/* Order Summary */}
        <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-2xl p-6 mb-6">
          <h2 className="text-[#f0b429] font-bold text-xs uppercase tracking-widest mb-4">Order Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Seats</span>
              <span className="text-white font-medium">{seats.map(s => s.seatCode).join(', ')}</span>
            </div>
            {['silver', 'gold', 'platinum'].map(cat => {
              const catSeats = seats.filter(s => s.category === cat)
              if (!catSeats.length) return null
              return (
                <div key={cat} className="flex justify-between">
                  <span className="text-slate-400 capitalize">{cat} × {catSeats.length}</span>
                  <span className="text-slate-300">₹{catSeats[0].price} each</span>
                </div>
              )
            })}
            <div className="border-t border-[#1e3a5f] pt-3 flex justify-between">
              <span className="text-white font-bold">Total</span>
              <span className="text-[#f0b429] font-black text-xl">₹{totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Details form */}
        <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-2xl p-6">
          <h2 className="text-[#f0b429] font-bold text-xs uppercase tracking-widest mb-6">Your Details</h2>
          <form onSubmit={handlePay} className="space-y-5">
            {[
              { label: 'Full Name', name: 'name', type: 'text', placeholder: 'Your full name' },
              { label: 'Email', name: 'email', type: 'email', placeholder: 'your@email.com' },
              { label: 'Phone', name: 'phone', type: 'tel', placeholder: '10-digit mobile number' },
            ].map(f => (
              <div key={f.name}>
                <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-2">{f.label}</label>
                <input
                  name={f.name}
                  type={f.type}
                  value={form[f.name]}
                  onChange={handleChange}
                  required
                  placeholder={f.placeholder}
                  className="w-full bg-[#060e1a] border border-[#1e3a5f] rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-[#f0b429] transition-colors"
                />
              </div>
            ))}

            <p className="text-xs text-slate-600 text-center pt-1">
              🔒 Seat lock expires in 10 minutes. Complete payment before then.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full gold-gradient text-[#060e1a] font-black py-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 text-sm shadow-lg glow-gold"
            >
              {loading ? 'Opening payment...' : `Pay ₹${totalAmount}`}
            </button>
          </form>
        </div>

        {/* Test mode hint */}
        <div className="mt-4 bg-[#0d1b2e]/60 border border-[#1e3a5f]/40 rounded-xl px-4 py-3 text-center">
          <p className="text-slate-500 text-xs">Test mode — use card <span className="text-slate-300 font-mono">4111 1111 1111 1111</span>, any future expiry, any CVV</p>
        </div>

      </div>
    </div>
  )
}
