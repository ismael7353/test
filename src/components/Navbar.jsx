import { Link, NavLink } from 'react-router-dom'
import { useSession } from '../hooks/useSession'
import { useUnread } from '../hooks/useUnread'
import { useInstall } from '../hooks/useInstall'
import { useTheme } from '../hooks/useTheme'
import Icon from './Icon'

const active = ({ isActive }) => (isActive ? 'on' : '')

export default function Navbar() {
  const { user } = useSession()
  const [theme, toggle] = useTheme()
  const { install, showHint, dismissHint } = useInstall()
  const unread = useUnread(user)
  return (
    <nav aria-label="Navigation principale">
      <Link to="/" className="brand" aria-label="Vendeo, accueil">Vendeo</Link>
      <div className="links">
        <NavLink to="/" end className={active}><span><Icon name="home" /></span>Accueil</NavLink>
        <NavLink to="/discover" className={active}><span><Icon name="compass" /></span>Découvrir</NavLink>
        <NavLink to="/publish" className={active}><span><Icon name="plus" /></span>Publier</NavLink>
        <NavLink to="/map" className={active}><span><Icon name="pin" /></span>Carte</NavLink>
        <NavLink to={user ? '/dashboard' : '/login'} className={active}><span><Icon name="user" /></span>{user ? 'Mon espace' : 'Connexion'}</NavLink>
      </div>
      {install && (
        <div className="install-control">
          <button
            className="theme"
            aria-label="Installer l’application"
            aria-expanded={showHint}
            aria-controls="install-guide"
            onClick={install}
          >
            <Icon name="download" />
          </button>
          {showHint && (
            <aside className="install-guide" id="install-guide" role="region" aria-label="Conseil d’installation">
              <b>Retrouvez Vendeo facilement</b>
              <p>Touchez la flèche pour ajouter l’application à votre appareil.</p>
              <div>
                <button className="pri" onClick={install}>Installer</button>
                <button onClick={dismissHint}>Plus tard</button>
              </div>
            </aside>
          )}
        </div>
      )}
      {user && <Link to="/notifications" className="theme bell" aria-label="Notifications"><Icon name="bell" />{unread > 0 && <i className="badge">{unread > 9 ? '9+' : unread}</i>}</Link>}
      {user && <Link to="/messages" className="theme" aria-label="Messages"><Icon name="message" /></Link>}
      {user && <Link to="/profile" className="theme" aria-label="Mon profil"><Icon name="user" /></Link>}
      <button className="theme" aria-label="Changer de thème" onClick={toggle}><Icon name={theme === 'dark' ? 'sun' : 'moon'} /></button>
    </nav>
  )
}
