export function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const sec = Math.floor(seconds % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}
