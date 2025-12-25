import {useEffect, useState} from 'react'
import {
    getEntities,
    getEntity,
    getRecords,
    getRecord,
    createRecord,
    updateRecord,
    deleteRecord,
} from '../api/client'
import {validateRecord, prepareRecordForApi} from '../utils/validation'
import {getDisplayName} from '../utils/helpers'
import {
    extractRelationsFromRecord,
    buildRelationsForApi,
    normalizeKey,
} from '../utils/relations'

import EntityList from './main/EntityList'
import RecordList from './main/RecordList'
import RecordForm from './main/RecordForm'

export default function MainPage() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [entities, setEntities] = useState([])

    const [view, setView] = useState('entities')

    const [currentEntity, setCurrentEntity] = useState(null)
    const [currentSchema, setCurrentSchema] = useState(null)

    const [records, setRecords] = useState([])

    const [formMode, setFormMode] = useState(null) // 'create' | 'edit'
    const [formData, setFormData] = useState({})
    const [editingId, setEditingId] = useState(null)

    const [relationOptions, setRelationOptions] = useState({})
    const [selectedRelations, setSelectedRelations] = useState({})

    useEffect(() => {
        loadEntities()
    }, [])

    function reset() {
        setView('entities')
        setCurrentEntity(null)
        setCurrentSchema(null)
        setRecords([])
        setFormMode(null)
        setFormData({})
        setEditingId(null)
        setRelationOptions({})
        setSelectedRelations({})
    }

    async function loadEntities() {
        setLoading(true)
        setError('')
        try {
            const data = await getEntities()
            setEntities(data.filter(e => e.isGenerated))
        } catch {
            setError('Failed to load entities')
        } finally {
            setLoading(false)
        }
    }

    async function openEntity(entityName) {
        setLoading(true)
        setError('')
        setRelationOptions({})
        setSelectedRelations({})
        try {
            const schema = await getEntity(entityName)
            const data = await getRecords(entityName)
            setCurrentEntity(entityName)
            setCurrentSchema(schema)
            setRecords(data)
            setView('records')
            await loadRelationOptions(schema.relations || [])
        } catch {
            setError('Failed to load entity data')
        } finally {
            setLoading(false)
        }
    }

    async function loadRelationOptions(relations) {
        const options = {}
        for (const rel of relations) {
            try {
                const relatedRecords = await getRecords(rel.entity)
                options[normalizeKey(rel.entity)] = relatedRecords.map(r => ({
                    id: r.id,
                    name: getDisplayName(r)
                }))
            } catch {
                options[normalizeKey(rel.entity)] = []
            }
        }
        setRelationOptions(options)
    }

    async function refreshRecords() {
        if (!currentEntity) return
        setLoading(true)
        try {
            const data = await getRecords(currentEntity)
            setRecords(data)
        } catch {
            setError('Failed to refresh records')
        } finally {
            setLoading(false)
        }
    }

    function backToEntities() {
        reset()
    }

    function backToRecords() {
        setView('records')
        setFormMode(null)
        setFormData({})
        setEditingId(null)
        setSelectedRelations({})
    }

    function startCreate() {
        setFormData({})
        setSelectedRelations({})
        setFormMode('create')
        setEditingId(null)
        setView('form')
    }

    async function startEdit(id) {
        setLoading(true)
        setError('')
        try {
            const record = await getRecord(currentEntity, id)
            setFormData(record || {})

            const relations = extractRelationsFromRecord(record)
            if (record?.relations) {
                await loadRelationOptionsForRecord(record.relations)
            }
            setSelectedRelations(relations)

            setFormMode('edit')
            setEditingId(id)
            setView('form')
        } catch {
            setError('Failed to load record')
        } finally {
            setLoading(false)
        }
    }

    async function loadRelationOptionsForRecord(recordRelations) {
        const newOptions = {...relationOptions}
        for (const entityName of Object.keys(recordRelations)) {
            const key = normalizeKey(entityName)
            if (!newOptions[key]) {
                try {
                    const relatedRecords = await getRecords(entityName)
                    newOptions[key] = relatedRecords.map(r => ({
                        id: r.id,
                        name: getDisplayName(r)
                    }))
                } catch {
                    newOptions[key] = []
                }
            }
        }
        setRelationOptions(newOptions)
    }

    async function handleDelete(id) {
        if (!confirm('Delete this record?')) return
        setError('')
        try {
            await deleteRecord(currentEntity, id)
            await refreshRecords()
        } catch {
            setError('Failed to delete record')
        }
    }

    async function handleSubmit() {
        setError('')

        const errors = validateRecord(formData, currentSchema)
        if (errors.length > 0) {
            setError(errors.join(', '))
            return
        }

        const data = prepareRecordForApi(formData, currentSchema)
        const schemaRelations = currentSchema?.relations || []

        const relations = buildRelationsForApi(selectedRelations, schemaRelations)
        if (Object.keys(relations).length > 0) {
            data.relations = relations
        }

        setLoading(true)
        try {
            if (formMode === 'create') {
                await createRecord(currentEntity, data)
            } else {
                await updateRecord(currentEntity, editingId, data)
            }
            await refreshRecords()
            backToRecords()
        } catch (err) {
            const message = err?.message || ''
            setError(message || (formMode === 'create' ? 'Failed to create record' : 'Failed to update record'))
        } finally {
            setLoading(false)
        }
    }

    function onFieldChange(fieldName, value) {
        setFormData(prev => ({...prev, [fieldName]: value}))
    }

    function onRelationChange(entityKey, selectedIds) {
        setSelectedRelations(prev => ({...prev, [normalizeKey(entityKey)]: selectedIds}))
    }

    if (view === 'entities') {
        return (
            <EntityList
                entities={entities}
                error={error}
                loading={loading}
                onSelect={openEntity}
            />
        )
    }

    if (view === 'records') {
        return (
            <RecordList
                entityName={currentEntity}
                schema={currentSchema}
                records={records}
                error={error}
                onBack={backToEntities}
                onCreate={startCreate}
                onEdit={startEdit}
                onDelete={handleDelete}
            />
        )
    }

    if (view === 'form') {
        return (
            <RecordForm
                entityName={currentEntity}
                schema={currentSchema}
                formMode={formMode}
                formData={formData}
                selectedRelations={selectedRelations}
                relationOptions={relationOptions}
                error={error}
                loading={loading}
                onFieldChange={onFieldChange}
                onRelationChange={onRelationChange}
                onSubmit={handleSubmit}
                onCancel={backToRecords}
            />
        )
    }

    return null
}