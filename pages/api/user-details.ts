import { isAuthenticated } from "@/middleware/auth";

import nextConnect from "next-connect";

const handler = nextConnect();

handler.use(isAuthenticated).get(async (req: any, res: any) => {
  try {
    const user = req.user.status === "Active" ? req.user : null;
    return res.status(user ? 200 : 400).json(user ? user : { msg: "Status not Active" });
  } catch (error) {
    return res.status(500).json({ msg: "Internal Server Error" });
  }
});

export default handler;
