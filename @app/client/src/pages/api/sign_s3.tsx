import { NextApiRequest, NextApiResponse } from "next";
import AWS from "aws-sdk";
export default async (req: NextApiRequest, res: NextApiResponse) => {
  console.log(req);
  const region = process.env.AWS_REGION;
  const accessKey = process.env.AWSACCESSKEYID;
  const secretKey = process.env.AWSSECRETKEY;
  const bucket = process.env.BUCKET;
  const fileName = req.query.fileName;
  const fileType = req.query.fileType;
  console.log(region, accessKey, secretKey, bucket);
  AWS.config.update({
    accessKeyId: accessKey, // Generated on step 1
    secretAccessKey: secretKey, // Generated on step 1
    region: region, // Must be the same as your bucket
    signatureVersion: "v4",
  });
  const params = {
    Bucket: "daylily-catalog-images",
    Key: fileName,
    Expires: 5 * 60, // 30 minutes
    ContentType: `image/${fileType}`,
  };
  const options = {
    signatureVersion: "v4",
    region: region, // same as your bucket
    endpoint: new AWS.Endpoint(
      "daylily-catalog-images.s3-accelerate.amazonaws.com"
    ),
    useAccelerateEndpoint: true,
  };
  // @ts-ignore
  const client = new AWS.S3(options);
  client.getSignedUrl("putObject", params, (err: any, url: any) => {
    if (err) {
      res.json({ success: false, err });
    } else {
      res.json({ url });
    }
  });
};
