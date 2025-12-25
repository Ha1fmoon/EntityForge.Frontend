import ErrorBanner from '../../components/ui/ErrorBanner'

export default function EntityList({entities, error, loading, onSelect}) {
    return (
        <div>
            <div className="page-header">
                <h2>Services</h2>
            </div>

            <ErrorBanner message={error}/>

            {entities.length === 0 && !loading && (
                <article>
                    No generated services.
                </article>
            )}

            {entities.map(entity => (
                <article
                    key={entity.name}
                    onClick={() => onSelect(entity.name)}
                    style={{cursor: 'pointer'}}
                >
                    <div>
                        <strong>{entity.pluralName}</strong>
                    </div>
                </article>
            ))}
        </div>
    )
}