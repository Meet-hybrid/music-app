import axios from 'axios'

const BASE = 'https://discoveryprovider.audius.co/v1'

export async function searchAudius(query) {
  try {
    const { data } = await axios.get(`${BASE}/tracks/search`, {
      params: { query, limit: 20 }
    })
    return data.data.map(t => ({
      id: 'audius_' + t.id,
      title: t.title,
      artist: t.user?.name || 'Unknown',
      album: t.album || '',
      artwork: t.artwork?.['480x480'] || t.artwork?.['150x150'] || '',
      streamUrl: `${BASE}/tracks/${t.id}/stream`,
      duration: t.duration,
      source: 'audius'
    }))
  } catch (err) {
    return []
  }
}