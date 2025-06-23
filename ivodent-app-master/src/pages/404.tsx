import React from "react";
import { navigate } from "gatsby";

import { StaticImage } from "gatsby-plugin-image";

import Seo from "@components/Seo";
import { Button } from "@ui";
import { ArrowLeftIcon } from "@icon";

import * as styles from "@styles/pages/not_found.module.scss";

const NotFoundPage: React.FC = () => {
  return (
    <>
      <Seo title="404 Faqja nuk ekziston" />

      <div className={styles.container}>
        <a href="https://ivodent.edu.al/" target="_blank">
          <StaticImage
            src="../images/logo.png"
            alt="Ivodent Logo"
            height={100}
            placeholder="none"
          />
        </a>

        <h1 className={styles.container__title}>404 Faqja nuk ekziston</h1>
        <p className={styles.container__description}>
          Faqja që po kërkoni nuk ekziston. Këtu janë disa linqe të dobishme:
        </p>

        <Button
          text="Kthehu mbrapa"
          icon={<ArrowLeftIcon />}
          onClick={() => navigate(-1)}
        />
      </div>
    </>
  );
};

export default NotFoundPage;
