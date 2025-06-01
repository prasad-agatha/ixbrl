import nextConnect from "next-connect";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { isAdmin, isAuthenticated } from "@/middleware/auth";
import { userSelect } from "@/db/queries";
import { getProfile } from "@/db/functions";
import { include } from "@/common/functions";
import { userPermissions } from "@/db/constants";
import { userCreateAuth } from "@/middleware/user";

const prisma = new PrismaClient();
const handler = nextConnect();

export default handler
  .use(isAuthenticated)
  .get(async (req: any, res: any) => {
    try {
      const { globalSuperAdmin, profile } = req.user;
      const { id, type } = profile;

      const { perPage, page, search, filter } = req.query;
      const take = Number(perPage) || 10;
      const skip = ((Number(page) || 1) - 1) * take;

      let where = {};
      const searchQuery = [{ email: { contains: search } }, { name: { contains: search } }];
      const permissions = filter ? { path: [filter], equals: true } : {};
      const typeUsersQuery = (ty) => {
        return filter
          ? { [`${ty}Users`]: { some: { [ty]: { id: { in: profile[`${ty}s`] } }, permissions } } }
          : { [`${ty}Users`]: { some: { [ty]: { id: { in: profile[`${ty}s`] } } } } };
      };

      if (!globalSuperAdmin) {
        where["OR"] = filter
          ? [{ [`${type}Users`]: { some: { [type]: { id }, permissions } } }]
          : [{ [`${type}Users`]: { some: { [type]: { id } } } }];

        if (["apex", "serviceProvider"].includes(type) && profile["clients"].length > 0)
          where["OR"] = [...where["OR"], { ...typeUsersQuery("client") }];

        if (type === "apex" && profile["serviceProviders"].length > 0)
          where["OR"] = [...where["OR"], { ...typeUsersQuery("serviceProvider") }];

        if (search) where = { AND: [{ OR: where["OR"] }, { OR: searchQuery }] };
      } else {
        if (search) where["OR"] = searchQuery;
        if (filter)
          where["AND"] = [
            {
              OR: [
                { apexUsers: { some: { permissions } } },
                { serviceProviderUsers: { some: { permissions } } },
                { clientUsers: { some: { permissions } } },
              ],
            },
          ];
      }

      const count = await prisma.user.aggregate({ where, _count: { _all: true } });

      const query: any = { where, orderBy: { createdAt: "desc" }, skip, take };
      const users: any = await prisma.user.findMany({ ...query, select: userSelect() });

      const data = users.map((e) => {
        return getProfile(e, true);
      });

      return res.status(200).json({ where, count: count._count._all, data });
    } catch (error) {
      return res.status(500).json({ msg: "Error", error });
    }
  })
  .use(isAdmin)
  .use(userCreateAuth)
  .post(async (req: any, res: any) => {
    try {
      const { name, email, type, role } = req.body;
      const profileId = Number(req.body[`${type}Id`]);

      await prisma.$transaction(async (tx) => {
        // Hash the raw password
        const password = await bcrypt.hash(req.body.password || "soul@123", 10);

        const data = { ...include(req.body, ["phoneNumber", "status"]) };

        const user = await tx.user.create({ data: { ...data, name, email, password } });

        const userId = user.id;
        const permissions = { ...userPermissions(), ...req.body.permissions };

        await tx[`${type}User`].create({
          data: { userId, [`${type}Id`]: profileId, role, permissions },
        });
      });

      return res.status(200).json({ msg: "User creation successful" });
    } catch (error) {
      return res.status(500).json({ msg: "Error", error });
    }
  });
