import { Card } from "@app/design";
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
      <Card size="20rem" gridTemplate="3fr 3fr" fitHeight>
        <Card.Image fitHeight>
          {image && <Image src={image} alt="user avatar" layout="fill" />}
        </Card.Image>
        <Card.Body>
          <h2 className="card-title">{name}</h2>
          {location && <p className="card-text">{location}</p>}
          {intro && <p className="card-text">{intro}</p>}
        </Card.Body>
      </Card>
    </>
  );
};
