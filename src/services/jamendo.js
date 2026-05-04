import axios from 'axios'

const BASE = 'https://api.jamendo.com/v3.0'
const KEY = import.meta.env.VITE_JAMENDO_KEY

export async function searchTracks(query) {
  const { data } = await axios.get(`${BASE}/tracks`, {
    params: {
      client_id: KEY,
      format: 'json',
      limit: 20,
      search: query,
      include: 'musicinfo',
      audioformat: 'mp32',
      imagesize: 300,
    }
  })
  return data.results.map(t => ({
    id: t.id,
    title: t.name,
    artist: t.artist_name,
    album: t.album_name,
    artwork: t.image,
    streamUrl: t.audio,
    duration: t.duration,
  }))
}