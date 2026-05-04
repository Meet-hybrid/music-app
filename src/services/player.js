import { Howl } from 'howler'
import { usePlayerStore } from '../store/playerStore'
import { useLibraryStore } from '../store/libraryStore'

let sound = null

// Check if browser supports audio formats
function canPlayAudioType(type) {
  const audio = document.createElement('audio')
  return !!(audio.canPlayType && audio.canPlayType(type).replace(/no/, ''))
}

export function playTrack(track) {
  const store = usePlayerStore.getState()

  if (sound) {
    sound.stop()
    sound.unload()
  }

  // Build src array with available formats, prioritizing common browser-supported formats
  const srcArray = []
  if (track.oggUrl && track.oggUrl !== track.streamUrl) {
    srcArray.push(track.oggUrl) // OGG is well supported
  }
  if (track.mp3Url) {
    srcArray.push(track.mp3Url) // MP3 is widely supported
  }
  if (track.streamUrl) {
    srcArray.push(track.streamUrl) // Fallback
  }

  // If no sources, skip
  if (srcArray.length === 0) {
    console.error('No audio sources available for track:', track.title)
    return
  }

  console.log('Playing track:', track.title, 'with sources:', srcArray)

  sound = new Howl({
    src: srcArray,
    html5: false, // Use Web Audio API instead of HTML5 Audio for better codec support
    volume: store.volume,
    format: ['mp3', 'ogg', 'aac', 'wav'], // Explicitly specify supported formats
    onplay: () => {
      usePlayerStore.setState({ isPlaying: true })
      requestAnimationFrame(updateProgress)
    },
    onpause: () => {
      usePlayerStore.setState({ isPlaying: false })
    },
    onstop: () => {
      usePlayerStore.setState({ isPlaying: false, progress: 0 })
    },
    onend: () => {
      usePlayerStore.setState({ isPlaying: false, progress: 0 })
      const { queue, queueIndex } = usePlayerStore.getState()
      console.log('Song ended. Queue length:', queue.length, 'Current index:', queueIndex)
      const nextIdx = queueIndex + 1
      if (nextIdx < queue.length) {
        const nextTrack = queue[nextIdx]
        console.log('Playing next:', nextTrack.title)
        usePlayerStore.setState({ currentTrack: nextTrack, queueIndex: nextIdx })
        playTrack(nextTrack)
      } else {
        console.log('No next track available')
      }
    },
    onload: () => {
      console.log('Successfully loaded track:', track.title)
      usePlayerStore.setState({ duration: sound.duration() })
    },
    onloaderror: (id, err) => {
      console.error('Load error:', err)
      console.error('Failed to load track:', track.title, 'URLs tried:', srcArray)
      // Try to skip to next track on error
      const { queue, queueIndex } = usePlayerStore.getState()
      const nextIdx = queueIndex + 1
      if (nextIdx < queue.length) {
        const nextTrack = queue[nextIdx]
        console.log('Skipping to next track due to load error:', nextTrack.title)
        usePlayerStore.setState({ currentTrack: nextTrack, queueIndex: nextIdx })
        playTrack(nextTrack)
      } else {
        console.log('No more tracks to play after load error')
        usePlayerStore.setState({ isPlaying: false })
      }
    }
  })

  sound.play()
  useLibraryStore.getState().addToRecentlyPlayed(track)
}

export function togglePlay() {
  if (!sound) return
  if (sound.playing()) {
    sound.pause()
  } else {
    sound.play()
    requestAnimationFrame(updateProgress)
  }
}

export function seekTo(seconds) {
  if (!sound) return
  sound.seek(seconds)
}

export function setVolume(val) {
  if (sound) sound.volume(val)
}

function updateProgress() {
  if (!sound || !sound.playing()) return
  const seek = sound.seek()
  if (typeof seek === 'number') {
    usePlayerStore.setState({ progress: seek })
  }
  requestAnimationFrame(updateProgress)
}