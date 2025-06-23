import type { Request, Response, NextFunction } from "express";

export const verifyAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const auth: string | undefined = req.headers.authorization;

  if (
    auth &&
    auth.startsWith("Bearer") &&
    process.env.ADMIN_UID &&
    process.env.ADMIN_UID.split(",").includes(auth.split(" ")[1])
  ) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "No Authorization",
  });
};
