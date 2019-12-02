import React, { useState } from "react";
import SharedLayout from "../components/SharedLayout";
import { useLiliesQuery } from "@app/graphql";
import { Button } from "antd";
import Error from "../components/ErrorAlert";
import Redirect from "../components/Redirect";
import { ApolloError } from "apollo-client";
import AddLilyForm from "../components/AddLilyForm";
import LiliesTable from "../components/LiliesTable";

export default function Lilies() {
  const { data, loading, error } = useLiliesQuery();
  const user = data && data.currentUser;
  const [showAddLilyForm, setShowAddLilyForm] = useState(false);
  const [updateLily, setUpdateLily] = useState(null);
  const [formError, setFormError] = useState<Error | ApolloError | null>(null);

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
      return (
        <div>
          <Button
            type="primary"
            onClick={() => {
              setUpdateLily(null);
              setShowAddLilyForm(true);
            }}
            data-cy="settingslilies-button-addlily"
          >
            Add daylily
          </Button>
          <LiliesTable dataSource={user.lilies.nodes} handleEdit={handleEdit} />
          <AddLilyForm
            onComplete={() => setShowAddLilyForm(false)}
            error={formError}
            setError={setFormError}
            show={showAddLilyForm}
            setShow={setShowAddLilyForm}
            updateLily={updateLily}
            setUpdateLily={setUpdateLily}
          />
        </div>
      );
    }
  })();
  return <SharedLayout title="Catalog">{pageContent}</SharedLayout>;
}
