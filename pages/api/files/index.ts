import nextConnect from "next-connect";
import { PrismaClient } from "@prisma/client";

import { isAuthenticated } from "@/middleware/auth";
import { include } from "@/common/functions";

const prisma = new PrismaClient();
const handler = nextConnect();

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb", // Adjust the limit as needed
    },
  },
};

export default handler
  .use(isAuthenticated)
  .get(async (req: any, res: any) => {
    try {
      const { profile, role, globalSuperAdmin } = req.user;
      const { id, type } = profile;

      const { perPage, page, search } = req.query;
      const take = Number(perPage) || 10;
      const skip = ((Number(page) || 1) - 1) * take;

      let where = {};
      const searchQuery = ["fileName", "companyName", "formType"].map((e) => {
        return { [e]: { contains: search } };
      });
      const typeUsersQuery = (ty) => {
        return { [`${ty}Users`]: { some: { [ty]: { id: { in: profile[`${ty}s`] } } } } };
      };

      if (!globalSuperAdmin) {
        if (role === "User") where = { fileUsers: { some: { user: { id: req.user.id, OR: [] } } } };
        else where = { fileUsers: { some: { user: { OR: [] } } } };
        where["fileUsers"]["some"]["user"]["OR"] = [
          { [`${type}Users`]: { some: { [type]: { id } } } },
        ];

        if (["apex", "serviceProvider"].includes(type))
          where["fileUsers"]["some"]["user"]["OR"] = [
            ...where["fileUsers"]["some"]["user"]["OR"],
            { ...typeUsersQuery("client") },
          ];
        if (type === "apex")
          where["fileUsers"]["some"]["user"]["OR"] = [
            ...where["fileUsers"]["some"]["user"]["OR"],
            { ...typeUsersQuery("serviceProvider") },
          ];

        if (search)
          where = {
            AND: [{ ...where }, { OR: searchQuery }],
          };
      } else if (search) where["OR"] = searchQuery;

      const query: any = {
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
        select: {
          id: true,
          fileName: true,
          createdAt: true,
          status: true,
          warning: true,
          error: true,
          fileUsers: { select: { user: true } },
          splitFiles: { select: { fileUsers: { select: { user: true } } } },
        },
      };

      const files = await prisma.file.findMany({ ...query });
      const count = await prisma.file.aggregate({ where, _count: { _all: true } });

      return res.status(200).json({ where, data: files, count: count._count._all });
    } catch (error) {
      return res.status(400).json({ msg: "Internal Server Error", error });
    }
  })
  .post(async (req: any, res: any) => {
    try {
      // Extract data from the request body
      const pick1 = ["companyName", "ticker", "cik", "companyWebsite", "formType", "period"];
      const pick2 = ["taxonomyId", "periodFrom", "periodTo", "unit", "url"];
      const pick3 = ["fileName", "tagging", "status"];

      let data: any = include(req.body, [...pick1, ...pick2]);
      if (Object.keys(data).length !== 11 || !Number(req.body.taxonomyId))
        return res.status(400).json({ msg: "invalid payload" });

      data = { ...data, ...include(req.body, [...pick3]) };

      const split = data["url"].split("/");
      if (!["fileName"].includes(data)) data["fileName"] = split[split.length - 1].split(".")[0];

      await prisma.$transaction(async (tx) => {
        const file = await tx.file.create({ data });

        await tx.fileUser.create({
          data: { fileId: file.id, userId: req.userId },
        });

        if (req.body?.assigned !== req.userId)
          await tx.fileUser.create({
            data: { fileId: file.id, userId: req.body.assigned },
          });

        return res.status(201).json({ msg: "File created successfully", id: file.id });
      });

      return res.status(400).json({ msg: "Error" });
    } catch (error) {
      return res.status(500).json({ msg: "Internal Server Error", error });
    }
  });
