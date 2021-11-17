import { SharedLayout } from "@app/components";
import { useSharedQuery } from "@app/graphql";
import { Button, Card, Col, Divider, Row, Space, Typography } from "antd";
import React from "react";
import styled from "styled-components";

const { Title, Text } = Typography;

const Style = styled.div`
  .container {
    width: var(--max-width);
    max-width: calc(100% - var(--spacing-lg));
    padding: var(--spacing-lg) 0;
    margin: auto;
  }
  h1,
  h2 {
    text-align: center;
    margin-bottom: var(--spacing-lg);
  }
  .pricing-style {
    .ant-col {
      display: flex;
      justify-content: center;
    }
  }
  .pricing-card {
    width: 100%;
    .price-button {
      height: var(--spacing-lg);
      display: flex;
      justify-content: center;
      align-items: center;
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
      span {
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
  }
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
          <Space direction="vertical" size="large">
            <div className="membership-title">
              <Title level={2}>Pick a plan to start your Daylily Catalog</Title>
            </div>
            <div className="pricing-style">
              <Row justify="start" align="top" gutter={[36, 36]}>
                <Col xs={24} md={12}>
                  <Card
                    className="pricing-card"
                    title={
                      <div className="title_container">
                        <Title level={3} className="free">
                          Free
                        </Title>
                        <Text className="free">$0 per year</Text>
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
                        className="free price-button"
                        href={`${process.env.ROOT_URL}/catalog`}
                        data-cy="free"
                      >
                        Start for free
                      </Button>,
                    ]}
                  >
                    <div className="detail_container">
                      <Text>
                        All our <a href="#features"> standard features</a>
                      </Text>
                      <Text>Limit 100 daylily listings</Text>
                    </div>
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card
                    className="pricing-card"
                    title={
                      <div className="title_container">
                        <Title level={3} className="pro">
                          Pro
                        </Title>
                        <Text className="pro">$60 per year</Text>
                        <Text type="secondary">
                          For serious gardeners and hybridizers
                        </Text>
                      </div>
                    }
                    actions={[
                      <Button
                        key="get_started"
                        block
                        type="primary"
                        className="pro price-button"
                        href={`${process.env.ROOT_URL}/membership`}
                        data-cy="get-membership"
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
                      <Text>Upload garden and daylily photos</Text>
                      <Text>Website for your catalog</Text>
                    </div>
                  </Card>
                </Col>
              </Row>
            </div>
            <Divider />
            <div className="feature-style">
              <Space direction="vertical" size="large">
                <Title level={2} id="features">
                  Daylily Catalog Standard Features
                </Title>
                <Row gutter={[24, 24]}>
                  <Col sm={12}>
                    <div>
                      <Row gutter={24}>
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
                      <Row gutter={24}>
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
                      <Row gutter={24}>
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
                      <Row gutter={24}>
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
            </div>
          </Space>
        </div>
      </Style>
    </SharedLayout>
  );
};

export default Pricing;
