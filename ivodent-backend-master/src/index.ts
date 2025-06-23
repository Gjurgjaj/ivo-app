import express, { Express } from "express";
import dotenv from "dotenv";

import { cors } from "./middleware/cors";

import adminRouter from "./router/admin";

dotenv.config();

const app: Express = express();
const port = process.env.PORT ?? 8000;

// For parsing application/json
app.use(express.json());
app.use(cors);

app.use("/admin", adminRouter);

app.use("*", (req, res) => {
  return res.status(200).json({
    message: "Hello",
  });
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
