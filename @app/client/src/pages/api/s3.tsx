import { NextApiRequest, NextApiResponse } from "next";
import AWS from "aws-sdk";
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const bucket = process.env.BUCKET;
  const fileName = req.query.fileName;
  const fileType = req.query.fileType;
  const params = {
    Bucket: bucket,
    Key: fileName + "." + fileType,
  };
  const client = getClient();
  const operation = req.query.operation;
  if (operation === "put") {
    put(client, params);
  } else if (operation === "delete") {
    del(client, params);
  }

  function getClient() {
    //const region = process.env.AWS_REGION;
    const accessKey = process.env.AWSACCESSKEYID;
    const secretKey = process.env.AWSSECRETKEY;
    AWS.config.update({
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
      //region: region,
      //signatureVersion: "v4",
    });
    const options = {
      //signatureVersion: "v4",
      //region: region,
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
  function put(client: any, params: any) {
    const putParams = {
      ...params,
      Expires: 5 * 60,
      //ContentType: `image/${fileType}`,
    };
    client.getSignedUrl("putObject", putParams, (err: any, url: any) => {
      if (err) {
        res.json({ success: false, err });
      } else {
        res.json({ success: true, url });
      }
    });
  }
  function del(client: any, params: any) {
    console.log("del");
    client.deleteObject(params, (err: any, data: any) => {
      if (err) {
        console.log(err);
        res.json({ success: false, err });
      } else {
        console.log(data);
        res.json({ success: true });
      }
    });
  }
};
