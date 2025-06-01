import nextConnect from "next-connect";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();
const handler = nextConnect();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export default handler.post(async (req: any, res: any) => {
  try {
    const { email } = req.body;
    // Check if email exists in the database
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ msg: "User not found" });

    // Generate a reset token
    const resetToken = uuidv4();

    // Save the reset token in the database
    await prisma.user.update({ where: { id: user.id }, data: { resetToken } });

    // Send the password reset email
    const resetLink = `${process.env.BASE_URL}/auth?reset=${resetToken}`;
    await transporter.sendMail({
      from: process.env.FROM_MAIL,
      to: user.email,
      subject: "Password Reset",
      text: `Click the following link to reset your password: ${resetLink}`,
    });

    return res.status(200).json({ msg: "Password reset email sent successfully." });
  } catch (error) {
    return res.status(400).json({ msg: "Error", error });
  }
});
