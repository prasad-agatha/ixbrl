import nextConnect from "next-connect";
import { PrismaClient } from "@prisma/client";

import { isAdmin, isAuthenticated } from "@/middleware/auth";
import { serviceProviderUpdateAuth } from "@/middleware/serviceProvider";
import { include } from "@/common/functions";

const prisma = new PrismaClient();
const handler = nextConnect();

export default handler
  .use(isAuthenticated)
  .use(isAdmin)
  .use(serviceProviderUpdateAuth)
  .put(async (req: any, res: any) => {
    try {
      const { id: serviceProviderId } = req.query;
      const id = Number(serviceProviderId);
      const { name, apexId } = req.body;
      const data = { name, apexId: apexId || null, ...include(req.body, ["status"]) };

      if (!req.user.globalSuperAdmin) data["apexId"] = 1;

      await prisma.serviceProvider.update({ where: { id }, data });

      return res.status(200).json({ msg: "ServiceProvider update successful" });
    } catch (error) {
      return res.status(500).json({ msg: "Error", error });
    }
  })
  .delete(async (req: any, res: any) => {
    try {
      const { id: serviceProviderId } = req.query;
      const id = Number(serviceProviderId);
      await prisma.user.deleteMany({
        where: { serviceProviderUsers: { some: { serviceProvider: { id } } } },
      });
      await prisma.serviceProvider.delete({ where: { id } });

      return res.status(204).json({ msg: "ServiceProvider delete successful" });
    } catch (error) {
      return res.status(500).json({ msg: "Error", error });
    }
  });
