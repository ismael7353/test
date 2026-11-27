const SUPPORT_URL = 'https://wa.me/261389807147'

export default function TermsPage() {
  return (
    <article className="legal-page">
      <header className="legal-hero">
        <span className="eyebrow">INFORMATIONS JURIDIQUES</span>
        <h1>Conditions générales d’utilisation</h1>
        <p>Les présentes conditions encadrent l’accès à Vendeo et l’utilisation de ses services par les acheteurs et les vendeurs.</p>
        <p className="mu">Mise à jour : 24 novembre 2026</p>
      </header>

      <div className="card pad legal-content">
        
        <section>
          <h2>1. Exploitant et acceptation</h2>
          <p>Vendeo est exploité par <strong>[nom légal de la personne ou de l’organisation responsable]</strong>, situé(e) à <strong>[adresse]</strong>. En accédant à Vendeo ou en créant un compte, vous acceptez ces conditions. Si vous ne les acceptez pas, n’utilisez pas les services nécessitant un compte.</p>
        </section>

        <section>
          <h2>2. Rôle de Vendeo</h2>
          <p>Vendeo met à disposition une plateforme de découverte de boutiques et de produits, de publication de contenus, de prise de contact et de transmission de demandes de commande. Les vendeurs proposent leurs propres produits et restent responsables de leurs offres, prix, stocks, communications, ventes, livraisons et obligations envers leurs clients. Sauf indication expresse contraire, Vendeo n’est ni le vendeur des produits ni partie au contrat conclu entre l’acheteur et le vendeur.</p>
          <p>Les utilisateurs doivent vérifier les informations de l’offre et convenir directement des modalités de paiement, de livraison, de retour ou de réclamation avec le vendeur. Vendeo ne garantit pas la disponibilité, la qualité, la légalité ou la conformité des produits publiés.</p>
        </section>

        <section>
          <h2>3. Compte et comportement des utilisateurs</h2>
          <p>Vous devez fournir des informations exactes, garder vos moyens d’accès confidentiels et utiliser uniquement votre propre compte. Vous êtes responsable des actions réalisées au moyen de celui-ci. Informez Vendeo sans délai si vous suspectez un accès non autorisé.</p>
          <p>Vous vous engagez à ne pas publier de contenu illégal, trompeur, frauduleux, portant atteinte aux droits d’autrui ou contenant des informations personnelles sans autorisation. Il est également interdit de perturber le service, d’en contourner les protections ou d’utiliser Vendeo à des fins abusives.</p>
        </section>

        <section>
          <h2>4. Contenus publiés</h2>
          <p>Vous conservez vos droits sur les contenus que vous publiez. Vous autorisez Vendeo à les héberger, reproduire et afficher dans la mesure nécessaire à la fourniture et à la promotion des fonctionnalités de la plateforme. Vous garantissez disposer des droits et autorisations nécessaires pour ces contenus.</p>
          <p>Vendeo peut retirer ou rendre inaccessible un contenu qui semble enfreindre ces conditions, les droits d’autrui ou les règles applicables. Les stories sont conçues pour ne plus être affichées après 24 heures.</p>
        </section>

        <section>
          <h2>5. Commandes, paiements et abonnements Pro</h2>
          <p>Une demande de commande transmise sur Vendeo ne constitue pas une garantie d’acceptation par le vendeur. Le vendeur et l’acheteur doivent confirmer les détails et organiser directement le paiement et la livraison.</p>
          <p>Les abonnements Pro sont activés après confirmation du paiement selon les modalités proposées par Vendeo. Le paiement est organisé directement avec l’équipe Vendeo ; aucun paiement intégré à l’application n’est proposé à ce jour. Les abonnements ne sont pas renouvelés automatiquement. Pour une question ou une réclamation concernant un paiement Pro, contactez <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer">l’équipe Vendeo sur WhatsApp</a>.</p>
        </section>

        <section>
          <h2>6. Disponibilité du service</h2>
          <p>Vendeo peut faire évoluer, suspendre ou interrompre tout ou partie du service, notamment pour maintenance, sécurité ou évolution technique. Nous faisons des efforts raisonnables pour maintenir le service, sans garantir une disponibilité continue ni l’absence d’erreurs ou de pertes de données.</p>
        </section>

        <section>
          <h2>7. Suspension et clôture</h2>
          <p>Vendeo peut limiter ou suspendre un compte en cas de violation des présentes conditions, de risque pour les utilisateurs ou de demande légale. Vous pouvez cesser d’utiliser le service et demander la clôture de votre compte en contactant l’équipe Vendeo. La clôture ne supprime pas les contenus déjà partagés ou les données qui doivent être conservées selon la politique de confidentialité et les règles applicables.</p>
        </section>

        <section>
          <h2>8. Responsabilité</h2>
          <p>Dans les limites permises par la loi, Vendeo ne répond pas des actes, produits, offres, paiements, livraisons ou échanges entre utilisateurs, ni des dommages résultant d’informations fournies par les utilisateurs ou de l’indisponibilité temporaire du service. Aucune disposition des présentes ne limite une responsabilité qui ne peut légalement être exclue.</p>
        </section>

        <section>
          <h2>9. Modifications et contact</h2>
          <p>Ces conditions peuvent être mises à jour. La date affichée en haut indique la dernière version. Les changements importants pourront être signalés sur Vendeo. Pour toute question, contactez-nous à <strong>[adresse e-mail de contact]</strong> ou via <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer">WhatsApp au +261 38 98 071 47</a>.</p>
          <p><strong>[Ajouter ici la loi applicable et les modalités de règlement des litiges après validation juridique.]</strong></p>
        </section>
      </div>
    </article>
  )
}
