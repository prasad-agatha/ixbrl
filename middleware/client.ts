import nextConnect from "next-connect";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const clientCreateAuth = nextConnect();
const clientUpdateAuth = nextConnect();

clientCreateAuth.use(async (req: any, res: any, next: any) => {
  const { profile, role: userRole } = req.user;
  const { type } = profile;

  if (!(userRole === "SuperAdmin" && ["apex", "serviceProvider"].includes(type)))
    return res.status(400).json({ msg: "Access Denied" });

  const { name, website, phoneNumber, email, apexId, serviceProviderId } = req.body;

  if (!name || !website || !phoneNumber) return res.status(400).json({ msg: "Invalid payload" });

  const exists = await prisma.client.findFirst({ where: { name } });
  if (exists) return res.status(400).json({ msg: "Client Name already exists" });

  if (email) {
    const emailExists = await prisma.user.findUnique({ where: { email } });
    if (emailExists) return res.status(400).json({ msg: "Email already exists" });
  }

  const body = { apexId: null, serviceProviderId: null };
  if (type === "apex") {
    body["apexId"] = req.user.globalSuperAdmin ? apexId : 1;
    body["serviceProviderId"] = serviceProviderId || null;
  }
  if (type === "serviceProvider") {
    body["apexId"] = profile.apexId || null;
    body["serviceProviderId"] = profile.id || null;
  }

  if (body.apexId !== 1) return res.status(400).json({ msg: "Invalid payload" });

  if (body.serviceProviderId && !Number(body.serviceProviderId))
    return res.status(400).json({ msg: "Invalid payload" });
  else if (body.serviceProviderId) {
    const serviceProvider = await prisma.serviceProvider.findUnique({
      where: { id: body.serviceProviderId },
      select: { id: true, apexId: true },
    });

    if (!serviceProvider) return res.status(400).json({ msg: "ServiceProvider does not exists" });
    if (body.apexId !== serviceProvider.apexId)
      return res.status(400).json({ msg: "Invalid payload" });
  }

  next();
});

clientUpdateAuth.use(async (req: any, res: any, next: any) => {
  const { id: clientId } = req.query;
  const id = Number(clientId);
  if (!id) return res.status(400).json({ msg: "Invalid query" });

  const client = await prisma.client.findUnique({
    where: { id },
    select: { name: true, website: true, phoneNumber: true, apexId: true, serviceProviderId: true },
  });
  if (!client) return res.status(400).json({ msg: "Client does not exists" });

  const { profile, role: userRole } = req.user;
  const { type } = profile;

  if (req.method === "PUT") {
    const { name, website, phoneNumber, apexId, serviceProviderId } = req.body;
    if (!name || !website || !phoneNumber) return res.status(400).json({ msg: "Invalid payload" });

    const exists = await prisma.client.findFirst({ where: { name, NOT: { id } } });
    if (exists) return res.status(400).json({ msg: "Client Name already exists" });

    if (apexId && apexId !== 1) return res.status(400).json({ msg: "Invalid payload" });

    if (serviceProviderId && !Number(serviceProviderId))
      return res.status(400).json({ msg: "Invalid payload" });
    else if (serviceProviderId) {
      const serviceProvider = await prisma.serviceProvider.findUnique({
        where: { id: serviceProviderId },
        select: { id: true, apexId: true },
      });

      if (!serviceProvider) return res.status(400).json({ msg: "ServiceProvider does not exists" });
      if (apexId !== serviceProvider.apexId)
        return res.status(400).json({ msg: "Invalid payload" });
    }

    if (type === "apex") {
      req.body["apexId"] = req.user.globalSuperAdmin ? apexId : 1;
      req.body["serviceProviderId"] = serviceProviderId || null;
    }
    if (type === "serviceProvider") {
      req.body["apexId"] = profile.apexId || null;
      req.body["serviceProviderId"] = profile.id || null;
    }
  }

  if (req.user.globalSuperAdmin) return next();

  if (
    userRole === "User" ||
    (["Admin", "SuperAdmin"].includes(userRole) && type === "client" && profile.id !== id) ||
    (userRole === "SuperAdmin" &&
      ["apex", "serviceProvider"].includes(type) &&
      !(profile?.clients || []).includes(id)) ||
    (req.method === "DELETE" && userRole !== "SuperAdmin")
  )
    return res.status(400).json({ msg: "Access Denied" });

  next();
});

export { clientCreateAuth, clientUpdateAuth };
