import { ApolloError } from "@apollo/client";
import { LilyDataFragment, useLiliesQuery } from "@app/graphql";
import { Button, Input, Space, Typography } from "antd";
import React, { useState } from "react";
import styled from "styled-components";

const { Text } = Typography;

import { LiliesTable } from "./";

export const Lilies = () => {
  const [showAddLilyForm, setShowAddLilyForm] = useState(false);
  const [updateLily, setUpdateLily] = useState<LilyDataFragment | null>(null);
  const [formError, setFormError] = useState<Error | ApolloError | null>(null);
  const [nameFilter, setNameFilter]: [
    string,
    React.Dispatch<React.SetStateAction<string>>
  ] = useState("");

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

  function handleEdit(lily: any) {
    setUpdateLily(null);
    setUpdateLily(lily);
    setShowAddLilyForm(true);
  }
  const isActive =
    user.stripeSubscription?.subscriptionInfo?.status == "active";
  const isOverFreeLimit = userLilies.length >= 99;
  const isFree = user.freeUntil ? new Date() < new Date(user.freeUntil) : false;
  const isAddActive = isFree || isActive || !isOverFreeLimit;
  return (
    <Style>
      {!isAddActive && (
        <div className="over-limit">
          <Space direction="vertical">
            <Text>
              You have reached the free plan limit. You must have an active
              membership to add more daylilies.
            </Text>
            <Button type="primary" href={`${process.env.ROOT_URL}/membership`}>
              Become a Daylily Catalog Member
            </Button>
          </Space>
        </div>
      )}
      <Button
        type="primary"
        onClick={() => {
          setUpdateLily(null);
          setShowAddLilyForm(true);
        }}
        data-cy="settingslilies-button-addlily"
        block
        style={{
          marginLeft: "auto",
          marginBottom: "1rem",
          display: "block",
        }}
        disabled={!isAddActive}
      >
        Add daylily
      </Button>
      <p></p>
      <Input
        placeholder="Filter catalog by name..."
        value={nameFilter}
        onChange={(e) => setNameFilter(e.target.value)}
        style={{ marginBottom: "1rem" }}
        allowClear
      />
      <LiliesTable
        dataSource={nameFilter ? filteredUserLilies : userLilies}
        handleEdit={handleEdit}
        searchText={nameFilter}
      />
    </Style>
  );
};

const Style = styled.div`
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
