import nextConnect from "next-connect";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const handler = nextConnect();

export default handler.post(async (req: any, res: any) => {
  try {
    const { password, newPassword, resetToken } = req.body;
    // Check if email exists in the database
    const user = await prisma.user.findFirst({ where: { resetToken } });
    if (!user) return res.status(404).json({ msg: "Invalid reset token" });
    if (newPassword !== password) return res.status(400).json({ msg: "Passwords do not match" });

    const passwordHash = await bcrypt.hash(req.body.password, 10);
    // Update user password and reset the resetToken field to null after the password is updated
    await prisma.user.update({
      where: { id: user.id },
      data: { password: passwordHash, resetToken: "" },
    });

    return res.status(200).json({ msg: "Password updated successfully" });
  } catch (error) {
    return res.status(400).json({ msg: "Error", error });
  }
});
