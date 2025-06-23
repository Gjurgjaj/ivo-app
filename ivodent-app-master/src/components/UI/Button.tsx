import React from "react";

import { Styles } from "@interface/UI/button";

import * as styles from "@styles/components/UI/button.module.scss";

type Props = {
  text?: string | JSX.Element;
  style?: Styles;
  icon?: JSX.Element;
  onClick?: () => void;
  className?: string;
  type?: "submit" | "reset" | "button";
  disabled?: boolean;
};

const Button: React.FC<Props> = ({
  text,
  style = "primary",
  icon,
  onClick,
  className = "",
  type = "button",
  disabled,
}) => {
  return (
    <button
      className={`${styles.btn} ${styles[`btn__${style}`]} ${className}`}
      onClick={() => {
        if (onClick && !disabled) onClick();
      }}
      type={type}
      disabled={disabled}
    >
      {icon} {text && icon && <span className={styles.btn__spacing} />} {text}
    </button>
  );
};

export default Button;
