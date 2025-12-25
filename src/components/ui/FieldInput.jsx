export default function FieldInput({field, value, onChange}) {
    const baseType = (field.type?.baseType || field.type?.id || 'string').toLowerCase()
    const currentValue = value ?? ''

    switch (baseType) {
        case 'int':
        case 'integer':
            return (
                <input
                    type="text"
                    inputMode="numeric"
                    value={currentValue}
                    onChange={e => onChange(e.target.value)}
                />
            )

        case 'decimal':
        case 'double':
        case 'float':
            return (
                <input
                    type="text"
                    inputMode="decimal"
                    value={currentValue}
                    onChange={e => onChange(e.target.value)}
                />
            )

        case 'bool':
        case 'boolean':
            return (
                <input
                    type="checkbox"
                    role="switch"
                    checked={!!currentValue}
                    onChange={e => onChange(e.target.checked)}
                />
            )

        case 'datetime':
            return (
                <input
                    type="datetime-local"
                    value={currentValue ? currentValue.slice(0, 16) : ''}
                    onChange={e => onChange(e.target.value)}
                />
            )

        default:
            return (
                <input
                    type="text"
                    value={currentValue}
                    onChange={e => onChange(e.target.value)}
                />
            )
    }
}