import {
  BillingPortalButton,
  CheckoutButton,
  Col,
  ErrorAlert,
  Redirect,
  Row,
  SharedLayout,
} from "@app/components";
import { useMembershipQuery } from "@app/graphql";
import { Button, Card, Space, Typography } from "antd";
import { NextPage } from "next";
import React from "react";
import styled from "styled-components";

const { Title, Text } = Typography;

const Membership: NextPage = () => {
  const query = useMembershipQuery();
  const { data, loading, error } = query;
  const isVerified = !!data?.currentUser?.isVerified;
  const isSubscriptionActive =
    data?.currentUser?.stripeSubscription?.subscriptionInfo?.status == "active";
  return (
    <SharedLayout title="Membership" query={query}>
      {data && data.currentUser ? (
        <Plans active={isSubscriptionActive} isVerified={isVerified} />
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

const Style = styled.div`
  .container {
    width: var(--max-width);
    max-width: calc(100% - var(--spacing-lg));
    padding: var(--spacing-lg) 0;
    margin: auto;
  }
  .ant-space {
    width: 100%;
  }
  button {
    height: var(--spacing-lg);
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
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .free {
      &.ant-typography {
        color: var(--free-plan-color);
      }
      &.ant-btn {
        color: var(--free-plan-color);
        background: var(--white);
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
  .over-limit {
    margin: var(--spacing-sm) auto var(--spacing-lg);
    max-width: 400px;
    border: var(--hairline);
    padding: var(--spacing-sm);
    .ant-btn {
      height: var(--spacing-lg);
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
`;

const Plans = ({
  active,
  isVerified,
}: {
  active: boolean;
  isVerified: boolean;
}) => {
  return (
    <Style>
      {active && (
        <div className="container">
          <Space direction="vertical">
            <div className="membership-title">
              <Title level={2}>You are a pro Daylily Catalog member </Title>
            </div>
            <BillingPortalButton />
          </Space>
        </div>
      )}
      {!active && (
        <div className="container">
          <Space direction="vertical">
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
                        className="free price-button"
                        disabled
                      >
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
                        <Text className="pro">$60 per year</Text>
                        <Text type="secondary">
                          For serious gardeners and hybridizers
                        </Text>
                      </div>
                    }
                    actions={[
                      !isVerified ? (
                        <div className="over-limit">
                          <Space direction="vertical">
                            <Text>
                              You must verify your email address to purchase a
                              membership. A verification link has been sent to
                              your email address. Please click the link in that
                              email to continue.
                            </Text>
                            <Button
                              type="primary"
                              href={`${process.env.ROOT_URL}/settings/emails`}
                              data-cy="view-email-settings"
                            >
                              View email settings
                            </Button>
                          </Space>
                        </div>
                      ) : active ? (
                        <Button
                          key="purchase_membership"
                          block
                          type="primary"
                          className="pro price-button"
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
                      <Text>All our standard features</Text>
                      <Text>Unlimited daylily listings</Text>
                      <Text>Upload garden and daylily photos</Text>
                      <Text>Website for your catalog</Text>
                    </div>
                  </Card>
                </Col>
              </Row>
            </div>
          </Space>
        </div>
      )}
    </Style>
  );
};
