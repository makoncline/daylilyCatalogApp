export const fromEmail = '"Daylily Catalog" <no-reply@daylilycatalog.com>';
export const awsRegion = "us-east-1";
export const projectName = "Daylily Catalog";
export const companyName = "Daylily Catalog"; // For copyright ownership
export const emailLegalText =
  // Envvar here so we can override on the demo website
  process.env.LEGAL_TEXT ||
  `Copyright © ${new Date().getFullYear()} Daylily Catalog. All
  rights reserved.`;
