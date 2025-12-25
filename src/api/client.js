const API_URL = ''

const DEFAULT_TIMEOUT = 30000

async function request(path, options = {}) {
    const url = `${API_URL}${path}`
    const method = options.method || 'GET'
    const hasBody = 'body' in options
    const timeout = options.timeout || DEFAULT_TIMEOUT

    const headers = {
        Accept: 'application/json',
        ...(hasBody ? {'Content-Type': 'application/json'} : {}),
        ...options.headers,
    }

    console.debug('Frontend -> Backend', method, url)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
        const res = await fetch(url, {
            ...options,
            headers,
            signal: controller.signal,
        })

        clearTimeout(timeoutId)

        console.debug('Frontend <- Backend', res.status, method, url)

        if (!res.ok) {
            let errorMessage = `HTTP ${res.status}`
            try {
                const errorData = await res.json()
                if (errorData.errors) {
                    const messages = Object.values(errorData.errors).flat().filter(Boolean)
                    if (messages.length) errorMessage = messages.join('; ')
                } else {
                    errorMessage = errorData.title || errorData.message || errorMessage
                }
            } catch {
                const errorText = await res.text().catch(() => '')
                if (errorText) errorMessage = errorText
            }
            throw new Error(errorMessage)
        }

        if (res.status === 204) return null

        const contentType = res.headers.get('content-type') || ''
        if (contentType.includes('json')) {
            return res.json()
        }

        return null
    } catch (err) {
        clearTimeout(timeoutId)
        if (err.name === 'AbortError') {
            throw new Error('Request timeout - operation took too long')
        }
        throw err
    }
}

function normalizeArray(data) {
    if (!data) return []
    if (Array.isArray(data)) return data
    if (data.$values) return data.$values
    if (data.value) return data.value
    return []
}

function normalizeEntity(entity) {
    if (!entity || typeof entity !== 'object') return entity
    return {...entity, fields: normalizeArray(entity.fields)}
}


export async function getEntities() {
    const data = await request('/api/gateway/entities')
    return normalizeArray(data).map(normalizeEntity)
}

export async function getEntity(name) {
    const data = await request(`/api/gateway/entities/${encodeURIComponent(name)}`)
    return normalizeEntity(data)
}

export async function createEntity(entity) {
    const data = await request('/api/gateway/entities', {
        method: 'POST',
        body: JSON.stringify(entity),
    })
    return normalizeEntity(data)
}

export async function updateEntity(name, entity) {
    const data = await request(`/api/gateway/entities/${encodeURIComponent(name)}`, {
        method: 'PUT',
        body: JSON.stringify(entity),
    })
    return normalizeEntity(data)
}

export async function deleteEntity(name) {
    await request(`/api/gateway/entities/${encodeURIComponent(name)}`, {method: 'DELETE'})
}

export function generateEntity(name) {
    const url = `${API_URL}/api/gateway/entities/${encodeURIComponent(name)}/generate`

    fetch(url, {
        method: 'POST',
        headers: {Accept: 'application/json'},
    }).catch((err) => {
        console.error('Generate error:', err.message)
    })

    return {message: 'Generation started'}
}


export async function getTypes() {
    const data = await request('/api/gateway/types')
    return normalizeArray(data)
}

export async function getType(id) {
    return request(`/api/gateway/types/${encodeURIComponent(id)}`)
}


export async function getServices() {
    const data = await request('/api/gateway/services')
    return normalizeArray(data)
}

export async function deleteService(serviceName) {
    await request(`/api/gateway/services/${encodeURIComponent(serviceName)}`, {method: 'DELETE'})
}


export async function getRecords(entityName, ids = null) {
    const path = `/api/gateway/${entityName.toLowerCase()}` + (ids ? `?ids=${ids.join(',')}` : '')
    const data = await request(path)
    return normalizeArray(data)
}

export async function getRecord(entityName, id) {
    return request(`/api/gateway/${entityName.toLowerCase()}/${encodeURIComponent(id)}`)
}

export async function createRecord(entityName, data) {
    return request(`/api/gateway/${entityName.toLowerCase()}`, {
        method: 'POST',
        body: JSON.stringify(data),
    })
}

export async function updateRecord(entityName, id, data) {
    return request(`/api/gateway/${entityName.toLowerCase()}/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    })
}

export async function deleteRecord(entityName, id) {
    await request(`/api/gateway/${entityName.toLowerCase()}/${encodeURIComponent(id)}`, {method: 'DELETE'})
}