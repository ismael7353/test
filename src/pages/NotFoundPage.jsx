import { Link } from 'react-router-dom'
import Icon from '../components/Icon'

export default function NotFoundPage() {
  return (
    <section className="not-found card" aria-labelledby="not-found-title">
      <div className="not-found-art" aria-hidden="true">
        <span>404</span>
        <Icon name="search" size={54} />
      </div>
      <span className="eyebrow">ON S’EST PERDUS ?</span>
      <h1 id="not-found-title">Cette page est introuvable.</h1>
      <p className="mu">Le lien a peut-être changé ou la page n’existe plus. Retrouvons ensemble une boutique ou revenons à l’accueil.</p>
      <div className="not-found-actions">
        <Link className="btn pri" to="/">Retour à l’accueil</Link>
        <Link className="btn" to="/map">Trouver une boutique</Link>
      </div>
    </section>
  )
}
