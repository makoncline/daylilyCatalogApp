import styled from "styled-components";

import { below } from "../utilities";

const Card = styled.div`
  width: 100%;
  display: grid;
  grid-template: auto / auto auto;
  border-radius: var(--radius-2);
  overflow: hidden;
  ${below.md`
    grid-template: auto auto / auto;
  `}
`;
const CardImage = styled.div`
  position: relative;
  display: grid;
  place-items: center;
  width: 200px;
  height: 200px;
`;
const CardBody = styled.div`
  margin: var(--size-4);
`;

export { Card, CardBody, CardImage };
