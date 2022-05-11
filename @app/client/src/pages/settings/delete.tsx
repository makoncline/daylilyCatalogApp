import { ApolloError } from "@apollo/client";
import { ErrorAlert, SettingsLayout } from "@app/components";
import { Alert, Button, Dialog, Heading, Space } from "@app/design";
import {
  useConfirmAccountDeletionMutation,
  useRequestAccountDeletionMutation,
  useSharedQuery,
} from "@app/graphql";
import { deleteUrl, getCodeFromError } from "@app/lib";
import { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useCallback, useState } from "react";

const Settings_Accounts: NextPage = () => {
  const router = useRouter();
  const token: string | null =
    (router && router.query && !Array.isArray(router.query.token)
      ? router.query.token
      : null) || null;
  const [error, setError] = useState<Error | ApolloError | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itIsDone, setItIsDone] = useState(false);
  const [doingIt, setDoingIt] = useState(false);
  const openModal = useCallback(() => setConfirmOpen(true), []);
  const closeModal = useCallback(() => setConfirmOpen(false), []);
  const [requestAccountDeletion] = useRequestAccountDeletionMutation();
  const doIt = useCallback(() => {
    setError(null);
    setDoingIt(true);
    (async () => {
      try {
        const result = await requestAccountDeletion();
        if (!result) {
          throw new Error("Result expected");
        }
        const { data, errors } = result;
        if (
          !data ||
          !data.requestAccountDeletion ||
          !data.requestAccountDeletion.success
        ) {
          console.dir(errors);
          throw new Error("Requesting deletion failed");
        }
        setItIsDone(true);
      } catch (e: any) {
        setError(e);
      }
      setDoingIt(false);
      setConfirmOpen(false);
    })();
  }, [requestAccountDeletion]);
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [confirmAccountDeletion] = useConfirmAccountDeletionMutation();
  const confirmDeletion = useCallback(() => {
    if (deleting || !token) {
      return;
    }
    setError(null);
    setDeleting(true);
    (async () => {
      try {
        await confirmAccountDeletion({ variables: { token } });
        // Display confirmation
        setDeleted(true);
      } catch (e: any) {
        setError(e);
      }
      setDeleting(false);
    })();
  }, [confirmAccountDeletion, deleting, token]);
  const query = useSharedQuery();
  return (
    <SettingsLayout href={deleteUrl} query={query}>
      <Space direction="column" gap="large">
        <Heading level={2}>Delete account</Heading>
        <p>
          Deleting your user account will delete all data (except that which we
          must retain for legal, compliance and accounting reasons) and cannot
          be undone. Make sure you want to do this.
        </p>
        <p>
          To protect your account, we require you to confirm you wish to delete
          your account here, then you will be sent an email with a confirmation
          code (to check your identity) and when you click that link you will be
          asked to confirm your account deletion again.
        </p>
        {token ? (
          <Alert type="danger">
            <Alert.Heading>Confirm account deletion</Alert.Heading>
            <Alert.Body>
              <p>
                This is it.{" "}
                <span>Press this button and your account will be deleted.</span>{" "}
                We're sorry to see you go, please don't hesitate to reach out
                and let us know why you no longer want your account.
              </p>
            </Alert.Body>
            <Alert.Actions>
              <Button onClick={confirmDeletion} disabled={deleting}>
                PERMANENTLY DELETE MY ACCOUNT
              </Button>
            </Alert.Actions>
          </Alert>
        ) : itIsDone ? (
          <Alert type="danger">
            <Alert.Heading>Confirm deletion via email link</Alert.Heading>
            <Alert.Body>
              You've been sent an email with a confirmation link in it, you must
              click it to confirm that you are the account holder so that you
              may continue deleting your account.
            </Alert.Body>
          </Alert>
        ) : (
          <Alert type="danger">
            <Alert.Heading>Delete user account?</Alert.Heading>
            <Alert.Body>
              Deleting your account cannot be undone, you will lose all your
              data.
            </Alert.Body>
            <Alert.Actions>
              <Button onClick={openModal} danger>
                I want to delete my account
              </Button>
            </Alert.Actions>
          </Alert>
        )}
        {error ? (
          getCodeFromError(error) === "OWNER" ? (
            <div>
              <Heading level={3}>Cannot delete account</Heading>
              <p>
                You cannot delete your account whilst you are the owner of an
                organization.
              </p>
              <p>
                For each organization you are the owner of, please either assign
                your ownership to another user or delete the organization to
                continue.
              </p>
            </div>
          ) : (
            <ErrorAlert error={error} />
          )
        ) : null}
      </Space>
      <Dialog
        isOpen={confirmOpen}
        onDismiss={closeModal}
        aria-label="delete account dialog"
      >
        {doingIt ? (
          <Alert type="danger">
            <Alert.Heading>Deleting Account...</Alert.Heading>
          </Alert>
        ) : (
          <Alert type="danger">
            <Alert.Heading>
              Send delete account confirmation email?
            </Alert.Heading>
            <Alert.Body>
              <p>
                Before we can delete your account, we need to confirm it's
                definitely you. We'll send you an email with a link in it, which
                when clicked will give you the option to delete your account.
              </p>
              <p>
                You should not trigger this unless you're sure you want to
                delete your account.
              </p>
            </Alert.Body>
            <Alert.Actions>
              <Button type="primary" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="primary" onClick={doIt}>
                Send delete account email
              </Button>
            </Alert.Actions>
          </Alert>
        )}
      </Dialog>
      <Dialog
        isOpen={deleted}
        onDismiss={() => router.push("/")}
        title="Account deleted"
        aria-label="Account deleted dialog"
      >
        <Alert type="danger">
          <Alert.Heading>Account deleted</Alert.Heading>
          <Alert.Body>
            Your account has been successfully deleted. We wish you all the
            best.
          </Alert.Body>
          <Alert.Actions>
            <Button type="primary" onClick={() => router.push("/")}>
              Return to homepage
            </Button>
          </Alert.Actions>
        </Alert>
      </Dialog>
    </SettingsLayout>
  );
};

export default Settings_Accounts;
