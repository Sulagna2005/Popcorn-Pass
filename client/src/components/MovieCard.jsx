import { Link } from 'react-router-dom'

const IMG_BASE = 'https://image.tmdb.org/t/p/w500'

export default function MovieCard({ movie }) {
  return (
    <Link to={`/movie/${movie.id}`} className="group block card-hover">
      <div className="relative overflow-hidden rounded-2xl bg-[#0d1b2e] aspect-[2/3] border border-[#1e3a5f]/50 group-hover:border-[#f0b429]/40 transition-colors">
        {movie.poster_path ? (
          <img
            src={`${IMG_BASE}${movie.poster_path}`}
            alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-[#1e3a5f] gap-2">
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z" />
            </svg>
            <span className="text-xs">No Image</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#060e1a] via-[#060e1a]/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

        {/* Rating badge */}
        {movie.vote_average > 0 && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-[#060e1a]/80 backdrop-blur-sm border border-[#f0b429]/30 text-[#f0b429] text-xs font-bold px-2 py-1 rounded-lg">
            <svg className="w-3 h-3 fill-[#f0b429]" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {movie.vote_average.toFixed(1)}
          </div>
        )}

        {/* Book Now overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <div className="gold-gradient text-[#060e1a] text-xs font-bold py-2 rounded-xl text-center shadow-lg">
            Book Now →
          </div>
        </div>
      </div>

      <div className="mt-3 px-1">
        <p className="text-sm font-semibold text-white truncate group-hover:text-[#f0b429] transition-colors">{movie.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-[#4a6fa5]">{movie.release_date?.split('-')[0]}</span>
          {movie.original_language && (
            <span className="text-xs bg-[#1e3a5f]/60 text-[#4a6fa5] px-1.5 py-0.5 rounded uppercase font-medium">
              {movie.original_language}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
