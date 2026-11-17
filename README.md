# Vendeo

```
backend/supabase/   SQL à exécuter dans l'ordre : 01_schema, 02_security, 03_functions
frontend/           React + Vite
  src/api/          accès Supabase (un fichier par ressource)
  src/hooks/        useSession, usePaginated
  src/components/   éléments réutilisables
  src/pages/        une page par route (+ dashboard/ pour les blocs du tableau de bord)
```

## Installation
1. Supabase > SQL Editor : exécuter les 3 fichiers de `backend/supabase/`.
2. Authentication > Providers : activer la confirmation par e-mail et téléphone. Pour les codes e-mail, utiliser `{{ .Token }}` dans les modèles de confirmation et de changement d'adresse ; garder le modèle de récupération du mot de passe avec son lien. Configurer un fournisseur SMS pour les codes téléphone, puis les identifiants OAuth Google et Facebook.
3. Authentication > URL Configuration : ajouter l'adresse du site, `http://localhost:5173/login`, `http://localhost:5173/profile` et `http://localhost:5173/reset-password` aux Redirect URLs. Ajouter les mêmes chemins pour le domaine de production.
4. `cd frontend && cp .env.example .env` puis renseigner URL et clé publishable/anon.
5. `npm install && npm run dev`
6. Déploiement : Vercel ou Netlify (routage SPA déjà configuré) avec les 2 variables d'environnement.

### Authentification
- L'inscription accepte un seul identifiant : e-mail ou téléphone. Les numéros malgaches locaux sont normalisés en `+261`.
- Les comptes e-mail sont vérifiés par code ; les comptes téléphone utilisent les OTP SMS de Supabase. L'envoi WhatsApp n'est pas activé.
- La récupération par e-mail utilise un lien magique ; pour un compte téléphone, un code SMS ouvre le formulaire de nouveau mot de passe.
- Google et Facebook passent par Supabase OAuth. Les deux fournisseurs, les URI de rappel et leurs secrets doivent être configurés dans le tableau de bord Supabase.
- Un e-mail et un téléphone peuvent être ajoutés au profil ; chacun doit être confirmé avant de servir d'identifiant.

## Déploiement : PWA puis APK
1. Déployer `frontend/` sur Vercel (ou Netlify) avec `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` et les `VITE_PAY_*`. HTTPS obligatoire.
2. Supabase > Auth > URL Configuration : ajouter l'adresse du site. Exécuter les SQL 01 à 05.
3. Installable tout de suite : bouton ⬇️ dans la barre (Chrome Android) ou « Ajouter à l'écran d'accueil ».
4. APK : aller sur pwabuilder.com, coller l'adresse du site, Package for Android, télécharger. Pour retirer la barre d'adresse, placer le fichier `assetlinks.json` fourni par PWABuilder dans `frontend/public/.well-known/`, puis redéployer.
5. Play Store : envoyer l'AAB généré par PWABuilder.

## Réseau social et plans (nouveau)
- Exécuter aussi `backend/supabase/04_social_plans.sql` (profils, likes, commentaires, abonnés, paiements).
- Gratuit : 5 publications ; Pro : 15 000 Ar / 30 jours, illimité. Le vendeur paie par Mvola / Orange Money / Airtel Money puis saisit la référence dans « Plans et paiement ».
- Validation : vérifier la réception du SMS, puis dans le SQL Editor `select activate_plan('<id du paiement>');` (table `payments`).
- Numéros de réception : variables `VITE_PAY_MVOLA`, `VITE_PAY_ORANGE`, `VITE_PAY_AIRTEL` (à ajouter aussi dans les Secrets GitHub et le workflow si besoin).

## Stories, push, administration, premium (nouveau)
- Exécuter `07_stories_admin_premium.sql`. Administrateur : `update profiles set is_admin = true where id = (select id from auth.users where email = 'vous@mail.com');` puis page **Profil > Administration** (paiements à valider, signalements, boutiques vérifiées).
- Push : `npx web-push generate-vapid-keys`, mettre la clé publique dans `VITE_VAPID_PUBLIC_KEY`, déployer `backend/functions/send-push` (instructions en tête du fichier) et créer le webhook sur `notifications`.
- Vidéos et stories : compression des photos côté appareil ; vidéos limitées à 25 Mo (vérifier la limite de taille du bucket `posts` dans Supabase Storage).
- Proximité : seules les boutiques avec position (bouton « Utiliser ma position » à la création) apparaissent dans « Près de moi ».


## Qualité et sécurité
- Consulter `AMELIORATIONS.md` pour le détail des évolutions, la configuration et la checklist préproduction.
- Le fichier `.env` local est volontairement exclu de la distribution ; utiliser `.env.example`.
- Ne jamais exposer une clé Supabase `service_role` dans les variables `VITE_*`.
