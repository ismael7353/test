# Vendeo

```
backend/supabase/   SQL à exécuter dans l'ordre numérique : 01 à 10
backend/functions/  Edge Functions existantes
frontend/           React + Vite
  src/api/          accès Supabase (un fichier par ressource)
  src/hooks/        useSession, usePaginated
  src/components/   éléments réutilisables
  src/pages/        une page par route (+ dashboard/ pour les blocs du tableau de bord)
```

## Installation
1. Première installation : exécuter les fichiers `01` à `10` de `backend/supabase/` dans l'ordre. Si les migrations `01` à `09` sont déjà installées, exécuter uniquement `10_shop_facebook_contact.sql` (une seule fois).
2. Authentication > Providers : garder la confirmation par e-mail activée et configurer le modèle de confirmation avec `{{ .Token }}`. Configurer un fournisseur SMS si les comptes doivent pouvoir s’inscrire ou récupérer leur mot de passe par téléphone. Désactiver **Secure email change** si un utilisateur connecté par téléphone doit pouvoir ajouter un e-mail; cette adresse devra toujours être confirmée. Google et Facebook ne sont plus utilisés pour l'inscription.
3. Authentication > URL Configuration : ajouter l'adresse du site, `http://localhost:5173/profile`, `http://localhost:5173/verify` et `http://localhost:5173/reset-password` aux Redirect URLs. Ajouter les mêmes chemins pour le domaine de production.
4. `cd frontend && cp .env.example .env` puis renseigner URL et clé publishable/anon.
5. `npm install && npm run dev`
6. Déploiement : Vercel ou Netlify (routage SPA déjà configuré) avec les 2 variables d'environnement.

### Authentification
- Acheteurs et vendeurs choisissent un pseudo public unique et utilisent leur e-mail ou leur numéro de téléphone avec un mot de passe d'au moins 8 caractères pour s'inscrire et se connecter. Le pseudo (3 à 30 caractères : lettres sans accent, chiffres, `.`, `_` ou `-`) est affiché publiquement, mais ne sert pas d'identifiant de connexion.
- Les comptes existants continuent de se connecter avec leur e-mail ou téléphone. Ils peuvent choisir un pseudo public depuis leur profil. Les sessions restent enregistrées sur l'appareil et se renouvellent automatiquement.
- Un e-mail ajouté au profil doit être confirmé et peut ensuite servir à se connecter et à récupérer le mot de passe. Le numéro de téléphone de contact du profil est indépendant de l'identifiant de connexion.
- Aucune Edge Function supplémentaire n'est requise pour l'authentification; celle-ci utilise directement Supabase Auth.
- Le fichier `08_username_auth.sql` ajoute les pseudos uniques et restreint la lecture et l'envoi des messages aux participants de la conversation.
- Le fichier `09_manual_plan_requests.sql` ajoute les demandes Pro WhatsApp et les commandes d’administration pour confirmer le paiement et appliquer la durée choisie.
- Le fichier `10_shop_facebook_contact.sql` ajoute le lien Facebook des boutiques. Il doit être appliqué avant de déployer le code qui utilise ce champ.

## Générer l’application Android (APK)
La méthode la plus légère consiste à générer un paquet Trusted Web Activity (TWA) avec [PWABuilder](https://www.pwabuilder.com/) depuis l’URL HTTPS déployée. Elle ne demande pas d’installer Android Studio ; l’application ouvre le site déployé.

1. Déployer la PWA sur Vercel ou Netlify en HTTPS, avec son manifeste et son service worker accessibles publiquement.
2. Sur PWABuilder, saisir l’URL du site, choisir **Package For Stores > Google Play**, puis télécharger le paquet.
3. Le ZIP contient `Vendeo.apk` pour installer l’application, `Vendeo.aab` pour le Play Store, et des fichiers de signature. Garder `signing.keystore` et `signing-key-info.txt` confidentiels et en lieu sûr : ils sont nécessaires pour publier des mises à jour signées avec la même clé.
4. Le fichier `public/.well-known/assetlinks.json` doit être déployé à `https://<domaine>/.well-known/assetlinks.json`. Il associe le domaine au paquet `mg.vendeo.app` et à la clé de signature générée. Vérifier cette association si un nouveau paquet est généré ou si la clé change.

Les changements publiés sur le site sont alors visibles dans l’application sans reconstruire l’APK. L’application web reste aussi installable directement via le bouton ⬇️ dans Chrome Android ou « Ajouter à l’écran d’accueil ».

## Réseau social et plans (nouveau)
- Exécuter aussi `backend/supabase/04_social_plans.sql` (profils, likes, commentaires, abonnés, paiements).
- Gratuit : 5 publications ; Pro : 15 000 Ar / 30 jours, illimité. Le vendeur paie par Mvola / Orange Money / Airtel Money puis saisit la référence dans « Plans et paiement ».
- Validation : vérifier la réception du SMS, puis dans le SQL Editor `select activate_plan('<id du paiement>');` (table `payments`).
- Numéros de réception : variables `VITE_PAY_MVOLA`, `VITE_PAY_ORANGE`, `VITE_PAY_AIRTEL` (à ajouter aussi dans les Secrets GitHub et le workflow si besoin).

## Stories, push, administration, premium (nouveau)
- Exécuter `07_stories_admin_premium.sql`. Administrateur : `update profiles set is_admin = true where id = (select id from auth.users where email = 'vous@mail.com');` puis page **Profil > Administration** (paiements à valider, signalements, boutiques vérifiées).
- Push Android/PWA : exécuter aussi `11_android_push.sql` après les migrations précédentes. Générer les clés avec `npx web-push generate-vapid-keys`, placer uniquement la clé publique dans `frontend/.env` (`VITE_VAPID_PUBLIC_KEY`). Déployer `backend/functions/send-push` avec `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `VAPID_PUBLIC`, `VAPID_PRIVATE` et `WEBHOOK_SECRET` comme secrets Supabase. Dans Supabase > Database > Webhooks, créer un webhook `INSERT` sur `public.notifications` vers la fonction `send-push`, avec l'en-tête `x-webhook-secret` égal au secret serveur. Héberger le frontend en HTTPS. Sur Android, ouvrir Vendeo dans Chrome, installer l'application depuis le menu du navigateur, puis aller dans Profil > Notifications sur Android > Activer. Les notifications push sont liées au compte connecté et à chaque appareil ; elles ne peuvent pas être testées tant que les secrets et le webhook ne sont pas configurés.
- Vidéos et stories : compression des photos côté appareil ; vidéos limitées à 25 Mo (vérifier la limite de taille du bucket `posts` dans Supabase Storage).
- Proximité : seules les boutiques avec position (bouton « Utiliser ma position » à la création) apparaissent dans « Près de moi ».


## Qualité et sécurité
- Consulter `AMELIORATIONS.md` pour le détail des évolutions, la configuration et la checklist préproduction.
- Le fichier `.env` local est volontairement exclu de la distribution ; utiliser `.env.example`.
- Ne jamais exposer une clé Supabase `service_role` dans les variables `VITE_*`.
- Toute variable `VITE_*` est intégrée au bundle public. Le frontend ne doit contenir que des valeurs publiques, par exemple l’URL Supabase, sa clé `publishable`/`anon`, la clé publique VAPID et les numéros de réception des paiements. Ne placez jamais de clé `service_role`, de clé VAPID privée, de secret OAuth ou de mot de passe dans `frontend/.env` ou dans une variable `VITE_*` ; gardez ces secrets dans les fonctions backend et les variables serveur. Le fichier `frontend/.env` est ignoré par Git.
# test
