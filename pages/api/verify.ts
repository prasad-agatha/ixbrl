import axios from "axios";
import dotenv from "dotenv";
import nextConnect from "next-connect";

dotenv.config();
const handler = nextConnect();

handler.post(async (req: any, res: any) => {
  try {
    const { captcha_response } = req.body;

    if (!captcha_response) return res.json({ msg: "Missing captcha value" });

    const secret = (process.env.RECAPTCHA_SECRET_KEY || "").replaceAll(`"`, "");

    const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${captcha_response}`;

    const options = { method: "POST", url };
    const response = await axios.request(options);
    return res.status(response.data.success ? 200 : 400).json(response.data);
  } catch (error) {
    return res.status(500).json({ msg: "Internal Server Error", error });
  }
});

export default handler;
