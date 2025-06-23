import React, { useContext, useRef, useState } from "react";

import Context from "@components/Context";

import * as styles from "@styles/pages/google_auth.module.scss";
import { Button, Input } from "@ui";
import { LoadingIcon } from "@icon";
import Seo from "@components/Seo";
import { linkAccount } from "@utils/firebase";

const GoogleAuthPage: React.FC = () => {
  const { currentUser } = useContext(Context);

  const [validPassword, setValidPassword] = useState<string | null>(null);
  const passwordEl = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (form) => {
    form.preventDefault();

    if (!passwordEl.current || !currentUser) return;

    setLoading(true);

    await linkAccount(
      currentUser.email,
      passwordEl.current.value,
      currentUser.role
    );
  };

  return (
    <>
      <Seo title="Lidh Account me Google" />

      <div className={styles.google_auth}>
        <form className={styles.google_auth__form} onSubmit={onSubmit}>
          <h1 className={styles.form__title}>Lidh Account me Google</h1>

          <Input
            type="text"
            label="Email"
            placeholder="Shkruani emailin tuaj"
            value={currentUser?.email}
            disabled
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
          <Button
            text="Identifikohu"
            type="submit"
            icon={loading ? <LoadingIcon /> : undefined}
          />
        </form>
      </div>
    </>
  );
};

export default GoogleAuthPage;
