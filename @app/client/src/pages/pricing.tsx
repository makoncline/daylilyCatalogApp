import { SharedLayout } from "@app/components";
import { useSharedQuery } from "@app/graphql";
import { Button, Card, Col, Row, Typography } from "antd";
const { Title, Text } = Typography;
import React from "react";
import styled from "styled-components";

const PricingCard = styled(Card)`
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
    span {
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
      padding: 1rem 0;
    }
    span:first-child {
      padding: 0 0 1rem;
    }
    span:last-child {
      padding: 1rem 0 0;
    }
    span:not(:last-child) {
      border-bottom: 1px solid var(--border-color-main);
    }
  }
`;
const Pricing = () => {
  const query = useSharedQuery();
  return (
    <SharedLayout title="Daylily Catalog" query={query}>
      <Row justify="center" align="top" gutter={16}>
        <Col md={24} lg={8}>
          <PricingCard
            title={
              <div className="title_container">
                <Title level={3} className="free">
                  Free
                </Title>
                <Text className="free">$0 per month</Text>
                <Text type="secondary">For hobby gardeners and evaluation</Text>
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
              <Text>All our standard features</Text>
            </div>
          </PricingCard>
        </Col>
        <Col md={24} lg={8}>
          <PricingCard
            title={
              <div className="title_container">
                <Title level={3} className="pro">
                  Pro
                </Title>
                <Text className="pro">From $10 per month</Text>
                <Text type="secondary">For gardeners selling daylilies</Text>
              </div>
            }
            actions={[
              <Button key="get_started" block type="primary" className="pro">
                Get started
              </Button>,
            ]}
          >
            <div className="detail_container">
              <Text>Upload your own photos</Text>
              <Text>Public website for your catalog</Text>
              <Text>Download your cat\og</Text>
            </div>
          </PricingCard>
        </Col>
        <Col md={24} lg={8}>
          <PricingCard
            title={
              <div className="title_container">
                <Title level={3} className="custom">
                  Custom
                </Title>
                <Text type="secondary">Whatever you need: we're here</Text>
              </div>
            }
            actions={[
              <Button key="contact_us" block type="primary" className="custom">
                Contact us
              </Button>,
            ]}
          >
            <div className="detail_container">
              <Text>Custom websites</Text>
              <Text>Catalog import</Text>
              <Text>PDF catalog</Text>
            </div>
          </PricingCard>
        </Col>
      </Row>
    </SharedLayout>
  );
};

export default Pricing;
