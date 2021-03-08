import { useAhsDatumByIdQuery } from "@app/graphql";
import { Avatar, Button, Card } from "antd";
import React from "react";

export const AhsCard = ({
  ahsId,
  handleUnlink,
}: {
  ahsId: string;
  handleUnlink: () => void;
}) => {
  const { data } = useAhsDatumByIdQuery({
    variables: {
      ahsId: parseInt(ahsId),
    },
  });

  const { name, hybridizer, year, image } = data?.ahsData?.nodes[0] || {
    name: "",
    hybridizer: "",
    year: "",
    image: "",
  };

  return (
    <Card
      title="Linked To"
      extra={<Button onClick={handleUnlink}>Unlink</Button>}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {image && <Avatar shape="square" size={102} src={image} />}
        <div
          style={{
            flexGrow: 1,
            marginLeft: "1rem",
          }}
        >
          <h3>{name}</h3>
          <div>
            {hybridizer && <span>{hybridizer}</span>}
            {year && <span>, {year}</span>}
          </div>
        </div>
        <a
          href={`https://daylilies.org/DaylilyDB/detail.php?id=${ahsId}`}
          target="_blank"
          rel="noreferrer"
        >
          Data
        </a>
      </div>
    </Card>
  );
};
