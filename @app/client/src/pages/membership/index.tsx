import {
  BillingPortalButton,
  CheckoutButton,
  ErrorAlert,
  Redirect,
  SEO,
  SharedLayout,
} from "@app/components";
import { Button, Heading, Hr, Space } from "@app/design";
import { SharedLayout_UserFragment, useMembershipQuery } from "@app/graphql";
import { emailsUrl, loginUrl } from "@app/lib";
import { NextPage } from "next";
import React from "react";

import { Features, FreePlan, ProPlan } from "../../components";

const Membership: NextPage = () => {
  const query = useMembershipQuery();
  const { data, loading, error } = query;
  const user = data && data.currentUser;
  const pageContent = (() => {
    if (loading) {
      return "Loading";
    }
    if (error) {
      return <ErrorAlert error={error} />;
    }
    if (!user) {
      return (
        <Redirect
          href={`${loginUrl}?next=${encodeURIComponent("/membership")}`}
        />
      );
    }
    return <Plans user={user} />;
  })();
  return (
    <SharedLayout title="Membership" query={query}>
      <SEO
        title="Membership"
        description="Become a Daylily Catalog Pro and unlock unlimited number of listings and lists, and upload your own photos."
        noRobots
      />
      {pageContent}
    </SharedLayout>
  );
};

export default Membership;

const Plans = ({ user }: { user: SharedLayout_UserFragment }) => {
  const isVerified = user.isVerified;
  const isSubscriptionActive =
    user.stripeSubscription?.subscriptionInfo?.status == "active";
  return (
    <Space direction="column" center gap="large">
      {isSubscriptionActive ? (
        <>
          <Heading level={2}>You are a pro Daylily Catalog member </Heading>
          <BillingPortalButton />
        </>
      ) : (
        <>
          <Heading level={2}>Pick a plan to start your Daylily Catalog</Heading>
          <Space responsive>
            <FreePlan
              action={
                <Button block disabled>
                  This is your current plan
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
                        <Button
                          block
                          href={emailsUrl}
                          data-cy="view-email-settings"
                        >
                          View email settings
                        </Button>
                      </Space>
                    </div>
                  ) : (
                    <CheckoutButton />
                  )}
                </>
              }
            />
          </Space>
        </>
      )}
      <Hr />
      <Features />
    </Space>
  );
};
