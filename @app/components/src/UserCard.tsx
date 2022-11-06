import {
  above,
  Button,
  Heading,
  PropertyList,
  PropertyListItem,
  Space,
  Thumbnail,
} from "@app/design";
import { toViewUserUrl } from "@app/lib";
import React from "react";
import styled from "styled-components";

import { Image } from "./Image";

export const UserCard = ({
  id,
  image,
  username,
  location,
  intro,
  numListings,
}: {
  id: number;
  image?: string | null;
  username: string;
  location?: string | null;
  intro?: string | null;
  numListings: number;
}) => {
  return (
    <StyledCard>
      <div style={{ position: "relative" }}>
        {image && (
          <Thumbnail
            thumb={false}
            style={
              { "--width": "var(--size-image-card)" } as React.CSSProperties
            }
          >
            <Image src={image} alt={`${username} image`} />
          </Thumbnail>
        )}
      </div>
      <Body block direction="column">
        <Heading level={3}>{username}</Heading>
        <PropertyList divider>
          {location && (
            <PropertyListItem label="Location">{location}</PropertyListItem>
          )}
          <PropertyListItem label="# Listings">
            {numListings.toLocaleString()}
          </PropertyListItem>
        </PropertyList>
        {intro && <p>{intro}</p>}
        <Button href={toViewUserUrl(id)}>View Catalog</Button>
      </Body>
    </StyledCard>
  );
};

const StyledCard = styled.div`
  display: grid;
  gap: var(--size-4);
  grid-template-columns: 1fr;
  grid-template-rows: var(--size-image-card) auto;
  ${above.sm`
    grid-template-columns: var(--size-image-card) 1fr;
    grid-template-rows: var(--size-image-card);
    width: 100%;
  `}
  :hover {
    background: var(--surface-2);
  }
`;

const Body = styled(Space)`
  padding: var(--size-4);
`;
