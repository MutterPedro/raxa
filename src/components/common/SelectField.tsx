import React from 'react';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import type { GroupBase, Props as ReactSelectProps, StylesConfig } from 'react-select';
import type { CreatableProps as ReactCreatableProps } from 'react-select/creatable';

export interface SelectOption {
  value: string;
  label: string;
}

// react-select ships a light-only default theme (white menus, blue focus rings) that turns
// unreadable on the tokenized dark surface, so every surface is mapped to design tokens.
const selectStyles: StylesConfig<SelectOption> = {
  control: (base) => ({
    ...base,
    backgroundColor: 'var(--color-surface-raised)',
    borderColor: 'var(--color-line-strong)',
    borderRadius: 'var(--radius-field)',
    boxShadow: 'none',
    ':focus': { borderColor: 'var(--color-brand-600)', boxShadow: 'none' },
    ':focus-within': { borderColor: 'var(--color-brand-600)', boxShadow: 'none' },
  }),
  menu: (base) => ({
    ...base,
    // Grow to content instead of react-select's viewport-capped internal scroll area.
    maxHeight: 'none',
    backgroundColor: 'var(--color-surface-raised)',
    borderColor: 'var(--color-line)',
    borderRadius: 'var(--radius-field)',
    color: 'var(--color-ink)',
  }),
  menuList: (base) => ({ ...base, borderRadius: 'var(--radius-field)' }),
  option: (base, state) => ({
    ...base,
    color: 'var(--color-ink)',
    borderRadius: 'var(--radius-field)',
    backgroundColor: state.isFocused ? 'var(--color-surface-sunken)' : 'transparent',
    ':hover': { backgroundColor: 'var(--color-surface-sunken)' },
    ':active': { backgroundColor: 'var(--color-line)' },
    ...(state.isSelected ? { fontWeight: 600 } : {}),
  }),
  placeholder: (base) => ({ ...base, color: 'var(--color-ink-faint)' }),
  input: (base) => ({ ...base, color: 'var(--color-ink)' }),
  singleValue: (base) => ({ ...base, color: 'var(--color-ink)' }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: 'var(--color-surface-sunken)',
    borderRadius: 'var(--radius-field)',
    color: 'var(--color-ink)',
  }),
  multiValueLabel: (base) => ({ ...base, color: 'var(--color-ink)' }),
  multiValueRemove: (base) => ({
    ...base,
    color: 'var(--color-ink-faint)',
    ':hover': { backgroundColor: 'var(--color-line-strong)', color: 'var(--color-ink)' },
  }),
  indicatorsContainer: (base) => ({ ...base, color: 'var(--color-ink-faint)' }),
  clearIndicator: (base) => ({
    ...base,
    color: 'var(--color-ink-faint)',
    ':hover': { color: 'var(--color-ink)' },
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: 'var(--color-ink-faint)',
    ':hover': { color: 'var(--color-ink)' },
  }),
  noOptionsMessage: (base) => ({ ...base, color: 'var(--color-ink-muted)' }),
};

interface SelectFieldOwnProps {
  label: string;
  /** Id put on the select's <input>, so the label's htmlFor works like in Field. */
  inputId: string;
}

export type SelectFieldProps = SelectFieldOwnProps & Omit<ReactSelectProps<SelectOption, false>, 'styles' | 'inputId'>;

/** Single-value select with the tokenized theme and a Field-style label. */
const SelectField: React.FC<SelectFieldProps> = ({ label, inputId, ...rest }) => (
  <div>
    <label htmlFor={inputId} className="mb-1 block text-sm font-semibold text-ink">
      {label}
    </label>
    <Select<SelectOption, false> inputId={inputId} styles={selectStyles} {...rest} />
  </div>
);

export type CreatableSelectFieldProps = SelectFieldOwnProps &
  Omit<ReactCreatableProps<SelectOption, true, GroupBase<SelectOption>>, 'styles' | 'inputId' | 'isMulti'>;

/** Multi-select where typed names become new options (always `isMulti`). */
export const CreatableSelectField: React.FC<CreatableSelectFieldProps> = ({
  label,
  inputId,
  formatCreateLabel = (inputValue) => `Adicionar "${inputValue}"`,
  ...rest
}) => (
  <div>
    <label htmlFor={inputId} className="mb-1 block text-sm font-semibold text-ink">
      {label}
    </label>
    <CreatableSelect<SelectOption, true>
      isMulti
      inputId={inputId}
      styles={selectStyles}
      formatCreateLabel={formatCreateLabel}
      {...rest}
    />
  </div>
);

export default SelectField;
