import { useState } from 'react'
import { Link } from 'react-router-dom'
import { updateShop } from '../../api/shops'
import { isPro } from '../../lib/format'
import Avatar from '../../components/Avatar'
import Icon from '../../components/Icon'

export default function ShopSettings({ shop, onChange, onSignOut }) {
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  const save = async (patch) => {
    setSaving(true)
    setMessage('')
    try {
      await updateShop(shop.id, patch)
      await onChange()
      setMessage('Modifications enregistrées.')
    } catch (error) {
      setMessage(error.message || 'Impossible d’enregistrer les modifications.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <header className="card seller-shop-card">
      <div className={`seller-shop-cover ${shop.cover_url ? 'has-cover' : ''}`}>
        {shop.cover_url && <img src={shop.cover_url} alt="" />}
        <div className="seller-shop-identity">
          <Avatar url={shop.avatar_url} name={shop.name} size={56} />
          <div>
            <span className="seller-overline">VOTRE BOUTIQUE</span>
            <h1>{shop.name}</h1>
            <Link to={`/shop/${shop.slug}`}>Voir la page publique <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
        <div className="seller-shop-actions">
          <span className={`seller-shop-tier ${isPro(shop) ? 'is-pro' : ''}`}>{isPro(shop) && <Icon name="sparkle" size={14} />}{isPro(shop) ? ' Vendeo Pro' : 'Compte vendeur'}</span>
          <button onClick={onSignOut}>Déconnexion</button>
        </div>
      </div>

      <div className="seller-shop-settings">
        <div className="seller-shop-settings-copy">
          <b>Présence de votre boutique</b>
          <span className="mu">Mettez à jour votre statut en direct et votre lien de diffusion.</span>
        </div>
        <div className="seller-settings-controls">
          <label className="seller-toggle">
            <input type="checkbox" checked={shop.is_live} disabled={saving} onChange={(e) => save({ is_live: e.target.checked })} />
            <span className="seller-switch" aria-hidden="true" />
            <span><b>{shop.is_live ? 'En direct' : 'Hors ligne'}</b><small>{shop.is_live ? 'Visible dans les directs' : 'Votre boutique n’est pas signalée en direct'}</small></span>
          </label>
          <label className="seller-live-link">
            Lien de diffusion
            <input
              type="url"
              key={shop.live_url || 'empty'}
              defaultValue={shop.live_url || ''}
              placeholder="https://facebook.com/…"
              disabled={saving}
              onBlur={(e) => e.target.value !== (shop.live_url || '') && save({ live_url: e.target.value })}
            />
          </label>
        </div>
        <div className="seller-settings-footer">
          <label className="seller-checkbox">
            <input type="checkbox" checked={shop.xmas} disabled={saving} onChange={(e) => save({ xmas: e.target.checked })} />
            Activer le thème de saison
          </label>
          {message && <span className="mu" role="status">{message}</span>}
          <Link to="/profile">Modifier mon profil vendeur →</Link>
        </div>
      </div>
    </header>
  )
}
