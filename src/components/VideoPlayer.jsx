import { useState } from 'react'

export default function VideoPlayer({ post }) {
  const [error, setError] = useState('')

  return (
    <div className={`video-frame${post.image_url ? ' has-poster' : ''}`}>
      <video
        className="vid"
        src={post.video_url}
        poster={post.image_url || undefined}
        controls
        playsInline
        preload="metadata"
        aria-label={`Vidéo : ${post.title || 'publication Vendeo'}`}
        onPlay={() => setError('')}
        onError={() => setError('Impossible de charger cette vidéo.')}
      />
      {error && <p className="video-error" role="alert">{error}</p>}
    </div>
  )
}
