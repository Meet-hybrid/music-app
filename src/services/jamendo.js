import axios from 'axios'
import { searchAudius } from './audius'

const BASE = 'https://api.jamendo.com/v3.0'
const KEY = import.meta.env.VITE_JAMENDO_KEY

export async function searchTracks(query) {
  try {
    const [jamendoRes, audiusRes] = await Promise.all([
      axios.get(`${BASE}/tracks`, {
        params: {
          client_id: KEY,
          format: 'json',
          limit: 20,
          search: query,
          include: 'musicinfo',
          audioformat: 'mp3', // Request MP3 format
          imagesize: 300,
        }
      }),
      searchAudius(query)
    ])

    const jamendoTracks = jamendoRes.data.results.map(t => ({
      id: 'jamendo_' + t.id,
      title: t.name,
      artist: t.artist_name,
      album: t.album_name || '',
      artwork: t.image,
      mp3Url: t.audio,
      oggUrl: t.audio ? t.audio.replace(/mp3\\.jamendo\\.com/i, 'ogg.jamendo.com') : null,
      streamUrl: t.audio,
      duration: t.duration,
      source: 'jamendo'
    }))

    return jamendoTracks
  } catch (err) {
    return []
  }
}

export async function searchByGenre(genre) {
  try {
    const { data } = await axios.get(`${BASE}/tracks`, {
      params: {
        client_id: KEY,
        format: 'json',
        limit: 20,
        tags: genre,
        include: 'musicinfo',
        audioformat: 'mp3',
        imagesize: 300,
        orderby: 'popularity_total'
      }
    })
    return data.results.map(t => ({
      id: 'jamendo_' + t.id,
      title: t.name,
      artist: t.artist_name,
      album: t.album_name || '',
      artwork: t.image,
      mp3Url: t.audio,
      oggUrl: t.audio ? t.audio.replace(/mp3\\.jamendo\\.com/i, 'ogg.jamendo.com') : null,
      streamUrl: t.audio,
      duration: t.duration,
      source: 'jamendo'
    }))
  } catch (err) {
    return []
  }
}