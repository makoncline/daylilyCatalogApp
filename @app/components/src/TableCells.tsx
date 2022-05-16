import { Thumbnail } from "@app/design";
import Image from "next/image";
import React from "react";
import styled from "styled-components";

import { truncate } from "./util";

function ImageCell({ value }: { value: string }) {
  return (
    <Thumbnail>
      <Image src={value.length > 0 ? value[0] : "/flowerPlaceholder.png"} />
    </Thumbnail>
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
