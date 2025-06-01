import nextConnect from "next-connect";
import { PrismaClient } from "@prisma/client";

import { isAdmin, isAuthenticated } from "@/middleware/auth";
import { clientUpdateAuth } from "@/middleware/client";
import { include } from "@/common/functions";

const prisma = new PrismaClient();
const handler = nextConnect();

export default handler
  .use(isAuthenticated)
  .use(isAdmin)
  .use(clientUpdateAuth)
  .put(async (req: any, res: any) => {
    try {
      const { id: clientId } = req.query;
      const id = Number(clientId);
      const { name, apexId, serviceProviderId } = req.body;
      const data = {
        name,
        apexId: apexId || null,
        serviceProviderId: serviceProviderId || null,
        ...include(req.body, ["status"]),
      };

      if (!req.user.globalSuperAdmin) data["apexId"] = 1;

      await prisma.client.update({ where: { id }, data });

      return res.status(200).json({ msg: "Client update successful" });
    } catch (error) {
      return res.status(500).json({ msg: "Error", error });
    }
  })
  .delete(async (req: any, res: any) => {
    try {
      const { id: clientId } = req.query;
      const id = Number(clientId);
      await prisma.user.deleteMany({
        where: { clientUsers: { some: { client: { id } } } },
      });
      await prisma.client.delete({ where: { id } });

      return res.status(204).json({ msg: "Client delete successful" });
    } catch (error) {
      return res.status(500).json({ msg: "Error", error });
    }
  });
