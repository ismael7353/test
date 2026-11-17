import { Suspense, lazy, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import ErrorBoundary from './components/ErrorBoundary'
import Icon from './components/Icon'
import HomePage from './pages/HomePage'

const SavedPage = lazy(() => import('./pages/SavedPage'))
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'))
const OrdersPage = lazy(() => import('./pages/OrdersPage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))
const ShopPage = lazy(() => import('./pages/ShopPage'))
const MapPage = lazy(() => import('./pages/MapPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
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

const titles = [
  ['/', 'Accueil'], ['/map', 'Carte'], ['/publish', 'Publier'], ['/login', 'Connexion'],
  ['/verify', 'Vérification'], ['/reset-password', 'Nouveau mot de passe'],
  ['/dashboard', 'Mon espace'], ['/profile', 'Profil'], ['/plans', 'Offres Vendeo'], ['/premium', 'Vendeo Pro'],
  ['/messages', 'Messages'], ['/saved', 'Favoris'], ['/notifications', 'Notifications'],
  ['/orders', 'Commandes'], ['/admin', 'Administration'],
]

function RouteEffects() {
  const location = useLocation()
  useEffect(() => {
    const match = titles.find(([path]) => path === location.pathname)
    const page = match?.[1] || (location.pathname.startsWith('/shop/') ? 'Boutique' : location.pathname.startsWith('/post/') ? 'Publication' : location.pathname.startsWith('/messages/') ? 'Conversation' : 'Vendeo')
    document.title = `${page} — Vendeo`
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [location.pathname])
  return null
}

export default function App() {
  return (
    <ErrorBoundary>
      <a className="skip-link" href="#contenu">Aller au contenu</a>
      <RouteEffects />
      <Navbar />
      <main id="contenu" tabIndex="-1">
        <Suspense fallback={<div className="card pad loading-state" role="status"><span className="spinner" />Chargement de la page…</div>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop/:slug" element={<ShopPage />} />
            <Route path="/post/:id" element={<PostPage />} />
            <Route path="/publish" element={<PublishPage />} />
            <Route path="/publish/:id" element={<PublishPage />} />
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
            <Route path="/verify" element={<VerifyPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="*" element={<section className="card pad empty-state"><Icon name="search" size={30} /><h2>Page introuvable</h2><p className="mu">Cette adresse n’existe pas ou a été déplacée.</p><a className="btn pri" href="/">Retour à l’accueil</a></section>} />
          </Routes>
        </Suspense>
      </main>
    </ErrorBoundary>
  )
}
