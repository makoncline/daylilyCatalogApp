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

    /* Color intentions */
    --text: var(--black);
    --icon: var(--text);
    --bg: var(--white);
    --header-bg: var(--gray);
    --primary: var(--gray);
    --pro-plan-color: var(--black);

    /* Styles */
    --line: solid 1px var(--lineColor);

      /* Type */
    --headingFont: "Space Mono", monospace;
    --bodyFont: "Work Sans", sans-serif;
    --baseFontSize: 100%;
    --h1: 3.052em;
    --h2: 2.441em;
    --h3: 1.953em;
    --h4: 1.563em;
    --h5: 1.25em;
    --smallText: 0.8em;

    /* Positioning */
    --container-padding: 2.5%;
    --header-height: 3rem;
    --footer-height: 3rem;
    --border-radius: 10px;
    --icon-size: 2rem;
    --space: 1.5rem;
  }

  html {
    font-size: var(--baseFontSize);
    box-sizing: border-box;
  }

  *, *:before, *:after {
    box-sizing: inherit;
  }

  body {
    font-family: var(--bodyFont);
    font-weight: 400;
    line-height: 1.65;
    background: var(--bg);
    color: var(--text);

  }

  main {
    width: 90%;
    margin: 0 auto;
  }

  h2{
    margin: 0;
  }

  .icon{
    fill: var(--icon-color);
  }
  .dark{
    --text: var(--white);
    --icon: var(--text);
    --bg: var(--black);
  }
`;
