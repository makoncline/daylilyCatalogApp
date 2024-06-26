import {
  ErrorAlert,
  Image,
  LiliesTable,
  ListingImageDisplay,
  SEO,
  SharedLayout,
  useReactTable,
} from "@app/components";
import {
  Badge,
  Button,
  Center,
  FancyHeading,
  getPlaceholderImageUrl,
  Heading,
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
import styled from "styled-components";

import { download } from "../../util/download";

const Catalogs: NextPage = () => {
  const listingSection = React.useRef<HTMLDivElement>(null);
  const router = useRouter();
  const initialState = React.useMemo(() => {
    if (router.query.state) {
      try {
        return JSON.parse(router.query.state as string);
      } catch (e) {
        console.error("Failed to parse state from URL", e);
      }
    }
    return {};
  }, [router.query.state]);
  const selectedList = initialState?.filters?.find(
    (filter: { id: string; value: string }) => filter.id === "list"
  )?.value;

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
    lists,
    userLocation,
    avatarUrl,
    updatedAt,
    createdAt,
  } = userQueryData?.user || {};
  const listings = lilies?.nodes || [];
  const listingsHeading = selectedList ? selectedList : "All Listings";
  const handleDownloadData = () => {
    download(listings);
  };

  const table = useReactTable({
    rawData: listings,
    isOwner: false,
    initialState,
  });

  const handleListChange = (list: string | null) => {
    // @ts-expect-error
    table.tableInstance.setFilter("list", list);
    listingSection?.current?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <SharedLayout
      title={username ? `${username}` : "Catalog"}
      query={sharedQuery}
    >
      <SEO
        title={`Check out this daylily catalog by ${username}`}
        description={`View garden information, daylily lists, and daylily listings. Buy daylilies online from daylily catalog user ${username}.`}
      />
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
          <Space direction="column" center block>
            <FancyHeading level={2}>Lists</FancyHeading>
            {lists?.nodes &&
              lists.nodes.length > 0 &&
              lists.nodes
                .filter((list) => list.lilies.totalCount > 0)
                .sort((a, b) => b.lilies.totalCount - a.lilies.totalCount)
                .map((list) => (
                  <ListCard direction="column" block key={list.id}>
                    <Heading level={3}>{list.name}</Heading>
                    {list.intro && <p>{list.intro}</p>}
                    <p>{list.lilies.totalCount.toLocaleString()} listings</p>
                    <Space>
                      <Button onClick={() => handleListChange(list.name)}>
                        {selectedList === list.name ? "Now viewing" : "View"}
                      </Button>
                    </Space>
                  </ListCard>
                ))}
            <ListCard direction="column" block>
              <Heading level={3}>All Listings</Heading>
              <p>View all of {username}'s listings</p>
              <p>{listings.length.toLocaleString()} listings</p>
              <Space>
                <Button onClick={() => handleListChange(null)}>
                  {selectedList === null ? "Now viewing" : "View"}
                </Button>
              </Space>
            </ListCard>
          </Space>
          <Space direction="column" block ref={listingSection}>
            <FancyHeading level={2}>{listingsHeading}</FancyHeading>
            {listings.length ? (
              <LiliesTable
                table={table}
                isOwner={false}
                downloadData={handleDownloadData}
              />
            ) : (
              <Space center>
                <p>No listings found. Maybe this user hasn't added any yet?</p>
              </Space>
            )}
          </Space>
        </>
      ) : (
        <p>User with id, {id}, not found...</p>
      )}
    </SharedLayout>
  );
};

export default Catalogs;

const ListCard = styled(Space)`
  max-width: var(--size-content-2);
  padding: var(--size-4);
  :hover {
    background: var(--surface-2);
  }
`;
