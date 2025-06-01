import nextConnect from "next-connect";
import { PrismaClient } from "@prisma/client";
import { isAuthenticated } from "@/middleware/auth";

const prisma = new PrismaClient();
const handler = nextConnect();

export default handler
  .use(isAuthenticated)
  .get(async (req: any, res: any) => {
    const id = Number(req.query.id);
    const search = req.query.search || "";
    const where = { fileId: id };

    if (search.trim()) where["data"] = { contains: search };

    const context = await prisma.context.findMany({ where });

    return res.status(201).json(context);
  })
  .post(async (req: any, res: any) => {
    try {
      const id = Number(req.query.id);
      const data = req.body.name;
      if (!id || !data) return res.status(400).json({ msg: "Invalid request" });

      const isExists = await prisma.context.findFirst({ where: { fileId: id, data } });
      if (isExists) return res.status(200).json({ msg: "Already Exists" });

      const context = await prisma.context.create({ data: { fileId: id, data } });

      return res.status(201).json(context);
    } catch (error) {
      return res.status(500).json({ msg: "Error", error });
    }
  });
