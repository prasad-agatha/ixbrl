import nextConnect from "next-connect";
import { PrismaClient } from "@prisma/client";
import { isAuthenticated } from "@/middleware/auth";
import { include } from "@/common/functions";

const prisma = new PrismaClient();
const handler = nextConnect();

export default handler.use(isAuthenticated).get(async (req: any, res: any) => {
  try {
    const { file, elementId } = req.query;
    if (!file) return res.status(400).json({ msg: "Invalid file." });
    const search = (req.query.search || "").trim();
    if (!elementId && search.length === 0) return res.status(200).json([]);

    const id = Number(req.query.id);
    const taxonomy_file = await prisma.taxonomy.findUnique({ where: { id } });
    if (!taxonomy_file) return res.status(400).json({ msg: "Taxonomy not found" });

    const where = { taxonomyId: id, sheet: file };
    if (elementId && !search) where["AND"] = [{ data: { path: ["cn"], equals: elementId } }];
    else if (!elementId) where["AND"] = [{ data: { path: ["name"], string_contains: search } }];

    const query: any = { where };
    if (!elementId && search.length < 4) query["take"] = 20;

    const elements = await prisma.taxonomyElement.findMany(query);
    const filteredData = elements.map((e: any) => {
      const name = e.data.prefix + ":" + e.data.name;
      const element =
        elementId && !search
          ? { ...e.data, name }
          : { ...include(e.data, ["cn"]), name, label: e.data.label_x };
      return element;
    });

    return res.status(200).json(filteredData);
  } catch (error) {
    return res.status(500).json({ msg: "Error", error });
  }
});
