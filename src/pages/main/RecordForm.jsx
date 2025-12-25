import ErrorBanner from '../../components/ui/ErrorBanner'
import FieldInput from '../../components/ui/FieldInput'
import MultiSelect from '../../components/common/MultiSelect'
import {getFieldValue} from '../../utils/helpers'
import {getRelationEntities, getByKey, normalizeKey} from '../../utils/relations'

export default function RecordForm({
                                       entityName,
                                       schema,
                                       formMode,
                                       formData,
                                       selectedRelations,
                                       relationOptions,
                                       error,
                                       onFieldChange,
                                       onRelationChange,
                                       onSubmit,
                                       onCancel,
                                   }) {
    const fields = schema?.fields || []
    const schemaRelations = schema?.relations || []

    const relationEntities = getRelationEntities(schemaRelations, selectedRelations)

    return (
        <div>
            <div className="page-header">
                <h2>{formMode === 'create' ? 'Create' : 'Edit'} {entityName}</h2>
                <button className="secondary" onClick={onCancel}>Back</button>
            </div>

            <ErrorBanner message={error}/>

            <article>
                {fields.map(field => (
                    <label key={field.name}>
                        {field.name}
                        {field.isRequired && <span style={{color: 'var(--pico-del-color)'}}> *</span>}
                        <FieldInput
                            field={field}
                            value={getFieldValue(formData, field.name)}
                            onChange={(value) => onFieldChange(field.name, value)}
                        />
                    </label>
                ))}

                {relationEntities.length > 0 && (
                    <>
                        <hr/>
                        <strong>Relations</strong>

                        {relationEntities.map(entityKey => {
                            const displayName = entityKey.charAt(0).toUpperCase() + entityKey.slice(1)
                            const options = getByKey(relationOptions, entityKey)
                            const selected = getByKey(selectedRelations, entityKey)

                            return (
                                <label key={entityKey}>
                                    {displayName}
                                    <MultiSelect
                                        options={options}
                                        value={selected}
                                        onChange={(values) => onRelationChange(normalizeKey(entityKey), values)}
                                        placeholder={`Select ${displayName}...`}
                                    />
                                </label>
                            )
                        })}
                    </>
                )}

                <div style={{marginTop: 16}}>
                    <button className="success" onClick={onSubmit}>
                        {formMode === 'create' ? 'Create' : 'Save'}
                    </button>
                    {' '}
                    <button className="secondary" onClick={onCancel}>Cancel</button>
                </div>
            </article>
        </div>
    )
}