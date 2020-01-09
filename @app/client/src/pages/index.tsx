import React, { useState } from "react";
import SharedLayout from "../components/SharedLayout";
import { useLiliesQuery } from "@app/graphql";
import { Button, Input } from "antd";
import Error from "../components/ErrorAlert";
import Redirect from "../components/Redirect";
import { ApolloError } from "apollo-client";
import AddLilyForm from "../components/AddLilyForm";
import LiliesTable from "../components/LiliesTable";

export default function Catalog() {
  const { data, loading, error } = useLiliesQuery();
  const user = data && data.currentUser;
  const [showAddLilyForm, setShowAddLilyForm] = useState(false);
  const [updateLily, setUpdateLily] = useState(null);
  const [formError, setFormError] = useState<Error | ApolloError | null>(null);
  const [nameFilter, setNameFilter] = useState<any>(null);

  function handleEdit(lily: any) {
    setUpdateLily(null);
    setUpdateLily(lily);
    setShowAddLilyForm(true);
  }

  const pageContent = (() => {
    if (error && !loading) {
      return <Error error={error} />;
    } else if (!user && !loading) {
      return <Redirect href={`/login?next=${encodeURIComponent("/lilies")}`} />;
    } else if (!user) {
      return "Loading";
    } else {
      const userLilies = user.lilies.nodes;
      const filteredUserLilies = userLilies.filter((lily: any) =>
        lily.name.toLowerCase().includes(nameFilter)
      );

      return (
        <div>
          <h1 style={{ textAlign: "center" }}>Your Daylily Catalog</h1>
          <Button
            type="primary"
            onClick={() => {
              setUpdateLily(null);
              setShowAddLilyForm(true);
            }}
            data-cy="settingslilies-button-addlily"
            style={{ margin: "auto", marginBottom: "1rem", display: "block" }}
          >
            Add daylily
          </Button>
          <Input
            value={nameFilter}
            onChange={e => setNameFilter(e.target.value)}
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
        </div>
      );
    }
  })();
  return <SharedLayout title="Catalog">{pageContent}</SharedLayout>;
}
