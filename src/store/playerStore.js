import { create } from 'zustand'

export const usePlayerStore = create((set, get) => ({
  currentTrack: null,
  queue: [],
  queueIndex: 0,
  isPlaying: false,
  volume: 0.8,
  progress: 0,
  duration: 0,

  setTrack: (track, queue = []) => set({
    currentTrack: track,
    queue: queue.length ? queue : [track],
    queueIndex: queue.indexOf(track) ?? 0,
    isPlaying: true,
  }),

  setIsPlaying: (val) => set({ isPlaying: val }),
  setVolume: (val) => set({ volume: val }),
  setProgress: (val) => set({ progress: val }),
  setDuration: (val) => set({ duration: val }),

  playNext: () => {
    const { queue, queueIndex } = get()
    const nextIdx = queueIndex + 1
    if (nextIdx < queue.length) {
      set({ currentTrack: queue[nextIdx], queueIndex: nextIdx, isPlaying: true })
    }
  },

  playPrev: () => {
    const { queue, queueIndex } = get()
    const prevIdx = queueIndex - 1
    if (prevIdx >= 0) {
      set({ currentTrack: queue[prevIdx], queueIndex: prevIdx, isPlaying: true })
    }
  },
}))