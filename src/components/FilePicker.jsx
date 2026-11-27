import { useId } from 'react'
import Icon from './Icon'

export default function FilePicker({
  accept,
  onChange,
  title,
  description,
  icon = 'image',
  disabled = false,
  className = '',
}) {
  const inputId = useId()

  return (
    <label className={`file-picker${className ? ` ${className}` : ''}${disabled ? ' is-disabled' : ''}`} htmlFor={inputId}>
      <span className="file-picker-icon"><Icon name={icon} /></span>
      <span className="file-picker-copy">
        <strong>{title}</strong>
        {description && <small>{description}</small>}
      </span>
      <span className="file-picker-action">Choisir</span>
      <input
        id={inputId}
        className="file-picker-input"
        type="file"
        accept={accept}
        disabled={disabled}
        onChange={(event) => {
          onChange(event)
          event.currentTarget.value = ''
        }}
      />
    </label>
  )
}
