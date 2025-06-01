import nextConnect from "next-connect";
import { PrismaClient } from "@prisma/client";

import { isAuthenticated } from "@/middleware/auth";
import { include } from "@/common/functions";
import { fileGetAuth } from "@/middleware/file";

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
  .use(fileGetAuth)
  .get(async (req: any, res: any) => {
    try {
      return res.status(200).json({ ...req.file });
    } catch (error) {
      return res.status(500).json({ msg: "Error", error });
    }
  })
  .put(async (req: any, res: any) => {
    try {
      const { id: fileId } = req.query;
      const id = Number(fileId);
      const pick = [
        "fileName",
        "companyName",
        "ticker",
        "cik",
        "companyWebsite",
        "status",
        "extra",
      ];
      await prisma.file.update({
        where: { id },
        data: { ...include(req.body, pick) },
      });

      return res.status(200).json({ msg: "File update successful" });
    } catch (error) {
      return res.status(500).json({ msg: "Error", error });
    }
  })
  .delete(async (req: any, res: any) => {
    try {
      const { id: fileId } = req.query;
      const id = Number(fileId);

      await prisma.file.delete({ where: { id } });

      return res.status(204).json({ msg: "File delete successful" });
    } catch (error) {
      return res.status(500).json({ msg: "Internal Server Error" });
    }
  });
