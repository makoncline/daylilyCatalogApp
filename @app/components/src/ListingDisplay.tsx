import {
  above,
  Badge,
  Button,
  Heading,
  PropertyList,
  PropertyListItem,
} from "@app/design";
import { AhsDataFragment, useLilyByIdQuery } from "@app/graphql";
import Link from "next/link";
import React from "react";
import styled from "styled-components";

import { ImageDisplay } from "./ImageDisplay";
import { getDescription } from "./RegisteredLilyDisplay";

function ListingDisplay({
  listingId,
  userId,
}: {
  listingId: number;
  userId: number;
}) {
  const { data, loading, error } = useLilyByIdQuery({
    variables: { id: listingId },
  });
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  const listing = data?.lily;
  if (!listing) return <p>No listing found with id {listingId}</p>;

  const listingImageUrls = (listing.imgUrl?.filter(Boolean) as string[]) || [];
  const ahsImageUrls = [listing.ahsDatumByAhsRef?.image || null].filter(
    Boolean
  ) as string[];
  const imageUrls = [...listingImageUrls, ...ahsImageUrls];
  const {
    name,
    publicNote,
    privateNote,
    price,
    updatedAt,
    list,
    ahsDatumByAhsRef,
  } = listing;
  const description = ahsDatumByAhsRef && getDescription(ahsDatumByAhsRef);
  const listName = list?.name;
  const isOwner = userId === listing.user?.id;
  return (
    <Wrapper>
      <ImageDisplay imageUrls={imageUrls} />
      <Details>
        <StyledHeading level={2}>{name}</StyledHeading>
        {isOwner && (
          <Link passHref href={`/catalog/edit/${listingId}`}>
            <Button>Edit listing</Button>
          </Link>
        )}
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
        <div>
          <Heading level={3}>Details</Heading>
          <hr />
          <PropertyList column padding="var(--size-1)">
            {ahsDatumByAhsRef &&
              getTraits(ahsDatumByAhsRef).map(([key, value]) => (
                <PropertyListItem inline label={key} key={key}>
                  {value}
                </PropertyListItem>
              ))}
          </PropertyList>
        </div>
      </Details>
    </Wrapper>
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

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--size-4);
  ${above.sm`
    flex-direction: row;
  `}
`;
const Details = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--size-4);
`;
const StyledHeading = styled(Heading)`
  margin: 0;
`;
