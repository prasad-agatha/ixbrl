import nextConnect from "next-connect";
import { PrismaClient } from "@prisma/client";

import { isAdmin, isAuthenticated } from "@/middleware/auth";
import { serviceProviderCreateAuth } from "@/middleware/serviceProvider";

const prisma = new PrismaClient();
const handler = nextConnect();

export default handler
  .use(isAuthenticated)
  .use(isAdmin)
  .get(async (req: any, res: any) => {
    try {
      const { globalSuperAdmin, profile } = req.user;
      const { id, type } = profile;

      const { perPage, page, search, apex } = req.query;
      const take = Number(perPage) || 10;
      const skip = ((Number(page) || 1) - 1) * take;

      const where = {};
      if (search) where["name"] = { contains: search };

      if (apex === "true") where["apexId"] = 1;
      else if (apex === "false") where["apexId"] = null;

      if (!globalSuperAdmin) {
        if (type === "client") return res.status(200).json({ data: [], count: 0 });
        if (type === "serviceProvider") where["AND"] = { id };
        if (type === "apex") where["id"] = { in: profile["serviceProviders"] };
      }

      const count = await prisma.serviceProvider.aggregate({ where, _count: { _all: true } });

      const query: any = { where, orderBy: { createdAt: "desc" }, skip, take };
      query["select"] = {
        _count: { select: { users: { where: { user: { status: "Active" } } } } },
        id: true,
        name: true,
        apexId: true,
        status: true,
        users: {
          take: 1,
          where: { role: "SuperAdmin" },
          orderBy: { createdAt: "asc" },
          select: { user: { select: { name: true, email: true } } },
        },
      };
      const data = await prisma.serviceProvider.findMany(query);

      return res.status(200).json({ data, count: count._count._all });
    } catch (error) {
      return res.status(500).json({ msg: "Internal Server Error" });
    }
  })
  .use(serviceProviderCreateAuth)
  .post(async (req: any, res: any) => {
    try {
      const { name, apexId } = req.body;
      const data = { name, apexId: apexId || null };

      const serviceProvider = await prisma.serviceProvider.create({ data });
      const id = serviceProvider.id;

      return res.status(200).json({ msg: "ServiceProvider creation successful", id });
    } catch (error) {
      return res.status(500).json({ msg: "Error", error });
    }
  });
