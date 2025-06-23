import React from "react";

import * as styles from "@styles/components/UI/modal.module.scss";

type Props = {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  children: React.ReactNode;
  big?: boolean;
};

const Modal: React.FC<Props> = ({ visible, setVisible, children, big }) => {
  return (
    <>
      <div
        className={`${styles.modal__background} ${
          !visible ? styles.modal__background__hidden : ""
        }`}
        onClick={() => setVisible(false)}
      />
      <div
        className={`${styles.modal} ${!visible ? styles.modal__hidden : ""} ${
          big ? styles.modal__big : ""
        }`}
      >
        {children}
      </div>
    </>
  );
};

export default Modal;
