import { Card, CardBody, Heading, Space } from "@app/design";
import React from "react";

function Plan({
  heading,
  body,
  action,
}: {
  heading: string;
  body: React.ReactNode;
  action: React.ReactNode;
}) {
  return (
    <Card>
      <CardBody>
        <Space direction="column" gap="large">
          <Heading level={3}>{heading}</Heading>
          <Space direction="column">{body}</Space>
          {action}
        </Space>
      </CardBody>
    </Card>
  );
}

export function FreePlan({ action }: { action: React.ReactNode }) {
  return (
    <Plan
      heading="Free"
      body={
        <>
          <p>$0 per year</p>
          <p>For hobby gardeners and evaluation</p>
          <p>
            All our <a href="#features"> standard features</a>
          </p>
          <p>Limit 100 daylily listings</p>
        </>
      }
      action={action}
    />
  );
}

export function ProPlan({ action }: { action: React.ReactNode }) {
  return (
    <Plan
      heading="Pro"
      body={
        <>
          <p>$60 per year</p>
          <p>For serious gardeners and hybridizers</p>
          <p>
            All our <a href="#features"> standard features</a>
          </p>
          <p>Unlimited daylily listings</p>
          <p>Upload garden and daylily photos</p>
          <p>Website for your catalog</p>
          <p>Limit 100 daylily listings</p>
        </>
      }
      action={action}
    />
  );
}
