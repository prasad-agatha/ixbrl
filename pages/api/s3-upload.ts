import S3 from "aws-sdk/clients/s3";
import nextConnect from "next-connect";

import { NextApiRequest, NextApiResponse } from "next";
import multer from "multer";

const s3 = new S3({
  region: process.env.AWS_S3_REGION,
  accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
  signatureVersion: "v4",
});

const UploadRoute = nextConnect({
  onError(error: any, req: NextApiRequest, res: NextApiResponse) {
    res.status(501).json({ error: `Sorry something Happened! ${error.message}` });
  },
  onNoMatch(req: NextApiRequest, res: NextApiResponse) {
    res.status(405).json({ error: `Method "${req.method}" Not Allowed` });
  },
});

UploadRoute.use(multer().any());

UploadRoute.post(async (req: NextApiRequest, res: NextApiResponse) => {
  if ((req as any).files.length <= 0) {
    res.status(400).send("NO FILE");
  }

  const { originalname, buffer, mimetype } = (req as any).files[0];
  try {
    const params: any = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: originalname,
      Body: buffer,
      ContentEncoding: "base64",
      ContentType: mimetype,
      ACL: "public-read",
    };
    await s3.putObject(params).promise();

    const BUCKET_URL = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${originalname}`;
    res.status(200).json({ url: BUCKET_URL });
  } catch (err) {
    res.status(400).json({ msg: err });
  }
});

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};

export default UploadRoute;
