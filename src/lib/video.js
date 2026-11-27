const MAX_SIDE = 720

function waitForVideoEvent(video, eventName) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => finish(new Error('La vidéo met trop de temps à se charger.')), 15000)
    const cleanup = () => {
      clearTimeout(timer)
      video.removeEventListener(eventName, onSuccess)
      video.removeEventListener('error', onError)
    }
    const finish = (error) => {
      cleanup()
      if (error) reject(error)
      else resolve()
    }
    const onSuccess = () => finish()
    const onError = () => finish(new Error('Le navigateur ne peut pas lire ce format vidéo.'))
    video.addEventListener(eventName, onSuccess, { once: true })
    video.addEventListener('error', onError, { once: true })
  })
}

export async function createVideoThumbnail(file) {
  if (!file.type.startsWith('video/')) throw new Error('Choisissez un fichier vidéo.')

  const objectUrl = URL.createObjectURL(file)
  const video = document.createElement('video')
  video.muted = true
  video.playsInline = true
  video.preload = 'metadata'
  video.src = objectUrl

  try {
    await waitForVideoEvent(video, 'loadedmetadata')
    if (!video.videoWidth || !video.videoHeight) {
      throw new Error('Aucune image exploitable n’a été trouvée dans la vidéo.')
    }

    const seekTime = Number.isFinite(video.duration) ? Math.min(1, video.duration * 0.1) : 0
    if (seekTime > 0.05) {
      const seeked = waitForVideoEvent(video, 'seeked')
      video.currentTime = seekTime
      await seeked
    } else if (video.readyState < 2) {
      await waitForVideoEvent(video, 'loadeddata')
    }

    const scale = Math.min(1, MAX_SIDE / Math.max(video.videoWidth, video.videoHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(video.videoWidth * scale)
    canvas.height = Math.round(video.videoHeight * scale)
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Impossible de préparer l’aperçu vidéo.')
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.82))
    if (!blob) throw new Error('Impossible de créer l’image d’aperçu.')

    const name = file.name.replace(/\.[^.]+$/, '') || 'video'
    return new File([blob], `${name}-apercu.jpg`, { type: 'image/jpeg' })
  } finally {
    video.pause()
    video.removeAttribute('src')
    video.load()
    URL.revokeObjectURL(objectUrl)
  }
}
