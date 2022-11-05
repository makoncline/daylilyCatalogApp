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
  note,
  description,
}: {
  id: number;
  image?: string | null;
  name: string;
  price?: number | null;
  note?: string | null;
  description: string | null;
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
            <Image src={image} alt={`${name} image`} />
          </Thumbnail>
        )}
      </div>
      <Body block direction="column">
        <Heading level={3}>{name}</Heading>
        {price && <p>{price > 0 ? currency(price) : "-"}</p>}
        {note && <p>{note}</p>}
        {description && <p>{description}</p>}
        <div>
          <Button href={toViewListingUrl(id)}>View</Button>
        </div>
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
