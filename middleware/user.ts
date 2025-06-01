import nextConnect from "next-connect";
import { PrismaClient } from "@prisma/client";

import { userSelect } from "@/db/queries";
import { getProfile } from "@/db/functions";

const prisma = new PrismaClient();
const userCreateAuth = nextConnect();
const userUpdateAuth = nextConnect();

userCreateAuth.use(async (req: any, res: any, next: any) => {
  const { profile } = req.user;

  const { name, email, type: profileType, role } = req.body;
  const profileExists = ["apex", "serviceProvider", "client"].includes(profileType);
  const profileId = Number(req.body[`${profileType}Id`]);

  if (!name || !email || !role || !profileExists || !profileId)
    return res.status(400).json({ msg: "Invalid payload" });

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(400).json({ msg: "User already exists" });

  if (req.user.globalSuperAdmin) return next();

  if (req.user.role === "Admin" && role !== "User")
    return res.status(400).json({ msg: "Access Denied" });

  const profileIds =
    profile.type === profileType ? [profile.id] : [...(profile[`${profileType}s`] || [])];

  if (!profileIds.includes(profileId)) return res.status(400).json({ msg: "Access Denied" });

  next();
});

userUpdateAuth.use(async (req: any, res: any, next: any) => {
  const { id: userId } = req.query;
  const id = Number(userId);
  if (!id) return res.status(400).json({ msg: "Invalid query" });

  const exists = await prisma.user.findUnique({ where: { id }, select: userSelect() });
  if (!exists) return res.status(400).json({ msg: "User does not exists" });
  const user = getProfile(exists);

  const { profile } = req.user;

  let body = { name: "", profileType: "", role: "", profileId: 0 };
  if (req.method === "DELETE") {
    if (user.globalSuperAdmin) return res.status(400).json({ msg: "Access Denied" });

    body = {
      name: user.name,
      profileType: user.profile.type || "apex",
      role: user.role || "User",
      profileId: user.profile.id || 1,
    };
  } else if (req.method === "PUT") {
    const { name, type: profileType, role } = req.body;
    const profileId = Number(req.body[`${profileType}Id`]);
    body = {
      name,
      profileType,
      role,
      profileId,
    };
    req.body["data"] = { id, name, profileType, role, profileId, user };
  }

  const { name, profileType, role, profileId } = body;
  const profileExists = ["apex", "serviceProvider", "client"].includes(profileType);

  if (!name || !role || !profileExists || !profileId)
    return res.status(400).json({ msg: "Invalid payload" });

  if (req.user.globalSuperAdmin) return next();

  if (user.globalSuperAdmin && !req.user.globalSuperAdmin)
    return res.status(400).json({ msg: "Access Denied" });

  if (
    req.user.role === "Admin" &&
    ([user.role, role].includes("SuperAdmin") || (role === "Admin" && req.user.id !== user.id))
  )
    return res.status(400).json({ msg: "Access Denied" });

  const profileIds =
    profile.type === profileType ? [profile.id] : [...(profile[`${profileType}s`] || [])];

  if (!profileIds.includes(profileId)) return res.status(400).json({ msg: "Access Denied" });

  next();
});

export { userCreateAuth, userUpdateAuth };
