function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

export function normalizeKey(key) {
    return key?.toLowerCase() || ''
}

export function extractRelationsFromRecord(record) {
    const relations = {}
    if (!record?.relations) return relations

    for (const [entityName, items] of Object.entries(record.relations)) {
        relations[normalizeKey(entityName)] = (items || []).map(item => item.id)
    }
    return relations
}

export function buildRelationsForApi(selectedRelations, schemaRelations = []) {
    const result = {}

    for (const rel of schemaRelations) {
        const key = normalizeKey(rel.entity)
        result[rel.entity] = selectedRelations[key] || []
    }

    for (const [key, ids] of Object.entries(selectedRelations)) {
        const schemaHas = schemaRelations.some(r => normalizeKey(r.entity) === normalizeKey(key))
        if (!schemaHas) {
            result[capitalize(key)] = ids || []
        }
    }

    return result
}

export function getRelationEntities(schemaRelations = [], recordRelations = {}) {
    const entities = new Set()

    for (const rel of schemaRelations) {
        entities.add(normalizeKey(rel.entity))
    }

    for (const key of Object.keys(recordRelations)) {
        entities.add(normalizeKey(key))
    }

    return Array.from(entities)
}

export function getByKey(obj, key, defaultValue = []) {
    return obj[key] ||
        obj[normalizeKey(key)] ||
        obj[capitalize(key)] ||
        defaultValue
}