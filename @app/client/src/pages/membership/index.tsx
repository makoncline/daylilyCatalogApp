import {
  BillingPortalButton,
  CheckoutButton,
  ErrorAlert,
  Redirect,
  SharedLayout,
} from "@app/components";
import { Button, Card, CardBody, Heading, Space } from "@app/design";
import { useMembershipQuery } from "@app/graphql";
import { emailsUrl } from "@app/lib";
import { NextPage } from "next";
import React from "react";
import styled from "styled-components";

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
        <Redirect
          href={`${loginUrl}?next=${encodeURIComponent("/membership")}`}
        />
      )}
    </SharedLayout>
  );
};

export default Membership;

const Plans = ({
  active,
  isVerified,
}: {
  active: boolean;
  isVerified: boolean;
}) => {
  return (
    <Wrapper>
      {active && (
        <Space direction="column">
          <Heading level={2}>You are a pro Daylily Catalog member </Heading>
          <BillingPortalButton />
        </Space>
      )}
      {!active && (
        <Space direction="column" center>
          <Heading level={2}>Pick a plan to start your Daylily Catalog</Heading>
          <Space direction="row">
            <Card>
              <CardBody>
                <Heading level={3}>Free</Heading>
                <p>$0 per year</p>
                <p>For hobby gardeners and evaluation</p>
                <p>Get started easily</p>
                <p>Limit 100 daylily listings</p>
                <Button disabled>
                  {active
                    ? "Included in your current plan"
                    : "This is your current plan"}
                </Button>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <Heading level={3}>Pro</Heading>
                <p>$60 per year</p>
                <p>For serious gardeners and hybridizers</p>
                <p>All our standard features</p>
                <p>Unlimited daylily listings</p>
                <p>Upload garden and daylily photos</p>
                <p>Website for your catalog</p>
                {!isVerified ? (
                  <div>
                    <Space direction="column">
                      <p>
                        You must verify your email address to purchase a
                        membership. A verification link has been sent to your
                        email address. Please click the link in that email to
                        continue.
                      </p>
                      <Button href={emailsUrl} data-cy="view-email-settings">
                        View email settings
                      </Button>
                    </Space>
                  </div>
                ) : active ? (
                  <Button disabled>This is your current plan</Button>
                ) : (
                  <CheckoutButton />
                )}
              </CardBody>
            </Card>
          </Space>
        </Space>
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  justify-content: center;
`;
const PlansWrapper = styled.div``;
const PlanWrapper = styled.div``;
