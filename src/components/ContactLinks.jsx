import { facebookLink, whatsappLink } from '../lib/format'
import Icon from './Icon'

export default function ContactLinks({ shop, message, className = '' }) {
  const whatsapp = shop?.whatsapp?.trim()
  const facebook = facebookLink(shop?.facebook_url)
  if (!whatsapp && !facebook) return null

  return (
    <div className={`contact-links${className ? ` ${className}` : ''}`} aria-label="Contacter le vendeur">
      {whatsapp && (
        <a className="contact-link is-whatsapp" href={whatsappLink(whatsapp, message)} target="_blank" rel="noopener noreferrer">
          <Icon name="phone" />
          <span>WhatsApp</span>
        </a>
      )}
      {facebook && (
        <a className="contact-link is-facebook" href={facebook} target="_blank" rel="noopener noreferrer">
          <Icon name="facebook" />
          <span>Facebook</span>
        </a>
      )}
    </div>
  )
}
