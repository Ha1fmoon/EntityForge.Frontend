import {getFieldValue} from './helpers'

const INT_MAX = 2147483647
const INT_MIN = -2147483648
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateEntitySchema(entity) {
    const errors = []

    if (!entity.name || !entity.name.trim()) {
        errors.push('Name is required')
    } else if (!/^[A-Za-z][A-Za-z0-9]*$/.test(entity.name)) {
        errors.push('Name must start with a letter and contain only letters and numbers')
    }

    if (!entity.pluralName || !entity.pluralName.trim()) {
        errors.push('Plural Name is required')
    }

    if (!entity.fields || entity.fields.length === 0) {
        errors.push('At least one field is required')
    }

    return errors
}

export function validateField(field) {
    const errors = []

    if (!field.name || !field.name.trim()) {
        errors.push('Field name is required')
    } else if (!/^[A-Za-z][A-Za-z0-9]*$/.test(field.name)) {
        errors.push('Field name must start with a letter and contain only letters and numbers')
    }

    if (!field.type?.id) {
        errors.push('Field type is required')
    }

    return errors
}

export function validateRecord(record, schema) {
    const errors = []
    const fields = schema?.fields || []

    for (const field of fields) {
        const value = getFieldValue(record, field.name)
        const fieldErrors = validateFieldValue(value, field)
        errors.push(...fieldErrors)
    }

    return errors
}

export function validateFieldValue(value, field) {
    const errors = []
    const fieldName = field.name
    const baseType = (field.type?.baseType || field.type?.id || 'string').toLowerCase()
    const typeId = (field.type?.id || '').toLowerCase()

    if (field.isRequired && isEmpty(value)) {
        errors.push(`${fieldName} is required`)
        return errors
    }

    if (isEmpty(value)) {
        return errors
    }

    switch (baseType) {
        case 'int':
        case 'integer':
            if (!isValidInt(value)) {
                errors.push(`${fieldName} must be a valid integer`)
            } else {
                const numValue = parseInt(value, 10)
                if (numValue > INT_MAX || numValue < INT_MIN) {
                    errors.push(`${fieldName} must be between ${INT_MIN} and ${INT_MAX}`)
                }
            }
            break

        case 'decimal':
        case 'double':
        case 'float':
            if (!isValidDecimal(value)) {
                errors.push(`${fieldName} must be a valid number`)
            }
            break

        case 'bool':
        case 'boolean':
            break

        case 'datetime':
            if (!isValidDateTime(value)) {
                errors.push(`${fieldName} must be a valid date`)
            }
            break

        case 'string':
        default:
            if (typeId === 'email' && !isValidEmail(value)) {
                errors.push(`${fieldName} must be a valid email address`)
            }
            break
    }

    return errors
}

function isEmpty(value) {
    return value === undefined || value === null || value === ''
}

function isValidInt(value) {
    if (typeof value === 'number') return Number.isInteger(value)
    if (typeof value === 'string') {
        const num = parseInt(value, 10)
        return !isNaN(num) && String(num) === value.trim()
    }
    return false
}

function isValidDecimal(value) {
    if (typeof value === 'number') return !isNaN(value)
    if (typeof value === 'string') return !isNaN(parseFloat(value))
    return false
}

function isValidDateTime(value) {
    if (!value) return false
    const date = new Date(value)
    return !isNaN(date.getTime())
}

function isValidEmail(value) {
    if (typeof value !== 'string') return false
    return EMAIL_REGEX.test(value)
}

function toCamelCase(str) {
    if (!str) return str
    return str.charAt(0).toLowerCase() + str.slice(1)
}

export function prepareRecordForApi(formData, schema) {
    const fields = schema?.fields || []
    const data = {}

    for (const field of fields) {
        const value = getFieldValue(formData, field.name)
        const baseType = (field.type?.baseType || field.type?.id || 'string').toLowerCase()
        const key = toCamelCase(field.name)

        if (isEmpty(value) && !field.isRequired) {
            continue
        }

        switch (baseType) {
            case 'int':
            case 'integer':
                data[key] = value ? parseInt(value, 10) : 0
                break
            case 'decimal':
            case 'double':
            case 'float':
                data[key] = value ? parseFloat(value) : 0
                break
            case 'bool':
            case 'boolean':
                data[key] = !!value
                break
            case 'datetime':
                data[key] = value || null
                break
            default:
                data[key] = value ? String(value) : ''
        }
    }

    return data
}