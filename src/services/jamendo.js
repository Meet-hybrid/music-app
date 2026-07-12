import axios from 'axios'
import { searchAudius } from './audius'

const BASE = 'https://api.jamendo.com/v3.0'
const KEY = import.meta.env.VITE_JAMENDO_KEY

function mapJamendoTrack(t) {
  return {
    id: 'jamendo_' + t.id,
    title: t.name,
    artist: t.artist_name,
    album: t.album_name || '',
    artwork: t.image,
    mp3Url: t.audio,
    oggUrl: t.audio ? t.audio.split('mp3.jamendo.com').join('ogg.jamendo.com') : null,
    streamUrl: t.audio,
    duration: t.duration,
    source: 'jamendo',
  }
}

async function fetchJamendo(params) {
  if (!KEY) return []
  try {
    const { data } = await axios.get(`${BASE}/tracks`, { params })
    return data.results.map(mapJamendoTrack)
  } catch {
    return []
  }
}

export async function searchTracks(query) {
  const [jamendoTracks, audiusTracks] = await Promise.all([
    fetchJamendo({
      client_id: KEY,
      format: 'json',
      limit: 20,
      search: query,
      include: 'musicinfo',
      audioformat: 'mp3',
      imagesize: 300,
    }),
    searchAudius(query).catch(() => []),
  ])
  return [...jamendoTracks, ...audiusTracks]
}

export async function searchByGenre(genre) {
  const [jamendoTracks, audiusTracks] = await Promise.all([
    fetchJamendo({
      client_id: KEY,
      format: 'json',
      limit: 20,
      tags: genre,
      include: 'musicinfo',
      audioformat: 'mp3',
      imagesize: 300,
      orderby: 'popularity_total',
    }),
    searchAudius(genre).catch(() => []),
  ])
  return [...jamendoTracks, ...audiusTracks]
}

export async function getPopularTracks(limit = 20) {
  const tracks = await fetchJamendo({
    client_id: KEY,
    format: 'json',
    limit,
    include: 'musicinfo',
    audioformat: 'mp3',
    imagesize: 300,
    orderby: 'popularity_total',
  })
  return tracks
}
