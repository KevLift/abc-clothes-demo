import React, { useEffect, useId, useRef, useState } from 'react';

/**
 * Custom select matching ABC Clothes system UI (not native OS menus).
 * onChange receives the selected value string (or { target: { name, value } } when name is set).
 */
const Select = ({
  value = '',
  onChange,
  options = [],
  placeholder = 'Select',
  name,
  id,
  required = false,
  disabled = false,
  fullWidth = false,
  variant = 'default', // 'default' | 'ghost'
  className = '',
  style,
  'aria-label': ariaLabel,
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const listId = useId();
  const normalized = options.map((opt) => (
    typeof opt === 'string' || typeof opt === 'number'
      ? { value: String(opt), label: String(opt) }
      : { value: String(opt.value), label: opt.label, disabled: opt.disabled }
  ));

  const selected = normalized.find((o) => o.value === String(value));
  const displayLabel = selected?.label ?? placeholder;

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const emit = (next) => {
    if (typeof onChange !== 'function') return;
    if (name) onChange({ target: { name, value: next } });
    else onChange(next);
  };

  const pick = (opt) => {
    if (opt.disabled) return;
    emit(opt.value);
    setOpen(false);
  };

  return (
    <div
      ref={rootRef}
      className={`ui-select ui-select--${variant} ${fullWidth ? 'ui-select--full' : ''} ${open ? 'is-open' : ''} ${className}`}
      style={style}
    >
      {required && (
        <input
          tabIndex={-1}
          aria-hidden="true"
          className="ui-select__native-required"
          value={value}
          onChange={() => {}}
          required
          name={name}
        />
      )}
      <button
        type="button"
        id={id}
        className="ui-select__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel || placeholder}
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
      >
        <span className={`ui-select__value ${!selected ? 'is-placeholder' : ''}`}>
          {displayLabel}
        </span>
        <span className="ui-select__chevron" aria-hidden="true" />
      </button>
      {open && (
        <ul id={listId} className="ui-select__menu" role="listbox">
          {normalized.map((opt) => {
            const isActive = String(value) === opt.value;
            return (
              <li key={opt.value === '' ? '__empty' : opt.value} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  disabled={opt.disabled}
                  className={`ui-select__option ${isActive ? 'is-selected' : ''}`}
                  onClick={() => pick(opt)}
                >
                  {opt.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Select;
