import S3 from "aws-sdk/clients/s3";

const s3 = new S3({
  region: process.env.AWS_S3_REGION,
  accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
  signatureVersion: "v4",
});

export async function uploadToS3(htmlDataString, key) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
    Body: htmlDataString,
    ContentType: "text/html",
    ACL: "public-read",
  };

  try {
    const response = await s3.upload(params).promise();

    return response.Location;
  } catch (error) {
    throw error;
  }
}

export default s3;
