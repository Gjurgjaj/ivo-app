import React from "react";

import { Styles } from "@interface/UI/button";

import { CheckIcon } from "@icon";

import * as styles from "@styles/components/UI/checkbox.module.scss";

type Props = {
  style?: Styles;
  checked: boolean;
  onClick?: () => void;
  id?: string;
  disabled?: boolean;
  icon?: JSX.Element;
};

const Checkbox: React.FC<Props> = ({
  style = "primary",
  checked,
  onClick,
  id,
  disabled,
  icon,
}) => {
  return (
    <div
      className={`${styles.checkbox} ${
        checked ? styles[`checkbox__${style}`] : styles["checkbox__light"]
      }`}
      onClick={() => !disabled && onClick && onClick()}
      id={id}
    >
      {checked && (icon ?? <CheckIcon />)}
    </div>
  );
};

export default Checkbox;
