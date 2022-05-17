import { Heading, Space } from "@app/design";
import React from "react";
import styled from "styled-components";

export function Features() {
  return (
    <Space direction="column" gap="large">
      <Space direction="column" gap="medium">
        <Heading level={2} id="features">
          Standard Features
        </Heading>
        <Space responsive>
          <Space direction="column" gap="medium">
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
          </Space>
          <Space direction="column" gap="medium">
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
          </Space>
        </Space>
      </Space>

      <Space direction="column" gap="medium">
        <Heading level={2}>Pro Features</Heading>
        <Space responsive>
          <Space direction="column" gap="medium">
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
          </Space>
          <Space direction="column" gap="medium">
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
          </Space>
        </Space>
      </Space>
    </Space>
  );
}

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
    <Space>
      <FeatureIcon>{icon}</FeatureIcon>
      <Space direction="column">
        <Heading level={3}>{title}</Heading>
        <p>{description}</p>
      </Space>
    </Space>
  );
};

const FeatureIcon = styled.span`
  width: var(--size-24);
  font-size: 2rem;
  display: block;
  text-align: center;
`;
