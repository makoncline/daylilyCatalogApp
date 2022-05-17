import { Card, CardBody, CardImage, Heading } from "@app/design";
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
      <Card>
        <CardImage>
          {image && <Image src={image} alt="user avatar" layout="fill" />}
        </CardImage>
        <CardBody>
          <Heading level={2}>{name}</Heading>
          {location && <p>{location}</p>}
          {intro && <p>{intro}</p>}
        </CardBody>
      </Card>
    </>
  );
};
