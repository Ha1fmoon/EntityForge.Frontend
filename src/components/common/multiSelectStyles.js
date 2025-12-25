export const selectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: 'var(--pico-form-element-background-color)',
    borderColor: state.isFocused
      ? 'var(--pico-form-element-active-border-color)'
      : 'var(--pico-form-element-border-color)',
    borderRadius: 'var(--pico-border-radius)',
    minHeight: 44,
    fontSize: '0.9rem',
    boxShadow: 'none',
    '&:hover': {
      borderColor: 'var(--pico-form-element-active-border-color)',
    },
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: 'var(--pico-card-background-color)',
    border: '1px solid var(--pico-form-element-border-color)',
    borderRadius: 'var(--pico-border-radius)',
    zIndex: 100,
  }),
  menuList: (base) => ({
    ...base,
    padding: 0,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? 'var(--pico-primary-background)'
      : state.isFocused
        ? 'var(--pico-card-sectioning-background-color)'
        : 'transparent',
    color: state.isSelected
      ? 'var(--pico-primary-inverse)'
      : 'var(--pico-color)',
    fontSize: '0.9rem',
    padding: '8px 12px',
    cursor: 'pointer',
    '&:active': {
      backgroundColor: 'var(--pico-primary-background)',
    },
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: 'var(--pico-secondary-background)',
    borderRadius: 'var(--pico-border-radius)',
    display: 'flex',
    alignItems: 'center',
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: 'var(--pico-secondary-inverse)',
    fontSize: '0.85rem',
    padding: '2px 6px',
    display: 'flex',
    alignItems: 'center',
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: 'var(--pico-secondary-inverse)',
    '&:hover': {
      backgroundColor: 'var(--pico-del-color)',
      color: 'white',
    },
  }),
  placeholder: (base) => ({
    ...base,
    color: 'var(--pico-form-element-placeholder-color)',
  }),
  input: (base) => ({
    ...base,
    color: 'var(--pico-color)',
  }),
  singleValue: (base) => ({
    ...base,
    color: 'var(--pico-color)',
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: 'var(--pico-form-element-placeholder-color)',
    '&:hover': {
      color: 'var(--pico-color)',
    },
  }),
  clearIndicator: (base) => ({
    ...base,
    color: 'var(--pico-form-element-placeholder-color)',
    '&:hover': {
      color: 'var(--pico-del-color)',
    },
  }),
}