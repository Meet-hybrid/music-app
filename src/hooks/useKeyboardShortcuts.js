import { useEffect } from 'react'
import { usePlayerStore } from '../store/playerStore'
import { togglePlay, playTrack, setVolume } from '../services/player'

function isTypingTarget(el) {
  return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)
}

export function useKeyboardShortcuts() {
  useEffect(() => {
    function onKey(e) {
      if (isTypingTarget(e.target)) return

      const { queue, queueIndex, volume } = usePlayerStore.getState()

      switch (e.key) {
        case ' ':
        case 'Spacebar':
          e.preventDefault()
          togglePlay()
          break

        case 'ArrowRight':
          if (e.ctrlKey || e.metaKey) {
            const nextIdx = queueIndex + 1
            if (nextIdx < queue.length) {
              const track = queue[nextIdx]
              usePlayerStore.setState({ currentTrack: track, queueIndex: nextIdx })
              playTrack(track)
            }
          }
          break

        case 'ArrowLeft':
          if (e.ctrlKey || e.metaKey) {
            const prevIdx = queueIndex - 1
            if (prevIdx >= 0) {
              const track = queue[prevIdx]
              usePlayerStore.setState({ currentTrack: track, queueIndex: prevIdx })
              playTrack(track)
            }
          }
          break

        case 'ArrowUp':
          e.preventDefault()
          adjustVolume(volume, 0.05)
          break

        case 'ArrowDown':
          e.preventDefault()
          adjustVolume(volume, -0.05)
          break

        default:
          break
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}

function adjustVolume(current, delta) {
  const next = Math.min(1, Math.max(0, Math.round((current + delta) * 100) / 100))
  usePlayerStore.setState({ volume: next })
  setVolume(next)
}
