import {useEffect, useState} from 'react'
import {getType, getTypes} from '../api/client'
import ErrorBanner from '../components/ui/ErrorBanner'

export default function TypesPage() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [list, setList] = useState([])
    const [mode, setMode] = useState('list')
    const [item, setItem] = useState(null)

    useEffect(() => {
        refresh()
    }, [])

    async function refresh() {
        setLoading(true)
        setError('')
        try {
            const data = await getTypes()
            setList(Array.isArray(data) ? data : [])
        } catch {
            setError('Failed to load types')
        } finally {
            setLoading(false)
        }
    }

    async function openCard(id) {
        setLoading(true)
        setError('')
        try {
            const t = await getType(id)
            setItem(t)
            setMode('card')
        } catch {
            setError('Failed to open type card')
        } finally {
            setLoading(false)
        }
    }

    function backToList() {
        setMode('list')
        setItem(null)
    }

    if (mode === 'card' && item) {
        return (
            <div>
                <div className="page-header">
                    <h2>{item.displayName || item.id}</h2>
                    <button className="secondary" onClick={backToList}>Back</button>
                </div>

                <article>
                    <table>
                        <tbody>
                        <tr>
                            <td>ID</td>
                            <td>{item.id}</td>
                        </tr>
                        <tr>
                            <td>Base Type</td>
                            <td>{item.baseType || '—'}</td>
                        </tr>
                        <tr>
                            <td>Value Object</td>
                            <td>{item.isValueObject ? 'Yes' : 'No'}</td>
                        </tr>
                        <tr>
                            <td>Nullable</td>
                            <td>{item.isNullable ? 'Yes' : 'No'}</td>
                        </tr>
                        <tr>
                            <td>DB Column Type</td>
                            <td>{item.dbColumnType || '—'}</td>
                        </tr>
                        {item.maxLength != null && <tr>
                            <td>Max Length</td>
                            <td>{item.maxLength}</td>
                        </tr>}
                        {item.validationPattern && <tr>
                            <td>Validation Pattern</td>
                            <td><code>{item.validationPattern}</code></td>
                        </tr>}
                        {item.validationErrorMessage && <tr>
                            <td>Validation Error</td>
                            <td>{item.validationErrorMessage}</td>
                        </tr>}
                        {item.valueObjectTemplateName && <tr>
                            <td>VO Template</td>
                            <td>{item.valueObjectTemplateName}</td>
                        </tr>}
                        </tbody>
                    </table>
                </article>
            </div>
        )
    }

    return (
        <div>
            <div className="page-header">
                <h2>Types</h2>
            </div>

            <ErrorBanner message={error}/>

            {list.map(t => (
                <article key={t.id} onClick={() => openCard(t.id)} style={{cursor: 'pointer'}}>
                    <strong>{t.displayName || t.id}</strong>
                    <br/>
                    <small className="muted">{t.baseType || ''}</small>
                </article>
            ))}

            {!loading && list.length === 0 && (
                <article>No types available</article>
            )}
        </div>
    )
}