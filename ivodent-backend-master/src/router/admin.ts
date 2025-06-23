import { Router } from "express";

import { addUser, removeUser } from "../controller/admin";
import { verifyAdmin } from "../middleware/auth";

const router = Router();

router.post("/add", verifyAdmin, addUser);

router.delete("/remove", verifyAdmin, removeUser);

export default router;
