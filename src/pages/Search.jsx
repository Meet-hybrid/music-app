import { useState } from 'react'
import { Search as SearchIcon, Play, Heart } from 'lucide-react'
import { searchTracks } from '../services/jamendo'
import { playTrack } from '../services/player'
import { usePlayerStore } from '../store/playerStore'
import { useLibraryStore } from '../store/libraryStore'

function formatTime(s) {
  if (!s || isNaN(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

export default function Search() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const { currentTrack, isPlaying } = usePlayerStore()
  const { toggleFavorite, isFavorite } = useLibraryStore()

  async function handleSearch(e) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setError(null)
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

  function handlePlay(track) {
    playTrack(track, results)
    usePlayerStore.getState().setTrack(track, results)
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Search</h1>

      <form onSubmit={handleSearch} className="flex gap-3 mb-8 max-w-xl">
        <div className="flex-1 flex items-center bg-[#242424] rounded-full px-4 gap-2">
          <SearchIcon size={16} className="text-[#b3b3b3]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
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

      {error && <p className="text-[#b3b3b3] mb-4">{error}</p>}

      {results.length > 0 && (
        <div className="flex flex-col gap-1">
          <div className="grid grid-cols-[auto_1fr_1fr_auto_auto] gap-4 px-4 py-2 text-xs text-[#b3b3b3] uppercase tracking-wider border-b border-[#282828] mb-2">
            <span className="w-8">#</span>
            <span>Title</span>
            <span>Album</span>
            <span>♡</span>
            <span>Duration</span>
          </div>

          {results.map((track, i) => {
            const isCurrentlyPlaying = currentTrack?.id === track.id && isPlaying
            return (
              <div
                key={track.id}
                onClick={() => handlePlay(track)}
                className={`grid grid-cols-[auto_1fr_1fr_auto_auto] gap-4 px-4 py-3 rounded-md items-center cursor-pointer group transition-colors ${
                  currentTrack?.id === track.id
                    ? 'bg-[#282828]'
                    : 'hover:bg-[#1a1a1a]'
                }`}
              >
                <span className="text-sm text-[#b3b3b3]">{i + 1}</span>
                <div className="flex items-center gap-2 min-w-0">
                  {isCurrentlyPlaying && (
                    <Play size={14} className="text-green-500" />
                  )}
                  <span className="text-white truncate">{track.title}</span>
                </div>
                <span className="text-[#b3b3b3] truncate">
                  {track.album_name || '-'}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleFavorite(track.id)
                  }}
                  className="hover:text-red-500 transition-colors"
                >
                  <Heart
                    size={18}
                    className={
                      isFavorite(track.id)
                        ? 'fill-red-500 text-red-500'
                        : 'text-[#b3b3b3]'
                    }
                  />
                </button>
                <span className="text-sm text-[#b3b3b3] text-right">
                  {formatTime(track.duration)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
