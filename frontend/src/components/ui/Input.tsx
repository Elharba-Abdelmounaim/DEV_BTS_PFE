import styles from './Input.module.css';

interface InputProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  hint?: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  min?: number;
  max?: number;
  disabled?: boolean;
}

export default function Input({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  hint,
  placeholder,
  autoComplete,
  required = false,
  min,
  max,
  disabled = false,
}: InputProps) {
  return (
    <div className={styles.field}>
      <label htmlFor={name} className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        disabled={disabled}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
      />
      {error && <div className={styles.error}>{error}</div>}
      {hint && !error && <div className={styles.hint}>{hint}</div>}
    </div>
  );
}