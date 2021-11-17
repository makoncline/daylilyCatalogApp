import { createGlobalStyle } from "styled-components";

export const OverrideStyles = createGlobalStyle`
  :root {
  /* base colors */

  /* color uses */
  --free-plan-color: var(--grey);
  --pro-plan-color: var(--blue);
  --custom-plan-color: var(--green);
  --border-color-main: var(--light-grey);
  --pricing-bg-color: var(--green);
}
`;
