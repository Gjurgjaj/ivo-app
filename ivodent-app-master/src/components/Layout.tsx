import React from "react";

import Header from "./Header";

import * as styles from "@styles/components/layout.module.scss";

type Props = {
  children: React.ReactNode;
  showHeader?: boolean;
};

const Layout: React.FC<Props> = ({ children, showHeader = true }) => {
  return (
    <>
      {showHeader && <Header />}

      <main
        className={`${styles.main} ${
          !showHeader ? styles.main__no_header : ""
        }`}
      >
        {children}
      </main>
    </>
  );
};

export default Layout;
