import { SharedLayout } from "@app/components";
import { useSharedQuery } from "@app/graphql";
import { Button, Card, Col, Divider, Row, Space, Typography } from "antd";
const { Title, Text } = Typography;
import React from "react";
import styled from "styled-components";

const Style = styled.div`
  .container {
    width: var(--container-width);
    max-width: calc(100% - var(--spacing-lg));
    padding: var(--spacing-lg) 0;
    margin: auto;
  }
  h1,
  h2 {
    text-align: center;
    margin-bottom: var(--spacing-lg);
  }
`;

const PricingCard = styled(Card)`
  width: 100%;
  font-size: 1.2rem;
  button {
    height: 60px;
  }
  .free {
    &.ant-typography {
      color: var(--free-plan-color);
    }
    &.ant-btn-primary {
      background: var(--free-plan-color);
      border-color: var(--free-plan-color);
    }
  }
  .pro {
    &.ant-typography {
      color: var(--pro-plan-color);
    }
    &.ant-btn-primary {
      background: var(--pro-plan-color);
      border-color: var(--pro-plan-color);
    }
  }
  .custom {
    &.ant-typography {
      color: var(--custom-plan-color);
    }
    &.ant-btn-primary {
      background: var(--custom-plan-color);
      border-color: var(--custom-plan-color);
    }
  }
  .title_container {
    display: flex;
    flex-direction: column;
    align-items: center;
    h3 {
      font-size: 2rem;
    }
    span {
      font-size: 1.5rem;
      font-weight: normal;
      text-align: center;
      white-space: normal;
    }
  }
  .detail_container {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    span {
      width: 100%;
      padding: var(--spacing-sm) 0;
    }
    span:first-child {
      padding: 0 0 var(--spacing-sm);
    }
    span:last-child {
      padding: var(--spacing-sm) 0 0;
    }
    span:not(:last-child) {
      border-bottom: 1px solid var(--border-color-main);
    }
  }
`;

const PricingStyle = styled.div`
  .ant-col {
    display: flex;
    justify-content: center;
  }
`;

const FeatureStyle = styled.div`
  .icon {
    font-size: 2rem;
    display: block;
    margin: auto;
    text-align: center;
  }
`;
const Pricing = () => {
  const query = useSharedQuery();
  return (
    <SharedLayout title="Pricing" query={query}>
      <Style>
        <div className="container">
          <Space direction="vertical">
            <Title level={2}>
              Pick a plan to start your Daylily Catalog today
            </Title>
            <PricingStyle>
              <Row justify="start" align="top" gutter={[36, 36]}>
                <Col xs={24} md={12}>
                  <PricingCard
                    title={
                      <div className="title_container">
                        <Title level={3} className="free">
                          Free
                        </Title>
                        <Text className="free">$0 per month</Text>
                        <Text type="secondary">
                          For hobby gardeners and evaluation
                        </Text>
                      </div>
                    }
                    actions={[
                      <Button
                        key="start_for_free"
                        block
                        type="primary"
                        className="free"
                      >
                        Start for free
                      </Button>,
                    ]}
                  >
                    <div className="detail_container">
                      <Text>
                        All our <a href="#features"> standard features</a>
                      </Text>
                      <Text>100 daylily listings</Text>
                    </div>
                  </PricingCard>
                </Col>
                <Col xs={24} md={12}>
                  <PricingCard
                    title={
                      <div className="title_container">
                        <Title level={3} className="pro">
                          Pro
                        </Title>
                        <Text className="pro">From $10 per month</Text>
                        <Text type="secondary">
                          For gardeners selling daylilies
                        </Text>
                      </div>
                    }
                    actions={[
                      <Button
                        key="get_started"
                        block
                        type="primary"
                        className="pro"
                      >
                        Get started
                      </Button>,
                    ]}
                  >
                    <div className="detail_container">
                      <Text>
                        All our <a href="#features"> standard features</a>
                      </Text>
                      <Text>Unlimited daylily listings</Text>
                      <Text>Upload your own photos</Text>
                      <Text>Website to share catalog</Text>
                      <Text>Download data as spreadsheet</Text>
                    </div>
                  </PricingCard>
                </Col>
              </Row>
            </PricingStyle>
            <Divider />
            <FeatureStyle>
              <Space direction="vertical">
                <Title level={2} id="features">
                  Daylily Catalog Standard Features
                </Title>
                <Row gutter={[16, 16]}>
                  <Col sm={12}>
                    <div>
                      <Row gutter={16}>
                        <Col span={4}>
                          <span className="icon">🌼</span>
                        </Col>
                        <Col span={20}>
                          <Title level={3}>Daylily listings</Title>
                          <Text>
                            Information about your daylilies. Add a name
                            description, price, and private notes for each
                            daylily.
                          </Text>
                        </Col>
                      </Row>
                    </div>
                  </Col>
                  <Col sm={12}>
                    <div>
                      <Row gutter={16}>
                        <Col span={4}>
                          <span className="icon">📸</span>
                        </Col>
                        <Col span={20}>
                          <Title level={3}>Photos and data</Title>
                          <Text>
                            Select a daylily from our database of 90,000+
                            registered cultivars. Photo and data added
                            automatically, if available.
                          </Text>
                        </Col>
                      </Row>
                    </div>
                  </Col>
                  <Col sm={12}>
                    <div>
                      <Row gutter={16}>
                        <Col span={4}>
                          <span className="icon">📗</span>
                        </Col>
                        <Col span={20}>
                          <Title level={3}>Catalog lists</Title>
                          <Text>
                            Organize your daylily collection into lists. Make a
                            list for favorite daylilies, seedlings, or a section
                            of your garden.
                          </Text>
                        </Col>
                      </Row>
                    </div>
                  </Col>
                  <Col sm={12}>
                    <div>
                      <Row gutter={16}>
                        <Col span={4}>
                          <span className="icon">🏡</span>
                        </Col>
                        <Col span={20}>
                          <Title level={3}>Garden info</Title>
                          <Text>
                            Tell your story, announce a special sale, link to
                            your social media pages. Name, location, garden
                            description, and email are standard, but you can add
                            anything you want!
                          </Text>
                        </Col>
                      </Row>
                    </div>
                  </Col>
                </Row>
              </Space>
            </FeatureStyle>
          </Space>
        </div>
      </Style>
    </SharedLayout>
  );
};

export default Pricing;
