import {
  ErrorAlert,
  Image,
  LiliesTable,
  ListingImageDisplay,
  SharedLayout,
} from "@app/components";
import {
  Badge,
  Button,
  Center,
  FancyHeading,
  getPlaceholderImageUrl,
  PropertyList,
  PropertyListItem,
  Space,
  Spinner,
  Thumbnail,
} from "@app/design";
import { useSharedQuery, useUserByIdQuery } from "@app/graphql";
import { settingsUrl } from "@app/lib";
import { NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";
import ReactMarkdown from "react-markdown";

const Catalogs: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const sharedQuery = useSharedQuery();
  const { loading: sharedQueryLoading, error: sharedQueryError } = sharedQuery;
  const userQuery = useUserByIdQuery({
    variables: { id: parseInt(id as string) },
  });
  const {
    data: userQueryData,
    loading: userQueryLoading,
    error: userQueryError,
  } = userQuery;

  const isLoading = sharedQueryLoading || userQueryLoading;
  const isError = sharedQueryError || userQueryError;
  const {
    username,
    imgUrls,
    bio,
    lilies,
    userLocation,
    avatarUrl,
    updatedAt,
    createdAt,
  } = userQueryData?.user || {};
  const listings = lilies?.nodes || [];
  return (
    <SharedLayout
      title={username ? `${username}` : "Catalog"}
      query={sharedQuery}
    >
      {isLoading ? (
        <Center>
          <Spinner />
        </Center>
      ) : isError ? (
        <>
          {sharedQueryError && <ErrorAlert error={sharedQueryError} />}
          {userQueryError && <ErrorAlert error={userQueryError} />}
        </>
      ) : userQueryData ? (
        <>
          <Space responsive>
            <ListingImageDisplay
              imageUrls={
                imgUrls && imgUrls.length
                  ? (imgUrls as string[])
                  : [getPlaceholderImageUrl()]
              }
            />
            <Space direction="column">
              <Space responsive>
                <Thumbnail>
                  <Image
                    src={avatarUrl || getPlaceholderImageUrl(username)}
                    alt="user avatar image"
                  />
                </Thumbnail>
                <Space direction="column">
                  <PropertyList divider>
                    {updatedAt && (
                      <PropertyListItem label="Updated">
                        <Badge>
                          {new Date(updatedAt).toLocaleDateString("en-US", {
                            year: "2-digit",
                            month: "short",
                            day: "numeric",
                          })}
                        </Badge>
                      </PropertyListItem>
                    )}
                    {createdAt && (
                      <PropertyListItem label="Joined">
                        <Badge>
                          {new Date(createdAt).toLocaleDateString("en-US", {
                            year: "2-digit",
                            month: "short",
                            day: "numeric",
                          })}
                        </Badge>
                      </PropertyListItem>
                    )}
                  </PropertyList>
                  <PropertyList divider>
                    {userLocation && (
                      <PropertyListItem label="Location">
                        {userLocation}
                      </PropertyListItem>
                    )}
                    {lilies && (
                      <PropertyListItem label="# Listings">
                        {lilies.totalCount.toLocaleString()}
                      </PropertyListItem>
                    )}
                  </PropertyList>
                </Space>
              </Space>
              {sharedQuery.data?.currentUser?.id === parseInt(id as string) && (
                <Button href={settingsUrl}>Edit Profile</Button>
              )}
              {bio && (
                <ReactMarkdown
                  components={{
                    h1: "h3",
                    h2: "h4",
                    h3: "h5",
                    h4: "h6",
                    h5: "h6",
                    h6: "h6",
                  }}
                >
                  {bio}
                </ReactMarkdown>
              )}
            </Space>
          </Space>
          <FancyHeading level={2}>Listings</FancyHeading>
          <LiliesTable dataSource={listings} isOwner={false} />
        </>
      ) : (
        <p>User with id, {id}, not found...</p>
      )}
    </SharedLayout>
  );
};

export default Catalogs;
