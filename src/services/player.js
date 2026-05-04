import { Howl } from 'howler'
import { usePlayerStore } from '../store/playerStore'
import { useLibraryStore } from '../store/libraryStore'

let sound = null

export function playTrack(track) {
  const store = usePlayerStore.getState()

  if (sound) {
    sound.stop()
    sound.unload()
  }

  sound = new Howl({
    src: [track.streamUrl],
    html5: true,
    volume: store.volume,
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
      const nextIdx = queueIndex + 1
      if (nextIdx < queue.length) {
        const nextTrack = queue[nextIdx]
        usePlayerStore.setState({ currentTrack: nextTrack, queueIndex: nextIdx })
        playTrack(nextTrack)
      }
    },
    onload: () => {
      usePlayerStore.setState({ duration: sound.duration() })
    },
    onloaderror: (id, err) => {
      console.error('Load error:', err)
      const { queue, queueIndex } = usePlayerStore.getState()
      const nextIdx = queueIndex + 1
      if (nextIdx < queue.length) {
        const nextTrack = queue[nextIdx]
        usePlayerStore.setState({ currentTrack: nextTrack, queueIndex: nextIdx })
        playTrack(nextTrack)
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