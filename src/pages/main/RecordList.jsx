import ErrorBanner from '../../components/ui/ErrorBanner'
import {truncate, getFieldValue} from '../../utils/helpers'

export default function RecordList({
                                       entityName,
                                       schema,
                                       records,
                                       error,
                                       onBack,
                                       onCreate,
                                       onEdit,
                                       onDelete,
                                   }) {
    function getRecordDisplayName(record) {
        if (!schema?.fields) return truncate(record.id, 40)
        const stringField = schema.fields.find(f =>
            f.type?.id === 'string' || f.type?.baseType === 'string'
        )
        if (stringField) {
            const value = getFieldValue(record, stringField.name)
            if (value) return truncate(value, 40)
        }
        return truncate(record.id, 40)
    }

    return (
        <div>
            <div className="page-header">
                <h2>{schema?.pluralName || entityName + 's'}</h2>
                <div>
                    <button className="secondary" onClick={onBack}>Back</button>
                    {' '}
                    <button className="success" onClick={onCreate}>Create New</button>
                </div>
            </div>

            <ErrorBanner message={error}/>

            {records.length === 0 && (
                <article>No items yet</article>
            )}

            {records.map(record => (
                <article
                    key={record.id}
                    onClick={() => onEdit(record.id)}
                    style={{cursor: 'pointer'}}
                >
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <div>
                            <strong>{getRecordDisplayName(record)}</strong>
                        </div>
                        <button
                            className="danger"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(record.id)
                            }}
                        >
                            Delete
                        </button>
                    </div>
                </article>
            ))}
        </div>
    )
}