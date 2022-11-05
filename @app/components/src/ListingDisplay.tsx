import {
  Badge,
  Button,
  getPlaceholderImageUrl,
  Heading,
  Hr,
  PropertyList,
  PropertyListItem,
  Space,
} from "@app/design";
import { AhsDataFragment, LilyByIdQuery } from "@app/graphql";
import { toEditListingUrl } from "@app/lib";
import Head from "next/head";
import Link from "next/link";
import React from "react";
import styled from "styled-components";

import { ListingImageDisplay } from "./ListingImageDisplay";
import { SEO } from "./SEO";

function ListingDisplay({
  listing,
  userId,
}: {
  listing: NonNullable<LilyByIdQuery["lily"]>;
  userId: number | null;
}) {
  const listingImageUrls = (listing.imgUrl?.filter(Boolean) as string[]) || [];
  const ahsImageUrls = [listing.ahsDatumByAhsRef?.image || null].filter(
    Boolean
  ) as string[];
  const imageUrls = Array.from(new Set([...listingImageUrls, ...ahsImageUrls]));
  const { publicNote, privateNote, price, updatedAt, list, ahsDatumByAhsRef } =
    listing;
  const listName = list?.name;
  const isOwner = userId === listing.user?.id;
  const description = listing.publicNote
    ? listing.publicNote
    : `View photos, description, and more for ${listing.name} daylily from the ${listing.user?.username} catalog.`;
  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    image:
      imageUrls.length > 0 ? imageUrls : [getPlaceholderImageUrl(listing.name)],
    name: `${listing.name} daylily`,
    description: description,
    offers: {
      "@type": "Offer",
      price: listing.price ? parseInt(listing.price) : 0,
      priceCurrency: "USD",
    },
  };
  return (
    <Space center responsive gap="medium">
      <SEO
        title={`${listing.price ? `Buy` : "View"} ${listing.name} daylily${
          listing.price ? ` for $${price}` : ""
        } from the ${listing.user?.username} catalog`}
        description={
          listing.publicNote
            ? listing.publicNote
            : `View photos, description, and more for ${listing.name} daylily from the ${listing.user?.username} catalog.`
        }
      />
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>
      {imageUrls.length > 0 ? (
        <ListingImageDisplay imageUrls={imageUrls} />
      ) : (
        <ListingImageDisplay
          imageUrls={[getPlaceholderImageUrl(listing.name)]}
        />
      )}
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
              <Link passHref href={toEditListingUrl(listing.id)}>
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
  max-width: var(--full-width);
`;
