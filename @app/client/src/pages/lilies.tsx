import React, { useState } from "react";
import SharedLayout from "../components/SharedLayout";
import { useLiliesQuery } from "@app/graphql";
import { List, Button } from "antd";
import Error from "../components/ErrorAlert";
import Redirect from "../components/Redirect";
import Lily from "../components/Lily";
import { ApolloError } from "apollo-client";
import AddLilyForm from "../components/AddLilyForm";

export default function Lilies() {
  const { data, loading, error } = useLiliesQuery();
  const user = data && data.currentUser;
  const [showAddLilyForm, setShowAddLilyForm] = useState(false);
  const [formError, setFormError] = useState<Error | ApolloError | null>(null);

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
            onClick={() => setShowAddLilyForm(true)}
            data-cy="settingslilies-button-addlily"
          >
            Add daylily
          </Button>
          <List
            itemLayout="horizontal"
            dataSource={user.lilies.nodes}
            renderItem={lily => <Lily lily={lily} />}
          />
          <AddLilyForm
            onComplete={() => setShowAddLilyForm(false)}
            error={formError}
            setError={setFormError}
            show={showAddLilyForm}
            setShow={setShowAddLilyForm}
          />
        </div>
      );
    }
  })();
  return <SharedLayout title="Catalog">{pageContent}</SharedLayout>;
}
