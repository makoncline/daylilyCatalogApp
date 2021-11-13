import { Button, Col, Divider, Row, Space, Typography } from "antd";
import * as React from "react";
const { Title, Paragraph, Text } = Typography;
import { SharedLayout } from "@app/components";
import { useSharedQuery } from "@app/graphql";
import { NextPage } from "next";
import styled from "styled-components";

const Home: NextPage = () => {
  const query = useSharedQuery();
  return (
    <SharedLayout title="Daylily Catalog" query={query}>
      <Style>
        <div>
          <Space direction="vertical" size="large">
            <Title level={1} data-cy="homepage-header">
              Welcome to the Daylily Catalog
            </Title>
            <Paragraph>
              Made for daylily gardeners and hybridizers, this simple but
              feature-packed app will help you feel comfortable organizing,
              sharing, and selling your daylilies online.
            </Paragraph>
            <div className="cta-button-container">
              <Space size="large">
                <Button
                  type="primary"
                  block
                  href={`${process.env.ROOT_URL}/catalog`}
                  data-cy="get-started-for-free"
                >
                  Get started for free
                </Button>
                <Button
                  block
                  href={`${process.env.ROOT_URL}/pricing`}
                  data-cy="pricing"
                >
                  Pricing
                </Button>
              </Space>
            </div>
          </Space>
        </div>

        <Features>
          <Space direction="vertical" size="large">
            <Title level={2} id="features">
              Standard Features
            </Title>
            <Row gutter={[24, 24]}>
              <Col md={12}>
                <div>
                  <Row gutter={24}>
                    <Col span={4}>
                      <span className="icon">🌼</span>
                    </Col>
                    <Col span={20}>
                      <Title level={3}>Daylily listings</Title>
                      <Text>
                        Information about your daylilies. Add a name
                        description, price, and private notes for each daylily.
                      </Text>
                    </Col>
                  </Row>
                </div>
              </Col>
              <Col md={12}>
                <div>
                  <Row gutter={24}>
                    <Col span={4}>
                      <span className="icon">📸</span>
                    </Col>
                    <Col span={20}>
                      <Title level={3}>Photos and data</Title>
                      <Text>
                        Select a daylily from our database of 90,000+ registered
                        cultivars. Photo and data added automatically, if
                        available.
                      </Text>
                    </Col>
                  </Row>
                </div>
              </Col>
              <Col md={12}>
                <div>
                  <Row gutter={24}>
                    <Col span={4}>
                      <span className="icon">📗</span>
                    </Col>
                    <Col span={20}>
                      <Title level={3}>Catalog lists</Title>
                      <Text>
                        Organize your daylily collection into lists. Make a list
                        for favorite daylilies, seedlings, or a section of your
                        garden.
                      </Text>
                    </Col>
                  </Row>
                </div>
              </Col>
              <Col md={12}>
                <div>
                  <Row gutter={24}>
                    <Col span={4}>
                      <span className="icon">🏡</span>
                    </Col>
                    <Col span={20}>
                      <Title level={3}>Garden info</Title>
                      <Text>
                        Tell your story, announce a special sale, link to your
                        social media pages. Name, location, garden description,
                        and email are standard, but you can add anything you
                        want!
                      </Text>
                    </Col>
                  </Row>
                </div>
              </Col>
            </Row>
          </Space>
        </Features>

        <Features>
          <Space direction="vertical">
            <Title level={2} id="features">
              Pro Features
            </Title>
            <Row gutter={[24, 24]}>
              <Col md={12}>
                <div>
                  <Row gutter={24}>
                    <Col span={4}>
                      <span className="icon">✨</span>
                    </Col>
                    <Col span={20}>
                      <Title level={3}>Unlimited daylily listings</Title>
                      <Text>
                        The free plan has a limit of 100 daylily listings. The
                        pro plan removes this limit and allows you to upload as
                        many daylilies as you like.
                      </Text>
                    </Col>
                  </Row>
                </div>
              </Col>
              <Col md={12}>
                <div>
                  <Row gutter={24}>
                    <Col span={4}>
                      <span className="icon">🖼️</span>
                    </Col>
                    <Col span={20}>
                      <Title level={3}>Photo uploads</Title>
                      <Text>
                        Upload photos of your garden and daylilies. You can
                        upload four photos of each daylily. Take and upload
                        photos from your smart phone while in the garden, or
                        click and drag to upload from your computer.
                      </Text>
                    </Col>
                  </Row>
                </div>
              </Col>
              <Col md={12}>
                <div>
                  <Row gutter={24}>
                    <Col span={4}>
                      <span className="icon">👋</span>
                    </Col>
                    <Col span={20}>
                      <Title level={3}>Public website for your catalog</Title>
                      <Text>
                        Share your catalog with customers, friends, and family.
                        Your public site is updated every night.
                      </Text>
                    </Col>
                  </Row>
                </div>
              </Col>
              <Col md={12}>
                <div>
                  <Row gutter={24}>
                    <Col span={4}>
                      <span className="icon">📝</span>
                    </Col>
                    <Col span={20}>
                      <Title level={3}>Unlimited lists</Title>
                      <Text>
                        Lists allow you to organize your daylily catalog. The
                        pro plan lets you add as many lists as you like.
                      </Text>
                    </Col>
                  </Row>
                </div>
              </Col>
            </Row>
          </Space>
        </Features>
        <div>
          <Space direction="vertical" size="large">
            <Title level={2}>Questions? Need help?</Title>
            <Paragraph>
              Email me at{" "}
              <a href="mailto:makon@daylilycatalog.com">
                makon@daylilycatalog.com
              </a>{" "}
              or send a text or give me a call at{" "}
              <a href="tel:513-970-1185">513-970-1185</a> and I'll be happy to
              help. I'll get back to you as soon as I can.
            </Paragraph>
          </Space>
        </div>
        <div>
          <Divider />
          <Space direction="vertical" size="small">
            <Title level={3}>Daylily Catalog relies on your support</Title>
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
                data-cy="become-a-member"
              >
                Become a Daylily Catalog Member
              </Button>
            </Paragraph>
            <Paragraph>Thank you! 🙏</Paragraph>
          </Space>
        </div>
      </Style>
    </SharedLayout>
  );
};

export default Home;

const Style = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 60rem;
  margin: auto;
  &:first-child {
    margin-top: var(--spacing-lg);
  }
  & > * {
    margin-bottom: var(--spacing-lg);
  }
  .ant-btn {
    height: var(--spacing-lg);
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const Features = styled.div`
  .icon {
    font-size: 2rem;
    display: block;
    margin: auto;
    text-align: center;
  }
`;
