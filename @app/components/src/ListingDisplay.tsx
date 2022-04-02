import { Heading, Space } from "@app/design";
import { useLilyByIdQuery } from "@app/graphql";
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
  const { hybridizer, year } = ahsDatumByAhsRef || {};
  const description = ahsDatumByAhsRef && getDescription(ahsDatumByAhsRef);
  const listName = list?.name;
  const isOwner = userId === listing.user?.id;
  return (
    <Wrapper>
      <ImageDisplay imageUrls={imageUrls} />
      <Details>
        <Heading level={1}>{name}</Heading>
        <Row>
          {hybridizer && year ? (
            <p>
              ({hybridizer}, {year})
            </p>
          ) : hybridizer ? (
            <p>({hybridizer})</p>
          ) : year ? (
            <p>({year})</p>
          ) : null}
          {listName && <p>{listName}</p>}
        </Row>
        {price && <p>${price}</p>}
        {publicNote && <p>{publicNote}</p>}
        {isOwner && privateNote && <p>{privateNote}</p>}
        {description && <p>{description}</p>}
        {updatedAt && <p>{updatedAt}</p>}
      </Details>
    </Wrapper>
  );
}

export { ListingDisplay };

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: var(--size-4);
`;
const Details = styled.div`
  width: 400px;
`;
const Row = styled.div`
  display: flex;
  justify-content: space-between;
`;
