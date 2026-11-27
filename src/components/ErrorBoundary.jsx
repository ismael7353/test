import { Component } from 'react'
import Icon from './Icon'

/** Empêche une erreur React isolée de laisser l'application entièrement blanche. */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error) {
    // Les détails restent dans la console développeur, jamais dans l'interface publique.
    console.error('Erreur d’interface Vendeo :', error)
  }

  render() {
    if (this.state.failed) {
      return (
        <section className="card pad app-error" role="alert">
          <Icon name="warning" size={30} />
          <h2>Un petit problème est survenu</h2>
          <p className="mu">La page n’a pas pu s’afficher correctement. Vous pouvez réessayer sans perdre votre compte.</p>
          <button className="pri" onClick={() => window.location.reload()}>Recharger la page</button>
        </section>
      )
    }
    return this.props.children
  }
}
