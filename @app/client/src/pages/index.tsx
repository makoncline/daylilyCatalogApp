import { Button, Col, Row, Space, Typography } from "antd";
import * as React from "react";
const { Title, Paragraph } = Typography;
import { SharedLayout } from "@app/components";
import { useSharedQuery } from "@app/graphql";
import { NextPage } from "next";
import styled from "styled-components";

// Convenience helper
const Li = ({ children, ...props }: any) => (
  <li {...props}>
    <Typography>{children}</Typography>
  </li>
);

const Home: NextPage = () => {
  const query = useSharedQuery();
  return (
    <SharedLayout title="Daylily Catalog" query={query}>
      <Style>
        <Row justify="space-between" gutter={32}>
          <Col xs={24} sm={16}>
            <Title data-cy="homepage-header">
              Welcome to the Daylily Catalog
            </Title>
            <Paragraph>
              Made for daylily gardeners, this simple but feature-packed app
              will help you feel comfortable building a website to sell your
              daylilies.
            </Paragraph>
            <div className="cta-button-container">
              <Space>
                <Button
                  type="primary"
                  block
                  href={`${process.env.ROOT_URL}/register`}
                >
                  Get started for free
                </Button>
                <Button block href={`${process.env.ROOT_URL}/pricing`}>
                  Pricing
                </Button>
              </Space>
            </div>

            <Title level={4}>
              Friendly websites with shortcuts for daylily gardeners.
            </Title>
            <Paragraph>
              Website builders assume you're a tech guru and expert designer.
              What if you just want a simple website to show off your beautiful
              garden and sell your daylilies online? Daylily Catalog will take
              care of all of the details and give you shortcuts so you can
              immediatly have a great looking website for your garden.
            </Paragraph>

            <Title level={4}>Features include</Title>
            <ol>
              <Li>
                <strong>Unlimited</strong> daylily listings
              </Li>
              <Li>
                <strong>Automatic</strong> photos and data for registered
                daylilies
              </Li>
              <Li>
                <strong>Photo uploads</strong> from your garden, with a
                smart-phone camera, or from your computer with drag and drop
              </Li>
              <Li>
                <strong>Multiple catalogs</strong> help organize your listings
              </Li>
              <Li>
                <strong>Garden information</strong> page with photo slideshow
              </Li>
              <Li>
                <strong>Import your list</strong> from any spreadsheet for a
                small fee. Email me for details.
              </Li>
              <Li>
                <strong>Export your list</strong>, with photo links and data, to
                a spreadsheet at any time
              </Li>
              <Li>
                <strong>Everything you need</strong> to start selling your
                daylilies online
              </Li>
            </ol>

            <Title level={3}>What you get</Title>
            <Title level={4}>Daylily listings</Title>
            <Paragraph>
              Start typing the name of a daylily and a list of registered
              daylilies will be shown for you to select from. If a registered
              daylily is selected, a photo and AHS data will automatically be
              added to your listing. Or, manually add a daylily name. You can
              add a description, price, notes, and up to 8 photos for each
              daylily listing.
              <br />
              <a
                href="https://daylilycatalog.com/example/seedlings-2020/"
                target="_blank"
                rel="noreferrer"
              >
                See example daylily listings
              </a>
            </Paragraph>

            <Title level={4}>Garden information</Title>
            <Paragraph>
              Share important information and updates with your customers. Name,
              email, location, logo, photos, and garden description are
              standard, but you can add anything you want! Tell your story,
              announce a special sale, link to your social media pages...
              <br />
              <a
                href="https://daylilycatalog.com/example/"
                target="_blank"
                rel="noreferrer"
              >
                See example garden information
              </a>
            </Paragraph>

            <Title level={4}>Catalogs</Title>
            <Paragraph>
              All of your daylily listings are displayed in a single list by
              default, but you can also make your own catalogs. Make a catalog
              of your favorites, this years new seedlings, new arrivals, or
              daylilies for a special sale.
            </Paragraph>

            <Title level={4}>Daily updates</Title>
            <Paragraph>
              Your public daylily catalog is updated once a day. Make changes to
              your listings, catalogs, or garden information at any time and
              your website will be updated in the morning. Your private daylily
              catalog is always up to date!
            </Paragraph>

            <Title level={4}>Questions? Need help?</Title>
            <Paragraph>
              Email me at{" "}
              <a href="mailto:makon@daylilycatalog.com">
                makon@daylilycatalog.com
              </a>{" "}
              or send a text or give me a call at{" "}
              <a href="tel:513-970-1185">513-970-1185</a> and I'll be happy to
              help. I'll get back to you as soon as I can.
            </Paragraph>
          </Col>
          <Col xs={24} sm={8}>
            <Title level={4}>Daylily Catalog relies on your support</Title>
            <Paragraph strong>A message from Makon</Paragraph>
            <Paragraph>
              I really hope that this site wows you 😍 and saves you huge
              amounts of time. I've certainly poured a lot of time into it!
            </Paragraph>
            <Paragraph>
              Without support from the community I could not keep building and
              advancing the site. Please join the amazing members of Daylily
              Catalog.
            </Paragraph>
            <Paragraph>
              Every member helps me spend more time working on the site.
            </Paragraph>
            <Paragraph>
              <Button
                type="primary"
                block
                href={`${process.env.ROOT_URL}/pricing`}
              >
                Become a Daylily Catalog Member
              </Button>
            </Paragraph>
            <Paragraph>Thank you! 🙏</Paragraph>
          </Col>
        </Row>
      </Style>
    </SharedLayout>
  );
};

export default Home;

const Style = styled.div`
  .cta-button-container {
    padding: var(--spacing-md) 0 var(--spacing-xl);
    .ant-btn {
      height: var(--spacing-xl);
      display: flex;
      align-items: center;
    }
  }
`;
