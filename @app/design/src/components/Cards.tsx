import styled from "styled-components";

import { elevation } from "../utilities";

export const Card = styled.div`
  border-radius: var(--border-radius);
  padding: var(--spacing-md);
  ${elevation[1]};
`;
