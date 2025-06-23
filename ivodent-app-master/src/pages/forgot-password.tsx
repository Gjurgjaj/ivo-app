import React, { useContext, useRef, useState } from "react";
import { Link } from "gatsby";

import { StaticImage } from "gatsby-plugin-image";
import { sendPasswordResetEmail } from "firebase/auth";

import Context from "@components/Context";
import { ArrowLeftIcon, LoadingIcon } from "@icon";
import { Button, Input } from "@ui";
import Seo from "@components/Seo";

import { auth } from "@utils/firebase";
import { validateEmail } from "@utils/helper";

import * as styles from "@styles/pages/forgot_password.module.scss";

const ResetPasswordPage: React.FC = () => {
  const { currentUser } = useContext(Context);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const emailEl = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const resetPassword: React.FormEventHandler<HTMLFormElement> = async (
    form
  ) => {
    form.preventDefault();

    if (!emailEl.current) return;

    let failed: boolean = false;

    if (!validateEmail(emailEl.current.value)) {
      setError("Vendosni një email të saktë");
      failed = true;
    }

    if (failed) {
      return;
    }

    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, emailEl.current.value);

      setSuccess(true);

      setEmail(emailEl.current.value);
    } catch (error) {
      const message: string = (error as { message: string }).message as string;

      if (message.includes("auth/user-not-found")) {
        setSuccess(false);
        setError("Nuk ekziston user me këtë email");
      }
    }

    setLoading(false);
  };

  return (
    <>
      <Seo title="Forgot Password" />

      <div className={styles.forgot_password}>
        {success ? (
          <div className={styles.forgot_password__success}>
            <a href="https://ivodent.edu.al/" target="_blank">
              <StaticImage
                src="../images/logo.png"
                alt="Ivodent Logo"
                height={100}
                placeholder="none"
              />
            </a>

            <h1 className={styles.success__title}>Kontrolloni emailin tuaj</h1>

            <p className={styles.success__description}>
              Ne dërguam një link per te ndryshuar password e account te email{" "}
              <span>{email}</span>
            </p>

            <p className={styles.success__more}>
              *Shikoni ne folderin Spam nese nuk ju vjen ne Inbox*
            </p>

            <Link
              to={currentUser ? "/student" : "/"}
              className={styles.success__link}
            >
              <ArrowLeftIcon /> Kthehu ne {currentUser ? "Notat" : "Log in"}
            </Link>
          </div>
        ) : (
          <form
            onSubmit={resetPassword}
            className={styles.forgot_password__from}
          >
            <a href="https://ivodent.edu.al/" target="_blank">
              <StaticImage
                src="../images/logo.png"
                alt="Ivodent Logo"
                height={100}
                placeholder="none"
              />
            </a>

            <h1 className={styles.form__title}>Keni Harruar Fjalëkalimin?</h1>
            <p className={styles.form__description}>
              Mos u shqetësoni, ne do t'ju dërgojmë udhëzime për ta ndryshuar.
            </p>

            <Input
              label="Email"
              type="email"
              placeholder="Shkruani emailin tuaj"
              elRef={emailEl}
              error={error}
              onChange={() => {
                if (error) {
                  setError(null);
                }
              }}
            />

            <Button
              type="submit"
              text="Rivendosni fjalëkalimin"
              icon={loading ? <LoadingIcon /> : undefined}
            />

            <Link
              to={currentUser ? "/student" : "/"}
              className={styles.form__link}
            >
              <ArrowLeftIcon /> Kthehu në mbrapa
            </Link>
          </form>
        )}
      </div>
    </>
  );
};

export default ResetPasswordPage;
