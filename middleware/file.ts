import nextConnect from "next-connect";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const fileGetAuth = nextConnect();

fileGetAuth.use(async (req: any, res: any, next: any) => {
  const { id: fileId } = req.query;
  const id = Number(fileId);
  if (!id) return res.status(400).json({ msg: "Invalid query" });

  const exists = await prisma.file.findUnique({
    where: { id },
    include: {
      taxonomy: { select: { name: true, data: true } },
      splitFiles: { select: { id: true, fileName: true, url: true } },
    },
  });
  if (!exists) return res.status(400).json({ msg: "File does not exists" });

  req["file"] = exists;

  // TODO  check restrictions of user with permissions and roles

  next();
});

export { fileGetAuth };
