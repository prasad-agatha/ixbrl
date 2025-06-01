import nextConnect from "next-connect";
import { PrismaClient } from "@prisma/client";
import { isAuthenticated } from "@/middleware/auth";
import { include } from "@/common/functions";

const prisma = new PrismaClient();
const handler = nextConnect();

export default handler.use(isAuthenticated).post(async (req: any, res: any) => {
  try {
    const id = Number(req.query.id);
    const taxonomy_file = await prisma.taxonomy.findUnique({
      where: {
        id,
      },
    });
    if (!taxonomy_file) return res.status(400).json({ msg: "Taxonomy not found." });
    const { name } = req.body;
    if (!name) return res.status(400).json({ msg: "Invalid Payload." });
    const where: any = {
      taxonomyId: id,
      sheet: "Presentation",
      AND: [{ data: { path: ["name"], string_contains: req.body.name } }],
    };
    const search = (ty) => {
      return { data: { path: [ty], equals: req.body[ty] } };
    };
    const fields = include(req.body, ["dataType", "deprecated", "balance", "period", "abstract"]);
    Object.keys(fields).map((e) => where["AND"].push(search(e)));

    const elements = await prisma.taxonomyElement.findMany({ where, select: { data: true } });
    const filteredData = elements.map((e) => {
      return { ...include(e.data, ["name", "cn", "Filer Usage Count"]) };
    });

    return res.status(200).json(filteredData);
  } catch (error) {
    return res.status(500).json({ msg: "Error", error });
  }
});
