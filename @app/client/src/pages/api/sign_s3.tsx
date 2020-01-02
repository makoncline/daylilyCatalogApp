import { NextApiRequest, NextApiResponse } from "next";
import AWS from "aws-sdk";
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const region = process.env.AWS_REGION;
  const accessKey = process.env.AWSACCESSKEYID;
  const secretKey = process.env.AWSSECRETKEY;
  const bucket = process.env.BUCKET;
  const fileName = req.query.fileName;
  const fileType = req.query.fileType;
  AWS.config.update({
    accessKeyId: accessKey,
    secretAccessKey: secretKey,
    region: region,
    signatureVersion: "v4",
  });
  const params = {
    Bucket: bucket,
    Key: fileName + "." + fileType,
    Expires: 5 * 60,
    ContentType: `image/${fileType}`,
  };
  const options = {
    signatureVersion: "v4",
    region: region,
    // uncomment the next line to use accelerated endpoint
    // accelerated endpoint must be turned on in your s3 bucket first
    // endpoint: new AWS.Endpoint(
    //   "daylily-catalog-images.s3-accelerate.amazonaws.com"
    // ),
    // useAccelerateEndpoint: true,
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
