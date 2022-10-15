import { SEO, SharedLayout } from "@app/components";
import { Button, Heading, Hr, Space } from "@app/design";
import { useSharedQuery } from "@app/graphql";
import React from "react";

import { Features, FreePlan, ProPlan } from "../components";

const Pricing = () => {
  const query = useSharedQuery();
  return (
    <SharedLayout title="Pricing" query={query}>
      <SEO
        title="Start growing your daylily catalog. If you can grow it, you can sell it with Daylily Catalog."
        description="Get started for free or become a Daylily Catalog Pro and unlock unlimited number of listings and lists, and upload your own photos."
      />
      <Space direction="column" gap="large" center>
        <Heading level={2}>Pick a plan to start your Daylily Catalog</Heading>
        <Space responsive>
          <FreePlan
            action={
              <Button
                styleType="primary"
                block
                href={`${process.env.ROOT_URL}/catalog`}
                data-cy="free"
              >
                Start for free
              </Button>
            }
          />
          <ProPlan
            action={
              <Button
                styleType="primary"
                block
                href={`${process.env.ROOT_URL}/membership`}
                data-cy="get-membership"
              >
                Get started
              </Button>
            }
          />
        </Space>
        <Hr />
        <Features />
      </Space>
    </SharedLayout>
  );
};

export default Pricing;
