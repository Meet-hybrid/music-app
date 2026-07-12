import { useState, useRef } from 'react'
import { Search as SearchIcon, Heart, ListPlus, Plus } from 'lucide-react'
import { searchTracks, searchByGenre } from '../services/jamendo'
import { playTrack } from '../services/player'
import { usePlayerStore } from '../store/playerStore'
import { useLibraryStore } from '../store/libraryStore'
import { formatTime } from '../utils/format'

const GENRES = [
  { label: 'Hip Hop', value: 'hiphop', color: '#e67e22' },
  { label: 'Rap', value: 'rap', color: '#c0392b' },
  { label: 'Pop', value: 'pop', color: '#e91e8c' },
  { label: 'Rock', value: 'rock', color: '#d4a017' },
  { label: 'Jazz', value: 'jazz', color: '#2980b9' },
  { label: 'Electronic', value: 'electronic', color: '#8e44ad' },
  { label: 'Classical', value: 'classical', color: '#27ae60' },
  { label: 'Lofi', value: 'lofi', color: '#16a085' },
  { label: 'R&B', value: 'rnb', color: '#3949ab' },
  { label: 'Reggae', value: 'reggae', color: '#558b2f' },
]

export default function Search() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [playbackError, setPlaybackError] = useState(null)
  const [activeGenre, setActiveGenre] = useState(null)
  const [menuFor, setMenuFor] = useState(null)
  const [newName, setNewName] = useState('')
  const resultsRef = useRef([])

  const { currentTrack, isPlaying } = usePlayerStore()
  const { toggleFavorite, isFavorite, playlists, addToPlaylist, createPlaylist } = useLibraryStore()

  async function handleSearch(e) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setError(null)
    setActiveGenre(null)
    try {
      const tracks = await searchTracks(query)
      setResults(tracks)
      resultsRef.current = tracks
      if (tracks.length === 0) setError('No results found.')
    } catch {
      setError('Something went wrong.')
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
      resultsRef.current = tracks
      if (tracks.length === 0) setError('No results for this genre.')
    } catch {
      setError('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  function handlePlay(track) {
    setPlaybackError(null)
    const current = resultsRef.current
    const idx = current.findIndex(t => t.id === track.id)
    usePlayerStore.setState({
      currentTrack: track,
      queue: current,
      queueIndex: idx === -1 ? 0 : idx
    })
    try {
      playTrack(track)
    } catch (err) {
      console.error('Playback error:', err)
      setPlaybackError('Unable to play this track. It may not be supported by your browser.')
      setTimeout(() => setPlaybackError(null), 5000)
    }
  }

  function openMenu(id) {
    setMenuFor(menuFor === id ? null : id)
    setNewName('')
  }

  function handleAddToPlaylist(playlistId, track) {
    addToPlaylist(playlistId, track)
    setMenuFor(null)
  }

  function handleCreateAndAdd(track) {
    const name = newName.trim()
    if (!name) return
    const playlist = createPlaylist(name)
    addToPlaylist(playlist.id, track)
    setMenuFor(null)
    setNewName('')
  }

  const isActive = (track) => currentTrack?.id === track.id
  const isCurrentlyPlaying = (track) => isActive(track) && isPlaying

  return (
    <div className="p-8 text-white">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => window.history.back()}
          className="w-8 h-8 rounded-full bg-[#282828] text-white cursor-pointer text-lg hover:bg-[#383838]"
        >
          &#8592;
        </button>
        <h1 className="text-2xl font-bold">Search</h1>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3 mb-8 max-w-xl">
        <div className="flex flex-1 items-center bg-[#242424] rounded-full px-4 gap-2">
          <SearchIcon size={16} className="text-[#b3b3b3]" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none text-white py-2 text-sm outline-none placeholder:text-[#b3b3b3]"
            placeholder="Artists, songs, albums..."
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-white text-black rounded-full px-5 py-2 font-bold text-sm cursor-pointer hover:scale-105 transition-transform disabled:opacity-60"
        >
          {loading ? '...' : 'Search'}
        </button>
      </form>

      {results.length === 0 && !loading && !error && (
        <div>
          <h2 className="text-lg font-bold mb-4">Browse by Genre</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-w-3xl">
            {GENRES.map(genre => (
              <button
                key={genre.value}
                onClick={() => handleGenre(genre)}
                style={{ background: genre.color }}
                className="border-none rounded-lg py-5 px-3 text-white font-bold text-sm cursor-pointer text-left hover:opacity-90"
              >
                {genre.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && <p className="text-[#b3b3b3] mt-8">Searching...</p>}

      {error && <p className="text-[#b3b3b3] mb-4">{error}</p>}

      {playbackError && (
        <div className="bg-[#ff4444] text-white p-3 rounded-md mb-4">
          {playbackError}
        </div>
      )}

      {results.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">
              {activeGenre ? activeGenre.toUpperCase() : 'Results'} — {results.length} songs
            </h2>
            <button
              onClick={() => { setResults([]); setActiveGenre(null); resultsRef.current = [] }}
              className="bg-none border-none text-[#b3b3b3] cursor-pointer text-sm hover:text-white"
            >
              Clear
            </button>
          </div>

          <div className="grid grid-cols-[40px_1fr_1fr_30px_36px_60px] gap-4 px-4 py-2 border-b border-[#282828] mb-2 text-[11px] text-[#b3b3b3] uppercase tracking-wider">
            <span>#</span>
            <span>Title</span>
            <span>Album</span>
            <span>&#9825;</span>
            <span></span>
            <span>Time</span>
          </div>

          {results.map((track, i) => (
            <div
              key={track.id}
              onClick={() => handlePlay(track)}
              className={`grid grid-cols-[40px_1fr_1fr_30px_36px_60px] gap-4 px-4 py-2.5 rounded-md items-center cursor-pointer ${isActive(track) ? 'bg-[#282828]' : 'hover:bg-[#1a1a1a]'}`}
            >
              <div className="flex items-center justify-center">
                {isCurrentlyPlaying(track)
                  ? <span className="text-green-400 text-xs">&#9654;</span>
                  : <span className="text-[#b3b3b3] text-sm">{i + 1}</span>
                }
              </div>

              <div className="flex items-center gap-3 min-w-0">
                {track.artwork
                  ? <img src={track.artwork} alt="" className="w-10 h-10 rounded object-cover shrink-0" />
                  : <div className="w-10 h-10 rounded bg-[#282828] shrink-0" />
                }
                <div className="min-w-0">
                  <p className={`text-sm font-medium truncate ${isActive(track) ? 'text-green-400' : 'text-white'}`}>
                    {track.title}
                  </p>
                  <p className="text-xs text-[#b3b3b3] truncate">{track.artist}</p>
                </div>
              </div>

              <p className="text-sm text-[#b3b3b3] truncate">{track.album || '—'}</p>

              <button
                onClick={e => { e.stopPropagation(); toggleFavorite(track) }}
                className={`bg-none border-none cursor-pointer p-0 ${isFavorite(track.id) ? 'text-green-400' : 'text-[#b3b3b3]'}`}
              >
                <Heart size={15} fill={isFavorite(track.id) ? 'currentColor' : 'none'} />
              </button>

              <div className="relative">
                <button
                  onClick={e => { e.stopPropagation(); openMenu(track.id) }}
                  className={`bg-none border-none cursor-pointer p-0 ${menuFor === track.id ? 'text-green-400' : 'text-[#b3b3b3]'}`}
                  title="Add to playlist"
                >
                  <ListPlus size={15} />
                </button>

                {menuFor === track.id && (
                  <div
                    onClick={e => e.stopPropagation()}
                    className="absolute top-7 right-0 z-10 bg-[#282828] border border-[#383838] rounded-lg p-2 w-52 shadow-xl"
                  >
                    {playlists.length === 0 && (
                      <p className="text-[#b3b3b3] text-xs mb-2">No playlists yet.</p>
                    )}
                    {playlists.map(p => (
                      <button
                        key={p.id}
                        onClick={() => handleAddToPlaylist(p.id, track)}
                        className="block w-full text-left bg-none border-none text-white text-sm py-1.5 px-2 rounded hover:bg-[#383838]"
                      >
                        {p.name}
                      </button>
                    ))}
                    <form
                      onSubmit={e => { e.preventDefault(); handleCreateAndAdd(track) }}
                      className="flex gap-1 mt-2 border-t border-[#383838] pt-2"
                    >
                      <input
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        placeholder="New playlist"
                        className="flex-1 min-w-0 bg-[#1a1a1a] border border-[#383838] rounded text-white text-xs py-1 px-2 outline-none"
                      />
                      <button
                        type="submit"
                        className="bg-green-400 border-none rounded text-black cursor-pointer py-1 px-2"
                      >
                        <Plus size={14} />
                      </button>
                    </form>
                  </div>
                )}
              </div>

              <span className="text-sm text-[#b3b3b3]">{formatTime(track.duration)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
