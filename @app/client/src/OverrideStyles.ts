import { createGlobalStyle } from "styled-components";

export const OverrideStyles = createGlobalStyle`
  :root {
  /* base colors */
  --light-grey: #d9d9d9;
  --grey: rgb(125, 125, 134);
  --blue: rgb(55, 112, 235);
  --green: rgb(245, 255, 246);
  --white: white;
  --black: black;

  /* color uses */
  --free-plan-color: var(--grey);
  --pro-plan-color: var(--blue);
  --custom-plan-color: var(--green);
  --border-color-main: var(--light-grey);
  --pricing-bg-color: var(--green);
  --hairline-color: var(--light-grey);

  /* sizes */
  --container-width: 900px;
  --size-sm: 1rem;
  --size-md: 1.5rem;
  --size-lg: 2rem;
  --size-xl: 3rem;

  /* spacing */
  --spacing-sm: var(--size-sm);
  --spacing-md: var(--size-md);
  --spacing-lg: var(--size-lg);
  --spacing-xl: var(--size-xl);

  --hairline: 1px solid var(--hairline-color);

  /* css variables for text sizing */
  --font-size-sm: var(--size-sm);
  --font-size-md: var(--size-md);
  --font-size-lg: var(--size-lg);
  --font-size-xl: var(--size-xl);

}
`;
