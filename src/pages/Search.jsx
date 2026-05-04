import { useState, useRef } from 'react'
import { Search as SearchIcon, Heart } from 'lucide-react'
import { searchTracks, searchByGenre } from '../services/jamendo'
import { playTrack } from '../services/player'
import { usePlayerStore } from '../store/playerStore'
import { useLibraryStore } from '../store/libraryStore'

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
  const [activeGenre, setActiveGenre] = useState(null)
  const resultsRef = useRef([])

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
      resultsRef.current = tracks
      if (tracks.length === 0) setError('No results found.')
    } catch (err) {
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
    } catch (err) {
      setError('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  function handlePlay(track) {
    const current = resultsRef.current
    const idx = current.findIndex(t => t.id === track.id)
    usePlayerStore.setState({
      currentTrack: track,
      queue: current,
      queueIndex: idx === -1 ? 0 : idx
    })
    playTrack(track)
  }

  const isActive = (track) => currentTrack?.id === track.id
  const isCurrentlyPlaying = (track) => isActive(track) && isPlaying

  return (
    <div style={{ padding: '32px', color: 'white' }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button
          onClick={() => window.history.back()}
          style={{ background: '#282828', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '18px' }}
        >
          &#8592;
        </button>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Search</h1>
      </div>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', marginBottom: '32px', maxWidth: '500px' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#242424', borderRadius: '24px', padding: '0 16px', gap: '8px' }}>
          <SearchIcon size={16} color="#b3b3b3" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', padding: '8px 0', fontSize: '14px', outline: 'none' }}
            placeholder="Artists, songs, albums..."
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{ background: 'white', color: 'black', border: 'none', borderRadius: '24px', padding: '8px 20px', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}
        >
          {loading ? '...' : 'Search'}
        </button>
      </form>

      {results.length === 0 && !loading && !error && (
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Browse by Genre</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', maxWidth: '600px' }}>
            {GENRES.map(genre => (
              <button
                key={genre.value}
                onClick={() => handleGenre(genre)}
                style={{ background: genre.color, border: 'none', borderRadius: '8px', padding: '20px 12px', color: 'white', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', textAlign: 'left' }}
              >
                {genre.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <p style={{ color: '#b3b3b3', marginTop: '32px' }}>Searching...</p>
      )}

      {error && <p style={{ color: '#b3b3b3', marginBottom: '16px' }}>{error}</p>}

      {results.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>
              {activeGenre ? activeGenre.toUpperCase() : 'Results'} — {results.length} songs
            </h2>
            <button
              onClick={() => { setResults([]); setActiveGenre(null); resultsRef.current = [] }}
              style={{ background: 'none', border: 'none', color: '#b3b3b3', cursor: 'pointer', fontSize: '13px' }}
            >
              Clear
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr 30px 60px', gap: '16px', padding: '8px 16px', borderBottom: '1px solid #282828', marginBottom: '8px', fontSize: '11px', color: '#b3b3b3', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            <span>#</span>
            <span>Title</span>
            <span>Album</span>
            <span>♡</span>
            <span>Time</span>
          </div>

          {results.map((track, i) => (
            <div
              key={track.id}
              onClick={() => handlePlay(track)}
              style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr 30px 60px', gap: '16px', padding: '10px 16px', borderRadius: '6px', alignItems: 'center', cursor: 'pointer', background: isActive(track) ? '#282828' : 'transparent' }}
              onMouseEnter={e => { if (!isActive(track)) e.currentTarget.style.background = '#1a1a1a' }}
              onMouseLeave={e => { if (!isActive(track)) e.currentTarget.style.background = 'transparent' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isCurrentlyPlaying(track)
                  ? <span style={{ color: '#1db954', fontSize: '12px' }}>▶</span>
                  : <span style={{ color: '#b3b3b3', fontSize: '13px' }}>{i + 1}</span>
                }
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                {track.artwork
                  ? <img src={track.artwork} alt="" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover', flexShrink: 0 }} />
                  : <div style={{ width: '40px', height: '40px', borderRadius: '4px', background: '#282828', flexShrink: 0 }} />
                }
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: isActive(track) ? '#1db954' : 'white' }}>
                    {track.title}
                  </p>
                  <p style={{ fontSize: '11px', color: '#b3b3b3', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {track.artist}
                  </p>
                </div>
              </div>

              <p style={{ fontSize: '13px', color: '#b3b3b3', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {track.album || '—'}
              </p>

              <button
                onClick={e => { e.stopPropagation(); toggleFavorite(track) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: isFavorite(track.id) ? '#1db954' : '#b3b3b3', padding: 0 }}
              >
                <Heart size={15} fill={isFavorite(track.id) ? 'currentColor' : 'none'} />
              </button>

              <span style={{ fontSize: '13px', color: '#b3b3b3' }}>{formatTime(track.duration)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}