import { credential } from "firebase-admin";
import { initializeApp, ServiceAccount } from "firebase-admin/app";

import serviceAccount from "../data/firebase-admin.json";

export const app = (() => {
  return initializeApp({
    credential: credential.cert(serviceAccount as ServiceAccount),
    databaseURL:
      "https://ivodent-app-default-rtdb.europe-west1.firebasedatabase.app",
  });
})();
