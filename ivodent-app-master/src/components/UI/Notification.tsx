import React from "react";

import { DangerIcon, XIcon } from "@icon";

import * as styles from "@styles/components/UI/notification.module.scss";

type Props = {
  icon?: JSX.Element;
  title: string;
  description: string;
  visible?: boolean;
  status?: "danger" | "success" | "warning";
  setVisible: React.Dispatch<
    React.SetStateAction<{
      title: string;
      description: string;
    } | null>
  >;
};

const Notification: React.FC<Props> = ({
  icon,
  title,
  description,
  status,
  visible,
  setVisible,
}) => {
  return (
    <div
      className={`${styles.notification} ${styles[`notification__${status}`]} ${
        styles[`notification__${visible ? "visible" : "hidden"}`]
      }`}
    >
      <div className={styles.notification__icon}>{icon ?? <DangerIcon />}</div>

      <div className={styles.notification__content}>
        <h4 className={styles.content__title}>{title}</h4>

        <p className={styles.content__description}>{description}</p>
      </div>

      <button
        onClick={() => setVisible(null)}
        className={styles.notification__action}
      >
        <XIcon />
      </button>
    </div>
  );
};

export default Notification;
