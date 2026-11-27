export default function Avatar({ url, name = '?', size = 40 }) {
  const s = { width: size, height: size, fontSize: size * 0.42 }
  return url
    ? <img className="av" style={{ ...s, objectFit: 'cover' }} src={url} alt="" loading="lazy" />
    : <span className="av" style={s}>{(name[0] || '?').toUpperCase()}</span>
}
