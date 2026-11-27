import { useState } from 'react'

export default function Avatar({ url, name = '?', size = 40 }) {
  const [failedUrl, setFailedUrl] = useState('')
  const s = { width: size, height: size, fontSize: size * 0.42, flex: `0 0 ${size}px` }
  return url && failedUrl !== url
    ? <img className="av" style={{ ...s, objectFit: 'cover' }} src={url} alt={`Photo de ${name}`} loading="lazy" onError={() => setFailedUrl(url)} />
    : <span className="av" style={s} aria-label={`Avatar de ${name}`}>{(name[0] || '?').toUpperCase()}</span>
}
