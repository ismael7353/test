export default function PageLoading({ label = 'Chargement de la page…', compact = false }) {
  return (
    <section
      className={`page-loader${compact ? ' page-loader-compact' : ''}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="page-loader-mark" aria-hidden="true"><i /></span>
      <div className="page-loader-copy">
        <strong>{label}</strong>
        {!compact && (
          <div className="page-loader-lines" aria-hidden="true">
            <i className="skeleton" />
            <i className="skeleton" />
          </div>
        )}
      </div>
    </section>
  )
}
