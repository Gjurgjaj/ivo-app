import React, { useId } from "react";

import * as styles from "@styles/components/UI/input.module.scss";

type Props = {
  label?: string;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  required?: boolean;
  elRef?: React.RefObject<HTMLInputElement>;
  error?: string | null;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  autoComplete?: boolean;
  disabled?: boolean;
  className?: string;
  defaultValue?: string;
  min?: string | number;
  max?: string | number;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
  value?: string | number;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  checked?: boolean;
};

const Input: React.FC<Props> = ({
  label,
  type = "text",
  placeholder = "",
  required = false,
  elRef,
  error,
  onChange = undefined,
  autoComplete = false,
  disabled = false,
  className = "",
  defaultValue,
  min,
  max,
  onKeyDown,
  value,
  onBlur,
  checked,
}) => {
  const id = useId();

  return (
    <div
      className={`${styles.input} ${
        error ? styles.input__error : ""
      } ${className}`}
    >
      {label && (
        <label htmlFor={id} className={styles.input__label}>
          {label}
        </label>
      )}

      <input
        type={type}
        id={id}
        placeholder={placeholder}
        className={styles.input__el}
        required={required}
        ref={elRef}
        onChange={onChange}
        autoComplete={autoComplete ? "on" : "new-password"}
        disabled={disabled}
        defaultValue={defaultValue}
        min={min}
        max={max}
        value={value}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        checked={checked}
      />

      {error && <p className={styles.input__error}>{error}</p>}
    </div>
  );
};

export default Input;
