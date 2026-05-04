import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react'
import { usePlayerStore } from '../store/playerStore'
import { togglePlay, seekTo, setVolume } from '../services/player'

function formatTime(s) {
  if (!s || isNaN(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

export default function PlayerBar() {
  const { currentTrack, isPlaying, progress, duration, volume, playNext, playPrev, setVolume: storeSetVolume } = usePlayerStore()

  function handleSeek(e) {
    const val = parseFloat(e.target.value)
    seekTo(val)
    usePlayerStore.setState({ progress: val })
  }

  function handleVolume(e) {
    const val = parseFloat(e.target.value)
    storeSetVolume(val)
    setVolume(val)
  }

  return (
    <div className="h-20 bg-[#181818] border-t border-[#282828] flex items-center px-6 gap-6 shrink-0">

      {/* Now playing */}
      <div className="flex items-center gap-3 w-56">
        {currentTrack?.artwork
          ? <img src={currentTrack.artwork} alt="" className="w-12 h-12 rounded object-cover shrink-0" />
          : <div className="w-12 h-12 bg-[#282828] rounded shrink-0" />
        }
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">
            {currentTrack?.title || 'Nothing playing'}
          </p>
          <p className="text-xs text-[#b3b3b3] truncate">
            {currentTrack?.artist || '—'}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex-1 flex flex-col items-center gap-2">
        <div className="flex items-center gap-6">
          <button
            onClick={playPrev}
            className="text-[#b3b3b3] hover:text-white transition-colors"
          >
            <SkipBack size={20} />
          </button>
          <button
            onClick={togglePlay}
            className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform"
          >
            {isPlaying
              ? <Pause size={16} className="text-black" />
              : <Play size={16} className="text-black ml-0.5" />
            }
          </button>
          <button
            onClick={playNext}
            className="text-[#b3b3b3] hover:text-white transition-colors"
          >
            <SkipForward size={20} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-md flex items-center gap-2">
          <span className="text-[10px] text-[#b3b3b3] w-8 text-right">
            {formatTime(progress)}
          </span>
          <input
            type="range"
            min="0"
            max={duration || 30}
            step="0.1"
            value={progress}
            onChange={handleSeek}
            className="flex-1 accent-white cursor-pointer h-1"
          />
          <span className="text-[10px] text-[#b3b3b3] w-8">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Volume */}
      <div className="flex items-center gap-2 w-56 justify-end">
        <Volume2 size={16} className="text-[#b3b3b3]" />
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={handleVolume}
          className="w-24 accent-white cursor-pointer"
        />
      </div>
    </div>
  )
}