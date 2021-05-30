import { ApolloError } from "@apollo/client";
import { LilyDataFragment, useLiliesQuery } from "@app/graphql";
import { Button, Input } from "antd";
import React, { useState } from "react";

import { AddLilyForm, LiliesTable } from "./";

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

  return (
    <>
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
      >
        Add daylily
      </Button>
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
      <AddLilyForm
        onComplete={() => setShowAddLilyForm(false)}
        error={formError}
        setError={setFormError}
        show={showAddLilyForm}
        setShow={setShowAddLilyForm}
        updateLily={updateLily}
        setUpdateLily={setUpdateLily}
        user={user}
      />
    </>
  );
};
