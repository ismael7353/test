import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const DEFAULT_CENTER = [-18.8792, 47.5079]

export default function ShopLocationPicker({ lat, lng, onChange }) {
  const element = useRef(null)
  const map = useRef(null)
  const marker = useRef(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!element.current || map.current) return
    const hasLocation = lat !== null && lat !== undefined && lng !== null && lng !== undefined && Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))
    const initial = hasLocation ? [Number(lat), Number(lng)] : DEFAULT_CENTER
    const instance = L.map(element.current, { scrollWheelZoom: false }).setView(initial, lat != null && lng != null ? 15 : 11)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(instance)
    map.current = instance
    if (hasLocation) marker.current = L.marker(initial).addTo(instance)
    instance.on('click', (event) => onChange({ lat: event.latlng.lat, lng: event.latlng.lng }))
    const resize = () => instance.invalidateSize()
    setTimeout(resize, 100)
    return () => { instance.remove(); map.current = null; marker.current = null }
  }, []) // map is intentionally initialized once

  useEffect(() => {
    if (!map.current || lat == null || lng == null) return
    const point = [Number(lat), Number(lng)]
    if (!marker.current) marker.current = L.marker(point).addTo(map.current)
    else marker.current.setLatLng(point)
    map.current.setView(point, Math.max(map.current.getZoom(), 14))
  }, [lat, lng])

  function useMyLocation() {
    setError('')
    if (!navigator.geolocation) { setError('La géolocalisation n’est pas disponible sur cet appareil.'); return }
    setBusy(true)
    navigator.geolocation.getCurrentPosition((position) => {
      onChange({ lat: position.coords.latitude, lng: position.coords.longitude })
      setBusy(false)
    }, (reason) => {
      setError(reason.code === 1 ? 'Autorisez la localisation dans votre navigateur.' : 'Position introuvable. Vérifiez le GPS et réessayez.')
      setBusy(false)
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 })
  }

  return <section className="shop-location-picker">
    <div className="row sp" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
      <b>Emplacement de la boutique</b>
      <button type="button" onClick={useMyLocation} disabled={busy}>{busy ? 'Localisation…' : 'Utiliser ma position'}</button>
    </div>
    <p className="mu">Placez le marqueur en touchant la carte, ou utilisez le GPS. Cette position sera visible sur la carte Vendeо.</p>
    <div ref={element} className="shop-location-map" role="application" aria-label="Carte pour choisir la position de la boutique" />
    {lat != null && lng != null
      ? <p className="mu" role="status">Position sélectionnée : {Number(lat).toFixed(5)}, {Number(lng).toFixed(5)}</p>
      : <p className="mu">Aucune position enregistrée pour le moment.</p>}
    {error && <p className="error" role="alert">{error}</p>}
  </section>
}
