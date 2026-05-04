import { useLibraryStore } from '../store/libraryStore'
import { usePlayerStore } from '../store/playerStore'
import { playTrack } from '../services/player'
import { Play, Clock } from 'lucide-react'

function formatTime(s) {
  if (!s || isNaN(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

export default function Home() {
  const { recentlyPlayed } = useLibraryStore()
  const { currentTrack, isPlaying } = usePlayerStore()

  function handlePlay(track) {
    const idx = recentlyPlayed.findIndex(t => t.id === track.id)
    usePlayerStore.setState({ 
        currentTrack: track,
        queue: recentlyPlayed,
        queueIndex: idx === -1 ? 0 : idx
      })
    playTrack(track)
  }

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">{greeting()} 👋</h1>

      {recentlyPlayed.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-6xl mb-4">🎵</p>
          <p className="text-white text-xl font-semibold mb-2">No songs played yet</p>
          <p className="text-[#b3b3b3]">Go to Search and play some songs — they will appear here.</p>
        </div>
      ) : (
        <>
          <h2 className="text-xl font-bold mb-4">Recently Played</h2>
          <div className="flex flex-col gap-1">
            <div className="grid grid-cols-[auto_1fr_1fr_auto_auto] gap-4 px-4 py-2 text-xs text-[#b3b3b3] uppercase tracking-wider border-b border-[#282828] mb-2">
              <span className="w-8">#</span>
              <span>Title</span>
              <span>Album</span>
              <span><Clock size={12} /></span>
              <span>Duration</span>
            </div>

            {recentlyPlayed.map((track, i) => {
              const isActive = currentTrack?.id === track.id
              const isCurrentlyPlaying = isActive && isPlaying
              return (
                <div
                  key={track.id + i}
                  onClick={() => handlePlay(track)}
                  className={isActive ? 'grid grid-cols-[auto_1fr_1fr_auto_auto] gap-4 px-4 py-3 rounded-md items-center cursor-pointer bg-[#282828]' : 'grid grid-cols-[auto_1fr_1fr_auto_auto] gap-4 px-4 py-3 rounded-md items-center cursor-pointer hover:bg-[#1a1a1a]'}
                >
                  <div className="w-8 flex items-center justify-center">
                    {isCurrentlyPlaying
                      ? <span className="text-green-400 text-xs">▶</span>
                      : <span className="text-[#b3b3b3] text-sm">{i + 1}</span>
                    }
                  </div>

                  <div className="flex items-center gap-3 min-w-0">
                    <img src={track.artwork} alt="" className="w-10 h-10 rounded object-cover shrink-0" />
                    <div className="min-w-0">
                      <p className={isActive ? 'text-sm font-medium truncate text-green-400' : 'text-sm font-medium truncate text-white'}>
                        {track.title}
                      </p>
                      <p className="text-xs text-[#b3b3b3] truncate">{track.artist}</p>
                    </div>
                  </div>

                  <p className="text-sm text-[#b3b3b3] truncate">{track.album}</p>

                  <Play size={14} className="text-[#b3b3b3]" />

                  <span className="text-sm text-[#b3b3b3]">{formatTime(track.duration)}</span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}