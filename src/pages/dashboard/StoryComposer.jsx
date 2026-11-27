import { useCallback, useEffect, useState } from 'react'
import { addStory, fetchShopStories } from '../../api/stories'
import { uploadPublic } from '../../api/social'
import { compressImage } from '../../lib/image'
import { isPro } from '../../lib/format'
import Avatar from '../../components/Avatar'
import FilePicker from '../../components/FilePicker'
import { StoryViewer } from '../../components/Stories'

export default function StoryComposer({ shop }) {
  const [caption, setCaption] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const [stories, setStories] = useState([])
  const [storyError, setStoryError] = useState('')
  const [viewing, setViewing] = useState(false)
  const pro = isPro(shop)

  const loadStories = useCallback(async () => {
    setStoryError('')
    try {
      setStories(await fetchShopStories(shop.id))
    } catch (error) {
      setStoryError(error.message || 'Impossible de charger vos stories.')
    }
  }, [shop.id])

  useEffect(() => { loadStories() }, [loadStories])

  async function pick(e) {
    const f = e.target.files[0]
    e.target.value = ''
    if (!f) return
    const video = f.type.startsWith('video/')
    if (video && f.size > 25 * 1048576) return setMsg('Vidéo trop lourde (25 Mo maximum).')
    setBusy(true); setMsg('Publication…')
    try {
      const media_url = await uploadPublic(video ? f : await compressImage(f))
      await addStory(shop.id, { media_url, media_type: video ? 'video' : 'image', caption: caption.trim() || null })
      setCaption('')
      setMsg('Story publiée pour 24 h. Vous pouvez la revoir autant de fois que vous voulez.')
      await loadStories()
    } catch (er) { setMsg(er.message || 'Impossible de publier la story.') } finally { setBusy(false) }
  }

  return (
    <>
      <div className="card pad story-composer">
        <div className="story-composer-heading">
          <div>
            <span className="eyebrow">VOTRE CONTENU</span>
            <h2>Stories</h2>
            <p className="mu">Une story reste visible 24 h. Vos visiteurs peuvent la revoir librement pendant ce délai.</p>
          </div>
          <button type="button" className="story-replay" disabled={!stories.length} onClick={() => setViewing(true)}>
            <span className={`story-avatar-wrap ${stories.length ? '' : 'no-stories'}`}>
              <span className="ring"><Avatar url={shop.avatar_url} name={shop.name} size={56} /></span>
              {stories.length > 1 && <span className="story-count">{stories.length}</span>}
            </span>
            <span>{stories.length ? 'Revoir mes stories' : 'Aucune story active'}</span>
          </button>
        </div>
        <div className="story-composer-info">
          <span>{stories.length} {stories.length === 1 ? 'story active' : 'stories actives'}</span>
          <span>{pro ? 'Stories illimitées avec Pro' : 'Jusqu’à 3 stories actives'}</span>
        </div>
        <label className="story-caption-label" htmlFor="story-caption">Légende <span className="mu">(facultatif)</span></label>
        <input id="story-caption" value={caption} maxLength={140} onChange={(e) => setCaption(e.target.value)} placeholder="Ajoutez un message à votre story" />
        <FilePicker
          accept="image/*,video/*"
          onChange={pick}
          title={busy ? 'Publication…' : 'Ajouter une photo ou une vidéo'}
          description="Photo optimisée · vidéo jusqu’à 25 Mo"
          icon="camera"
          disabled={busy}
          className={`story-upload${busy ? ' is-loading' : ''}`}
        />
        <p className="story-format-note">Photo optimisée automatiquement · vidéo jusqu’à 25 Mo</p>
        {storyError && <p className="error story-error" role="alert">{storyError} <button type="button" onClick={loadStories}>Réessayer</button></p>}
        {msg && <p className="mu" role="status">{msg}</p>}
      </div>
      {viewing && stories.length > 0 && <StoryViewer groups={[{ shop, items: stories }]} start={{ g: 0, i: 0 }} onClose={() => setViewing(false)} />}
    </>
  )
}
