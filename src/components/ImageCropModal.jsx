import { useEffect, useRef, useState } from 'react'
import Icon from './Icon'

const OUTPUT_SIZE = 640

function clampOffset(value, viewport, image) {
  return Math.min(0, Math.max(viewport - image, value))
}

export default function ImageCropModal({ file, onCancel, onApply }) {
  const cropRef = useRef(null)
  const imageRef = useRef(null)
  const dragRef = useRef(null)
  const [viewport, setViewport] = useState(280)
  const [imageSize, setImageSize] = useState(null)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')

  useEffect(() => {
    const url = URL.createObjectURL(file)
    setSourceUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  useEffect(() => {
    const element = cropRef.current
    if (!element) return undefined

    const observer = new ResizeObserver(() => setViewport(element.clientWidth))
    observer.observe(element)
    setViewport(element.clientWidth)
    return () => observer.disconnect()
  }, [])

  const baseScale = imageSize
    ? Math.max(viewport / imageSize.width, viewport / imageSize.height)
    : 1
  const scale = baseScale * zoom
  const imageWidth = imageSize ? imageSize.width * scale : viewport
  const imageHeight = imageSize ? imageSize.height * scale : viewport

  useEffect(() => {
    if (!imageSize) return
    setOffset((current) => ({
      x: clampOffset(current.x, viewport, imageWidth),
      y: clampOffset(current.y, viewport, imageHeight),
    }))
  }, [imageSize, imageWidth, imageHeight, viewport])

  function imageLoaded(event) {
    const image = event.currentTarget
    const width = image.naturalWidth
    const height = image.naturalHeight
    if (!width || !height) {
      setError('Cette image ne peut pas être recadrée.')
      return
    }

    setImageSize({ width, height })
    const coverScale = Math.max(viewport / width, viewport / height)
    setOffset({
      x: (viewport - width * coverScale) / 2,
      y: (viewport - height * coverScale) / 2,
    })
  }

  function changeZoom(event) {
    const nextZoom = Number(event.target.value)
    const nextScale = baseScale * nextZoom
    const nextWidth = imageSize.width * nextScale
    const nextHeight = imageSize.height * nextScale
    setOffset((current) => ({
      x: clampOffset(current.x + imageWidth / 2 - nextWidth / 2, viewport, nextWidth),
      y: clampOffset(current.y + imageHeight / 2 - nextHeight / 2, viewport, nextHeight),
    }))
    setZoom(nextZoom)
  }

  function startDrag(event) {
    if (busy || !imageSize) return
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      offset,
    }
  }

  function moveDrag(event) {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    setOffset({
      x: clampOffset(drag.offset.x + event.clientX - drag.x, viewport, imageWidth),
      y: clampOffset(drag.offset.y + event.clientY - drag.y, viewport, imageHeight),
    })
  }

  async function applyCrop() {
    const image = imageRef.current
    if (!image || !imageSize) return
    setBusy(true)
    setError('')
    try {
      const sourceSize = viewport / scale
      const canvas = document.createElement('canvas')
      canvas.width = OUTPUT_SIZE
      canvas.height = OUTPUT_SIZE
      const context = canvas.getContext('2d')
      if (!context) throw new Error('Impossible de préparer le recadrage.')

      context.drawImage(
        image,
        Math.max(0, -offset.x / scale),
        Math.max(0, -offset.y / scale),
        sourceSize,
        sourceSize,
        0,
        0,
        OUTPUT_SIZE,
        OUTPUT_SIZE,
      )

      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob((result) => {
          if (result) resolve(result)
          else reject(new Error('Impossible de créer la photo recadrée.'))
        }, 'image/jpeg', 0.9)
      })
      const baseName = file.name.replace(/\.[^.]+$/, '') || 'photo-profil'
      await onApply(new File([blob], `${baseName}-recadree.jpg`, { type: 'image/jpeg' }))
    } catch (cropError) {
      setError(cropError.message || 'Impossible de recadrer cette photo.')
      setBusy(false)
    }
  }

  return (
    <div className="modal crop-modal" onClick={(event) => {
      if (event.target === event.currentTarget && !busy) onCancel()
    }}>
      <section className="card crop-dialog" role="dialog" aria-modal="true" aria-labelledby="crop-title">
        <header className="crop-header">
          <div>
            <span className="eyebrow">PHOTO DE PROFIL</span>
            <h2 id="crop-title">Ajuster le cadrage</h2>
          </div>
          <button type="button" className="icon" aria-label="Fermer" disabled={busy} onClick={onCancel}><Icon name="close" /></button>
        </header>

        <div
          ref={cropRef}
          className="crop-viewport"
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={() => { dragRef.current = null }}
          onPointerCancel={() => { dragRef.current = null }}
        >
          <img
            ref={imageRef}
            src={sourceUrl || undefined}
            alt="Recadrage de la photo de profil"
            draggable="false"
            onLoad={imageLoaded}
            onError={() => setError('Impossible de lire cette image.')}
            style={{
              width: imageWidth,
              height: imageHeight,
              transform: `translate(${offset.x}px, ${offset.y}px)`,
            }}
          />
        </div>
        <label className="crop-zoom">
          <span>Zoom</span>
          <input type="range" min="1" max="3" step="0.01" value={zoom} disabled={!imageSize || busy} onChange={changeZoom} />
        </label>
        <p className="crop-help">Faites glisser la photo pour la positionner. Le cercle montre le rendu de votre profil.</p>
        {error && <p className="error crop-error" role="alert">{error}</p>}
        <div className="crop-actions">
          <button type="button" disabled={busy} onClick={onCancel}>Annuler</button>
          <button type="button" className="pri" disabled={!imageSize || busy} onClick={applyCrop}>
            {busy ? 'Enregistrement…' : 'Utiliser cette photo'}
          </button>
        </div>
      </section>
    </div>
  )
}
