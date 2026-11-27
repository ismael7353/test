import { Suspense, lazy, useEffect, useState } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import ErrorBoundary from './components/ErrorBoundary'
import CookieConsent from './components/CookieConsent'
import PageLoading from './components/PageLoading'
import HomePage from './pages/HomePage'

const DiscoverPage = lazy(() => import('./pages/DiscoverPage'))
const SavedPage = lazy(() => import('./pages/SavedPage'))
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'))
const OrdersPage = lazy(() => import('./pages/OrdersPage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))
const ShopPage = lazy(() => import('./pages/ShopPage'))
const MapPage = lazy(() => import('./pages/MapPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const CompleteAccountPage = lazy(() => import('./pages/CompleteAccountPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const PostPage = lazy(() => import('./pages/PostPage'))
const PublishPage = lazy(() => import('./pages/PublishPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const PlansPage = lazy(() => import('./pages/PlansPage'))
const PremiumPage = lazy(() => import('./pages/PremiumPage'))
const ChatPage = lazy(() => import('./pages/ChatPage'))
const MessagesPage = lazy(() => import('./pages/MessagesPage'))
const VerifyPage = lazy(() => import('./pages/VerifyPage'))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'))
const TermsPage = lazy(() => import('./pages/TermsPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

const focusedWorkspacePaths = ['/dashboard', '/profile', '/publish', '/messages', '/orders', '/saved', '/notifications', '/admin']

const pageMetadata = [
  ['/', 'Vendeo — Boutiques et bonnes affaires à Antananarivo', 'Découvrez les boutiques, produits et bonnes affaires près de chez vous à Antananarivo avec Vendeo.'],
  ['/discover', 'Découvrir', 'Parcourez les publications des boutiques une par une sur Vendeo.'],
  ['/map', 'Carte des boutiques', 'Repérez les boutiques et produits près de vous sur la carte Vendeo.'],
  ['/publish', 'Publier une annonce', 'Présentez vos produits et votre boutique aux acheteurs sur Vendeo.'],
  ['/login', 'Connexion ou inscription', 'Connectez-vous ou créez un compte Vendeo pour acheter, vendre et échanger.'],
  ['/complete-account', 'Finaliser votre compte', 'Choisissez un pseudo public pour votre compte Vendeo.'],
  ['/verify', 'Vérification du compte', 'Vérifiez votre adresse e-mail ou votre numéro de téléphone pour sécuriser votre compte Vendeo.'],
  ['/reset-password', 'Nouveau mot de passe', 'Réinitialisez le mot de passe de votre compte Vendeo.'],
  ['/dashboard', 'Mon espace vendeur', 'Gérez votre boutique, vos publications et vos commandes sur Vendeo.'],
  ['/profile', 'Mon profil', 'Consultez et mettez à jour les informations de votre profil Vendeo.'],
  ['/plans', 'Offres Vendeo Pro', 'Découvrez les offres Vendeo et les fonctionnalités proposées aux vendeurs.'],
  ['/premium', 'Vendeo Pro', 'Découvrez les outils de visibilité et les avantages Vendeo Pro.'],
  ['/messages', 'Messages', 'Retrouvez vos conversations avec les acheteurs et les vendeurs sur Vendeo.'],
  ['/saved', 'Favoris', 'Retrouvez les produits que vous avez enregistrés sur Vendeo.'],
  ['/notifications', 'Notifications', 'Consultez les nouvelles interactions et les mises à jour de votre compte Vendeo.'],
  ['/orders', 'Commandes', 'Suivez vos demandes de commande effectuées auprès des boutiques Vendeo.'],
  ['/admin', 'Administration', 'Espace d’administration Vendeo.'],
  ['/confidentialite', 'Politique de confidentialité', 'Découvrez quelles données Vendeo traite et comment exercer vos choix.'],
  ['/conditions-generales', 'Conditions générales', 'Consultez les conditions générales d’utilisation de Vendeo.'],
]

function updateMeta(attribute, key, content) {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

function RouteEffects() {
  const location = useLocation()
  useEffect(() => {
    const match = pageMetadata.find(([path]) => path === location.pathname)
    const [title, description] = match
      ? [match[1], match[2]]
      : location.pathname.startsWith('/shop/')
        ? ['Boutique — Vendeo', 'Découvrez les produits et les informations de cette boutique sur Vendeo.']
        : location.pathname.startsWith('/post/')
          ? ['Publication — Vendeo', 'Découvrez cette publication et contactez la boutique sur Vendeo.']
          : location.pathname.startsWith('/messages/')
            ? ['Conversation — Vendeo', 'Échangez avec un acheteur ou un vendeur sur Vendeo.']
            : ['Page introuvable — Vendeo', 'Cette adresse Vendeo n’existe pas ou a été déplacée.']
    const image = new URL('/social-preview.png', window.location.origin).href
    document.title = title
    updateMeta('name', 'description', description)
    updateMeta('property', 'og:title', title)
    updateMeta('property', 'og:description', description)
    updateMeta('property', 'og:image', image)
    updateMeta('property', 'og:image:alt', 'Vendeo — les boutiques d’Antananarivo à portée de main')
    updateMeta('property', 'og:url', window.location.href.split('#')[0])
    updateMeta('name', 'twitter:title', title)
    updateMeta('name', 'twitter:description', description)
    updateMeta('name', 'twitter:image', image)
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [location.pathname])
  return null
}

export default function App() {
  const location = useLocation()
  const [openCookieSettings, setOpenCookieSettings] = useState(false)
  const isFocusedWorkspace = focusedWorkspacePaths.some((path) => location.pathname === path || location.pathname.startsWith(`${path}/`))
  const isConversation = location.pathname.startsWith('/messages/')
  const isDiscover = location.pathname === '/discover'

  return (
    <ErrorBoundary>
      <div className={`app-shell${isConversation ? ' is-conversation' : ''}${isDiscover ? ' is-discover' : ''}`}>
        <a className="skip-link" href="#contenu">Aller au contenu</a>
        <RouteEffects />
        <Navbar />
        <main id="contenu" className={isConversation ? 'conversation-main' : isDiscover ? 'discover-main' : ''} tabIndex="-1">
          <div className="page-enter" key={location.pathname}>
            <Suspense fallback={<PageLoading />}>
              <Routes location={location}>
                <Route path="/" element={<HomePage />} />
                <Route path="/shop/:slug" element={<ShopPage />} />
                <Route path="/post/:id" element={<PostPage />} />
                <Route path="/publish" element={<PublishPage />} />
                <Route path="/publish/:id" element={<PublishPage />} />
                <Route path="/discover" element={<DiscoverPage />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/plans" element={<PlansPage />} />
                <Route path="/premium" element={<PremiumPage />} />
                <Route path="/messages" element={<MessagesPage />} />
                <Route path="/messages/:id" element={<ChatPage />} />
                <Route path="/saved" element={<SavedPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/complete-account" element={<CompleteAccountPage />} />
                <Route path="/verify" element={<VerifyPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/confidentialite" element={<PrivacyPage />} />
                <Route path="/conditions-generales" element={<TermsPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </div>
        </main>
        {!isFocusedWorkspace && !isDiscover && (
          <footer className="site-footer">
            <span>© {new Date().getFullYear()} Vendeo</span>
            <div>
              <Link to="/confidentialite">Politique de confidentialité</Link>
              <Link to="/conditions-generales">Conditions générales</Link>
              <button type="button" className="cookie-manage" onClick={() => setOpenCookieSettings(true)}>Préférences cookies</button>
            </div>
          </footer>
        )}
        {!isFocusedWorkspace && <CookieConsent forceOpen={openCookieSettings} onClose={() => setOpenCookieSettings(false)} />}
      </div>
    </ErrorBoundary>
  )
}
