/** Squelette affiché pendant le chargement : la page ne saute pas à l'arrivée des données. */
export default function PostSkeleton() {
  return (
    <div className="card" aria-hidden="true">
      <div className="pad row">
        <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%' }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ width: '40%', height: 12 }} />
          <div className="skeleton" style={{ width: '25%', height: 10, marginTop: 6 }} />
        </div>
      </div>
      <div className="skeleton" style={{ aspectRatio: '4 / 3', borderRadius: 0 }} />
      <div className="pad">
        <div className="skeleton" style={{ width: '60%', height: 14 }} />
      </div>
    </div>
  )
}
