import nextConnect from "next-connect";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const handler = nextConnect();

export default handler.post(async (req: any, res: any) => {
  try {
    const { email, password } = req.body;
    // Check if email exists in the database
    const user = await prisma.user.findUnique({
      where: { email, status: { not: "Inactive" } },
      include: { apexUsers: true, clientUsers: true, serviceProviderUsers: true, fileUsers: true },
    });

    if (!user) return res.status(400).json({ msg: "User not found" });

    if (user.status === "Pending")
      return res.status(400).json({ msg: "User status pending. Admin approval required" });
    if (!user.password) return res.status(400).json({ msg: "Please complete your password setup" });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(400).json({ msg: "Incorrect Password" });

    const lastLogin = new Date().toISOString();
    await prisma.user.update({ where: { id: user.id }, data: { lastLogin } });

    const token = jwt.sign({ id: user.id }, "secret", { expiresIn: "3d" });
    return res.status(200).json({ token: token });
  } catch (error) {
    return res.status(400).json({ msg: "Error", error });
  }
});
