import { Card, CardBody, CardImage, Heading } from "@app/design";
import { AhsDataFragment, useRegisteredLilyQuery } from "@app/graphql";
import Image from "next/image";
import React from "react";
import styled from "styled-components";

import { ErrorAlert } from ".";

export function RegisteredLilyDisplay({
  ahsId,
  children,
}: {
  ahsId: number;
  children?: React.ReactNode;
}) {
  const { data, loading, error } = useRegisteredLilyQuery({
    variables: { ahsId },
  });
  if (loading) return <p>loading...</p>;
  if (error) return <ErrorAlert error={error} />;
  const lily = data?.ahsDatumByAhsId;
  return (
    <>
      {lily ? (
        <Card>
          <CardImage>
            {lily?.image && (
              <Image
                src={lily.image}
                alt="user avatar"
                width={400}
                height={400}
                objectFit="cover"
              />
            )}
          </CardImage>
          <CardBody>
            <Title level={2}>{lily.name}</Title>
            {lily.hybridizer && lily.year ? (
              <p>
                ({lily.hybridizer}, {lily.year})
              </p>
            ) : lily.hybridizer ? (
              <p>({lily.hybridizer})</p>
            ) : lily.year ? (
              <p>({lily.year})</p>
            ) : null}
            <p>{getDescription(lily)}</p>
            {children ? children : null}
          </CardBody>
        </Card>
      ) : (
        "no registered lily data..."
      )}
    </>
  );
}

const Title = styled(Heading)`
  margin: 0;
`;

function getDescription(lily: AhsDataFragment) {
  const descriptionKeys = [
    "scapeHeight",
    "bloomSize",
    "bloomSeason",
    "bloomHabit",
    "ploidy",
    "fragrance",
    "budcount",
    "branches",
    "color",
    "parentage",
    "flower",
    "foliage",
    "foliageType",
    "form",
    "sculpting",
    "seedlingNum",
  ];
  const description = descriptionKeys
    .map((key) => {
      const value = lily[key];
      if (value) {
        return {
          label: key.replace(/([A-Z])/g, " $1").toLowerCase(),
          value,
        };
      }
    })
    .filter((item) => !!item?.value)
    .map((item) => `${item?.label} ${item?.value}`)
    .join(", ")
    .replace(/, ([^,]*)$/, " and $1.");
  return description.charAt(0).toUpperCase() + description.slice(1);
}
