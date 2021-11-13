// import { css } from "styled-components";

// const size = {
//   sm: 400,
//   md: 960,
//   lg: 1140,
// };

// const mediaQueryKeys = Object.keys(size) as Array<keyof typeof size>;

// export const above = mediaQueryKeys.reduce((acc, label) => {
//   acc[label] = (literals: TemplateStringsArray, ...placeholders: any[]) =>
//     css`
//       @media (min-width: ${size[label] / 16}em) {
//         ${css(literals, ...placeholders)}
//       }
//     `.join("");
//   return acc;
// }, {} as Record<keyof typeof size, (l: TemplateStringsArray, ...p: any[]) => string>);

// export const below = mediaQueryKeys.reduce((acc, label) => {
//   acc[label] = (literals: TemplateStringsArray, ...placeholders: any[]) =>
//     css`
//       @media (max-width: ${size[label] / 16}em) {
//         ${css(literals, ...placeholders)}
//       }
//     `.join("");
//   return acc;
// }, {} as Record<keyof typeof size, (l: TemplateStringsArray, ...p: any[]) => string>);
