import { Thumbnail } from "@app/design";
import Image from "next/image";
import React, { FC } from "react";

export const UserAvatar: FC<{
  user: {
    name?: string | null;
    avatarUrl?: string | null;
  };
}> = (props) => {
  const { avatarUrl } = props.user;
  return (
    <Thumbnail>
      <Image
        src={
          avatarUrl
            ? avatarUrl
            : `${process.env.ROOT_URL}/flowerPlaceholder.png`
        }
      />
    </Thumbnail>
  );
};
