import {useEffect, useMemo, useState} from 'react'
import {
    createEntity,
    deleteEntity,
    deleteService,
    getEntities,
    getEntity,
    getServices,
    getTypes,
    updateEntity,
    generateEntity
} from '../api/client'
import {createTestEntity} from '../api/testData'
import {validateEntitySchema} from '../utils/validation'
import ErrorBanner from '../components/ui/ErrorBanner'
import FieldEditor from '../components/entities/FieldEditor'

export default function EntitiesPage() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [list, setList] = useState([])
    const [types, setTypes] = useState([])
    const [services, setServices] = useState([])

    const [mode, setMode] = useState('list')
    const [currentName, setCurrentName] = useState(null)
    const [draft, setDraft] = useState(null)

    const [addOpen, setAddOpen] = useState(false)
    const [editIndex, setEditIndex] = useState(null)
    const [generatingNames, setGeneratingNames] = useState(new Set())
    const [deletingServiceName, setDeletingServiceName] = useState(null)
    const [creatingTest, setCreatingTest] = useState(false)

    useEffect(() => {
        refresh()
        loadTypes()
        loadServices()
    }, [])

    async function refresh() {
        setLoading(true)
        setError('')
        try {
            const data = await getEntities()
            setList(Array.isArray(data) ? data : [])
        } catch {
            setError('Failed to load entities')
        } finally {
            setLoading(false)
        }
    }

    async function loadTypes() {
        try {
            const data = await getTypes()
            setTypes(Array.isArray(data) ? data : [])
        } catch { /* empty */
        }
    }

    async function loadServices() {
        try {
            const data = await getServices()
            setServices(Array.isArray(data) ? data : [])
        } catch { /* empty */
        }
    }

    function startCreate() {
        setDraft({name: '', pluralName: '', fields: [], relations: []})
        setMode('create')
        setAddOpen(false)
        setEditIndex(null)
    }

    async function openCard(name) {
        setLoading(true)
        setError('')
        try {
            const ent = await getEntity(name)
            setCurrentName(name)
            setDraft(ent ? {
                ...ent,
                fields: Array.isArray(ent.fields) ? [...ent.fields] : [],
                relations: Array.isArray(ent.relations) ? [...ent.relations] : []
            } : null)
            setMode('card')
            setAddOpen(false)
            setEditIndex(null)
        } catch {
            setError('Failed to open entity card')
        } finally {
            setLoading(false)
        }
    }

    function onDraftChange(patch) {
        setDraft(prev => ({...prev, ...patch}))
    }

    function handleAddSave(field) {
        onDraftChange({fields: [...(draft.fields || []), field]})
        setAddOpen(false)
    }

    function handleEditSave(index, field) {
        const next = [...(draft.fields || [])]
        next[index] = field
        onDraftChange({fields: next})
        setEditIndex(null)
    }

    function deleteField(index) {
        const next = [...(draft.fields || [])]
        next.splice(index, 1)
        onDraftChange({fields: next})
        if (editIndex === index) setEditIndex(null)
    }

    async function saveDraft() {
        const errors = validateEntitySchema(draft)
        if (errors.length > 0) {
            setError(errors.join(', '))
            return
        }
        try {
            setError('')
            if (mode === 'create') {
                await createEntity(draft)
            } else {
                await updateEntity(currentName, draft)
            }
            await refresh()
            backToList()
        } catch (err) {
            setError(err?.message || 'Failed to save')
        }
    }

    async function removeEntity() {
        if (!currentName) return
        try {
            setError('')
            await deleteEntity(currentName)
            await refresh()
            backToList()
        } catch {
            setError('Failed to delete entity')
        }
    }

    function backToList() {
        setMode('list')
        setDraft(null)
        setCurrentName(null)
        setAddOpen(false)
        setEditIndex(null)
    }

    async function handleGenerate(name) {
        setError('')
        setGeneratingNames(prev => new Set(prev).add(name))

        try {
            await generateEntity(name)
        } catch {
            setError('Failed to start generation')
            setGeneratingNames(prev => {
                const next = new Set(prev)
                next.delete(name)
                return next
            })
            return
        }

        await (async () => {
            const maxAttempts = 36
            for (let i = 0; i < maxAttempts; i++) {
                await new Promise(r => setTimeout(r, 5000))
                try {
                    const entities = await getEntities()
                    const entity = entities.find(e => e.name === name)
                    if (entity?.isGenerated) {
                        await refresh()
                        break
                    }
                } catch { /* ignore */
                }
            }
            setGeneratingNames(prev => {
                const next = new Set(prev)
                next.delete(name)
                return next
            })
            await refresh()
        })()
    }

    async function handleDeleteService(name) {
        setError('')
        setDeletingServiceName(name)
        try {
            await deleteService(`${name}Service`)
            await refresh()
        } catch {
            setError('Failed to delete service')
        } finally {
            setDeletingServiceName(null)
        }
    }

    async function handleCreateTestEntity() {
        setError('')
        setCreatingTest(true)
        try {
            await createTestEntity()
            await refresh()
        } catch {
            setError('Failed to create test entity')
        } finally {
            setCreatingTest(false)
        }
    }

    function addRelation(entityName) {
        if (!entityName) return
        if ((draft.relations || []).some(r => r.entity === entityName)) return
        if (entityName === draft.name) return
        onDraftChange({
            relations: [...(draft.relations || []), {entity: entityName, cardinality: 'ManyToMany'}]
        })
    }

    function removeRelation(index) {
        const next = [...(draft.relations || [])]
        next.splice(index, 1)
        onDraftChange({relations: next})
    }

    const typeLabelById = useMemo(() => {
        const map = new Map(types.map(t => [t.id, t.displayName || t.id]))
        return (id) => map.get(id) || id
    }, [types])

    if (mode === 'list') {
        return (
            <div>
                <div className="page-header">
                    <h2>Entities</h2>
                    <div>
                        <button className="success" onClick={startCreate}>Add New</button>
                        {' '}
                        <button className="secondary" disabled={creatingTest} onClick={handleCreateTestEntity}>
                            Test
                        </button>
                    </div>
                </div>

                <ErrorBanner message={error}/>

                {list.map(e => (
                    <article
                        key={e.name}
                        onClick={() => openCard(e.name)}
                        style={{cursor: 'pointer'}}
                    >
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <div>
                                <strong>{e.name}</strong>
                                <br/>
                                <small className="muted">
                                    {e.pluralName || e.name}{e.isGenerated ? ' · generated' : ''}
                                </small>
                            </div>
                            <div>
                                {e.isGenerated ? (
                                    <>
                                        <button
                                            className="success"
                                            disabled={generatingNames.has(e.name) || !!deletingServiceName}
                                            aria-busy={generatingNames.has(e.name)}
                                            onClick={(ev) => {
                                                ev.stopPropagation();
                                                handleGenerate(e.name)
                                            }}
                                        >
                                            {generatingNames.has(e.name) ? 'Regenerating...' : 'Regenerate'}
                                        </button>
                                        {' '}
                                        <button
                                            className="danger"
                                            disabled={generatingNames.has(e.name) || !!deletingServiceName}
                                            aria-busy={deletingServiceName === e.name}
                                            onClick={(ev) => {
                                                ev.stopPropagation();
                                                handleDeleteService(e.name)
                                            }}
                                        >
                                            {deletingServiceName === e.name ? 'Deleting...' : 'Delete Service'}
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        className="success"
                                        disabled={generatingNames.has(e.name)}
                                        aria-busy={generatingNames.has(e.name)}
                                        onClick={(ev) => {
                                            ev.stopPropagation();
                                            handleGenerate(e.name)
                                        }}
                                    >
                                        {generatingNames.has(e.name) ? 'Generating...' : 'Generate'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </article>
                ))}

                {!loading && list.length === 0 && (
                    <article>No entities</article>
                )}
            </div>
        )
    }

    return (
        <div>
            <div className="page-header">
                <h2>{mode === 'create' ? 'New Entity' : draft?.name || 'Entity'}</h2>
                <div>
                    <button className="secondary" onClick={backToList}>Back</button>
                    {mode === 'card' && (
                        <>
                            {' '}
                            <button className="danger" onClick={removeEntity}>Delete Entity</button>
                        </>
                    )}
                </div>
            </div>

            <ErrorBanner message={error}/>

            <article>
                <header><strong>Settings</strong></header>
                <label>
                    Name
                    <input
                        value={draft?.name || ''}
                        onChange={(e) => onDraftChange({name: e.target.value})}
                    />
                </label>
                <label>
                    Plural Name
                    <input
                        value={draft?.pluralName || ''}
                        onChange={(e) => onDraftChange({pluralName: e.target.value})}
                    />
                </label>
            </article>

            <article>
                <header>
                    <nav style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <strong>Fields</strong>
                        {!addOpen && (
                            <button className="secondary" onClick={() => {
                                setAddOpen(true);
                                setEditIndex(null)
                            }}>
                                Add Field
                            </button>
                        )}
                    </nav>
                </header>

                {addOpen && (
                    <div style={{
                        marginBottom: 16,
                        padding: 12,
                        background: 'var(--pico-card-sectioning-background-color)',
                        borderRadius: 'var(--pico-border-radius)'
                    }}>
                        <FieldEditor
                            types={types}
                            onSave={handleAddSave}
                            onCancel={() => setAddOpen(false)}
                        />
                    </div>
                )}

                {(draft?.fields || []).map((f, idx) => (
                    <div key={`${f.name}-${idx}`} style={{marginBottom: 8}}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '8px 0'
                        }}>
                            <div>
                                <strong>{f.name}</strong>
                                <br/>
                                <small className="muted">{typeLabelById(f.type?.id || '')}</small>
                            </div>
                            <div>
                                <button
                                    className="secondary"
                                    onClick={() => {
                                        if (editIndex === idx) {
                                            setEditIndex(null)
                                        } else {
                                            setEditIndex(idx)
                                            setAddOpen(false)
                                        }
                                    }}
                                >
                                    {editIndex === idx ? 'Collapse' : 'Edit'}
                                </button>
                                {' '}
                                <button className="danger" onClick={() => deleteField(idx)}>Delete</button>
                            </div>
                        </div>
                        {editIndex === idx && (
                            <div style={{
                                padding: 12,
                                background: 'var(--pico-card-sectioning-background-color)',
                                borderRadius: 'var(--pico-border-radius)'
                            }}>
                                <FieldEditor
                                    value={f}
                                    types={types}
                                    onSave={(val) => handleEditSave(idx, val)}
                                    onCancel={() => setEditIndex(null)}
                                />
                            </div>
                        )}
                    </div>
                ))}

                {(draft?.fields || []).length === 0 && !addOpen && (
                    <p className="muted">No fields added</p>
                )}
            </article>

            <article>
                <header><strong>Relations</strong></header>
                <label>
                    Related Entities
                    <select value="" onChange={(e) => addRelation(e.target.value)}>
                        <option value="">— Add relation —</option>
                        {services
                            .filter(s => s.entityName !== draft?.name && !(draft?.relations || []).some(r => r.entity === s.entityName))
                            .map(s => (
                                <option key={s.entityName} value={s.entityName}>{s.entityName}</option>
                            ))
                        }
                    </select>
                </label>

                {(draft?.relations || []).map((rel, idx) => (
                    <div key={rel.entity} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 0'
                    }}>
                        <div>
                            <strong>{rel.entity}</strong>
                            <br/>
                            <small className="muted">{rel.cardinality}</small>
                        </div>
                        <button className="danger" onClick={() => removeRelation(idx)}>Remove</button>
                    </div>
                ))}

                {(draft?.relations || []).length === 0 && (
                    <p className="muted">No relations added</p>
                )}

                {services.length === 0 && (
                    <p className="muted">Generate services first to add relations</p>
                )}
            </article>

            <div>
                <button className="success" onClick={saveDraft}>
                    {mode === 'create' ? 'Create' : 'Save'}
                </button>
                {' '}
                <button className="secondary" onClick={backToList}>Cancel</button>
            </div>
        </div>
    )
}