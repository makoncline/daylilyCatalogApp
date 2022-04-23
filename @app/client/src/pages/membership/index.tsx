import {
  BillingPortalButton,
  CheckoutButton,
  ErrorAlert,
  Redirect,
  SharedLayout,
} from "@app/components";
import { Button, Heading, Space } from "@app/design";
import { useMembershipQuery } from "@app/graphql";
import { emailsUrl, loginUrl } from "@app/lib";
import { NextPage } from "next";
import React from "react";

import { Features, FreePlan, ProPlan } from "../../components";

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
    <Space direction="column">
      {active && (
        <Space direction="column">
          <Heading level={2}>You are a pro Daylily Catalog member </Heading>
          <BillingPortalButton />
        </Space>
      )}
      {!active && (
        <Space direction="column" center>
          <Heading level={2}>Pick a plan to start your Daylily Catalog</Heading>
          <Space responsive>
            <FreePlan
              action={
                <Button disabled>
                  {active
                    ? "Included in your current plan"
                    : "This is your current plan"}
                </Button>
              }
            />
            <ProPlan
              action={
                <>
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
                </>
              }
            />
          </Space>
        </Space>
      )}
      <Features />
    </Space>
  );
};
