const SUPPORT_URL = 'https://wa.me/261389807147'

export default function PrivacyPage() {
  return (
    <article className="legal-page">
      <header className="legal-hero">
        <span className="eyebrow">INFORMATIONS JURIDIQUES</span>
        <h1>Politique de confidentialité</h1>
        <p>Cette politique explique quelles données Vendeo traite lorsque vous utilisez la plateforme et comment exercer vos choix.</p>
        <p className="mu">Mise à jour : 24 novembre 2026</p>
      </header>

      <div className="card pad legal-content">
        
        <section>
          <h2>1. Responsable du traitement et contact</h2>
          <p>Le service Vendeo est exploité par <strong>[nom légal de la personne ou de l’organisation responsable]</strong>, situé(e) à <strong>[adresse]</strong>. Pour toute question ou demande relative à vos données, contactez-nous à <strong>[adresse e-mail de contact]</strong> ou via <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer">WhatsApp au +261 38 98 071 47</a>.</p>
        </section>

        <section>
          <h2>2. Données traitées</h2>
          <p>Selon les fonctionnalités que vous utilisez, Vendeo peut traiter :</p>
          <ul>
            <li>les données de compte et de connexion, comme l’e-mail ou le téléphone utilisé pour vous connecter, votre mot de passe (protégé par Supabase) et les codes de vérification associés ;</li>
            <li>les informations de profil, comme votre pseudo public, un éventuel téléphone de contact, votre biographie et votre photo ;</li>
            <li>une empreinte temporaire de l’adresse IP, utilisée pour limiter les créations abusives de comptes ;</li>
            <li>les informations de boutique et les contenus publiés : coordonnées de contact, ville, position de la boutique si vous l’ajoutez, produits, photos, vidéos et stories ;</li>
            <li>les commandes, notamment le nom, le téléphone, les articles et la quantité demandée ;</li>
            <li>les messages, avis, commentaires, favoris, abonnements, signalements et notifications ;</li>
            <li>pour un abonnement Pro, les informations de paiement que vous déclarez, telles que le moyen utilisé, le numéro expéditeur et la référence de transaction ;</li>
            <li>si vous activez les notifications, l’identifiant technique d’abonnement push de votre navigateur ou appareil.</li>
          </ul>
          <p>La position de votre appareil n’est utilisée qu’après autorisation du navigateur pour les fonctions de proximité. Elle est utilisée en mémoire pour calculer la distance et n’est pas enregistrée par Vendeo comme votre position actuelle. La position d’une boutique que vous choisissez d’ajouter peut, elle, être affichée publiquement.</p>
        </section>

        <section>
          <h2>3. Utilisation des données</h2>
          <p>Les données servent à créer et sécuriser les comptes, afficher les profils et boutiques, gérer les publications et commandes, permettre les échanges entre acheteurs et vendeurs, assurer les notifications, traiter les signalements, gérer les abonnements Pro et faire fonctionner les fonctionnalités de la plateforme.</p>
          <p>Le navigateur peut conserver des éléments techniques indispensables, notamment la session de connexion, le thème choisi et vos préférences. Aucun outil publicitaire ou de mesure d’audience n’est actuellement configuré. Le choix enregistré dans le bandeau ne déclenche pas de suivi supplémentaire.</p>
        </section>

        <section>
          <h2>4. Visibilité et partage</h2>
          <p>Les profils, boutiques, publications, avis et autres contenus destinés au public peuvent être consultés par les visiteurs de Vendeo. Les informations nécessaires à une commande ou à une conversation sont accessibles au vendeur concerné et à l’acheteur participant. Les références de paiement déclarées sont accessibles aux personnes autorisées à vérifier les paiements.</p>
          <p>Vendeo ne vend pas vos données personnelles. Le service fait appel à des prestataires techniques, notamment Supabase pour l’authentification et le stockage des données, ainsi qu’au prestataire d’hébergement choisi pour le déploiement. Ces prestataires traitent les données pour fournir leurs services, selon leur configuration et leurs propres conditions. <strong>[Préciser la région du projet Supabase et les éventuels autres prestataires utilisés.]</strong></p>
          <p>Si vous contactez un vendeur par téléphone, WhatsApp ou Facebook, l’échange se poursuit sur le service choisi et est soumis aux conditions de ce service tiers.</p>
        </section>

        <section>
          <h2>5. Durée de conservation</h2>
          <p>Les données sont conservées pendant la durée nécessaire au fonctionnement du compte et aux finalités décrites ci-dessus, puis supprimées ou conservées uniquement lorsque cela reste nécessaire pour traiter une demande, assurer la sécurité ou répondre aux obligations applicables. Les délais précis doivent être définis par l’exploitant de Vendeo.</p>
          <p>Les stories cessent d’être affichées après leur période d’activité de 24 heures. Leur suppression technique peut suivre un délai différent. Les sauvegardes et données conservées par les prestataires peuvent également avoir leurs propres délais.</p>
        </section>

        <section>
          <h2>6. Vos choix et demandes</h2>
          <p>Vous pouvez modifier certaines informations depuis votre profil et demander l’accès, la rectification ou la suppression des données qui vous concernent, sous réserve des règles applicables et des données qui doivent être conservées. Pour cela, contactez-nous par les moyens indiqués à la section 1 en précisant votre demande et le compte concerné. Nous pouvons demander des informations raisonnables pour vérifier votre identité.</p>
          <p>Vous pouvez refuser l’accès à la géolocalisation et désactiver les notifications dans les réglages de votre appareil ou navigateur. Certaines fonctions ne seront alors pas disponibles.</p>
        </section>

        <section>
          <h2>7. Sécurité</h2>
          <p>Vendeo applique des contrôles d’accès et des mesures techniques adaptés à son fonctionnement. Aucun service en ligne ne peut toutefois garantir une sécurité absolue. Choisissez un mot de passe robuste et ne partagez pas vos codes de vérification.</p>
        </section>

        <section>
          <h2>8. Modifications</h2>
          <p>Cette politique peut évoluer avec le service ou les règles applicables. La date de mise à jour affichée en haut de page indique la version en vigueur. En cas de changement important, Vendeo pourra vous en informer par la plateforme.</p>
        </section>
      </div>
    </article>
  )
}
