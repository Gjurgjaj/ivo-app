import React, { useId } from "react";

import * as styles from "@styles/components/UI/select.module.scss";
import { ChevronArrowDownIcon } from "@icon";

type Props = {
  options?: {
    key: string;
    value: string;
  }[];
  label?: string;
  error?: string;
  className?: string;
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
  elRef?: React.RefObject<HTMLSelectElement>;
  value?: string;
  defaultValue?: string;
};

const Select: React.FC<Props> = ({
  options,
  label,
  error,
  className,
  onChange,
  elRef,
  value,
  defaultValue,
}) => {
  const id = useId();

  return (
    <div
      className={`${styles.select} ${
        error ? styles.select__error : ""
      } ${className}`}
    >
      {label && (
        <label htmlFor={id} className={styles.select__label}>
          {label}
        </label>
      )}

      <select
        className={styles.select__el}
        onChange={onChange}
        ref={elRef}
        value={value}
        defaultValue={defaultValue}
      >
        {options?.map(({ key, value }) => (
          <option key={key} value={key}>
            {value}
          </option>
        ))}
      </select>

      {error && <p className={styles.select__error}>{error}</p>}

      <ChevronArrowDownIcon />
    </div>
  );
};

export default Select;
