import { ApolloError } from "@apollo/client";
import { ErrorAlert, Redirect, SettingsLayout, Wysiwyg } from "@app/components";
import {
  Alert,
  Button,
  Field,
  Form,
  FormWrapper,
  Heading,
  Space,
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
} from "@app/lib";
import { NextPage } from "next";
import React, { useCallback, useState } from "react";

import { ImageDisplay } from "../ImageDisplay";
import { ImageUpload } from "../ImageUpload";

const Settings_Profile: NextPage = () => {
  const [formError, setFormError] = useState<Error | ApolloError | null>(null);
  const query = useSettingsProfileQuery();
  const { data, loading, error } = query;
  return (
    <SettingsLayout href={settingsUrl} query={query}>
      {data && data.currentUser ? (
        <ProfileSettingsForm
          error={formError}
          setError={setFormError}
          user={data.currentUser}
        />
      ) : loading ? (
        "Loading..."
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
  const isFree = user.freeUntil ? new Date() < new Date(user.freeUntil) : false;
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
        console.log("saved img urls to db: ", profilePhotoUrls);
      } catch (e: any) {
        setProfilePhotoUploadError(e.message);
      }
    }
  }, [isReady, profilePhotoUrls, setError, updateUser, user.id, user.imgUrls]);
  return (
    <FormWrapper>
      <Heading level={3}>Edit Profile</Heading>
      <Form formId={profileFormName} onSubmit={handleSubmit}>
        <Space>
          <Space direction="row">
            <Space direction="column">
              {!avatarPhotoUrl && (
                <ImageUpload
                  keyPrefix="avatar"
                  handleImageUploaded={handleAvatarImageUploaded}
                  title="Upload avatar image"
                  single
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
          </Space>
        </Space>
        <Field name="name" required>
          Name
        </Field>
        <Field name="username" required>
          Username
        </Field>
        <Field name="location">Location</Field>
        <Field name="intro">Intro</Field>
        <Field name="bio" hidden>
          bio
        </Field>
        {error ? (
          <div>
            <p>Updating username</p>
            <span>
              {extractError(error).message}
              {code ? (
                <span>
                  {" "}
                  (Error code: <code>ERR_{code}</code>)
                </span>
              ) : null}
            </span>
          </div>
        ) : success ? (
          <p>Profile updated</p>
        ) : null}
        <SubmitButton>
          <Button>Update Profile</Button>
        </SubmitButton>
      </Form>

      <Heading level={3}>Edit Bio</Heading>
      <Wysiwyg handleSetBio={handleSetBio} value={user.bio} />
      <br />
      <Button htmlType="submit">Update Profile</Button>

      <>
        <Space direction="column">
          {showProfileImageUpload && (
            <ImageUpload
              keyPrefix="profile"
              handleImageUploaded={handleProfileImageUploaded}
              handleBeforeUpload={handleBeforeProfileImageUpload}
              title="Upload profile images"
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
      </>
    </FormWrapper>
  );
}

const UploadDisabledNotVerified = () => (
  <Alert type="danger">
    <Alert.Heading>Image upload disabled</Alert.Heading>
    <Alert.Body>
      You must verify your email address to upload photos. A verification link
      has been sent to your email address. Please click the link in that email
      to verify.
    </Alert.Body>
    <Alert.Actions>
      <Button type="primary" href={`${process.env.ROOT_URL}/settings/emails`}>
        View email settings
      </Button>
    </Alert.Actions>
  </Alert>
);

const UploadDisabledNoMembership = () => (
  <Alert type="danger">
    <Alert.Heading>Image upload disabled</Alert.Heading>
    <Alert.Body>
      <p>You must have an active membership to upload photos.</p>
    </Alert.Body>
    <Alert.Actions>
      <Button href={`${process.env.ROOT_URL}/membership`}>
        Become a Daylily Catalog Member
      </Button>
    </Alert.Actions>
  </Alert>
);
