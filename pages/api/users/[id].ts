import nextConnect from "next-connect";
import { PrismaClient } from "@prisma/client";

import { isAdmin, isAuthenticated } from "@/middleware/auth";
import { userPermissions } from "@/db/constants";
import { include } from "@/common/functions";
import { userUpdateAuth } from "@/middleware/user";

const prisma = new PrismaClient();
const handler = nextConnect();

export default handler
  .use(isAuthenticated)
  .use(isAdmin)
  .use(userUpdateAuth)
  .put(async (req: any, res: any) => {
    try {
      const { id, name, profileType, role, profileId, user } = req.body.data;

      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id },
          data: { name, ...include(req.body, ["phoneNumber", "status"]) },
        });

        const userId = user.id;
        if (!user.globalSuperAdmin) {
          const permissions = { ...userPermissions(), ...req.body.permissions };
          if (user.profile.type === profileType)
            await tx[`${profileType}User`].update({
              where: { id: user.profile.userId },
              data: { [`${profileType}Id`]: profileId, role, permissions },
            });
          else {
            if (user.profile.type)
              await tx[`${user.profile.type}User`].delete({ where: { id: user.profile.userId } });
            await tx[`${profileType}User`].create({
              data: { userId, [`${profileType}Id`]: profileId, role, permissions },
            });
          }
        }
      });
      return res.status(200).json({ msg: "User update successful" });
    } catch (error) {
      return res.status(500).json({ msg: "Error", error });
    }
  })
  .delete(async (req: any, res: any) => {
    try {
      const { id: userId } = req.query;
      const id = Number(userId);

      await prisma.user.delete({ where: { id } });

      return res.status(204).json({ msg: "User delete successful" });
    } catch (error) {
      return res.status(500).json({ msg: "Internal Server Error" });
    }
  });
