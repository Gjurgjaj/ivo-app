import React from "react";

import * as styles from "@styles/components/UI/user.module.scss";

type Props = {
  name: string;
  email: string;
  className?: string;
};

const User: React.FC<Props> = ({ name, email, className = "" }) => {
  return (
    <div className={`${styles.user} ${className}`}>
      <h4 className={styles.user__name}>{name}</h4>
      <p className={styles.user__email}>{email}</p>
    </div>
  );
};

export default User;
