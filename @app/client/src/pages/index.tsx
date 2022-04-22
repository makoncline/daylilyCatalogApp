import { SharedLayout } from "@app/components";
import { below, Button, Heading, Hr, Space } from "@app/design";
import { useSharedQuery } from "@app/graphql";
import { catalogUrl, pricingUrl } from "@app/lib";
import { NextPage } from "next";
import * as React from "react";
import styled from "styled-components";

const Home: NextPage = () => {
  const query = useSharedQuery();
  return (
    <SharedLayout title="Daylily Catalog" query={query}>
      <div>
        <Space direction="column" gap="large">
          <Heading level={1} data-cy="homepage-header">
            Welcome to the Daylily Catalog
          </Heading>
          <p>
            Made for daylily gardeners and hybridizers, this simple but
            feature-packed app will help you feel comfortable organizing,
            sharing, and selling your daylilies online.
          </p>
          <div className="cta-button-container">
            <Space gap="large">
              <Button href={catalogUrl} data-cy="get-started-for-free">
                Get started for free
              </Button>
              <Button href={pricingUrl} data-cy="pricing">
                Pricing
              </Button>
            </Space>
          </div>
        </Space>
      </div>

      <Space direction="column" gap="large">
        <Heading level={2} id="features">
          Standard Features
        </Heading>
        <Features>
          <Feature
            title="Daylily Listings"
            icon="🌼"
            description="Information about your daylilies. Add a name
                        description, price, and private notes for each daylily."
          />
          <Feature
            title="Photos and data"
            icon="📸"
            description="Select a daylily from our database of 90,000+ registered
                  cultivars. Photo and data added automatically, if
                  available."
          />
          <Feature
            title="Catalog lists"
            icon="📗"
            description="Organize your daylily collection into lists. Make a list
                  for favorite daylilies, seedlings, or a section of your
                  garden."
          />
          <Feature
            title="Garden info"
            icon="🏡"
            description="Tell your story, announce a special sale, link to your
                  social media pages. Name, location, garden description,
                  and email are standard, but you can add anything you
                  want!"
          />
        </Features>
      </Space>

      <Space direction="column">
        <Heading level={2} id="features">
          Pro Features
        </Heading>
        <Features>
          <Feature
            title="Unlimited daylily listings"
            icon="✨"
            description="The free plan has a limit of 100 daylily listings. The
                  pro plan removes this limit and allows you to upload as
                  many daylilies as you like."
          />

          <Feature
            title="Photo uploads"
            icon="🖼️"
            description="Upload photos of your garden and daylilies. You can
                  upload four photos of each daylily. Take and upload
                  photos from your smart phone while in the garden, or
                  click and drag to upload from your computer."
          />

          <Feature
            title="Public website for your catalog"
            icon="👋"
            description="Share your catalog with customers, friends, and family.
                  Your public site is updated every night."
          />

          <Feature
            title="Unlimited lists"
            icon="📝"
            description="Lists allow you to organize your daylily catalog. The
                  pro plan lets you add as many lists as you like."
          />
        </Features>
      </Space>
      <div>
        <Space direction="column" gap="large">
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
      </div>
      <div>
        <Hr />
        <Space direction="column" gap="small">
          <Heading level={3}>Daylily Catalog relies on your support</Heading>
          <p>
            <strong>A message from Makon</strong>
          </p>
          <p>
            I really hope that this site wows you 😍 and saves you huge amounts
            of time. I've certainly poured a lot of time into it!
          </p>
          <p>
            Without support from the community I could not keep building and
            advancing the site. Please join the amazing members of Daylily
            Catalog.
          </p>
          <p>Every member helps me spend more time working on the site.</p>
          <Button
            type="primary"
            href={`${process.env.ROOT_URL}/pricing`}
            data-cy="become-a-member"
          >
            Become a Daylily Catalog Member
          </Button>
          <p>Thank you! 🙏</p>
        </Space>
      </div>
    </SharedLayout>
  );
};

export default Home;

const Feature = ({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) => {
  return (
    <FeatureWrapper>
      <FeatureIcon>{icon}</FeatureIcon>
      <div>
        <Heading level={3}>{title}</Heading>
        <p>{description}</p>
      </div>
    </FeatureWrapper>
  );
};

const FeatureWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
`;
const FeatureIcon = styled.span`
  width: var(--size-24);

  font-size: 2rem;
  display: block;
  text-align: center;
`;

const Features = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--size-4);
  ${below.md`
    grid-template-columns: 1fr;
  `}
`;
