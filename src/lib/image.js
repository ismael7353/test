const MAX_SIDE = 1080 // px : suffisant pour un téléphone
const QUALITY = 0.8

/** Redimensionne et compresse une image (JPEG) avant l'envoi : économise le forfait. */
export async function compressImage(file) {
  if (!file.type.startsWith('image/')) throw new Error('Choisissez un fichier image.')

  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close?.()

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', QUALITY))
  const name = file.name.replace(/\.\w+$/, '') + '.jpg'
  return new File([blob], name, { type: 'image/jpeg' })
}

export const formatSize = (bytes) =>
  bytes > 1_048_576 ? `${(bytes / 1_048_576).toFixed(1)} Mo` : `${Math.round(bytes / 1024)} Ko`
