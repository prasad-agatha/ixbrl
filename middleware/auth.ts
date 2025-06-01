import nextConnect from "next-connect";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

import { userSelect } from "@/db/queries";
import { getProfile } from "@/db/functions";

const prisma = new PrismaClient();
const isAuthenticated = nextConnect();
const isAdmin = nextConnect();

isAuthenticated.use(async (req: any, res: any, next: any) => {
  if (!req.headers.authorization)
    return res.status(403).send({ msg: "Please provide an authentication token" });

  const token = req.headers.authorization.split(" ")[1];

  if (!token) return res.status(403).send({ msg: "No token provided" });

  jwt.verify(token, "secret", async (err: any, decoded: any) => {
    if (err) return res.status(401).send({ msg: "Failed to authenticate token" });

    const user = await prisma.user.findUnique({ where: { id: decoded.id }, select: userSelect() });

    if (!user) return res.status(401).send({ msg: "User not found" });

    req.userId = decoded.id;

    req.user = getProfile(user);

    next();
  });
});

isAdmin.use(async (req: any, res: any, next: any) => {
  const { role } = req.user;

  if (!role || role === "User") return res.status(400).json({ msg: "Access Denied" });
  next();
});

export { isAuthenticated, isAdmin };
