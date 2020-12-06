// @ts-ignore
const packageJson = require("../../../package.json");

// TODO: customise this with your own settings!

export const fromEmail = '"Daylily Catalog" <no-reply@daylilycatalogcom>';
export const awsRegion = "us-east-1";
export const projectName = packageJson.name.replace(/[-_]/g, " ");
export const companyName = projectName; // For copyright ownership
export const emailLegalText =
  // Envvar here so we can override on the demo website
  process.env.LEGAL_TEXT ||
  `Copyright &copy; ${new Date().getFullYear()} Daylily Catalog. All
  rights reserved. `;
