const XLSX = require("xlsx");
import nextConnect from "next-connect";
import { PrismaClient } from "@prisma/client";
// import path from "path";
// import getConfig from "next/config";

import { isAuthenticated } from "@/middleware/auth";
import { include } from "@/common/functions";

const prisma = new PrismaClient();
const handler = nextConnect();

export default handler
  .use(isAuthenticated)
  .get(async (req: any, res: any) => {
    try {
      const files = await prisma.taxonomy.findMany({ select: { id: true, name: true } });

      return res.status(200).json(files);
    } catch (error) {
      return res.status(400).json({ msg: "Internal Server Error", error });
    }
  })
  .post(async (req: any, res: any) => {
    // try {
    // TODO restrictions
    // Extract data from the request body
    const data: any = include(req.body, ["name", "data"]);

    if (Object.keys(data).length !== 2) return res.status(400).json({ msg: "invalid payload" });

    const elements: any = [];
    //
    // const { serverRuntimeConfig } = getConfig();
    // const dir = path.join(serverRuntimeConfig.PROJECT_ROOT, "./public", "");
    // const localFiles = [
    //   `${dir}/GAAP_Taxonomy_2023_Elements_Presentation.xlsx`,
    //   `${dir}/GAAP_Taxonomy_2023_Elements_Definition.xlsx`,
    //   `${dir}/GAAP_Taxonomy_2023_Elements_Calculation.xlsx`,
    // ];
    // for (const file of localFiles) {
    //   const workbook = XLSX.readFile(file);
    //   const sheet = workbook.Sheets[workbook.SheetNames[0]];
    //   const excelData = XLSX.utils.sheet_to_json(sheet);
    //   for (const el of excelData)
    //     elements.push({
    //       sheet: file.replace(`${dir}/GAAP_Taxonomy_2023_Elements_`, "").replace(".xlsx", ""),
    //       name: el.name,
    //       label: el.label_x,
    //       data: el,
    //     });
    // }

    for (const file of data.data.elements) {
      const response = await fetch(file.value);
      const buffer = await response.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const excelData = XLSX.utils.sheet_to_json(sheet);
      for (const el of excelData)
        elements.push({ sheet: file.label, name: el.name, label: el.label_x, data: el });
    }

    await prisma.$transaction(
      async (tx) => {
        const taxonomy = await tx.taxonomy.create({ data });
        // dump records
        for (const el of elements)
          await tx.taxonomyElement.create({ data: { ...el, taxonomyId: taxonomy.id } });
      },
      { timeout: 100 * 60 * 1000 }
    );

    return res.status(201).json({ msg: "Taxonomy created successfully" });
    // } catch (error) {
    //   return res.status(500).json({ msg: "Error", error });
    // }
  });
