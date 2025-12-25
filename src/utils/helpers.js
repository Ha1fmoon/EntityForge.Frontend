export function truncate(str, maxLength) {
    if (!str) return str
    if (str.length <= maxLength) return str
    return str.slice(0, maxLength) + '...'
}

export function getDisplayName(record) {
    if (!record) return ''
    for (const key of ['name', 'title', 'firstName']) {
        const value = getFieldValue(record, key)
        if (value) return String(value)
    }
    for (const val of Object.values(record)) {
        if (typeof val === 'string' && val && val !== record.id) return val
    }
    return record.id || ''
}

export function getFieldValue(record, fieldName) {
    if (!record || !fieldName) return undefined
    if (record[fieldName] !== undefined) return record[fieldName]
    const lowerKey = fieldName.toLowerCase()
    for (const key of Object.keys(record)) {
        if (key.toLowerCase() === lowerKey) {
            return record[key]
        }
    }
    return undefined
}