import { UserRole } from "@interface/context";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  EmailAuthProvider,
  linkWithCredential,
} from "firebase/auth";
import {
  getFirestore,
  deleteDoc,
  doc,
  query,
  collection,
  where,
  getDocs,
} from "firebase/firestore";
import { navigate } from "gatsby";

const firebaseConfig = {
  apiKey: process.env.GATSBY_API_KEY,
  authDomain: process.env.GATSBY_AUTH_DOMAIN,
  databaseURL: process.env.GATSBY_DATABASE_URL,
  projectId: process.env.GATSBY_PROJECT_ID,
  storageBucket: process.env.GATSBY_STORAGE_BUCKET,
  messagingSenderId: process.env.GATSBY_MESSAGING_SENDER_ID,
  appId: process.env.GATSBY_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const logInWithEmailAndPassword = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

export const registerWithEmailAndPassword = async ({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) => {
  if (!auth.currentUser) return;

  try {
    const req = await fetch(`${process.env.GATSBY_BACKEND_API_URL}/admin/add`, {
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${auth.currentUser.uid}`,
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
      method: "POST",
    });

    const data = (await req.json()) as {
      success: true;
      uid: string;
    };

    return data.uid;
  } catch (err) {
    // console.error(err);
  }
};

export const sendPasswordReset = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    alert("Password reset link sent!");
  } catch (err) {
    // console.error(err);
  }
};

export const deleteUser = async (
  uid: string,
  id: string,
  student?: boolean
) => {
  try {
    if (!auth.currentUser) return;

    await fetch(`${process.env.GATSBY_BACKEND_API_URL}/admin/remove`, {
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${auth.currentUser.uid}`,
      },
      body: JSON.stringify({
        uid,
      }),
      method: "DELETE",
    });

    if (student) {
      const q = query(collection(db, "grades"), where("student", "==", uid));
      const docs = await getDocs(q);

      if (docs.docs.length > 0) {
        docs.docs.forEach(async (item) => {
          await deleteDoc(doc(db, "grades", item.id));
        });
      }
    }

    await deleteDoc(doc(db, "users", id));
  } catch (error) {
    // console.log(error);
  }
};

export const signInWithGoogle = async () => {
  try {
    const googleProvider = new GoogleAuthProvider();

    await signInWithPopup(auth, googleProvider);
  } catch (err) {
    // console.error(err);
  }
};

export const linkAccount = async (
  email: string,
  password: string,
  role: UserRole
) => {
  if (auth.currentUser) {
    try {
      const credential = EmailAuthProvider.credential(email, password);

      await linkWithCredential(auth.currentUser, credential);

      let redirectURl: string = "/";

      switch (role) {
        case "admin":
          redirectURl = "/admin/students";
          break;

        case "student":
          redirectURl = "/student";
          break;

        case "teacher":
          redirectURl = "/teacher";
          break;
      }

      if (window.location.pathname !== redirectURl) {
        navigate(redirectURl);
      }
    } catch (error) {
      // console.log(error);
    }
  }
};

export const logout = () => signOut(auth);

export default app;
