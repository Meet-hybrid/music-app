import { create } from 'zustand'

export const useLibraryStore = create((set, get) => ({
  favorites: [],
  recentlyPlayed: [],
  playlists: [],

  toggleFavorite: (track) => {
    const { favorites } = get()
    const exists = favorites.find(t => t.id === track.id)
    set({
      favorites: exists
        ? favorites.filter(t => t.id !== track.id)
        : [track, ...favorites]
    })
  },

  isFavorite: (id) => {
    return get().favorites.some(t => t.id === id)
  },

  addToRecentlyPlayed: (track) => {
    const { recentlyPlayed } = get()
    const filtered = recentlyPlayed.filter(t => t.id !== track.id)
    set({ recentlyPlayed: [track, ...filtered].slice(0, 20) })
  },

  createPlaylist: (name) => {
    const playlist = {
      id: Date.now().toString(),
      name,
      tracks: [],
      createdAt: new Date().toISOString(),
    }
    set(state => ({ playlists: [...state.playlists, playlist] }))
    return playlist
  },

  addToPlaylist: (playlistId, track) => {
    set(state => ({
      playlists: state.playlists.map(p =>
        p.id === playlistId && !p.tracks.find(t => t.id === track.id)
          ? { ...p, tracks: [...p.tracks, track] }
          : p
      )
    }))
  },

  removeFromPlaylist: (playlistId, trackId) => {
    set(state => ({
      playlists: state.playlists.map(p =>
        p.id === playlistId
          ? { ...p, tracks: p.tracks.filter(t => t.id !== trackId) }
          : p
      )
    }))
  },
}))