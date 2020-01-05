import { NextApiRequest, NextApiResponse } from "next";
import AWS from "aws-sdk";
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const bucket: string = process.env.BUCKET as string;
  const key: string = req.query.key as string;
  if (!bucket) {
    res.json({ success: false, err: "no bucket enviromental var set" });
    return;
  }
  if (!key) {
    res.json({ success: false, err: "no key set" });
    return;
  }
  const params: AWS.S3.DeleteObjectRequest = {
    Bucket: bucket,
    Key: key,
  };
  const client = getClient();
  const operation = req.query.operation;
  if (operation === "put") {
    put(client, params);
  } else if (operation === "delete") {
    del(client, params);
  }

  function getClient() {
    const region = process.env.AWS_REGION;
    const accessKey = process.env.AWSACCESSKEYID;
    const secretKey = process.env.AWSSECRETKEY;
    AWS.config.update({
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
      signatureVersion: "v4",
      region: region,
    });
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
    const client = new AWS.S3(options);
    return client;
  }
  function put(client: AWS.S3, params: AWS.S3.DeleteObjectRequest) {
    const putParams = {
      ...params,
      Expires: 5 * 60,
    };
    client.getSignedUrl("putObject", putParams, (err, url) => {
      if (err) {
        res.json({ success: false, err });
      } else {
        res.json({ success: true, url });
      }
    });
  }
  function del(client: AWS.S3, params: AWS.S3.DeleteObjectRequest) {
    client.deleteObject(params, err => {
      if (err) {
        res.json({ success: false, err });
      } else {
        res.json({ success: true });
      }
    });
  }
};
