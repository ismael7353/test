const PENDING_VERIFICATION_KEY = 'vendeo:pending-verification'

export function persistVerification(request) {
  try {
    sessionStorage.setItem(PENDING_VERIFICATION_KEY, JSON.stringify(request))
  } catch (error) {
    console.error('Impossible de mémoriser la vérification en cours :', error)
  }
}

export function readPendingVerification() {
  try {
    const request = JSON.parse(sessionStorage.getItem(PENDING_VERIFICATION_KEY) || 'null')
    if (request?.identifier && request?.kind && request?.purpose && request?.verifyType) return request
  } catch (error) {
    console.error('Impossible de restaurer la vérification en cours :', error)
  }
  return null
}

export function clearPendingVerification() {
  try {
    sessionStorage.removeItem(PENDING_VERIFICATION_KEY)
  } catch (error) {
    console.error('Impossible de supprimer la vérification en cours :', error)
  }
}
