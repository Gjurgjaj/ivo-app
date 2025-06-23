import React from "react";

import * as styles from "@styles/components/UI/status.module.scss";
import { CheckIcon, ClockIcon, XIcon } from "@icon";

type Props = {
  status: "success" | "fail" | "light";
  message?: string;
  className?: string;
};

const Status: React.FC<Props> = ({ status, message, className = "" }) => {
  return (
    <div
      className={`${styles.status} ${styles[`status__${status}`]} ${className}`}
    >
      {status === "success" ? (
        <CheckIcon />
      ) : status === "fail" ? (
        <XIcon />
      ) : (
        <ClockIcon />
      )}{" "}
      {message ?? status}
    </div>
  );
};

export default Status;
