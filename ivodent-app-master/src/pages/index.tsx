import React, { useEffect, useRef, useState } from "react";
import { Link } from "gatsby";

import { StaticImage } from "gatsby-plugin-image";

import { Button, Input, Notification } from "@ui";
import { GoogleIcon, LoadingIcon } from "@icon";
import Seo from "@components/Seo";

import { logInWithEmailAndPassword, signInWithGoogle } from "@utils/firebase";
import { validateEmail } from "@utils/helper";

import * as styles from "@styles/pages/login.module.scss";
import Layout from "@components/Layout";

const LoginPage: React.FC = () => {
  const [validEmail, setValidEmail] = useState<string | null>(null);
  const [validPassword, setValidPassword] = useState<string | null>(null);
  const [error, setError] = useState<{
    title: string;
    description: string;
  } | null>(null);
  const emailEl = useRef<HTMLInputElement>(null);
  const passwordEl = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (form) => {
    form.preventDefault();

    if (!(emailEl.current && passwordEl.current)) return;

    let failed: boolean = false;

    if (!validateEmail(emailEl.current.value)) {
      setValidEmail("Vendosni një email te saktë");
      failed = true;
    }

    if (!(passwordEl.current.value.length > 0)) {
      setValidPassword("Vendosni një password");
      failed = true;
    }

    if (failed) return;

    setLoading(true);

    try {
      await logInWithEmailAndPassword(
        emailEl.current.value,
        passwordEl.current.value
      );
    } catch (error) {
      console.log(error);

      const message: string = (error as { message: string }).message as string;

      if (message.includes("auth/wrong-password")) {
        setValidPassword("Password i gabuar");
      }

      if (message.includes("auth/user-not-found")) {
        setValidEmail("Nuk ekziston user me këtë email");
      }

      if (message.includes("auth/too-many-requests")) {
        // setValidEmail("Accoutn u Provoni përsëri më vonë");
        setError({
          title: "Llogari është çaktivizuar",
          description:
            "Llogari juaj është çaktivizuar përkohësisht për shkak të shumë përpjekjeve të dështuara për hyrje. Provoni përsëri më vonë.",
        });
      }
    }

    setLoading(false);
  };

  return (
    <Layout showHeader={false}>
      <Seo title="Login" />

      {error && (
        <Notification
          title={error.title}
          description={error.description}
          visible={!!error}
          setVisible={setError}
          status="danger"
        />
      )}

      <div className={styles.login}>
        <div className={styles.login__wrapper}>
          <a href="https://ivodent.edu.al/" target="_blank">
            <StaticImage
              src="../images/logo.png"
              alt="Ivodent Logo"
              height={85}
              placeholder="none"
            />
          </a>

          <div className={styles.login__card}>
            <h1 className={styles.card__title}>Mirëserdhët</h1>
            <p className={styles.card__description}>
              Ju lutemi plotesoni te dhënat tuaja
            </p>

            <form className={styles.card__form} onSubmit={onSubmit}>
              <Input
                type="text"
                label="Email"
                placeholder="Shkruani emailin tuaj"
                elRef={emailEl}
                error={validEmail}
                onChange={() => (validEmail ? setValidEmail(null) : null)}
                autoComplete
              />

              <Input
                type="password"
                label="Fjalëkalimi"
                placeholder="Shkruani fjalëkalimin tuaj"
                elRef={passwordEl}
                error={validPassword}
                onChange={() => (validPassword ? setValidPassword(null) : null)}
                autoComplete
              />

              <Link to="/forgot-password" className={styles.form__link}>
                Keni harruar fjalëkalimin?
              </Link>

              <Button
                text="Identifikohu"
                type="submit"
                icon={loading ? <LoadingIcon /> : undefined}
              />

              <Button
                text="Identifikohu me Google"
                style="light"
                icon={<GoogleIcon />}
                onClick={async () => await signInWithGoogle()}
              />
            </form>
          </div>

          <p className={styles.login__copyright}>
            Developed with <span className={styles.heart} /> by Ivodent Academy
          </p>
        </div>

        <div className={styles.login__image}>
          <StaticImage
            src="../images/students.jpg"
            alt="Students working"
            className={styles.image}
            placeholder="none"
          />
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;
