import { Alert, Button, Field, Form, Space, useForm } from "@app/design";
import { useLiliesQuery } from "@app/graphql";
import { toCreateListingUrl } from "@app/lib";
import React from "react";
import styled from "styled-components";

import { LiliesTable } from "./";

export const Lilies = () => {
  const filterFormName = "list-filter";
  const { values } = useForm(filterFormName);
  const nameFilter = values && values.filter;

  const { data } = useLiliesQuery();
  const user = data && data.currentUser;
  const userLilies = user && user.lilies.nodes;
  const filteredUserLilies =
    userLilies &&
    userLilies.filter((lily: any) => {
      if (!nameFilter) return;
      return lily.name.toLowerCase().includes(nameFilter.toLowerCase());
    });

  if (!user || !userLilies) return <p>Loading...</p>;

  const isActive =
    user.stripeSubscription?.subscriptionInfo?.status == "active";
  const isOverFreeLimit = userLilies.length >= 99;
  const isFree = user.freeUntil ? new Date() < new Date(user.freeUntil) : false;
  const isAddActive = isFree || isActive || !isOverFreeLimit;
  return (
    <Space direction="column" block center>
      {!isAddActive && (
        <Alert type="info">
          <Alert.Heading>Create listing disabled</Alert.Heading>
          <Alert.Body>
            <p>
              You have reached the free plan limit. You must have an active
              membership to add more daylilies.
            </p>
          </Alert.Body>
          <Alert.Actions>
            <Button
              href={`${process.env.ROOT_URL}/membership`}
              styleType="primary"
              block
            >
              Become a Daylily Catalog Member
            </Button>
          </Alert.Actions>
        </Alert>
      )}
      {isAddActive && (
        <Button href={`${process.env.ROOT_URL}${toCreateListingUrl()}`} block>
          Create listing
        </Button>
      )}
      <Form formId="list-filter" onSubmit={() => void 0}>
        <Field label={false} placeholder="Filter catalog by name...">
          Filter
        </Field>
      </Form>
      <LiliesTable
        dataSource={(nameFilter ? filteredUserLilies : userLilies) || []}
      />
    </Space>
  );
};
