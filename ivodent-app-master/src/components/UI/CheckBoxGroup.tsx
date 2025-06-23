import React from "react";

import { CheckMarkIcon, ClockIcon, XIcon } from "@icon";

import * as styles from "@styles/components/UI/checkbox_group.module.scss";

type Props = {
  title: string;
  actions?: JSX.Element;
  status?: "success" | "fail" | "disabled" | "light";
  children: React.ReactNode;
  className?: string;
};

const CheckBoxGroup: React.FC<Props> = ({
  title,
  status = "light",
  children,
  actions,
  className = "",
}) => {
  return (
    <div
      className={`${styles.checkbox} ${
        styles[`checkbox__${status}`]
      } ${className}`}
    >
      <div className={styles.checkbox__header}>
        <div className={styles.header__info}>
          <h4 className={styles.header__title}>{title}</h4>

          {status && (
            <div className={styles.header__status}>
              {status === "success" ? (
                <CheckMarkIcon />
              ) : status === "disabled" || status === "light" ? (
                <ClockIcon />
              ) : (
                <XIcon />
              )}
            </div>
          )}
        </div>

        {actions}
      </div>

      <div className={styles.checkbox__content}>{children}</div>
    </div>
  );
};

export default CheckBoxGroup;
