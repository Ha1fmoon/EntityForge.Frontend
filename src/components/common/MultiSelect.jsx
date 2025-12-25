import Select from 'react-select'
import {selectStyles} from './multiSelectStyles'

export default function MultiSelect({options = [], value = [], onChange, placeholder = 'Select...'}) {
    const selectOptions = options.map(opt => ({
        value: opt.id,
        label: opt.name || opt.id
    }))

    const selectedValues = selectOptions.filter(opt => value.includes(opt.value))

    function handleChange(selected) {
        onChange((selected || []).map(s => s.value))
    }

    return (
        <Select
            isMulti
            options={selectOptions}
            value={selectedValues}
            onChange={handleChange}
            placeholder={placeholder}
            isClearable
            styles={selectStyles}
        />
    )
}