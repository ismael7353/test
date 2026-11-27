import { Link } from 'react-router-dom'
import Icon from '../components/Icon'

const BENEFITS = [
  {
    icon: '01',
    title: 'Tout votre catalogue, sans limite',
    description: 'Publiez autant de produits que nécessaire. La formule gratuite est limitée à 5 publications visibles.',
  },
  {
    icon: '02',
    title: 'Vos produits dans « À la une »',
    description: 'Les produits publiés par les boutiques Pro actives peuvent rejoindre la sélection mise en avant sur l’accueil.',
  },
  {
    icon: '03',
    title: 'Montrez vos produits en vidéo',
    description: 'Ajoutez des vidéos à vos publications et partagez des stories photo ou vidéo pour donner plus de contexte.',
  },
  {
    icon: '04',
    title: 'Comprenez ce qui intéresse vos clients',
    description: 'Consultez les vues, les abonnés, les interactions, les commandes, le chiffre d’affaires et vos publications les plus aimées.',
  },
  {
    icon: '05',
    title: 'Affichez votre statut Pro',
    description: 'Le badge Pro rend votre boutique plus identifiable dans les publications et sur votre page vendeur.',
  },
  {
    icon: '06',
    title: 'Essayez avant de choisir',
    description: 'Les boutiques éligibles peuvent activer un essai gratuit de 7 jours, une seule fois.',
  },
]

export default function PremiumPage() {
  return (
    <article className="premium-page">
      <header className="premium-hero">
        <span className="premium-kicker"><Icon name="sparkle" size={15} /> VENDEO PRO</span>
        <h1>Plus de place pour vos produits. Plus de visibilité pour votre boutique.</h1>
        <p>Les outils pour faire grandir votre catalogue, mettre votre savoir-faire en valeur et suivre votre activité au même endroit.</p>
        <div className="premium-hero-actions">
          <Link className="btn premium-primary" to="/plans">Voir les offres et les tarifs <span aria-hidden="true">→</span></Link>
          <Link className="premium-secondary" to="/dashboard">Retour à mon espace</Link>
        </div>
      </header>

      <section className="premium-benefits" aria-labelledby="premium-benefits-title">
        <div className="premium-section-heading">
          <span className="eyebrow">CE QUI CHANGE AVEC PRO</span>
          <h2 id="premium-benefits-title">Les bons outils, au bon moment.</h2>
          <p className="mu">Une formule pensée pour les vendeurs qui publient régulièrement et veulent mieux présenter leur activité.</p>
        </div>
        <div className="premium-benefit-grid">
          {BENEFITS.map((benefit) => (
            <section className="premium-benefit card" key={benefit.title}>
              <span className="premium-benefit-number">{benefit.icon}</span>
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </section>
          ))}
        </div>
      </section>

      <section className="premium-featured-explainer">
        <div className="premium-featured-symbol"><Icon name="sparkle" size={25} /></div>
        <div>
          <span className="eyebrow">MISE EN AVANT</span>
          <h2>Une place sur l’accueil pour les boutiques Pro.</h2>
          <p>La rubrique « À la une » présente jusqu’à 8 publications Pro les plus récentes. Gardez vos produits publiés et votre formule active pour qu’ils soient éligibles à cette sélection. La place dépend du nombre de publications Pro actives : tous les produits ne sont donc pas affichés en même temps.</p>
        </div>
        <Link className="btn premium-outline" to="/">Voir l’accueil</Link>
      </section>

      <section className="premium-bottom-cta">
        <div>
          <span className="eyebrow">PRÊT À PASSER À L’ÉTAPE SUIVANTE ?</span>
          <h2>Choisissez la durée qui vous convient.</h2>
          <p>Le paiement et l’activation sont confirmés par l’équipe Vendeo après échange avec vous.</p>
        </div>
        <Link className="btn premium-primary" to="/plans">Découvrir les tarifs <span aria-hidden="true">→</span></Link>
      </section>
    </article>
  )
}
