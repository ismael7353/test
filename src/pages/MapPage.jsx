import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { fetchShopsWithLocation } from '../api/shops'
import { whatsappLink } from '../lib/format'
import Icon from '../components/Icon'

const TANA = [-18.9, 47.52]
const QUARTIERS = ['Analakely', 'Isotry', 'Ankorondrano', 'Behoririka', '67 Ha', 'Ivandry']

const km = (a, b) => {
  const r = (x) => (x * Math.PI) / 180
  const h = Math.sin(r(b[0] - a[0]) / 2) ** 2 + Math.cos(r(a[0])) * Math.cos(r(b[0])) * Math.sin(r(b[1] - a[1]) / 2) ** 2
  return 12742 * Math.asin(Math.sqrt(h))
}
const fmtKm = (d) => (d < 1 ? `${Math.round(d * 1000)} m` : `${d.toFixed(1)} km`)
const pin = (s, on) => L.divIcon({
  className: '', iconSize: [34, 42], iconAnchor: [17, 40],
  html: `<div class="pin${on ? ' on' : ''}${s.is_live ? ' live' : ''}"><span></span></div>`,
})

export default function MapPage() {
  const box = useRef(null), map = useRef(null), markers = useRef({}), line = useRef(null), dot = useRef(null)
  const [params] = useSearchParams()
  const [shops, setShops] = useState([])
  const [q, setQ] = useState(params.get('q') || '')
  const [sel, setSel] = useState(null)
  const [me, setMe] = useState(null)
  const [mode, setMode] = useState('driving')
  const [route, setRoute] = useState(null)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    const m = L.map(box.current, { zoomControl: false }).setView(TANA, 13)
    L.control.zoom({ position: 'bottomright' }).addTo(m)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap', maxZoom: 19 }).addTo(m)
    map.current = m
    fetchShopsWithLocation().then(setShops).catch(() => setMsg('Impossible de charger les boutiques.'))
    return () => m.remove()
  }, [])

  const list = useMemo(() => {
    const s = q.trim().toLowerCase()
    return shops
      .filter((x) => !s || `${x.name} ${x.city || ''}`.toLowerCase().includes(s))
      .map((x) => ({ ...x, d: me ? km(me, [x.lat, x.lng]) : null }))
      .sort((a, b) => (me ? a.d - b.d : a.name.localeCompare(b.name)))
  }, [shops, q, me])

  function pick(s) {
    setSel(s); setRoute(null); setMsg('')
    map.current.flyTo([s.lat, s.lng], 16, { duration: 0.8 })
  }

  useEffect(() => {
    Object.values(markers.current).forEach((x) => x.remove())
    markers.current = {}
    list.forEach((s) => {
      markers.current[s.id] = L.marker([s.lat, s.lng], { icon: pin(s, sel?.id === s.id) }).addTo(map.current).on('click', () => pick(s))
    })
  }, [list, sel]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    dot.current?.remove()
    if (me) dot.current = L.circleMarker(me, { radius: 8, color: '#fff', weight: 3, fillColor: '#2563eb', fillOpacity: 1 }).addTo(map.current)
  }, [me])

  useEffect(() => {
    line.current?.remove()
    if (!route) return
    line.current = L.polyline(route.pts, { color: '#0f9d6b', weight: 6, opacity: 0.9 }).addTo(map.current)
    map.current.fitBounds(line.current.getBounds(), { padding: [40, 40] })
  }, [route])

  const locate = () => new Promise((ok, ko) => {
    if (!navigator.geolocation) return ko()
    navigator.geolocation.getCurrentPosition((p) => {
      const c = [p.coords.latitude, p.coords.longitude]
      setMe(c); ok(c)
    }, ko, { enableHighAccuracy: true, timeout: 10000 })
  })

  async function go(profile = mode) {
    setMsg('Calcul de l’itinéraire…')
    try {
      const from = me || (await locate())
      const path = profile === 'foot' ? 'routed-foot/route/v1/foot' : 'routed-car/route/v1/driving'
      const r = await fetch(`https://routing.openstreetmap.de/${path}/${from[1]},${from[0]};${sel.lng},${sel.lat}?overview=full&geometries=geojson`).then((x) => x.json())
      const t = r.routes?.[0]
      if (!t) throw new Error('none')
      setRoute({ km: t.distance / 1000, min: Math.round(t.duration / 60), pts: t.geometry.coordinates.map(([a, b]) => [b, a]) })
      setMsg('')
    } catch {
      setMsg('Itinéraire indisponible : activez la position ou ouvrez Google Maps.')
    }
  }

  const changeMode = (m) => { setMode(m); if (route) go(m) }

  return (
    <div className="mapx">
      <aside className="mapx-side">
        <h2>Boutiques à Antananarivo</h2>
        <input type="search" placeholder="Boutique ou quartier…" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="chips">
          {QUARTIERS.map((z) => (
            <button key={z} className={`chip${q === z ? ' on' : ''}`} onClick={() => setQ(q === z ? '' : z)}>{z}</button>
          ))}
        </div>

        {sel && (
          <div className="card pad sel">
            <div className="row sp">
              <Link to={`/shop/${sel.slug}`}><b>{sel.name}</b></Link>
              <button aria-label="Fermer" onClick={() => { setSel(null); setRoute(null) }}><Icon name="close" /></button>
            </div>
            <div className="mu">
              {sel.city || 'Madagascar'}{sel.is_live && ' · '}{sel.is_live && <span className="live">EN DIRECT</span>}
              {me && ` · à ${fmtKm(km(me, [sel.lat, sel.lng]))}`}
            </div>
            {sel.bio && <p className="clamp">{sel.bio}</p>}
            <div className="seg">
              <button className={mode === 'driving' ? 'on' : ''} onClick={() => changeMode('driving')}><Icon name="car" /> Voiture / taxi-be</button>
              <button className={mode === 'foot' ? 'on' : ''} onClick={() => changeMode('foot')}><Icon name="walk" /> À pied</button>
            </div>
            <button className="pri block" onClick={() => go()}><Icon name="compass" /> Itinéraire depuis ma position</button>
            {route && <p className="route"><b>{route.min} min</b> · {fmtKm(route.km)}</p>}
            {msg && <p className="mu">{msg}</p>}
            <div className="grid">
              <a className="btn" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/dir/?api=1&destination=${sel.lat},${sel.lng}`}>Google Maps</a>
              <a className="btn" target="_blank" rel="noreferrer" href={whatsappLink(sel.whatsapp)}>WhatsApp</a>
            </div>
          </div>
        )}

        {!sel && msg && <p className="mu">{msg}</p>}
        <ul className="shoplist">
          {list.map((s) => (
            <li key={s.id}>
              <button onClick={() => pick(s)} className={sel?.id === s.id ? 'on' : ''}>
                <span className="av">{s.name[0]}</span>
                <span><b>{s.name}</b><span className="mu" style={{ display: 'block' }}>{s.city || 'Madagascar'}{s.d != null && ` · ${fmtKm(s.d)}`}</span></span>
              </button>
            </li>
          ))}
          {shops.length > 0 && list.length === 0 && <li className="mu">Aucune boutique trouvée.</li>}
        </ul>
      </aside>

      <div className="mapx-map">
        <div ref={box} className="leafmap" />
        <button className="fab" aria-label="Ma position" onClick={() => locate().then((c) => map.current.flyTo(c, 15)).catch(() => setMsg('Position refusée : activez la localisation.'))}><Icon name="pin" /></button>
      </div>
    </div>
  )
}
