import { Thumbnail, thumbnailProps } from "@app/design";
import Image from "next/image";
import React, { FC } from "react";

export const UserAvatar: FC<{
  user: {
    name?: string | null;
    avatarUrl?: string | null;
  };
}> = (props) => {
  const { name, avatarUrl } = props.user;
  if (avatarUrl) {
    return (
      <Thumbnail>
        <Image src={avatarUrl} {...thumbnailProps} />
      </Thumbnail>
    );
  } else {
    return <Thumbnail>{(name && name[0]) || "?"}</Thumbnail>;
  }
};
