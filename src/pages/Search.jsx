import { useState } from 'react'
import { Search as SearchIcon, Heart } from 'lucide-react'
import { searchTracks, searchByGenre } from '../services/jamendo'
import { playTrack } from '../services/player'
import { usePlayerStore } from '../store/playerStore'
import { useLibraryStore } from '../store/libraryStore'

const GENRES = [
  { label: 'Hip Hop', value: 'hiphop', color: 'bg-orange-600' },
  { label: 'Rap', value: 'rap', color: 'bg-red-600' },
  { label: 'Pop', value: 'pop', color: 'bg-pink-600' },
  { label: 'Rock', value: 'rock', color: 'bg-yellow-600' },
  { label: 'Jazz', value: 'jazz', color: 'bg-blue-600' },
  { label: 'Electronic', value: 'electronic', color: 'bg-purple-600' },
  { label: 'Classical', value: 'classical', color: 'bg-green-600' },
  { label: 'Lofi', value: 'lofi', color: 'bg-teal-600' },
  { label: 'R&B', value: 'rnb', color: 'bg-indigo-600' },
  { label: 'Reggae', value: 'reggae', color: 'bg-lime-600' },
]

function formatTime(s) {
  if (!s || isNaN(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

function rowClass(isActive) {
  const base = 'grid grid-cols-[auto_1fr_1fr_auto_auto] gap-4 px-4 py-3 rounded-md items-center cursor-pointer transition-colors'
  if (isActive) return base + ' bg-[#282828]'
  return base + ' hover:bg-[#1a1a1a]'
}

function titleClass(isActive) {
  if (isActive) return 'text-sm font-medium truncate text-green-400'
  return 'text-sm font-medium truncate text-white'
}

function heartClass(fav) {
  if (fav) return 'transition-colors text-green-400'
  return 'transition-colors text-[#b3b3b3] hover:text-white'
}

export default function Search() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeGenre, setActiveGenre] = useState(null)

  const { currentTrack, isPlaying } = usePlayerStore()
  const { toggleFavorite, isFavorite } = useLibraryStore()

  async function handleSearch(e) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setError(null)
    setActiveGenre(null)
    try {
      const tracks = await searchTracks(query)
      setResults(tracks)
      if (tracks.length === 0) setError('No results found. Try a different search.')
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleGenre(genre) {
    setActiveGenre(genre.value)
    setLoading(true)
    setError(null)
    setQuery('')
    try {
      const tracks = await searchByGenre(genre.value)
      setResults(tracks)
      if (tracks.length === 0) setError('No results found for this genre.')
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handlePlay(track) {
    playTrack(track)
    usePlayerStore.getState().setTrack(track, results)
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-6">
  <button
    onClick={() => window.history.back()}
    className="w-8 h-8 bg-[#282828] rounded-full flex items-center justify-center hover:bg-[#3a3a3a] transition-colors"
  >
    &#8592;
  </button>
  <h1 className="text-2xl font-bold">Search</h1>
</div>

      <form onSubmit={handleSearch} className="flex gap-3 mb-8 max-w-xl">
        <div className="flex-1 flex items-center bg-[#242424] rounded-full px-4 gap-2">
          <SearchIcon size={16} className="text-[#b3b3b3]" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-white py-2 text-sm outline-none placeholder-[#b3b3b3]"
            placeholder="Artists, songs, albums..."
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-white text-black px-5 py-2 rounded-full text-sm font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          {loading ? '...' : 'Search'}
        </button>
      </form>

      {results.length === 0 && !loading && !error && (
        <div>
          <h2 className="text-lg font-bold mb-4">Browse by Genre</h2>
          <div className="grid grid-cols-5 gap-3 max-w-2xl">
            {GENRES.map(genre => (
              <button
                key={genre.value}
                onClick={() => handleGenre(genre)}
                className={`${genre.color} rounded-lg p-4 text-left font-bold text-sm hover:opacity-90 transition-opacity`}
              >
                {genre.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-3 text-[#b3b3b3] mt-8">
          <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
          Searching...
        </div>
      )}

      {error && <p className="text-[#b3b3b3] mb-4">{error}</p>}

      {results.length > 0 && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">
              {activeGenre ? activeGenre.toUpperCase() : 'Results'} — {results.length} songs
            </h2>
            <button
              onClick={() => { setResults([]); setActiveGenre(null) }}
              className="text-sm text-[#b3b3b3] hover:text-white transition-colors"
            >
              Clear
            </button>
          </div>

          <div className="grid grid-cols-[auto_1fr_1fr_auto_auto] gap-4 px-4 py-2 text-xs text-[#b3b3b3] uppercase tracking-wider border-b border-[#282828] mb-2">
            <span className="w-8">#</span>
            <span>Title</span>
            <span>Album</span>
            <span>♡</span>
            <span>Duration</span>
          </div>

          {results.map((track, i) => {
            const isActive = currentTrack?.id === track.id
            const isCurrentlyPlaying = isActive && isPlaying
            const fav = isFavorite(track.id)
            return (
              <div
                key={track.id + i}
                onClick={() => handlePlay(track)}
                className={rowClass(isActive)}
              >
                <div className="w-8 flex items-center justify-center">
                  {isCurrentlyPlaying
                    ? <span className="text-green-400 text-xs">▶</span>
                    : <span className="text-[#b3b3b3] text-sm">{i + 1}</span>
                  }
                </div>

                <div className="flex items-center gap-3 min-w-0">
                  {track.artwork
                    ? <img src={track.artwork} alt="" className="w-10 h-10 rounded object-cover shrink-0" />
                    : <div className="w-10 h-10 rounded bg-[#282828] shrink-0" />
                  }
                  <div className="min-w-0">
                    <p className={titleClass(isActive)}>{track.title}</p>
                    <p className="text-xs text-[#b3b3b3] truncate">{track.artist}</p>
                  </div>
                </div>

                <p className="text-sm text-[#b3b3b3] truncate">{track.album || '—'}</p>

                <button
                  onClick={e => { e.stopPropagation(); toggleFavorite(track) }}
                  className={heartClass(fav)}
                >
                  <Heart size={16} fill={fav ? 'currentColor' : 'none'} />
                </button>

                <span className="text-sm text-[#b3b3b3]">{formatTime(track.duration)}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}