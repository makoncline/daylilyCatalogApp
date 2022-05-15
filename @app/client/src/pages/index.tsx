import { SharedLayout } from "@app/components";
import { Button, Heading, Hr, Space } from "@app/design";
import { useSharedQuery } from "@app/graphql";
import { catalogUrl, pricingUrl } from "@app/lib";
import { NextPage } from "next";
import * as React from "react";

import { Features } from "../components";

const Home: NextPage = () => {
  const query = useSharedQuery();
  return (
    <SharedLayout query={query}>
      <Space direction="column" gap="large" center>
        <Space direction="column" gap="large">
          <Heading level={1} data-cy="homepage-header">
            Welcome to the Daylily Catalog
          </Heading>
          <p>
            Made for daylily gardeners and hybridizers, this simple but
            feature-packed app will help you feel comfortable organizing,
            sharing, and selling your daylilies online.
          </p>
          <Space>
            <Button
              href={catalogUrl}
              data-cy="get-started-for-free"
              styleType="primary"
            >
              Get started for free
            </Button>
            <Button href={pricingUrl} data-cy="pricing">
              Pricing
            </Button>
          </Space>
        </Space>
        <Features />
        <Hr />
        <Space responsive gap="large">
          <Space direction="column">
            <Heading level={2}>Questions? Need help?</Heading>
            <p>
              Email me at{" "}
              <a href="mailto:makon@daylilycatalog.com">
                makon@daylilycatalog.com
              </a>{" "}
              or send a text or give me a call at{" "}
              <a href="tel:513-970-1185">513-970-1185</a> and I'll be happy to
              help. I'll get back to you as soon as I can.
            </p>
          </Space>
          <Space direction="column">
            <Heading level={2}>Daylily Catalog relies on your support</Heading>
            <p>
              <strong>A message from Makon</strong>
            </p>
            <p>
              I really hope that this site wows you 😍 and saves you huge
              amounts of time. I've certainly poured a lot of time into it!
            </p>
            <p>
              Without support from the community I could not keep building and
              advancing the site. Please join the amazing members of Daylily
              Catalog.
            </p>
            <p>Every member helps me spend more time working on the site.</p>
            <Button
              styleType="primary"
              href={`${process.env.ROOT_URL}/pricing`}
              data-cy="become-a-member"
            >
              Become a Daylily Catalog Member
            </Button>
            <p>Thank you! 🙏</p>
          </Space>
        </Space>
      </Space>
    </SharedLayout>
  );
};

export default Home;
