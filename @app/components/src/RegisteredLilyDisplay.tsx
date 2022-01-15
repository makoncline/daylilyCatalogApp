import { useRegisteredLilyQuery } from "@app/graphql";
import Image from "next/image";
import React from "react";

import { ErrorAlert } from ".";

export function RegisteredLilyDisplay({ ahsId }: { ahsId: number }) {
  const { data, loading, error } = useRegisteredLilyQuery({
    variables: { ahsId },
  });
  if (loading) return <p>loading...</p>;
  if (error) return <ErrorAlert error={error} />;
  const lily = data?.ahsDatumByAhsId;
  return (
    <>
      {lily ? (
        <>
          <p>{lily.name}</p>
          {lily?.image && (
            <Image
              src={lily.image}
              alt={lily.name || "flower"}
              width={300}
              height={300}
              objectFit="cover"
            />
          )}
        </>
      ) : (
        "no registered lily data..."
      )}
    </>
  );
}
