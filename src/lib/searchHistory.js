const KEY = 'vendeo:recent-searches'
const MAX = 8

export function getRecent() {
  try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch { return [] }
}
function save(list) {
  try { localStorage.setItem(KEY, JSON.stringify(list)) } catch { /* stockage indisponible */ }
}
export function addRecent(term) {
  const t = term.trim()
  if (t.length < 2) return getRecent()
  const list = [t, ...getRecent().filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, MAX)
  save(list)
  return list
}
export function removeRecent(term) {
  const list = getRecent().filter((x) => x !== term)
  save(list)
  return list
}
export function clearRecent() { save([]); return [] }
