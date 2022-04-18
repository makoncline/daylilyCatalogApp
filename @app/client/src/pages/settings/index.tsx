import { ApolloError } from "@apollo/client";
import {
  AvatarPhotoUpload,
  ErrorAlert,
  ProfilePhotoUpload,
  Redirect,
  SettingsLayout,
  Wysiwyg,
} from "@app/components";
import {
  Button,
  Field,
  Form,
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
import { extractError, getCodeFromError } from "@app/lib";
import { NextPage } from "next";
import React, { useCallback, useState } from "react";

const Settings_Profile: NextPage = () => {
  const [formError, setFormError] = useState<Error | ApolloError | null>(null);
  const query = useSettingsProfileQuery();
  const { data, loading, error } = query;
  return (
    <SettingsLayout href="/settings" query={query}>
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
        <Redirect href={`/login?next=${encodeURIComponent("/settings")}`} />
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

  React.useEffect(() => {
    console.log("setting form values");
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
  // const MAX_NUM_IMAGES = 3;
  // const [imageUrls, setImageUrls] = React.useState<string[] | null>([]);
  // const numImages = imageUrls?.length ?? 0;
  // const showProfileImageUpload = numImages < MAX_NUM_IMAGES;
  // function handleBeforeUpload(files: File[]) {
  //   const newNumImages = numImages ?? 0 + files.length;
  //   if (newNumImages > MAX_NUM_IMAGES) {
  //     alert(
  //       `Only ${MAX_NUM_IMAGES} profile images allowed. Please remove ${
  //         newNumImages - MAX_NUM_IMAGES
  //       } images and try again.`
  //     );
  //     return false;
  //   }
  //   return true;
  // }

  // const handleImageUploaded = React.useCallback((_key: string, url: string) => {
  //   setImageUrls((prev) => [...(prev ?? []), url]);
  // }, []);
  // React.useEffect(() => {
  //   if (
  //     isReady &&
  //     imageUrls &&
  //     JSON.stringify(imageUrls) != JSON.stringify(data?.lily?.imgUrl)
  //   ) {
  //     try {
  //       console.log("saved img urls to db: ", imageUrls);
  //     } catch (e: any) {
  //       setError(e);
  //     }
  //   }
  // }, []);
  return (
    <>
      <Heading level={3}>Edit Profile</Heading>
      <Form formId={profileFormName} onSubmit={handleSubmit}>
        <Space>
          <Space direction="row">
            <fieldset disabled={!isPhotoUploadActive}>
              <AvatarPhotoUpload user={user} />
            </fieldset>
            {/* <ImageUpload
              keyPrefix="avatar"
              handleImageUploaded={handleImageUploaded}
              handleBeforeUpload={handleBeforeUpload}
            />
            <ImageDisplay imageUrls={imageUrls} setImageUrls={setImageUrls} /> */}

            {!user.isVerified && (
              <Space direction="column">
                <div className="over-limit">
                  <Space direction="row">
                    <p>
                      You must verify your email address to upload photos. A
                      verification link has been sent to your email address.
                      Please click the link in that email to verify.
                    </p>
                    <Button
                      type="primary"
                      href={`${process.env.ROOT_URL}/settings/emails`}
                    >
                      View email settings
                    </Button>
                  </Space>
                </div>
              </Space>
            )}
            {user.isVerified && !isPhotoUploadActive && (
              <Space direction="column">
                <div className="over-limit">
                  <Space direction="row">
                    <p>You must have an active membership to upload photos.</p>
                    <Button
                      type="primary"
                      href={`${process.env.ROOT_URL}/membership`}
                    >
                      Become a Daylily Catalog Member
                    </Button>
                  </Space>
                </div>
              </Space>
            )}
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

      <Heading level={3}>Edit Profile Photos</Heading>
      <>
        {isPhotoUploadActive ? (
          <ProfilePhotoUpload user={user} />
        ) : (
          "disabled photo upload"
        )}
        {!user.isVerified && (
          <div className="over-limit">
            <Space direction="column">
              <p>
                You must verify your email address to upload photos. A
                verification link has been sent to your email address. Please
                click the link in that email to verify.
              </p>
              <Button
                type="primary"
                href={`${process.env.ROOT_URL}/settings/emails`}
              >
                View email settings
              </Button>
            </Space>
          </div>
        )}
        {user.isVerified && !isPhotoUploadActive && (
          <div className="over-limit">
            <Space direction="column">
              <p>You must have an active membership to upload photos.</p>
              <Button href={`${process.env.ROOT_URL}/membership`}>
                Become a Daylily Catalog Member
              </Button>
            </Space>
          </div>
        )}
      </>
    </>
  );
}
