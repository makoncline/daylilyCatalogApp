import { awsRegion } from "@app/config";
import { SESClient } from "@aws-sdk/client-ses";
import { promises as fsp } from "fs";
import * as nodemailer from "nodemailer";

import { createSesTransport, MailSender } from "./sesTransport";

const { readFile, writeFile } = fsp;

const isTest = process.env.NODE_ENV === "test";
const isDev = process.env.NODE_ENV !== "production";

let transporterPromise: Promise<MailSender>;
const etherealFilename = `${process.cwd()}/.ethereal`;

export default function getTransport(): Promise<MailSender> {
  if (!transporterPromise) {
    transporterPromise = (async () => {
      if (isTest) {
        return nodemailer.createTransport({
          jsonTransport: true,
        });
      } else if (isDev) {
        let account;
        try {
          const testAccountJson = await readFile(etherealFilename, "utf8");
          account = JSON.parse(testAccountJson);
        } catch {
          account = await nodemailer.createTestAccount();
          await writeFile(etherealFilename, JSON.stringify(account), {
            mode: 0o600,
          });
        }
        return nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          requireTLS: true,
          auth: {
            user: account.user,
            pass: account.pass,
          },
        });
      } else {
        if (!process.env.AWS_ACCESS_KEY_ID) {
          throw new Error("Misconfiguration: no AWS_ACCESS_KEY_ID");
        }
        if (!process.env.AWS_SECRET_ACCESS_KEY) {
          throw new Error("Misconfiguration: no AWS_SECRET_ACCESS_KEY");
        }
        return createSesTransport(
          new SESClient({
            region: awsRegion,
            credentials: {
              accessKeyId: process.env.AWS_ACCESS_KEY_ID,
              secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
              sessionToken: process.env.AWS_SESSION_TOKEN,
            },
          })
        );
      }
    })();
  }
  return transporterPromise!;
}
