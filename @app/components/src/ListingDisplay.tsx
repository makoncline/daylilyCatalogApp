import { ApolloError } from "@apollo/client";
import {
  Badge,
  Button,
  Heading,
  Hr,
  PropertyList,
  PropertyListItem,
  Space,
} from "@app/design";
import { AhsDataFragment, LilyByIdQuery } from "@app/graphql";
import { toEditListingUrl } from "@app/lib";
import Link from "next/link";
import React from "react";
import styled from "styled-components";

import { ImageDisplay } from "./ImageDisplay";

function ListingDisplay({
  listingId,
  data,
  loading,
  error,
  userId,
}: {
  listingId: number;
  data: LilyByIdQuery | undefined;
  loading: boolean;
  error: ApolloError | undefined;
  userId: number;
}) {
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  const listing = data?.lily;
  if (!listing) return <p>No listing found with id {listingId}</p>;

  const listingImageUrls = (listing.imgUrl?.filter(Boolean) as string[]) || [];
  const ahsImageUrls = [listing.ahsDatumByAhsRef?.image || null].filter(
    Boolean
  ) as string[];
  const imageUrls = Array.from(new Set([...listingImageUrls, ...ahsImageUrls]));
  const { publicNote, privateNote, price, updatedAt, list, ahsDatumByAhsRef } =
    listing;
  const listName = list?.name;
  const isOwner = userId === listing.user?.id;
  return (
    <Space center responsive gap="medium">
      {imageUrls.length > 0 && <ImageDisplay imageUrls={imageUrls} />}
      <StyledSpace direction="column">
        <PropertyList divider>
          {price && <PropertyListItem label="Price">${price}</PropertyListItem>}
          {updatedAt && (
            <PropertyListItem label="Updated">
              {new Date(updatedAt).toLocaleDateString("en-US", {
                year: "2-digit",
                month: "short",
                day: "numeric",
              })}
            </PropertyListItem>
          )}
          {listName && (
            <PropertyListItem label="List">
              <Badge>{listName}</Badge>
            </PropertyListItem>
          )}
          {isOwner && (
            <PropertyListItem label="Edit">
              <Link passHref href={toEditListingUrl(listingId)}>
                <Button>Edit listing</Button>
              </Link>
            </PropertyListItem>
          )}
        </PropertyList>
        <PropertyList column>
          {publicNote && (
            <PropertyListItem label="Description">
              {publicNote}
            </PropertyListItem>
          )}
          {isOwner && privateNote && (
            <PropertyListItem label="Private Note">
              {privateNote}
            </PropertyListItem>
          )}
        </PropertyList>
        {ahsDatumByAhsRef && (
          <div>
            <Heading level={3}>Details</Heading>
            <Hr />
            <PropertyList column padding="var(--size-1)">
              {getTraits(ahsDatumByAhsRef).map(([key, value]) => (
                <PropertyListItem inline label={key} key={key}>
                  {value}
                </PropertyListItem>
              ))}
            </PropertyList>
          </div>
        )}
      </StyledSpace>
    </Space>
  );
}

export { ListingDisplay };

function getTraits(ahsData: AhsDataFragment): [string, string][] {
  const traitLabels: Record<string, string> = {
    hybridizer: "Hybridizer",
    year: "Year",
    parentage: "Parentage",
    ploidy: "Ploidy",
    scapeHeight: "Scape height",
    color: "Color",
    bloomHabit: "Bloom habit",
    bloomSeason: "Bloom season",
    bloomSize: "Bloom size",
    branches: "Branches",
    budcount: "Bud count",
    flower: "Flower",
    foliage: "Foliage",
    foliageType: "Foliage type",
    form: "Form",
    fragrance: "Fragrance",
    sculpting: "Sculpting",
    seedlingNum: "Seedling #",
  };
  return Object.entries(traitLabels)
    .map(([key, label]) =>
      ahsData[key] ? [label, ahsData[key] as string] : null
    )
    .filter(Boolean) as [string, string][];
}

const StyledSpace = styled(Space)`
  min-width: var(--image-size);
`;
