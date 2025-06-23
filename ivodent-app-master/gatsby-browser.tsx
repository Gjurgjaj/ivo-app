import * as React from "react";
import type { GatsbyBrowser } from "gatsby";

import "firebase/auth";
import "firebase/firestore";
import "firebase/functions";

import { ContextProvider } from "./src/components/Context";

import "./src/styles/main.scss";

export const wrapPageElement: GatsbyBrowser["wrapPageElement"] = ({
  element,
}) => <ContextProvider>{element}</ContextProvider>;
