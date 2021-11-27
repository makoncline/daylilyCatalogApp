import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  :root{
    /* RGB Values */
    --rgb-black: 0, 0, 0;
    --rgb-white: 255, 255, 255;
    --rgb-white: 0,0,0;
    --rgb-almost-black: 35, 28, 51;
    --rgb-almost-white: 236, 233, 230;
    --rgb-gray: 116, 116, 128;
    --rgb-medium-gray: 226, 221, 215;
    --rgb-light-gray: 251, 250, 249;
    --rgb-neutral-light-gray: 244, 243, 245;
    --rgb-teal: 157, 255, 236;
    --rgb-blue: 0, 116, 228;
    --rgb-purple: 85, 34, 250;
    --rgb-green: 41, 152, 80;
    --rgb-red: 201, 36, 0;
    --rgb-canary: 255, 245, 202;
    --rgb-yellow: 255, 214, 10;
    --rgb-yellow-gradient-middle: 255, 245, 205;
    --rgb-peach: 255, 229, 218;
    --rgb-orange: 248, 121, 23;
    --rgb-coral: 249, 92, 92;
    --rgb-light-green: 22, 186, 91;
    --rgb-background: var(--rgb-white);
    --rgb-ink: var(--rgb-almost-black);
    --rgb-overlay: var(--rgb-white);

    /* Colors */
    --color-black: rgb(var(--rgb-black));
    --color-almost-black: rgb(var(--rgb-almost-black));
    --color-primary: rgb(var(--rgb-teal));
    --color-secondary: rgb(var(--rgb-blue));
    --color-tertiary: rgb(var(--rgb-purple));
    --color-positive: rgb(var(--rgb-green));
    --color-negative: rgb(var(--rgb-red));
    --color-coral: rgb(var(--rgb-coral));
    --color-disabled: rgb(var(--rgb-gray));
    --color-always-white: rgb(var(--rgb-white));
    --color-yellow: rgb(var(--rgb-yellow));

    /* Color intentions */
    --color-bg--main: rgb(var(--rgb-background));
    --color-bg--main-transparent: rgba(var(--rgb-background), 0);
    --color-bg--main-thin: rgba(var(--rgb-background), 0.5);
    --color-bg--main-thick: rgba(var(--rgb-background), 0.95);
    --color-bg--main-reversed: rgb(var(--rgb-ink));
    --color-bg--surface: rgba(var(--rgb-medium-gray), 0.4);
    --color-bg--surface-opaque: rgb(var(--rgb-medium-gray));
    --color-bg--surface-glint: rgba(var(--rgb-medium-gray), 0.15);
    --color-bg--surface-glint-transparent: rgba(var(--rgb-light-gray), 0);
    --color-bg--surface-glint-opaque: rgb(var(--rgb-light-gray));
    --color-bg--surface-glint-thick: rgb(var(--rgb-light-gray), 0.9);
    --color-bg--sheet: var(--color-bg--surface-glint-opaque);
    --color-bg--sheet-transparent: rgba(var(--rgb-light-gray), 0);
    --color-bg--neutral: rgb(var(--rgb-neutral-light-gray));
    --color-bg--positive: rgba(var(--rgb-green), 0.25);
    --color-bg--positive-glint: rgba(var(--rgb-green), 0.15);
    --color-bg--negative: rgb(var(--rgb-red), 0.25);
    --color-bg--negative-glint: rgb(var(--rgb-red), 0.15);
    --color-bg--negative-glint-thin: rgb(var(--rgb-red), 0.05);
    --color-primary: rgba(var(--rgb-teal), 0.15);
    --color-primary-glint: rgba(var(--rgb-teal), 0.05);
    --color-bg--secondary: rgba(var(--rgb-blue), 0.15);
    --color-bg--secondary-glint: rgba(var(--rgb-blue), 0.05);
    --color-bg--tertiary: rgba(var(--rgb-purple), 0.15);
    --color-bg--tertiary-glint: rgba(var(--rgb-purple), 0.05);
    --color-bg--warning: rgb(var(--rgb-canary));
    --color-bg--warning-glint: rgb(var(--rgb-peach));
    --color-bg--highlight: rgba(var(--rgb-yellow), 0.25);
    --color-bg--overlay: rgb(var(--rgb-overlay));
    --color-bg--overlay-dark: rgb(var(--rgb-almost-black), 0.95);
    --color-bg--card: #fff;
    --color-txt: rgb(var(--rgb-ink));
    --color-txt--reversed: rgb(var(--rgb-background));
    --color-txt--subtle: rgba(var(--rgb-ink), 0.66);
    --color-txt--subtle-reversed: rgba(var(--rgb-background), 0.66);
    --color-txt--action: rgb(var(--rgb-blue));
    --color-txt--placeholder: rgba(var(--rgb-ink), 0.60);
    --color-border: rgba(var(--rgb-ink), 0.15);
    --color-border--reversed: rgba(var(--rgb-almost-white), 0.25);
    --color-border--light: rgba(var(--rgb-ink), 0.05);
    --color-border--heavy: rgba(var(--rgb-ink), 0.5);
    --color-border--solid: rgb(var(--rgb-ink));

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
    --size-256: 64rem;

    /* size intentions */
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

    --hairline: 1px solid var(--color-border);

    /* Styles */
    --border-radius: var(--size-2);
    --max-width: var(--size-256);
    --container-padding: var(--spacing-md);
    --sheet-padding: var(--size-10);
  }

  html {
    font-size: var(--base-font-size);
    box-sizing: border-box;
  }

  *, *:before, *:after {
    box-sizing: inherit;
  }

  * {
    margin: 0;
    padding: 0;
  }

  body {
    font-family: var(--body-font);
    font-weight: var(--font-weight-base);
    line-height: var(--line-height);
    background: var(--color-bg--main);
    color: var(--color-txt);
    min-height: 100vh;
    margin-bottom: 50vh;
  }

  main {
    margin: 0 auto;
    max-width: var(--max-width);
    border-radius: var(--spacing-lg);
    background: var(--color-bg--sheet);
  }

  .dark{
    --rgb-almost-black: 27, 39, 51;
    --rgb-gray: 116, 116, 128;
    --rgb-medium-gray: 51, 60, 71;
    --rgb-light-gray: 39, 50, 62;
    --rgb-neutral-light-gray: 39, 50, 62;
    --rgb-blue: 80, 162, 255;
    --rgb-purple: 134, 126, 255;
    --rgb-peach: 242, 165, 117;
    --rgb-green: 105, 240, 174;
    --rgb-red: 255, 120, 120;
    --rgb-yellow: 251, 225, 144;
    --rgb-yellow-gradient-middle: 225, 203, 133;
    --rgb-orange: 255, 184, 92;
    --rgb-coral: 222, 137, 131;
    --rgb-light-green: 115, 240, 105;
    --rgb-background: var(--rgb-almost-black);
    --rgb-ink: var(--rgb-almost-white);
    --rgb-overlay: 32, 44, 56;

    --color-bg--surface: rgba(var(--rgb-gray), 0.2);
    --color-bg--surface-glint: rgba(var(--rgb-gray), 0.10);
    --color-bg--positive: rgba(var(--rgb-green), 0.18);
    --color-bg--positive-glint: rgba(var(--rgb-green), 0.10);
    --color-bg--warning: rgba(var(--rgb-peach), 0.15);
    --color-bg--warning-glint: rgba(var(--rgb-peach), 0.1);
    --color-bg--secondary-opaque: #28394F;
    --color-bg--secondary-glint-opaque: #223040;
    --color-bg--negative: rgb(var(--rgb-red), 0.5);
    --color-bg--negative-glint: rgb(var(--rgb-red), 0.3);
    --color-bg--card: rgb(var(--rgb-overlay));
    --color-shadow: rgba(var(--rgb-black), 0.15);
    --color-shadow--light: rgba(var(--rgb-black), 0.12);
    --color-shadow--dark: rgba(var(--rgb-black), 0.25);

    /* don't touch these here */
    /* have to redeclare so that override above are re-evaluated */
    --color-bg--main: rgb(var(--rgb-background));
    --color-bg--main-transparent: rgba(var(--rgb-background), 0);
    --color-bg--main-thin: rgba(var(--rgb-background), 0.5);
    --color-bg--main-thick: rgba(var(--rgb-background), 0.95);
    --color-bg--main-reversed: rgb(var(--rgb-ink));
    --color-bg--surface: rgba(var(--rgb-medium-gray), 0.4);
    --color-bg--surface-opaque: rgb(var(--rgb-medium-gray));
    --color-bg--surface-glint: rgba(var(--rgb-medium-gray), 0.15);
    --color-bg--surface-glint-transparent: rgba(var(--rgb-light-gray), 0);
    --color-bg--surface-glint-opaque: rgb(var(--rgb-light-gray));
    --color-bg--surface-glint-thick: rgb(var(--rgb-light-gray), 0.9);
    --color-bg--sheet: var(--color-bg--surface-glint-opaque);
    --color-bg--sheet-transparent: rgba(var(--rgb-light-gray), 0);
    --color-bg--neutral: rgb(var(--rgb-neutral-light-gray));
    --color-bg--positive: rgba(var(--rgb-green), 0.25);
    --color-bg--positive-glint: rgba(var(--rgb-green), 0.15);
    --color-bg--negative: rgb(var(--rgb-red), 0.25);
    --color-bg--negative-glint: rgb(var(--rgb-red), 0.15);
    --color-bg--negative-glint-thin: rgb(var(--rgb-red), 0.05);
    --color-primary: rgba(var(--rgb-teal), 0.15);
    --color-primary-glint: rgba(var(--rgb-teal), 0.05);
    --color-bg--secondary: rgba(var(--rgb-blue), 0.15);
    --color-bg--secondary-glint: rgba(var(--rgb-blue), 0.05);
    --color-bg--tertiary: rgba(var(--rgb-purple), 0.15);
    --color-bg--tertiary-glint: rgba(var(--rgb-purple), 0.05);
    --color-bg--warning: rgb(var(--rgb-canary));
    --color-bg--warning-glint: rgb(var(--rgb-peach));
    --color-bg--highlight: rgba(var(--rgb-yellow), 0.25);
    --color-bg--overlay: rgb(var(--rgb-overlay));
    --color-bg--overlay-dark: rgb(var(--rgb-almost-black), 0.95);
    --color-bg--card: #fff;
    --color-txt: rgb(var(--rgb-ink));
    --color-txt--reversed: rgb(var(--rgb-background));
    --color-txt--subtle: rgba(var(--rgb-ink), 0.66);
    --color-txt--subtle-reversed: rgba(var(--rgb-background), 0.66);
    --color-txt--action: rgb(var(--rgb-blue));
    --color-txt--placeholder: rgba(var(--rgb-ink), 0.60);
    --color-border: rgba(var(--rgb-ink), 0.15);
    --color-border--reversed: rgba(var(--rgb-almost-white), 0.25);
    --color-border--light: rgba(var(--rgb-ink), 0.05);
    --color-border--heavy: rgba(var(--rgb-ink), 0.5);
    --color-border--solid: rgb(var(--rgb-ink));
}
`;
