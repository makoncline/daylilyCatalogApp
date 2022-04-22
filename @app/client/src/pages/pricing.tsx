import { SharedLayout } from "@app/components";
import {
  below,
  Button,
  Card,
  CardBody,
  FormWrapper,
  Heading,
  Hr,
  Space,
} from "@app/design";
import { useSharedQuery } from "@app/graphql";
import React from "react";
import styled from "styled-components";

const Style = styled.div`
  .feature-style {
    .icon {
      font-size: 2rem;
      display: block;
      margin: auto;
      text-align: center;
    }
  }
`;

const Pricing = () => {
  const query = useSharedQuery();
  return (
    <SharedLayout title="Pricing" query={query}>
      <Style>
        <div className="container">
          <Space direction="column" gap="large">
            <div className="membership-title">
              <Heading level={2}>
                Pick a plan to start your Daylily Catalog
              </Heading>
            </div>
            <div className="pricing-style">
              <Space center gap="large" style={{ alignItems: "flex-start" }}>
                <Card className="pricing-card">
                  <CardBody>
                    <div className="title_container">
                      <Heading level={3} className="free">
                        Free
                      </Heading>
                      <p className="free">$0 per year</p>
                      <p>For hobby gardeners and evaluation</p>
                    </div>
                    <div className="detail_container">
                      <p>
                        All our <a href="#features"> standard features</a>
                      </p>
                      <p>Limit 100 daylily listings</p>
                    </div>
                    <Button
                      key="start_for_free"
                      block
                      type="primary"
                      className="free price-button"
                      href={`${process.env.ROOT_URL}/catalog`}
                      data-cy="free"
                    >
                      Start for free
                    </Button>
                  </CardBody>
                </Card>
                <Card className="pricing-card">
                  <CardBody>
                    <div className="title_container">
                      <Heading level={3} className="pro">
                        Pro
                      </Heading>
                      <p className="pro">$60 per year</p>
                      <p>For serious gardeners and hybridizers</p>
                    </div>
                    <div className="detail_container">
                      <p>
                        All our <a href="#features"> standard features</a>
                      </p>
                      <p>Unlimited daylily listings</p>
                      <p>Upload garden and daylily photos</p>
                      <p>Website for your catalog</p>
                    </div>
                    <Button
                      key="get_started"
                      block
                      type="primary"
                      className="pro price-button"
                      href={`${process.env.ROOT_URL}/membership`}
                      data-cy="get-membership"
                    >
                      Get started
                    </Button>
                  </CardBody>
                </Card>
              </Space>
            </div>
            <Hr />
            <div className="feature-style">
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
            </div>
          </Space>
        </div>
      </Style>
    </SharedLayout>
  );
};

export default Pricing;

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
