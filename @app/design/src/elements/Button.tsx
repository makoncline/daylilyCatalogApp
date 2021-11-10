import styled from "styled-components";

import { elevation } from "../utilities";

export const Button = styled.button`
  padding: 5px 20px;
  border-radius: 4px;
  color: white;
  font-size: 2rem;
  border: none;
  transition: 0.3s ease box-shadow;
  background: var(--primary);
  display: grid;
  justify-content: center;
  align-items: center;
  ${elevation[1]};
  &:hover {
    ${elevation[2]};
  }
`;

export const IconButton = styled(Button)`
  background: transparent;
  box-shadow: none;
  width: 42px;
  height: 42px;
  padding: 0;
  &:hover {
    box-shadow: none;
  }
`;
