import type { Request, Response, NextFunction } from "express";

import { getAuth } from "firebase-admin/auth";

import { app } from "../utils/firebase";

// @desc       Add User
// @route      POST /admin/add
// @access     Public
export const addUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, name, password } = req.body as {
    email?: string;
    password?: string;
    name?: string;
  };

  if (!email || !name || !password) {
    return res.status(400).json({
      success: false,
      message: `Please provide missing credentials`,
    });
  }

  try {
    const user = await getAuth(app).createUser({
      email,
      password,
      displayName: name,
    });

    return res.status(201).json({
      success: true,
      uid: user.uid,
    });
  } catch (error) {
    let message: string = "Failed to add user";

    const err = error as { message: string };

    if (err.message) {
      message = err.message;
    }

    return res.status(400).json({
      success: false,
      message,
    });
  }
};

// @desc       Add User
// @route      DELETE /admin/remote
// @access     Public
export const removeUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { uid } = req.body as {
    uid?: string;
  };

  if (!uid) {
    return res.status(400).json({
      success: false,
      message: `Please provide user uid`,
    });
  }

  try {
    await getAuth(app).deleteUser(uid);

    return res.status(200).json({
      success: true,
      message: "Successfully removed user",
    });
  } catch (error) {
    let message: string = "Failed to remove user";

    const err = error as { message: string };

    if (err.message) {
      message = err.message;
    }

    return res.status(400).json({
      success: false,
      message,
    });
  }
};
