import styled from "styled-components";

import { FancyHeading } from ".";

export const Hr = styled.hr`
  border: none;
  height: 1px;
  background: linear-gradient(
    135deg,
    var(--color-secondary) 0%,
    var(--color-tertiary) 100%
  );
  ${FancyHeading as any} & {
    grid-area: 1 / 1;
  }
`;
