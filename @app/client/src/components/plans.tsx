import { Card, CardBody, Heading, Space } from "@app/design";
import React from "react";
import styled from "styled-components";
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
    <StyledCard>
      <CardBody>
        <SpaceBetween direction="column">
          <Space direction="column">
            <Heading level={3}>{heading}</Heading>
            <Space direction="column" gap="medium">
              {body}
            </Space>
          </Space>
          {action}
        </SpaceBetween>
      </CardBody>
    </StyledCard>
  );
}

const StyledCard = styled(Card)`
  background-color: var(--surface-2);
`;
const SpaceBetween = styled(Space)`
  height: 100%;
  justify-content: space-between;
`;

export function FreePlan({ action }: { action: React.ReactNode }) {
  return (
    <Plan
      heading="Free"
      body={
        <>
          <Space direction="column">
            <p>$0 per year</p>
            <p>For hobby gardeners and evaluation</p>
          </Space>
          <Space direction="column">
            <p>
              All our <a href="#features"> standard features</a>
            </p>
            <p>Limit 100 daylily listings</p>
          </Space>
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
          <Space direction="column">
            <p>$60 per year</p>
            <p>For serious gardeners and hybridizers</p>
          </Space>
          <Space direction="column">
            <p>
              All our <a href="#features"> standard features</a>
            </p>
            <p>Unlimited daylily listings</p>
            <p>Upload garden and daylily photos</p>
            <p>Website for your catalog</p>
          </Space>
        </>
      }
      action={action}
    />
  );
}
