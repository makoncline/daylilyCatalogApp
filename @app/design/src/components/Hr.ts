import styled from "styled-components";

import { FancyHeading } from ".";

export const Hr = styled.hr`
  border: none;
  height: 1px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  ${FancyHeading} & {
    grid-area: 1 / 1;
  }
`;
