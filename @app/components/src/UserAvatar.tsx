import { Thumbnail } from "@app/design";
import React, { FC } from "react";

import { Image } from "./Image";

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
