import { Card, Heading } from "@app/design";
import Image from "next/image";
import React from "react";

export const UserCard = ({
  image,
  name,
  location,
  intro,
}: {
  image?: string | null;
  name: string;
  location?: string | null;
  intro?: string | null;
}) => {
  return (
    <>
      <Card size="20rem" sizeProp="height" gridTemplate="1fr / auto 1fr">
        <Card.Image>
          {image && <Image src={image} alt="user avatar" layout="fill" />}
        </Card.Image>
        <Card.Body>
          <Heading level={2}>{name}</Heading>
          {location && <p>{location}</p>}
          {intro && <p>{intro}</p>}
        </Card.Body>
      </Card>
    </>
  );
};
