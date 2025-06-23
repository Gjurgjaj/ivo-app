import React from "react";

import { StaticImage } from "gatsby-plugin-image";

import * as styles from "@styles/components/UI/loading_screen.module.scss";

const LoadingScreen: React.FC = () => {
  return (
    <div className={styles.loading__screen}>
      <StaticImage
        src="../../images/logo.png"
        alt="Ivodent Logo"
        width={300}
        placeholder="none"
      />
    </div>
  );
};

export default LoadingScreen;
