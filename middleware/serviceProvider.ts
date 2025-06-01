import nextConnect from "next-connect";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const serviceProviderCreateAuth = nextConnect();
const serviceProviderUpdateAuth = nextConnect();

serviceProviderCreateAuth.use(async (req: any, res: any, next: any) => {
  const { profile, role: userRole } = req.user;
  const { type } = profile;

  if (!(userRole === "SuperAdmin" && type === "apex"))
    return res.status(400).json({ msg: "Access Denied" });

  const { name, email } = req.body;

  if (!name) return res.status(400).json({ msg: "Invalid payload" });

  const exists = await prisma.serviceProvider.findFirst({ where: { name } });
  if (exists) return res.status(400).json({ msg: "ServiceProvider Name already exists" });

  if (email) {
    const emailExists = await prisma.user.findUnique({ where: { email } });
    if (emailExists) return res.status(400).json({ msg: "Email already exists" });
  }

  if (!req.user.globalSuperAdmin) req.body["apexId"] = 1;

  next();
});

serviceProviderUpdateAuth.use(async (req: any, res: any, next: any) => {
  const { id: serviceProviderId } = req.query;
  const id = Number(serviceProviderId);
  if (!id) return res.status(400).json({ msg: "Invalid query" });

  const serviceProvider = await prisma.serviceProvider.findUnique({
    where: { id },
    select: { apexId: true },
  });
  if (!serviceProvider) return res.status(400).json({ msg: "ServiceProvider does not exists" });

  const { profile, role: userRole } = req.user;
  const { type } = profile;

  if (req.method === "PUT") {
    const { name } = req.body;

    if (!name) return res.status(400).json({ msg: "Invalid payload" });

    const exists = await prisma.serviceProvider.findFirst({ where: { name, NOT: { id } } });
    if (exists) return res.status(400).json({ msg: "ServiceProvider Name already exists" });
  }

  if (req.user.globalSuperAdmin) return next();

  if (
    type === "client" ||
    userRole === "User" ||
    (["Admin", "SuperAdmin"].includes(userRole) &&
      type === "serviceProvider" &&
      profile.id !== id) ||
    (userRole === "SuperAdmin" &&
      type === "apex" &&
      !(profile?.serviceProviders || []).includes(id)) ||
    (req.method === "DELETE" && userRole !== "SuperAdmin")
  )
    return res.status(400).json({ msg: "Access Denied" });

  next();
});

export { serviceProviderCreateAuth, serviceProviderUpdateAuth };
