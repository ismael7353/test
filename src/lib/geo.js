let pos = null
export const getPos = () => pos
export const locate = () => new Promise((ok, ko) => {
  if (!navigator.geolocation) return ko(new Error('Position indisponible'))
  navigator.geolocation.getCurrentPosition((p) => { pos = [p.coords.latitude, p.coords.longitude]; ok(pos) }, ko, { timeout: 10000, maximumAge: 300000 })
})
export const km = (a, b) => {
  const r = (x) => (x * Math.PI) / 180
  const h = Math.sin(r(b[0] - a[0]) / 2) ** 2 + Math.cos(r(a[0])) * Math.cos(r(b[0])) * Math.sin(r(b[1] - a[1]) / 2) ** 2
  return 12742 * Math.asin(Math.sqrt(h))
}
export const fmtKm = (d) => (d < 1 ? `${Math.round(d * 1000)} m` : `${d.toFixed(1)} km`)
