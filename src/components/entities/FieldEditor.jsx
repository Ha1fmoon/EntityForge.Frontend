import {useState} from 'react'
import {validateField} from '../../utils/validation'
import ErrorBanner from '../ui/ErrorBanner'

export default function FieldEditor({value = null, types = [], onSave, onCancel}) {
    const [name, setName] = useState(value?.name || '')
    const [typeId, setTypeId] = useState(value?.type?.id || '')
    const [isRequired, setIsRequired] = useState(!!value?.isRequired)
    const [isUnique, setIsUnique] = useState(!!value?.isUnique)
    const [isSearchable, setIsSearchable] = useState(!!value?.isSearchable)
    const [error, setError] = useState('')

    function handleSave() {
        const typeObj = types.find(t => t.id === typeId) || null
        const field = {name, type: typeObj, isRequired, isUnique, isSearchable}

        const errors = validateField(field)
        if (errors.length > 0) {
            setError(errors.join(', '))
            return
        }

        setError('')
        onSave(field)
    }

    return (
        <div>
            <ErrorBanner message={error}/>

            <label>
                Name
                <input value={name} onChange={(e) => setName(e.target.value)}/>
            </label>

            <label>
                Type
                <select value={typeId} onChange={(e) => setTypeId(e.target.value)}>
                    <option value="">- Select type -</option>
                    {types.map(t => (
                        <option key={t.id} value={t.id}>{t.displayName || t.id}</option>
                    ))}
                </select>
            </label>

            <fieldset>
                <label>
                    <input type="checkbox" checked={isRequired} onChange={(e) => setIsRequired(e.target.checked)}/>
                    Required
                </label>
                <label>
                    <input type="checkbox" checked={isUnique} onChange={(e) => setIsUnique(e.target.checked)}/>
                    Unique
                </label>
                <label>
                    <input type="checkbox" checked={isSearchable} onChange={(e) => setIsSearchable(e.target.checked)}/>
                    Searchable
                </label>
            </fieldset>

            <div>
                <button className="success" onClick={handleSave}>Save</button>
                {' '}
                <button className="secondary" onClick={onCancel}>Cancel</button>
            </div>
        </div>
    )
}