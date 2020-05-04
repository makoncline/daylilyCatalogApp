import React, { useState, SetStateAction, Dispatch } from "react";
import SharedLayout from "../layout/SharedLayout";
import { useLiliesQuery } from "@app/graphql";
import { Button, Input } from "antd";
import {
  ErrorAlert,
  Redirect,
  WrappedAddLilyForm,
  LiliesTable,
} from "@app/components";
import { ApolloError } from "apollo-client";
import { NextPage } from "next";

const Catalog: NextPage = () => {
  const { data, loading, error } = useLiliesQuery();
  const user = data && data.currentUser;
  const [showAddLilyForm, setShowAddLilyForm] = useState(false);
  const [updateLily, setUpdateLily] = useState(null);
  const [formError, setFormError] = useState<Error | ApolloError | null>(null);
  const [nameFilter, setNameFilter]: [
    string,
    Dispatch<SetStateAction<string>>
  ] = useState("");

  function handleEdit(lily: any) {
    setUpdateLily(null);
    setUpdateLily(lily);
    setShowAddLilyForm(true);
  }

  const pageContent = (() => {
    if (error && !loading) {
      return <ErrorAlert error={error} />;
    } else if (!user && !loading) {
      return <Redirect href={`/login?next=${encodeURIComponent("/")}`} />;
    } else if (!user) {
      return "Loading";
    } else {
      const userLilies = user.lilies.nodes;
      const filteredUserLilies = userLilies.filter((lily: any) => {
        if (!nameFilter) return;
        return lily.name.toLowerCase().includes(nameFilter.toLowerCase());
      });

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
            onChange={e => setNameFilter(e.target.value)}
            style={{ marginBottom: "1rem" }}
            allowClear
          />
          <LiliesTable
            dataSource={nameFilter ? filteredUserLilies : userLilies}
            handleEdit={handleEdit}
            searchText={nameFilter}
          />
          <WrappedAddLilyForm
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
    }
  })();
  return <SharedLayout title="Catalog">{pageContent}</SharedLayout>;
};

export default Catalog;
