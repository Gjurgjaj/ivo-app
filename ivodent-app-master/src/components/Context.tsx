import React, { createContext, useCallback, useEffect, useState } from "react";
import { navigate } from "gatsby";

import { onAuthStateChanged, User } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";

import { UserItem } from "@interface/context";

import LoadingScreen from "./UI/LoadingScreen";

import { auth, db, logout } from "@utils/firebase";
interface State {
  currentUser: UserItem | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserItem | null>>;
  checkAuth: boolean;
}

const Context = createContext<State>({
  currentUser: null,
  setCurrentUser: () => null,
  checkAuth: false,
});

type Props = {
  children?: React.ReactNode;
};

export const ContextProvider: React.FC<Props> = ({ children }) => {
  const [checkAuth, setCheckAuth] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserItem | null>(null);

  const loginMiddleWare = useCallback(async (user: User | null) => {
    let redirectURl: string | null = null;

    if (user) {
      const q = query(collection(db, "users"), where("uid", "==", user.uid));
      const docs = await getDocs(q);

      if (docs.docs.length > 0) {
        const userData = docs.docs[0].data() as UserItem;

        setCurrentUser({
          ...userData,
        } as UserItem);

        if (
          !(
            user.providerData.length === 1 &&
            user.providerData[0].providerId === "google.com"
          )
        ) {
          switch (userData.role) {
            case "admin":
              redirectURl = window.location.pathname.includes("admin")
                ? window.location.pathname
                : "/admin/students";
              break;

            case "student":
              redirectURl = window.location.pathname.includes("student")
                ? window.location.pathname
                : "/student";
              break;

            case "teacher":
              redirectURl = window.location.pathname.includes("teacher")
                ? window.location.pathname
                : "/teacher";
              break;
          }
        } else {
          redirectURl = "/auth/google";
        }
      } else {
        await logout();

        redirectURl = "/";
      }
    } else {
      const currentPath = window.location.pathname;

      if (
        currentPath.includes("admin") ||
        currentPath.includes("student") ||
        currentPath.includes("teacher") ||
        currentPath.includes("auth")
      ) {
        redirectURl = "/";
      }
    }

    setCheckAuth(true);

    if (redirectURl) {
      navigate(redirectURl);
    }

    return null;
  }, []);

  useEffect(() => {
    onAuthStateChanged(auth, loginMiddleWare);
  }, []);

  const context = {
    currentUser,
    setCurrentUser,
    checkAuth,
  };

  return (
    <Context.Provider value={context}>
      {!checkAuth ? <LoadingScreen /> : children}
    </Context.Provider>
  );
};

export default Context;
