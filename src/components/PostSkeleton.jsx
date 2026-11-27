/** Squelette affiché pendant le chargement : la page ne saute pas à l'arrivée des données. */
export default function PostSkeleton() {
  return (
    <div className="card pc" aria-hidden="true">
      <div className="pc-head">
        <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%' }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ width: '40%', height: 12 }} />
          <div className="skeleton" style={{ width: '25%', height: 10, marginTop: 6 }} />
        </div>
      </div>
      <div className="skeleton" style={{ aspectRatio: '4 / 3', borderRadius: 0 }} />
      <div className="pc-body">
        <div className="skeleton" style={{ width: '65%', height: 16 }} />
        <div className="skeleton" style={{ width: '30%', height: 16 }} />
      </div>
    </div>
  )
}
