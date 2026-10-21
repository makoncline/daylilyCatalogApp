import { SendRawEmailCommand, SESClient } from "@aws-sdk/client-ses";
import { SendMailOptions, SentMessageInfo } from "nodemailer";
import MailComposer from "nodemailer/lib/mail-composer";

export type MailSender = {
  sendMail(options: SendMailOptions): Promise<SentMessageInfo>;
};

export function createSesTransport(ses: SESClient): MailSender {
  return {
    async sendMail(options) {
      const message = new MailComposer({
        ...options,
        newline: "windows",
      }).compile();
      message.keepBcc = false;
      const envelope = message.getEnvelope();
      const raw = await message.build();
      const result = await ses.send(
        new SendRawEmailCommand({
          Source: envelope.from || undefined,
          Destinations: envelope.to,
          RawMessage: { Data: raw },
        })
      );
      if (!result.MessageId) throw new Error("SES returned no message id");
      return { messageId: result.MessageId, envelope };
    },
  };
}
