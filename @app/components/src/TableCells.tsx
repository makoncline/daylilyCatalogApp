import { getPlaceholderImageUrl, Thumbnail } from "@app/design";
import React from "react";
import styled from "styled-components";

import { Image } from "./Image";
import { truncate } from "./util";

function ImageCell({ value }: { value?: string[] }) {
  const src = value && value.length > 0 ? value[0] : getPlaceholderImageUrl();
  return (
    <>
      {/* hack to get around styled components not working correctly when columns move around */}
      <div style={{ position: "relative" }}>
        <Thumbnail>
          <Image src={src} />
        </Thumbnail>
      </div>
    </>
  );
}
function DateCell({ value }: { value: string }) {
  return <LimitWidth>{new Date(value).toLocaleDateString("en-US")}</LimitWidth>;
}
function TruncateCell({ value }: { value: string }) {
  return <LimitWidth>{truncate(value || "")}</LimitWidth>;
}
const LimitWidth = styled.div`
  max-width: 300px;
  width: max-content;
`;

export { DateCell, ImageCell, LimitWidth, TruncateCell };
