import { Routes, Route } from 'react-router-dom'
import { CityProvider } from './context/CityContext'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import MovieDetail from './pages/MovieDetail'
import Showtimes from './pages/Showtimes'
import SeatPicker from './pages/SeatPicker'
import Checkout from './pages/Checkout'
import Confirmation from './pages/Confirmation'
import Login from './pages/Login'
import MyBookings from './pages/MyBookings'
import SearchResults from './pages/SearchResults'

export default function App() {
  return (
    <AuthProvider>
      <CityProvider>
        <div className="min-h-screen bg-[#0f0f0f]">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/movie/:id" element={<MovieDetail />} />
            <Route path="/movie/:id/showtimes" element={<Showtimes />} />
            <Route path="/booking/:showtimeId" element={<SeatPicker />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/confirmation/:bookingId" element={<Confirmation />} />
            <Route path="/bookings" element={<MyBookings />} />
          </Routes>
        </div>
      </CityProvider>
    </AuthProvider>
  )
}
