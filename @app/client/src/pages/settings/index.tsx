import { ApolloError } from "@apollo/client";
import {
  ErrorAlert,
  ImageDisplay,
  ImageUpload,
  Redirect,
  SEO,
  SettingsLayout,
  UploadDisabledNoMembership,
  UploadDisabledNotVerified,
  Wysiwyg,
} from "@app/components";
import {
  Alert,
  Button,
  Center,
  Field,
  Form,
  FormWrapper,
  Heading,
  Space,
  Spinner,
  SubmitButton,
  useForm,
} from "@app/design";
import {
  ProfileSettingsForm_UserFragment,
  useSettingsProfileQuery,
  useUpdateUserMutation,
} from "@app/graphql";
import {
  extractError,
  getCodeFromError,
  loginUrl,
  settingsUrl,
  toViewUserUrl,
} from "@app/lib";
import * as Sentry from "@sentry/nextjs";
import { NextPage } from "next";
import NextLink from "next/link";
import React, { useCallback, useState } from "react";
import styled from "styled-components";

import { validateUsername } from "../../util";
import { getIsFree } from "../../util/getIsFree";

const Settings_Profile: NextPage = () => {
  const [formError, setFormError] = useState<Error | ApolloError | null>(null);
  const query = useSettingsProfileQuery();
  const { data, loading, error } = query;
  const id = data?.currentUser?.id;
  return (
    <SettingsLayout href={settingsUrl} query={query} noPad>
      <SEO
        title="Edit Profile"
        description="Manage your Daylily Catalog profile. Change your username, bio, profile photo, and garden photos."
      />
      <Space direction="column">
        <p>Jump to edit:</p>
        <Wrap>
          <NextLink href="#profile" passHref>
            Profile
          </NextLink>
          <NextLink href="#bio" passHref>
            Bio
          </NextLink>
          <NextLink href="#avatar" passHref>
            Avatar
          </NextLink>
          <NextLink href="#images" passHref>
            Images
          </NextLink>
        </Wrap>
        {id && <Button href={toViewUserUrl(id)}>View public profile</Button>}
      </Space>
      {data && data.currentUser ? (
        <ProfileSettingsForm
          error={formError}
          setError={setFormError}
          user={data.currentUser}
        />
      ) : loading ? (
        <Center>
          <Spinner />
        </Center>
      ) : error ? (
        <ErrorAlert error={error} />
      ) : (
        <Redirect
          href={`${loginUrl}?next=${encodeURIComponent(settingsUrl)}`}
        />
      )}
    </SettingsLayout>
  );
};

export default Settings_Profile;

interface ProfileSettingsFormProps {
  user: ProfileSettingsForm_UserFragment;
  error: Error | ApolloError | null;
  setError: (error: Error | ApolloError | null) => void;
}

function ProfileSettingsForm({
  user,
  error,
  setError,
}: ProfileSettingsFormProps) {
  const profileFormName = "edit-profile";
  const { values, isReady, setValues, setField } = useForm(profileFormName);
  const [updateUser] = useUpdateUserMutation();
  const [success, setSuccess] = useState(false);
  const [_, setFormError] = React.useState<string | null>(null);
  const [avatarPhotoUrl, setAvatarPhotoUrl] = useState<string | null>(
    user.avatarUrl
  );
  const [avatarUploadError, setAvatarUploadError] = React.useState<
    string | null
  >(null);
  const [profilePhotoUrls, setProfilePhotoUrls] = useState<string[]>(
    (user.imgUrls?.filter(Boolean) as string[]) || []
  );
  const [profilePhotoUploadError, setProfilePhotoUploadError] = React.useState<
    string | null
  >(null);

  React.useEffect(() => {
    setValues({
      username: user.username,
      name: user.name!,
      intro: user.intro || "",
      bio: user.bio || "",
      userLocation: user.userLocation || "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSubmit = useCallback(async () => {
    setSuccess(false);
    setError(null);
    try {
      await updateUser({
        variables: {
          id: user.id,
          patch: {
            username: values.username,
            name: values.name,
            intro: values.intro,
            bio: values.bio,
            userLocation: values.location,
          },
        },
      });
      setError(null);
      setSuccess(true);
    } catch (e: any) {
      Sentry.captureException(e);
      const errcode = getCodeFromError(e);
      if (errcode === "23505") {
        setFormError(
          "This username is already in use, please pick a different name"
        );
      } else {
        setError(e);
      }
    }
  }, [setError, updateUser, user.id, values]);

  const code = getCodeFromError(error);

  const handleSetBio: (text: string | null | undefined) => void = (text) => {
    if (text) {
      setField("bio", text);
    }
  };

  const isActive =
    user.stripeSubscription?.subscriptionInfo?.status == "active";
  const isFree = getIsFree(user?.freeUntil);
  const isPhotoUploadActive = user.isVerified && (isFree || isActive);

  const handleSaveAvatarPhoto = React.useCallback(
    async (avatarUrl: string) => {
      setAvatarUploadError(null);
      try {
        await updateUser({
          variables: {
            id: user.id,
            patch: {
              avatarUrl,
            },
          },
        });
      } catch (e: any) {
        Sentry.captureException(e);
        setAvatarPhotoUrl(null);
        setAvatarUploadError(`${e.message}`);
      }
    },
    [updateUser, user.id]
  );

  const handleAvatarImageUploaded = React.useCallback(
    (_key: string, url: string) => {
      setAvatarPhotoUrl(url);
      handleSaveAvatarPhoto(url);
    },
    [handleSaveAvatarPhoto]
  );

  const MAX_NUM_PROFILE_IMAGES = 4;
  const numImages = profilePhotoUrls.length ?? 0;
  const showProfileImageUpload = numImages < MAX_NUM_PROFILE_IMAGES;
  function handleBeforeProfileImageUpload(files: File[]) {
    const newNumImages = numImages ?? 0 + files.length;
    if (newNumImages > MAX_NUM_PROFILE_IMAGES) {
      alert(
        `Only ${MAX_NUM_PROFILE_IMAGES} profile images allowed. Please remove ${
          newNumImages - MAX_NUM_PROFILE_IMAGES
        } images and try again.`
      );
      return false;
    }
    return true;
  }
  const handleProfileImageUploaded = React.useCallback(
    (_key: string, url: string) => {
      setProfilePhotoUrls((prev) => [...(prev ?? []), url]);
    },
    []
  );
  React.useEffect(() => {
    if (
      isReady &&
      JSON.stringify(profilePhotoUrls) != JSON.stringify(user.imgUrls)
    ) {
      setProfilePhotoUploadError(null);
      try {
        updateUser({
          variables: {
            id: user.id,
            patch: {
              imgUrls: profilePhotoUrls,
            },
          },
        });
        // console.log("saved img urls to db: ", profilePhotoUrls);
      } catch (e: any) {
        Sentry.captureException(e);
        setProfilePhotoUploadError(e.message);
      }
    }
  }, [isReady, profilePhotoUrls, setError, updateUser, user.id, user.imgUrls]);
  return (
    <Space responsive>
      <FormWrapper>
        <Form
          formId={profileFormName}
          onSubmit={handleSubmit}
          onChange={() => {
            setSuccess(false);
            setError(null);
          }}
          validation={{
            username: validateUsername,
          }}
        >
          <Space direction="column" block>
            <Heading level={3} id="profile">
              Profile
            </Heading>
            <Field name="name" required>
              Name
            </Field>
            <Field name="username" required>
              Username
            </Field>
            <Field name="location">Location</Field>
            <Field name="intro" textarea maxLength={279}>
              Intro
            </Field>
            {error ? (
              <Alert type="danger">
                <Alert.Heading>Updating profile</Alert.Heading>
                <Alert.Body>
                  {extractError(error).message}
                  {code ? (
                    <span>
                      {" "}
                      (Error code: <code>ERR_{code}</code>)
                    </span>
                  ) : null}
                </Alert.Body>
              </Alert>
            ) : success ? (
              <Alert type="success">
                <Alert.Body>Profile updated</Alert.Body>
              </Alert>
            ) : null}
            <SubmitButton>
              <Button>Update Profile</Button>
            </SubmitButton>
          </Space>
          <Space direction="column" block>
            <Heading level={3} id="bio">
              Bio
            </Heading>
            <Wysiwyg handleSetBio={handleSetBio} value={user.bio} />
            <Field name="bio" hidden>
              bio
            </Field>
            {error ? (
              <Alert type="danger">
                <Alert.Heading>Error updating profile</Alert.Heading>
                <Alert.Body>
                  {extractError(error).message}
                  {code ? (
                    <span>
                      {" "}
                      (Error code: <code>ERR_{code}</code>)
                    </span>
                  ) : null}
                </Alert.Body>
              </Alert>
            ) : success ? (
              <Alert type="success">
                <Alert.Body>Profile updated</Alert.Body>
              </Alert>
            ) : null}
            <SubmitButton>
              <Button>Update Profile</Button>
            </SubmitButton>
          </Space>
        </Form>
      </FormWrapper>
      <Space direction="column">
        <Space direction="column">
          <Heading level={3} id="avatar">
            Avatar
          </Heading>
          {!avatarPhotoUrl && (
            <ImageUpload
              keyPrefix="avatar"
              handleImageUploaded={handleAvatarImageUploaded}
              single
              showTitle={false}
            />
          )}
          {avatarUploadError && (
            <Alert type="danger">
              <Alert.Heading>Error uploading avatar photo</Alert.Heading>
              <Alert.Body>{avatarUploadError}</Alert.Body>
            </Alert>
          )}
          {avatarPhotoUrl && (
            <ImageDisplay
              imageUrls={avatarPhotoUrl ? [avatarPhotoUrl] : []}
              setImageUrls={(imageUrls: string[]) =>
                setAvatarPhotoUrl(imageUrls.at(0) || null)
              }
            />
          )}
          {!user.isVerified && <UploadDisabledNotVerified />}
          {user.isVerified && !isPhotoUploadActive && (
            <UploadDisabledNoMembership />
          )}
        </Space>

        <Space direction="column">
          <Heading level={3} id="images">
            Images
          </Heading>
          {showProfileImageUpload && (
            <ImageUpload
              keyPrefix="profile"
              handleImageUploaded={handleProfileImageUploaded}
              handleBeforeUpload={handleBeforeProfileImageUpload}
              showTitle={false}
            />
          )}
          {profilePhotoUploadError && (
            <Alert type="danger">
              <Alert.Heading>Error uploading profile photo</Alert.Heading>
              <Alert.Body>{profilePhotoUploadError}</Alert.Body>
            </Alert>
          )}
          {profilePhotoUrls.length ? (
            <ImageDisplay
              imageUrls={profilePhotoUrls}
              setImageUrls={setProfilePhotoUrls}
            />
          ) : null}
          {!user.isVerified && <UploadDisabledNotVerified />}
          {user.isVerified && !isPhotoUploadActive && (
            <UploadDisabledNoMembership />
          )}
        </Space>
      </Space>
    </Space>
  );
}

const Wrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--size-4);
`;
