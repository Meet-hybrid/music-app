import { useState } from 'react'
import { Play, Heart, ListMusic, Plus, Trash2, Music2 } from 'lucide-react'
import { useLibraryStore } from '../store/libraryStore'
import { usePlayerStore } from '../store/playerStore'
import { playTrack } from '../services/player'
import { formatTime } from '../utils/format'

export default function Library() {
  const { favorites, playlists, toggleFavorite, createPlaylist, removeFromPlaylist } = useLibraryStore()
  const { currentTrack, isPlaying } = usePlayerStore()
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [expanded, setExpanded] = useState(null)

  function handlePlay(track) {
    usePlayerStore.setState({ currentTrack: track, queue: favorites, queueIndex: favorites.findIndex(t => t.id === track.id) })
    playTrack(track)
  }

  function handleCreatePlaylist(e) {
    e.preventDefault()
    const name = newPlaylistName.trim()
    if (!name) return
    createPlaylist(name)
    setNewPlaylistName('')
  }

  function playPlaylist(tracks) {
    if (tracks.length === 0) return
    usePlayerStore.setState({ currentTrack: tracks[0], queue: tracks, queueIndex: 0 })
    playTrack(tracks[0])
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Your Library</h1>

      {/* Favorites */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Heart size={20} className="text-green-400" /> Favorites
        </h2>

        {favorites.length === 0 ? (
          <p className="text-[#b3b3b3]">Tap the heart on any track to save it here.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {favorites.map(track => {
              const active = currentTrack?.id === track.id
              return (
                <div
                  key={track.id}
                  className="bg-[#181818] hover:bg-[#282828] rounded-md p-4 transition-colors group relative"
                >
                  <button
                    onClick={() => handlePlay(track)}
                    className="block w-full text-left"
                  >
                    {track.artwork
                      ? <img src={track.artwork} alt="" className="w-full aspect-square rounded object-cover mb-3 shadow-lg" />
                      : <div className="w-full aspect-square rounded bg-[#282828] mb-3 flex items-center justify-center"><Music2 size={32} className="text-[#b3b3b3]" /></div>
                    }
                    <p className={`text-sm font-medium truncate ${active && isPlaying ? 'text-green-400' : 'text-white'}`}>
                      {track.title}
                    </p>
                    <p className="text-xs text-[#b3b3b3] truncate">{track.artist}</p>
                  </button>
                  <button
                    onClick={() => toggleFavorite(track)}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-green-400"
                    title="Remove from favorites"
                  >
                    <Heart size={18} fill="currentColor" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Playlists */}
      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <ListMusic size={20} className="text-green-400" /> Playlists
        </h2>

        <form onSubmit={handleCreatePlaylist} className="flex gap-2 mb-6 max-w-md">
          <input
            value={newPlaylistName}
            onChange={e => setNewPlaylistName(e.target.value)}
            placeholder="New playlist name"
            className="flex-1 bg-[#242424] border border-[#282828] rounded-md px-3 py-2 text-sm text-white outline-none focus:border-green-400"
          />
          <button
            type="submit"
            className="flex items-center gap-1 bg-green-400 text-black px-3 py-2 rounded-md text-sm font-semibold hover:bg-green-300"
          >
            <Plus size={16} /> Create
          </button>
        </form>

        {playlists.length === 0 ? (
          <p className="text-[#b3b3b3]">No playlists yet. Create one above.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {playlists.map(playlist => {
              const isOpen = expanded === playlist.id
              return (
                <div key={playlist.id} className="bg-[#181818] rounded-md overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3">
                    <button
                      onClick={() => playPlaylist(playlist.tracks)}
                      className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center hover:scale-105 transition-transform shrink-0"
                    >
                      <Play size={14} className="text-black ml-0.5" />
                    </button>
                    <button
                      onClick={() => setExpanded(isOpen ? null : playlist.id)}
                      className="flex-1 text-left"
                    >
                      <p className="text-sm font-medium text-white">{playlist.name}</p>
                      <p className="text-xs text-[#b3b3b3]">{playlist.tracks.length} songs</p>
                    </button>
                  </div>

                  {isOpen && (
                    <ul className="border-t border-[#282828]">
                      {playlist.tracks.length === 0 && (
                        <li className="px-4 py-3 text-xs text-[#b3b3b3]">Empty playlist.</li>
                      )}
                      {playlist.tracks.map((track, i) => (
                        <li
                          key={track.id + i}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-[#282828]"
                        >
                          <button
                            onClick={() => {
                              usePlayerStore.setState({ currentTrack: track, queue: playlist.tracks, queueIndex: i })
                              playTrack(track)
                            }}
                            className="flex-1 flex items-center gap-3 text-left min-w-0"
                          >
                            <span className="text-[#b3b3b3] text-xs w-4">{i + 1}</span>
                            {track.artwork
                              ? <img src={track.artwork} alt="" className="w-9 h-9 rounded object-cover shrink-0" />
                              : <div className="w-9 h-9 rounded bg-[#282828] shrink-0" />
                            }
                            <span className="min-w-0">
                              <span className="text-sm text-white block truncate">{track.title}</span>
                              <span className="text-xs text-[#b3b3b3] block truncate">{track.artist}</span>
                            </span>
                          </button>
                          <span className="text-xs text-[#b3b3b3]">{formatTime(track.duration)}</span>
                          <button
                            onClick={() => removeFromPlaylist(playlist.id, track.id)}
                            className="text-[#b3b3b3] hover:text-white"
                            title="Remove from playlist"
                          >
                            <Trash2 size={16} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
