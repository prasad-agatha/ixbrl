import nextConnect from "next-connect";
import { PrismaClient } from "@prisma/client";

import { isAdmin, isAuthenticated } from "@/middleware/auth";
import { clientCreateAuth } from "@/middleware/client";

const prisma = new PrismaClient();
const handler = nextConnect();

export default handler
  .use(isAuthenticated)
  .use(isAdmin)
  .get(async (req: any, res: any) => {
    try {
      const { globalSuperAdmin, profile } = req.user;
      const { id, type } = profile;

      const { perPage, page, search } = req.query;
      const take = Number(perPage) || 10;
      const skip = ((Number(page) || 1) - 1) * take;

      const where = {};
      if (search) where["name"] = { contains: search };
      if (!globalSuperAdmin) {
        if (type === "client") where["AND"] = { id };
        if (["apex", "serviceProvider"].includes(type)) where["id"] = { in: profile["clients"] };
      }

      const count = await prisma.client.aggregate({ where, _count: { _all: true } });

      const query: any = { where, orderBy: { createdAt: "desc" }, skip, take };
      query["select"] = {
        _count: { select: { users: { where: { user: { status: "Active" } } } } },
        id: true,
        name: true,
        website: true,
        status: true,
        apexId: true,
        phoneNumber: true,
        serviceProvider: { select: { id: true, name: true } },
        users: {
          take: 1,
          where: { role: "SuperAdmin" },
          orderBy: { createdAt: "asc" },
          select: { user: { select: { name: true, email: true } } },
        },
      };
      const data = await prisma.client.findMany(query);

      return res.status(200).json({ data, count: count._count._all });
    } catch (error) {
      return res.status(500).json({ msg: "Internal Server Error" });
    }
  })
  .use(clientCreateAuth)
  .post(async (req: any, res: any) => {
    try {
      const { name, website, phoneNumber, apexId, serviceProviderId } = req.body;

      const data = { name, website, phoneNumber, apexId, serviceProviderId };

      const client = await prisma.client.create({ data });
      const id = client.id;

      return res.status(200).json({ msg: "Client creation successful", id });
    } catch (error) {
      return res.status(500).json({ msg: "Error", error });
    }
  });
