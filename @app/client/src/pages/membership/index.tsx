import {
  CheckoutButton,
  Col,
  ErrorAlert,
  Redirect,
  Row,
  SharedLayout,
} from "@app/components";
import { useMembershipQuery } from "@app/graphql";
import { Button, Card, Typography } from "antd";
import { NextPage } from "next";
import React from "react";
import styled from "styled-components";

const { Title, Text } = Typography;

const Membership: NextPage = () => {
  const query = useMembershipQuery();
  const { data, loading, error } = query;
  const isSubscriptionActive =
    data?.currentUser?.stripeSubscription?.subscriptionInfo?.status == "active";
  return (
    <SharedLayout title="Membership" query={query}>
      {data && data.currentUser ? (
        <Plans active={isSubscriptionActive} />
      ) : loading ? (
        "Loading..."
      ) : error ? (
        <ErrorAlert error={error} />
      ) : (
        <Redirect href={`/login?next=${encodeURIComponent("/membership")}`} />
      )}
    </SharedLayout>
  );
};

export default Membership;

const Plans = ({ active }: { active: boolean }) => {
  return (
    <Style>
      <Row justify="start" align="top" gutter={[36, 36]}>
        <Col xs={24} md={12}>
          <Card
            className="pricing-card"
            title={
              <div className="title_container">
                <Title level={3} className="free">
                  Free
                </Title>
                <Text className="free">$0 per month</Text>
              </div>
            }
            actions={[
              <Button key="start_for_free" block className="free" disabled>
                {active
                  ? "Included in your current plan"
                  : "This is your current plan"}
              </Button>,
            ]}
          >
            <div className="detail_container">
              <Text>Get started easily</Text>
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
                <Text className="pro">From $10 per month</Text>
                <Text type="secondary">For gardeners selling daylilies</Text>
              </div>
            }
            actions={[
              active ? (
                <Button
                  key="purchase_membership"
                  block
                  className="pro"
                  disabled
                >
                  This is your current plan
                </Button>
              ) : (
                <CheckoutButton />
              ),
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
          </Card>
        </Col>
      </Row>
    </Style>
  );
};

const Style = styled(Card)`
  .pricing-card {
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
  }
`;
