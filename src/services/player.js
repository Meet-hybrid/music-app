import { Howl } from 'howler'
import { usePlayerStore } from '../store/playerStore'
import { useLibraryStore } from '../store/libraryStore'
import { logger } from '../utils/logger'

let sound = null

export function playTrack(track) {
  const store = usePlayerStore.getState()

  if (sound) {
    sound.stop()
    sound.unload()
  }

  const srcArray = []
  if (track.oggUrl && track.oggUrl !== track.streamUrl) {
    srcArray.push(track.oggUrl)
  }
  if (track.mp3Url) {
    srcArray.push(track.mp3Url)
  }
  if (track.streamUrl) {
    srcArray.push(track.streamUrl)
  }

  if (srcArray.length === 0) {
    logger.error('No audio sources available for track:', track.title)
    return
  }

  logger.log('Playing track:', track.title, 'with sources:', srcArray)

  sound = new Howl({
    src: srcArray,
    html5: false,
    volume: store.volume,
    format: ['mp3', 'ogg', 'aac', 'wav'],
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
      logger.log('Song ended. Queue length:', queue.length, 'Current index:', queueIndex)
      const nextIdx = queueIndex + 1
      if (nextIdx < queue.length) {
        const nextTrack = queue[nextIdx]
        logger.log('Playing next:', nextTrack.title)
        usePlayerStore.setState({ currentTrack: nextTrack, queueIndex: nextIdx })
        playTrack(nextTrack)
      } else {
        logger.log('No next track available')
      }
    },
    onload: () => {
      logger.log('Successfully loaded track:', track.title)
      usePlayerStore.setState({ duration: sound.duration() })
    },
    onloaderror: (id, err) => {
      logger.error('Load error:', err)
      logger.error('Failed to load track:', track.title, 'URLs tried:', srcArray)
      const { queue, queueIndex } = usePlayerStore.getState()
      const nextIdx = queueIndex + 1
      if (nextIdx < queue.length) {
        const nextTrack = queue[nextIdx]
        logger.log('Skipping to next track due to load error:', nextTrack.title)
        usePlayerStore.setState({ currentTrack: nextTrack, queueIndex: nextIdx })
        playTrack(nextTrack)
      } else {
        logger.log('No more tracks to play after load error')
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