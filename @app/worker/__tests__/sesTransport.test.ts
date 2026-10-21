import { SESClient } from "@aws-sdk/client-ses";

import { createSesTransport } from "../src/sesTransport";

function recordedSes(statusCode = 200) {
  const requests: string[] = [];
  const client = new SESClient({
    region: "us-east-1",
    credentials: {
      accessKeyId: "fixture",
      secretAccessKey: "fixture",
      sessionToken: "fixture-session",
    },
    maxAttempts: 1,
    requestHandler: {
      async handle(request) {
        expect(request.headers["x-amz-security-token"]).toBe("fixture-session");
        requests.push(String(request.body));
        return {
          response: {
            statusCode,
            headers: { "content-type": "text/xml" },
            body: Buffer.from(
              statusCode === 200
                ? "<SendRawEmailResponse><SendRawEmailResult><MessageId>fixture-message</MessageId></SendRawEmailResult></SendRawEmailResponse>"
                : "<ErrorResponse><Error><Type>Sender</Type><Code>MessageRejected</Code><Message>Fixture rejection</Message></Error></ErrorResponse>"
            ),
          },
        };
      },
    },
  });
  return { client, requests };
}

test("classic SES keeps envelope recipients and removes Bcc from MIME", async () => {
  const { client, requests } = recordedSes();
  try {
    const result = await createSesTransport(client).sendMail({
      from: '"Catalog" <sender@example.invalid>',
      to: ["one@example.invalid", '"Two" <two@example.invalid>'],
      cc: "copy@example.invalid",
      bcc: "hidden@example.invalid",
      subject: "Daylily 🌼",
      text: "Hello\nUnicode: café",
      html: "<p>Unicode: café</p>",
    });
    expect(result.messageId).toBe("fixture-message");
    expect(requests).toHaveLength(1);
    const params = new URLSearchParams(requests[0]);
    expect(params.get("Action")).toBe("SendRawEmail");
    expect(params.get("Source")).toBe("sender@example.invalid");
    expect(
      [...params]
        .filter(([key]) => key.startsWith("Destinations.member."))
        .map(([, value]) => value)
    ).toEqual([
      "one@example.invalid",
      "two@example.invalid",
      "copy@example.invalid",
      "hidden@example.invalid",
    ]);
    const mime = Buffer.from(
      params.get("RawMessage.Data")!,
      "base64"
    ).toString();
    expect(mime).not.toMatch(/^Bcc:/im);
    expect(mime).not.toContain("hidden@example.invalid");
    expect(mime).toContain("multipart/alternative");
    expect(mime).toMatch(/Subject: =\?UTF-8\?/i);
    expect(mime).not.toMatch(/(?<!\r)\n/);
  } finally {
    client.destroy();
  }
});

test("classic SES rejection fails the mail job", async () => {
  const { client, requests } = recordedSes(400);
  try {
    await expect(
      createSesTransport(client).sendMail({
        from: "sender@example.invalid",
        to: "one@example.invalid",
        text: "Fixture",
      })
    ).rejects.toMatchObject({ name: "MessageRejected" });
    expect(requests).toHaveLength(1);
  } finally {
    client.destroy();
  }
});
