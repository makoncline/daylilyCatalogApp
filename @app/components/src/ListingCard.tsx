import { above, Button, Heading, Space, Thumbnail } from "@app/design";
import { toViewListingUrl } from "@app/lib";
import React from "react";
import styled from "styled-components";

import { Image } from "./Image";
import { currency } from "./util";

export const ListingCard = ({
  id,
  image,
  name,
  price,
  description,
}: {
  id: number;
  image?: string | null;
  name: string;
  price?: number | null;
  description?: string | null;
}) => {
  return (
    <StyledCard>
      <div style={{ position: "relative" }}>
        {image && (
          <Thumbnail
            style={
              { "--width": "var(--size-image-card)" } as React.CSSProperties
            }
          >
            <Image src={image} alt={`${name} image`} />
          </Thumbnail>
        )}
      </div>
      <Body block direction="column">
        <Heading level={3}>{name}</Heading>
        {price && <p>{price > 0 ? currency(price) : "-"}</p>}
        {description && <p>{description}</p>}
        <Button href={toViewListingUrl(id)}>View</Button>
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
    width: var(--max-width);
  `}
  :hover {
    background: var(--surface-2);
  }
`;

const Body = styled(Space)`
  padding: var(--size-4);
`;
