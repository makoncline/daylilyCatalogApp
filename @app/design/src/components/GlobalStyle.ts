import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  :root{
    /* Base colors */
    --black: #222;
    --white: white;
    --gray: gray;
    --light-green: lightGreen;
    --dark-green: darkGreen;
    --blue: blue;
    --light-grey: #d9d9d9;
    --grey: rgb(125, 125, 134);
    --blue: rgb(55, 112, 235);
    --green: rgb(245, 255, 246);

    /* Color intentions */
    --color-text: var(--black);
    --color-text-light: var(--gray);
    --color-bg: var(--white);
    --color-header-bg: var(--gray);
    --color-primary: var(--blue);
    --color-hairline: var(--light-grey);
    --color-button-text: var(--white);
    --color-button-bg: var(--color-primary);
    --color-navigation-background: var(--white);
    --color-nav-text: var(--color-text);
    --color-nav-text-light: var(--color-text-light);

    /* sizes */
    --size-1: 0.25rem;
    --size-2: 0.5rem;
    --size-3: 0.75rem;
    --size-4: 1rem;
    --size-5: 1.25rem;
    --size-6: 1.5rem;
    --size-8: 2rem;
    --size-10: 2.5rem;
    --size-12: 3rem;
    --size-16: 4rem;
    --size-20: 5rem;

    /* size intentions */
    --max-width: 900px;
    --width-header: 90%;


    /* spacing */
    --spacing-xs: var(--size-1);
    --spacing-sm: var(--size-2);
    --spacing-md: var(--size-4);
    --spacing-lg: var(--size-8);

    /* css variables for text sizing */
    --font-size-1: var(--size-1);
    --font-size-2: var(--size-2);
    --font-size-3: var(--size-3);
    --font-size-4: var(--size-4);

      /* Type */
    --heading-font: "Space Mono", monospace;
    --body-font: "Work Sans", sans-serif;
    --base-font-size: 100%;
    --h1: 3.052em;
    --h2: 2.441em;
    --h3: 1.953em;
    --h4: 1.563em;
    --h5: 1.25em;
    --line-height: 1.65;
    --font-weight-base: 400;

    --hairline: 1px solid var(--hairline-color);

    /* Styles */
    --container-padding: var(--spacing-md);
    --border-radius: var(--size-2);
    --max-width: 64rem;
  }

  html {
    font-size: var(--base-font-size);
    box-sizing: border-box;
  }

  *, *:before, *:after {
    box-sizing: inherit;
  }

  body {
    font-family: var(--body-font);
    font-weight: var(--font-weight-base);
    line-height: var(--line-height);
    background: var(--bg);
    color: var(--text);
  }

  main {
    max-width: 100%;
    width: var(--max-width);
    margin: 0 auto;
  }

  .dark{
    --text: var(--white);
    --icon: var(--text);
    --bg: var(--black);
  }
`;
